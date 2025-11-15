import express from 'express'
import NhaXuatBanController from '../../controllers/nhaXuatBan.controller.js'

const router = express.Router()

router.post('/', NhaXuatBanController.create)

router.put('/:id', NhaXuatBanController.update)

router.delete('/:id', NhaXuatBanController.delete)

export default router
