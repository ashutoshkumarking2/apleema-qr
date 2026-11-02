import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import { domainVerificationLimiter } from '../middleware/rateLimit'
import {
  createDomainVerificationChallenge,
  verifyDomainOwnership,
  getDomainVerificationStatus,
} from '../controllers/domainVerification.controller'

const router = Router()

router.use(verifyToken)
router.post('/challenge', domainVerificationLimiter, createDomainVerificationChallenge)
router.post('/verify', domainVerificationLimiter, verifyDomainOwnership)
router.get('/status', getDomainVerificationStatus)

export default router
