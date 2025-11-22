import express from 'express'
import CategoryController from '../../controllers/category.controller.js'

const router = express.Router()

router.get('/check-unique', CategoryController.checkUnique)

router.get('/partials', CategoryController.getPartials)

router.post('/', CategoryController.create)

router.put('/:id', CategoryController.update)

router.delete('/:id', CategoryController.delete)

router.get('/:id', CategoryController.getById)

export default router
