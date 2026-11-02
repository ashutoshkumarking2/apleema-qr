import { Router } from 'express'
import { redirectQr } from '../controllers/redirect.controller'

const router = Router()

router.get('/:shortCode', redirectQr)

export default router
