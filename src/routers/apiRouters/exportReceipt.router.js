import express from 'express'
import ExportReceiptController from '../../controllers/exportReceipt.controller.js'

const router = express.Router()

router.get('/partials', ExportReceiptController.getPartials)
router.get('/detail/:id', ExportReceiptController.getDetailById)
router.get('/:id', ExportReceiptController.getById)
router.post('/', ExportReceiptController.create)

export default router
