import type { Request, Response, NextFunction } from 'express'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { adminAuth } from '../config/firebaseAdmin'

declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken
    }
  }
}

export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    res.status(401).json({ error: 'Not logged in.' })
    return
  }
  try {
    req.user = await adminAuth.verifyIdToken(token)
    next()
  } catch {
    res.status(401).json({ error: 'Your login has expired. Please log in again.' })
  }
}