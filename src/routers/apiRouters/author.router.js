import express from 'express'
import AuthorController from '../../controllers/author.controller.js'
import { checkLoginAdmin, isAdmin } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/partials', checkLoginAdmin, AuthorController.getPartials)

router.get('/export', checkLoginAdmin, isAdmin, AuthorController.export)

router.get('/:id', checkLoginAdmin, AuthorController.getById)

router.post('/', checkLoginAdmin, isAdmin, AuthorController.create)

router.put('/:id', checkLoginAdmin, isAdmin, AuthorController.update)

router.delete('/:id', checkLoginAdmin, isAdmin, AuthorController.delete)

export default router
