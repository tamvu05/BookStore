import express from 'express'
import BookController from '../../controllers/book.controller.js'
import { createUploadMiddleware } from '../../middlewares/upload.js';
import { bookConfig } from '../../configs/adminView.config.js';
import { checkLoginAdmin, isAdmin } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', checkLoginAdmin, BookController.getAll)

router.get('/partials', checkLoginAdmin, BookController.getPartials)

router.get('/export', checkLoginAdmin, isAdmin, BookController.export)

router.get('/quantity/:id', checkLoginAdmin, BookController.getQuantity)

router.get('/:id', checkLoginAdmin, BookController.getById)

router.post('/', checkLoginAdmin, isAdmin, createUploadMiddleware('HinhAnh'), BookController.create);

router.put('/:id', checkLoginAdmin, isAdmin, createUploadMiddleware('HinhAnh'), BookController.update);

router.delete('/:id', checkLoginAdmin, isAdmin, BookController.delete);

router.patch('/:id/stock', checkLoginAdmin, isAdmin, BookController.updateStock);

export default router