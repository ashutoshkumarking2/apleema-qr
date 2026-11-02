import { createHash, randomInt, timingSafeEqual } from 'crypto'
import { db } from '../config/firebaseAdmin'

const TTL_MS = 10 * 60 * 1000
const COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5

export type OtpPurpose = 'login' | 'logout' | 'qr-delete'

const col = () => db.collection('email_otps')

const getRef = (uid: string, purpose: OtpPurpose) =>
  col().doc(`${uid}_${purpose}`)

const hashCode = (uid: string, purpose: OtpPurpose, code: string) =>
  createHash('sha256')
    .update(`${uid}:${purpose}:${code}:${process.env.OTP_SECRET}`)
    .digest('hex')

export async function createAndStoreCode(uid: string, purpose: OtpPurpose) {
  const ref = getRef(uid, purpose)
  const snap = await ref.get()
  const now = Date.now()

  if (snap.exists) {
    const sentAt = snap.data()!.sentAt as number
    if (now - sentAt < COOLDOWN_MS) {
      return {
        ok: false as const,
        wait: Math.ceil((COOLDOWN_MS - (now - sentAt)) / 1000),
      }
    }
  }

  const code = String(randomInt(0, 1000000)).padStart(6, '0')

  await ref.set({
    codeHash: hashCode(uid, purpose, code),
    purpose,
    expiresAt: now + TTL_MS,
    attempts: 0,
    sentAt: now,
  })

  return { ok: true as const, code }
}

export async function clearCode(uid: string, purpose: OtpPurpose) {
  await getRef(uid, purpose).delete()
}

export async function checkCode(
  uid: string,
  purpose: OtpPurpose,
  code: string,
): Promise<'ok' | 'invalid' | 'expired' | 'locked'> {
  const ref = getRef(uid, purpose)
  const snap = await ref.get()

  if (!snap.exists) return 'invalid'

  const d = snap.data()!

  if (d.purpose !== purpose) return 'invalid'

  if (Date.now() > d.expiresAt) {
    await ref.delete()
    return 'expired'
  }

  if (d.attempts >= MAX_ATTEMPTS) {
    await ref.delete()
    return 'locked'
  }

  const stored = Buffer.from(String(d.codeHash))
  const submitted = Buffer.from(hashCode(uid, purpose, code))

  const match =
    stored.length === submitted.length &&
    timingSafeEqual(stored, submitted)

  if (!match) {
    const nextAttempts = Number(d.attempts || 0) + 1
    if (nextAttempts >= MAX_ATTEMPTS) {
      await ref.delete()
      return 'locked'
    }
    await ref.update({ attempts: nextAttempts })
    return 'invalid'
  }

  await ref.delete()
  return 'ok'
}

