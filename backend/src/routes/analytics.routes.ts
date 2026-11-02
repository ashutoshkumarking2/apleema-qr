import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import { getQrAnalytics } from '../controllers/analytics.controller'

const router = Router()
router.use(verifyToken)
router.get('/:qrId', getQrAnalytics)

export default router
