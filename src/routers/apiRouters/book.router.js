import express from 'express'
import BookController from '../../controllers/book.controller.js'
import { createUploadMiddleware } from '../../middlewares/upload.js';
import { bookConfig } from '../../configs/adminView.config.js';

const router = express.Router()

router.get('/', BookController.getAll)

router.get('/partials', BookController.getPartials)

router.get('/export', BookController.export)

router.get('/quantity/:id', BookController.getQuantity)

router.get('/:id', BookController.getById)

router.post('/', createUploadMiddleware('HinhAnh'), BookController.create);

router.put('/:id', createUploadMiddleware('HinhAnh'), BookController.update);

router.delete('/:id', BookController.delete);

router.patch('/:id/stock', BookController.updateStock);

export default router