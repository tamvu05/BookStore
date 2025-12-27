import express from 'express'
import InvoiceController from '../../controllers/invoice.controller.js'
import { checkLoginAdmin } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/partials', checkLoginAdmin, InvoiceController.getPartials)
router.get('/detail/:id', checkLoginAdmin, InvoiceController.getDetailById)
router.get('/:id', checkLoginAdmin, InvoiceController.getById)
router.post('/', checkLoginAdmin, InvoiceController.create)
router.patch('/:id/pay', checkLoginAdmin, InvoiceController.pay)
router.patch('/:id/cancel', checkLoginAdmin, InvoiceController.cancel)

export default router
