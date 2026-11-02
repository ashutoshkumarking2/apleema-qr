import type { Request, Response } from 'express'
import { FieldValue } from 'firebase-admin/firestore'
import { randomBytes } from 'crypto'
import { db } from '../config/firebaseAdmin'
import { createAndStoreCode, checkCode, clearCode } from '../services/otp.service'
import { sendOtpEmail } from '../services/email.service'
import { verifyGithubRepositoryAccess } from './githubApp.controller'

const collection = db.collection('qr_codes')

function validUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export async function createQr(req: Request, res: Response): Promise<void> {
  const uid = req.user?.uid
  const { name, type, category, content, style, githubRepositoryId } = req.body ?? {}

  if (!uid) {
    res.status(401).json({ error: 'Authentication required.' })
    return
  }

  if (!['static', 'dynamic'].includes(type)) {
    res.status(400).json({ error: 'QR type must be static or dynamic.' })
    return
  }

  if (typeof content !== 'string' || !content.trim() || content.length > 4096) {
    res.status(400).json({ error: 'Valid QR content is required (maximum 4096 characters).' })
    return
  }

  if (type === 'dynamic' && !validUrl(content.trim())) {
    res.status(400).json({ error: 'Dynamic QR requires a valid HTTP or HTTPS destination URL.' })
    return
  }

  if (name !== undefined && (typeof name !== 'string' || name.length > 80)) {
    res.status(400).json({ error: 'QR name must be 80 characters or fewer.' })
    return
  }

  try {
    const normalizedCategory =
      typeof category === 'string' ? category.slice(0, 40) : 'url'

    let verifiedGithubRepository = null

    if (type === 'dynamic' && normalizedCategory === 'url') {
      if (
        typeof githubRepositoryId !== 'number' ||
        !Number.isSafeInteger(githubRepositoryId) ||
        githubRepositoryId <= 0
      ) {
        res.status(400).json({
          error: 'Connect GitHub and select a repository for Dynamic Website QR.',
        })
        return
      }

      verifiedGithubRepository = await verifyGithubRepositoryAccess(
        uid,
        githubRepositoryId
      )

      if (!verifiedGithubRepository) {
        res.status(403).json({
          error: 'GitHub repository could not be verified. Reconnect GitHub or select an accessible repository.',
        })
        return
      }
    }

    const shortCode = type === 'dynamic' ? randomBytes(6).toString('hex') : null
    const backendUrl = (process.env.PUBLIC_BACKEND_URL || '').replace(/\/$/, '')

    if (type === 'dynamic' && !backendUrl) {
      res.status(503).json({ error: 'Dynamic QR is not configured yet. Set PUBLIC_BACKEND_URL on the backend.' })
      return
    }

    const doc = {
      ownerUid: uid,
      name: typeof name === 'string' && name.trim() ? name.trim() : 'Untitled QR',
      type,
      category: normalizedCategory,
      githubRepository: verifiedGithubRepository,
      content: content.trim(),
      style: style && typeof style === 'object' ? style : {},
      shortCode,
      shortUrl: shortCode ? `${backendUrl}/r/${shortCode}` : null,
      scanCount: 0,
      active: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    const ref = await collection.add(doc)
    res.status(201).json({ success: true, qr: { id: ref.id, ...doc } })
  } catch (error) {
    console.error('createQr failed:', error)
    res.status(500).json({ error: 'Could not create QR code.' })
  }
}

export async function listQrs(req: Request, res: Response): Promise<void> {
  const uid = req.user?.uid
  if (!uid) {
    res.status(401).json({ error: 'Authentication required.' })
    return
  }

  try {
    const snapshot = await collection.where('ownerUid', '==', uid).get()
    const qrs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    qrs.sort((a, b) => {
      const first = (a as { createdAt?: { toMillis?: () => number } }).createdAt?.toMillis?.() ?? 0
      const second = (b as { createdAt?: { toMillis?: () => number } }).createdAt?.toMillis?.() ?? 0
      return second - first
    })
    res.json({ success: true, qrs })
  } catch (error) {
    console.error('listQrs failed:', error)
    res.status(500).json({ error: 'Could not load QR codes.' })
  }
}

export async function getQr(req: Request, res: Response): Promise<void> {
  const uid = req.user?.uid
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    if (!id) { res.status(400).json({ error: 'Invalid QR code ID.' }); return }
    const ref = collection.doc(id)
    const doc = await ref.get()

    if (!doc.exists || doc.data()?.ownerUid !== uid) {
      res.status(404).json({ error: 'QR code not found.' })
      return
    }

    res.json({ success: true, qr: { id: doc.id, ...doc.data() } })
  } catch (error) {
    console.error('getQr failed:', error)
    res.status(500).json({ error: 'Could not load QR code.' })
  }
}

export async function updateQr(req: Request, res: Response): Promise<void> {
  const uid = req.user?.uid
  const { name, content, style, active } = req.body ?? {}

  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    if (!id) { res.status(400).json({ error: 'Invalid QR code ID.' }); return }
    const ref = collection.doc(id)
    const doc = await ref.get()

    if (!doc.exists || doc.data()?.ownerUid !== uid) {
      res.status(404).json({ error: 'QR code not found.' })
      return
    }

    const current = doc.data()!

    if (content !== undefined) {
      if (typeof content !== 'string' || !content.trim() || content.length > 4096) {
        res.status(400).json({ error: 'Invalid QR content.' })
        return
      }
      if (current.type === 'dynamic' && !validUrl(content.trim())) {
        res.status(400).json({ error: 'Dynamic QR requires a valid HTTP or HTTPS URL.' })
        return
      }
    }

    const changes: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.length > 80) {
        res.status(400).json({ error: 'Invalid QR name.' })
        return
      }
      changes.name = name.trim()
    }

    if (content !== undefined) changes.content = content.trim()
    if (style !== undefined && typeof style === 'object') changes.style = style
    if (typeof active === 'boolean') changes.active = active

    await ref.update(changes)
    res.json({ success: true, message: 'QR code updated.' })
  } catch (error) {
    console.error('updateQr failed:', error)
    res.status(500).json({ error: 'Could not update QR code.' })
  }
}


export async function sendQrDeleteCode(req: Request, res: Response): Promise<void> {
  const uid = req.user?.uid
  const email = req.user?.email
  const rawId = req.params.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId

  if (!uid || !email) {
    res.status(401).json({ error: 'Authenticated account email required.' })
    return
  }

  try {
    const ref = collection.doc(id)
    const doc = await ref.get()

    if (!doc.exists || doc.data()?.ownerUid !== uid) {
      res.status(404).json({ error: 'QR code not found.' })
      return
    }

    const result = await createAndStoreCode(uid, 'qr-delete')

    if (!result.ok) {
      res.status(429).json({
        error: `Please wait ${result.wait} seconds before requesting another code.`,
        wait: result.wait,
      })
      return
    }

    try {
      await sendOtpEmail(email, result.code, 'qr-delete')
    } catch (error) {
      await clearCode(uid, 'qr-delete')
      throw error
    }

    res.json({ sent: true, email })
  } catch (error) {
    console.error('sendQrDeleteCode failed:', error)
    res.status(500).json({ error: 'Could not send QR deletion code.' })
  }
}

export async function deleteQr(req: Request, res: Response): Promise<void> {
  const uid = req.user?.uid
  const email = req.user?.email
  const rawId = req.params.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  const submittedEmail = String(req.body?.email || '').trim().toLowerCase()
  const code = String(req.body?.code || '').trim()

  if (!uid || !email) {
    res.status(401).json({ error: 'Authentication required.' })
    return
  }

  if (!id || !/^\d{6}$/.test(code)) {
    res.status(400).json({ error: 'Enter the 6-digit email verification code.' })
    return
  }

  if (submittedEmail !== email.trim().toLowerCase()) {
    res.status(400).json({ error: 'The email does not match your signed-in account.' })
    return
  }

  try {
    const ref = collection.doc(id)
    const doc = await ref.get()

    if (!doc.exists || doc.data()?.ownerUid !== uid) {
      res.status(404).json({ error: 'QR code not found.' })
      return
    }

    const verification = await checkCode(uid, 'qr-delete', code)

    if (verification !== 'ok') {
      const messages = {
        invalid: 'Incorrect verification code.',
        expired: 'Verification code expired. Request a new one.',
        locked: 'Too many incorrect attempts. Request a new code.',
      }

      res.status(verification === 'locked' ? 429 : 400).json({
        error: messages[verification],
      })
      return
    }

    const events = await db.collection('scan_events')
      .where('qrId', '==', id)
      .where('ownerUid', '==', uid)
      .get()

    for (let i = 0; i < events.docs.length; i += 400) {
      const batch = db.batch()
      events.docs.slice(i, i + 400).forEach(item => batch.delete(item.ref))
      await batch.commit()
    }

    await ref.delete()

    res.json({
      success: true,
      message: 'QR code and its scan history were permanently deleted.',
    })
  } catch (error) {
    console.error('deleteQr failed:', error)
    res.status(500).json({ error: 'Could not delete QR code and analytics.' })
  }
}


// Send one OTP for deleting multiple selected QR codes.
export async function sendBulkQrDeleteCode(req: Request, res: Response): Promise<void> {
  const uid = req.user?.uid
  const email = req.user?.email
  const rawIds = req.body?.ids

  if (!uid || !email) {
    res.status(401).json({ error: 'Authenticated account email required.' })
    return
  }

  if (!Array.isArray(rawIds) || rawIds.length < 1 || rawIds.length > 100) {
    res.status(400).json({ error: 'Select between 1 and 100 QR codes.' })
    return
  }

  const ids = [...new Set(rawIds.filter((id): id is string =>
    typeof id === 'string' && id.trim().length > 0
  ).map((id: string) => id.trim()))]

  if (ids.length !== rawIds.length) {
    res.status(400).json({ error: 'Invalid or duplicate QR code selection.' })
    return
  }

  try {
    const snapshots = await Promise.all(ids.map(id => collection.doc(id).get()))
    const allOwned = snapshots.every(doc => doc.exists && doc.data()?.ownerUid === uid)

    if (!allOwned) {
      res.status(404).json({ error: 'One or more selected QR codes were not found.' })
      return
    }

    const result = await createAndStoreCode(uid, 'qr-delete')

    if (!result.ok) {
      res.status(429).json({
        error: `Please wait ${result.wait} seconds before requesting another code.`,
        wait: result.wait,
      })
      return
    }

    try {
      await sendOtpEmail(email, result.code, 'qr-delete')
    } catch (error) {
      await clearCode(uid, 'qr-delete')
      throw error
    }

    res.json({ sent: true, email, count: ids.length })
  } catch (error) {
    console.error('sendBulkQrDeleteCode failed:', error)
    res.status(500).json({ error: 'Could not send bulk QR deletion code.' })
  }
}

// Verify one OTP, then permanently delete all selected QR codes and their scan events.
export async function deleteBulkQrs(req: Request, res: Response): Promise<void> {
  const uid = req.user?.uid
  const accountEmail = req.user?.email
  const submittedEmail = String(req.body?.email || '').trim().toLowerCase()
  const code = String(req.body?.code || '').trim()
  const rawIds = req.body?.ids

  if (!uid || !accountEmail) {
    res.status(401).json({ error: 'Authentication required.' })
    return
  }

  if (!Array.isArray(rawIds) || rawIds.length < 1 || rawIds.length > 100) {
    res.status(400).json({ error: 'Select between 1 and 100 QR codes.' })
    return
  }

  const ids = [...new Set(rawIds.filter((id): id is string =>
    typeof id === 'string' && id.trim().length > 0
  ).map((id: string) => id.trim()))]

  if (ids.length !== rawIds.length) {
    res.status(400).json({ error: 'Invalid or duplicate QR code selection.' })
    return
  }

  if (!/^\d{6}$/.test(code)) {
    res.status(400).json({ error: 'Enter the 6-digit email verification code.' })
    return
  }

  if (submittedEmail !== accountEmail.trim().toLowerCase()) {
    res.status(400).json({ error: 'The email does not match your signed-in account.' })
    return
  }

  try {
    // Validate ownership of every QR before consuming the OTP or deleting anything.
    const snapshots = await Promise.all(ids.map(id => collection.doc(id).get()))
    const allOwned = snapshots.every(doc => doc.exists && doc.data()?.ownerUid === uid)

    if (!allOwned) {
      res.status(404).json({ error: 'One or more selected QR codes were not found.' })
      return
    }

    const verification = await checkCode(uid, 'qr-delete', code)

    if (verification !== 'ok') {
      const messages = {
        invalid: 'Incorrect verification code.',
        expired: 'Verification code expired. Request a new one.',
        locked: 'Too many incorrect attempts. Request a new code.',
      }

      res.status(verification === 'locked' ? 429 : 400).json({
        error: messages[verification],
      })
      return
    }

    // Remove scan events for each selected QR, scoped to the authenticated owner.
    for (const id of ids) {
      const events = await db.collection('scan_events')
        .where('qrId', '==', id)
        .where('ownerUid', '==', uid)
        .get()

      for (let i = 0; i < events.docs.length; i += 400) {
        const batch = db.batch()
        events.docs.slice(i, i + 400).forEach(item => batch.delete(item.ref))
        await batch.commit()
      }
    }

    // Delete the selected QR documents in safe Firestore batch sizes.
    for (let i = 0; i < ids.length; i += 400) {
      const batch = db.batch()
      ids.slice(i, i + 400).forEach(id => batch.delete(collection.doc(id)))
      await batch.commit()
    }

    res.json({
      success: true,
      deletedCount: ids.length,
      message: `${ids.length} QR code(s) and their scan history were permanently deleted.`,
    })
  } catch (error) {
    console.error('deleteBulkQrs failed:', error)
    res.status(500).json({ error: 'Could not delete the selected QR codes and analytics.' })
  }
}

