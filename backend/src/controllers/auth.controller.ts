import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import {
  createAndStoreCode,
  checkCode,
  clearCode,
  type OtpPurpose,
} from '../services/otp.service'
import { sendOtpEmail } from '../services/email.service'

const COOKIE_NAME = 'apleema_session'
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000

const secret = () => {
  const value = process.env.OTP_SECRET
  if (!value) throw new Error('OTP_SECRET is not configured.')
  return value
}

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
  maxAge: SESSION_MAX_AGE,
})

function getCookie(req: Request, name: string): string {
  const cookies = req.headers.cookie || ''
  const item = cookies.split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`))
  return item ? decodeURIComponent(item.slice(name.length + 1)) : ''
}

function getPurpose(value: unknown): OtpPurpose | null {
  return value === 'login' || value === 'logout' ? value : null
}

export async function sendCode(req: Request, res: Response): Promise<void> {
  const user = req.user
  const purpose = getPurpose(req.body?.purpose)

  if (!user?.email) {
    res.status(400).json({ error: 'No email address found on this account.' })
    return
  }

  if (!purpose) {
    res.status(400).json({ error: 'Invalid verification purpose.' })
    return
  }

  try {
    const result = await createAndStoreCode(user.uid, purpose)

    if (!result.ok) {
      res.status(429).json({
        error: `Please wait ${result.wait} seconds before requesting a new code.`,
        wait: result.wait,
      })
      return
    }

    try {
      await sendOtpEmail(user.email, result.code, purpose)
    } catch (err) {
      await clearCode(user.uid, purpose)
      throw err
    }

    res.json({ sent: true, purpose, email: user.email })
  } catch (err) {
    console.error('send-code failed:', err)
    res.status(500).json({ error: 'Could not send the code. Please try again.' })
  }
}

export async function verifyCode(req: Request, res: Response): Promise<void> {
  const user = req.user
  const purpose = getPurpose(req.body?.purpose)
  const code = String(req.body?.code ?? '')

  if (!user) {
    res.status(401).json({ error: 'Not logged in.' })
    return
  }

  if (!purpose) {
    res.status(400).json({ error: 'Invalid verification purpose.' })
    return
  }

  if (!/^\d{6}$/.test(code)) {
    res.status(400).json({ error: 'Enter the 6-digit code.' })
    return
  }

  try {
    const result = await checkCode(user.uid, purpose, code)

    if (result !== 'ok') {
      const messages = {
        invalid: 'That code is incorrect.',
        expired: 'This code has expired. Request a new one.',
        locked: 'Too many wrong attempts. Request a new code.',
      }

      res.status(result === 'locked' ? 429 : 400).json({
        error: messages[result],
      })
      return
    }

    if (purpose === 'logout') {
      res.clearCookie(COOKIE_NAME, cookieOptions())
      res.json({ verified: true, purpose: 'logout' })
      return
    }

    const token = jwt.sign(
      { uid: user.uid, purpose: 'login' },
      secret(),
      { expiresIn: '7d' },
    )

    res.cookie(COOKIE_NAME, token, cookieOptions())
    res.json({ verified: true, purpose: 'login' })
  } catch (err) {
    console.error('verify-code failed:', err)
    res.status(500).json({ error: 'Could not verify the code. Please try again.' })
  }
}

export function sessionStatus(req: Request, res: Response): void {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  })
const firebaseUid = req.user?.uid
  const token = getCookie(req, COOKIE_NAME)

  if (!firebaseUid || !token) {
    res.json({ verified: false })
    return
  }

  try {
    const payload = jwt.verify(token, secret()) as {
      uid?: string
      purpose?: string
    }

    const verified =
      Boolean(payload.uid) &&
      payload.uid === firebaseUid &&
      payload.purpose === 'login'

    res.json({ verified })
  } catch {
    res.clearCookie(COOKIE_NAME, cookieOptions())
    res.json({ verified: false })
  }
}

