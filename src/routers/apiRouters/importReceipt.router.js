import express from 'express'
import ImportReceiptController from '../../controllers/importReceipt.controller.js'
import { checkLoginAdmin, isAdmin } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/partials', checkLoginAdmin, isAdmin, ImportReceiptController.getPartials)
router.get('/detail/:id', checkLoginAdmin, isAdmin, ImportReceiptController.getDetailById)
router.get('/:id', checkLoginAdmin, isAdmin, ImportReceiptController.getById)
router.post('/', checkLoginAdmin, isAdmin, ImportReceiptController.create)
router.put('/cancel/:id', checkLoginAdmin, isAdmin, ImportReceiptController.cancel)

export default router
