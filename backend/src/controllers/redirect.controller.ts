import type { Request, Response } from 'express'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../config/firebaseAdmin'
import { randomUUID } from 'node:crypto'

export async function redirectQr(req: Request, res: Response): Promise<void> {
  const shortCode = req.params.shortCode

  try {
    const snapshot = await db.collection('qr_codes')
      .where('shortCode', '==', shortCode)
      .where('type', '==', 'dynamic')
      .limit(1)
      .get()

    if (snapshot.empty) {
      res.status(404).send('This QR code does not exist.')
      return
    }

    const doc = snapshot.docs[0]
    const data = doc.data()

    if (data.active !== true || typeof data.content !== 'string') {
      res.status(410).send('This QR code is no longer active.')
      return
    }

    const destination = new URL(data.content)
    if (!['http:', 'https:'].includes(destination.protocol)) {
      res.status(400).send('Invalid destination.')
      return
    }

    const cookieHeader = req.headers.cookie || ''
    const existingVisitorId = cookieHeader
      .split(';')
      .map(cookie => cookie.trim())
      .find(cookie => cookie.startsWith('apleema_visitor='))
      ?.slice('apleema_visitor='.length)

    const visitorId = existingVisitorId && /^[a-f0-9-]{36}$/i.test(existingVisitorId)
      ? existingVisitorId
      : randomUUID()

    const secureCookie = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    res.append(
      'Set-Cookie',
      `apleema_visitor=${visitorId}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax${secureCookie}`
    )

    const batch = db.batch()
    batch.update(doc.ref, { scanCount: FieldValue.increment(1) })

    const eventRef = db.collection('scan_events').doc()
    batch.set(eventRef, {
      qrId: doc.id,
      ownerUid: data.ownerUid,
      visitorId,
      scannedAt: FieldValue.serverTimestamp(),
      userAgent: req.get('user-agent') || 'unknown',
      referrer: req.get('referer') || null,
    })

    await batch.commit()
    res.redirect(302, destination.toString())
  } catch (error) {
    console.error('redirectQr failed:', error)
    res.status(500).send('Unable to open this QR destination.')
  }
}


