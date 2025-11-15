import express from 'express'
import sachRouter from './sach.router.js'
import nhaXuatBanRouter from './nhaXuatBan.router.js'
import tacGiaRouter from './tacGia.router.js'
import theLoaiRouter from './theLoai.router.js'
const router = express.Router()

router.use('/tacgia', tacGiaRouter)
router.use('/theloai', theLoaiRouter)
router.use('/nhaxuatban', nhaXuatBanRouter)
router.use('/sach', sachRouter)

export default router
