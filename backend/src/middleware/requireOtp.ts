import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function requireOtp(req: Request, res: Response, next: NextFunction): void {
  const token = String(req.headers['x-otp-token'] ?? '')
  try {
    const payload = jwt.verify(token, process.env.OTP_SECRET as string) as { uid?: string }
    if (payload.uid && payload.uid === req.user?.uid) {
      next()
      return
    }
  } catch {
    // fall through
  }
  res.status(403).json({ error: 'Email verification required.' })
}