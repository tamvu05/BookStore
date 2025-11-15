import express from 'express'
import TacGiaController from '../../controllers/tacGia.controller.js'

const router = express.Router()

router.post('/', TacGiaController.create)

router.put('/:id', TacGiaController.update)

router.delete('/:id', TacGiaController.delete)

export default router
