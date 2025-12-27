import express from 'express'
import OrderController from '../../controllers/order.controller.js'
import { checkLoginAdmin } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/partials', checkLoginAdmin, OrderController.getPartials)
router.get('/detail/:id', checkLoginAdmin, OrderController.getDetailById)
router.get('/:id', checkLoginAdmin, OrderController.getById)
router.patch('/:id/status', checkLoginAdmin, OrderController.updateState)
router.delete('/:id', checkLoginAdmin, OrderController.delete)

export default router
