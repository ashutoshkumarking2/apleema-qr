import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import { otpLimiter } from '../middleware/rateLimit'
import {
  sendCode,
  verifyCode,
  sessionStatus,
} from '../controllers/auth.controller'

const router = Router()

router.post('/send-code', verifyToken, otpLimiter, sendCode)
router.post('/verify-code', verifyToken, otpLimiter, verifyCode)
router.get('/session', verifyToken, sessionStatus)

export default router
