import express from 'express'
import ExportReceiptController from '../../controllers/exportReceipt.controller.js'
import { checkLoginAdmin, isAdmin } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/partials', checkLoginAdmin, isAdmin, ExportReceiptController.getPartials)
router.get('/detail/:id', checkLoginAdmin, isAdmin, ExportReceiptController.getDetailById)
router.get('/:id', checkLoginAdmin, isAdmin, ExportReceiptController.getById)
router.post('/', checkLoginAdmin, isAdmin, ExportReceiptController.create)
router.put('/cancel/:id', checkLoginAdmin, isAdmin, ExportReceiptController.cancel)

export default router
