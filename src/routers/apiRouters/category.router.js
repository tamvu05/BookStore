import express from 'express'
import CategoryController from '../../controllers/category.controller.js'
import { checkLoginAdmin, isAdmin } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/partials', checkLoginAdmin, CategoryController.getPartials)

router.get('/export', checkLoginAdmin, isAdmin, CategoryController.export)

router.get('/:id', checkLoginAdmin, CategoryController.getById)

router.post('/', checkLoginAdmin, isAdmin, CategoryController.create)

router.put('/:id', checkLoginAdmin, isAdmin, CategoryController.update)

router.delete('/:id', checkLoginAdmin, isAdmin, CategoryController.delete)

export default router
