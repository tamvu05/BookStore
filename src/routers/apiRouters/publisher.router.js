import express from 'express'
import PublisherController from '../../controllers/publisher.controller.js'
import { checkLoginAdmin, isAdmin } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/partials', checkLoginAdmin, PublisherController.getPartials)

router.get('/export', checkLoginAdmin, isAdmin, PublisherController.export)

router.get('/:id', checkLoginAdmin, PublisherController.getById)

router.post('/', checkLoginAdmin, isAdmin, PublisherController.create)

router.put('/:id', checkLoginAdmin, isAdmin, PublisherController.update)

router.delete('/:id', checkLoginAdmin, isAdmin, PublisherController.delete)

export default router
