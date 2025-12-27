import express from 'express'
import VoucherController from '../../controllers/voucher.controller.js'
import { checkLoginAdmin, isAdmin } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/partials', checkLoginAdmin, isAdmin, VoucherController.getPartials)
router.get('/:id', checkLoginAdmin, isAdmin, VoucherController.getById)
router.post('/', checkLoginAdmin, isAdmin, VoucherController.create)
router.put('/:id', checkLoginAdmin, isAdmin, VoucherController.update)
router.delete('/:id', checkLoginAdmin, isAdmin, VoucherController.delete)

export default router
