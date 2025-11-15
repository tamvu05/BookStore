import express from 'express'
import SachController from '../../controllers/sach.controller.js'
import TheLoaiController from '../../controllers/theLoai.controller.js'

const router = express.Router()

router.get('/sach', SachController.getAll)
router.get('/theloai', TheLoaiController.getAll)

router.get('/', (req, res, next) => {
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
    })
})

export default router
