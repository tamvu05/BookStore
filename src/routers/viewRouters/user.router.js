import express from 'express'
import SachController from '../../controllers/sach.controller.js';
import TheLoaiController from '../../controllers/theLoai.controller.js';

const setUserLayout = (req, res, next) => {
    res.locals.userLayout = 'layouts/userLayout'
    next()
}

const router = express.Router()

router.use(setUserLayout)

router.get('/sach', SachController.getAllUser);
router.get('/theloai', TheLoaiController.getAllUser)

export default router