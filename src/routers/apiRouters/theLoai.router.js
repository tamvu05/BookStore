import express from 'express'
import TheLoaiController from '../../controllers/theLoai.controller.js'

const router = express.Router()

router.post('/', TheLoaiController.create)

router.put('/:id', TheLoaiController.update)

router.delete('/:id', TheLoaiController.delete)

export default router
