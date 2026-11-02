import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import {
  createQr,
  listQrs,
  getQr,
  updateQr,
  deleteQr,
  sendQrDeleteCode,
  sendBulkQrDeleteCode,
  deleteBulkQrs,
} from '../controllers/qr.controller'

const router = Router()

router.use(verifyToken)
router.post('/', createQr)
router.get('/', listQrs)
router.get('/:id', getQr)
router.patch('/:id', updateQr)

// Bulk routes must be declared before the /:id routes.
router.post('/bulk-delete-code', sendBulkQrDeleteCode)
router.post('/bulk-delete', deleteBulkQrs)

router.post('/:id/delete-code', sendQrDeleteCode)
router.delete('/:id', deleteQr)

export default router

