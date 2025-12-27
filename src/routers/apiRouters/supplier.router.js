import express from 'express'
import SupplierController from '../../controllers/supplier.controller.js'
import { checkLoginAdmin, isAdmin } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/partials', checkLoginAdmin, isAdmin, SupplierController.getPartials)

router.get('/export', checkLoginAdmin, isAdmin, SupplierController.export)

router.get('/:id', checkLoginAdmin, isAdmin, SupplierController.getById)


router.post('/', checkLoginAdmin, isAdmin, SupplierController.create)

router.put('/:id', checkLoginAdmin, isAdmin, SupplierController.update)

router.delete('/:id', checkLoginAdmin, isAdmin, SupplierController.delete)


export default router
