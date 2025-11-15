import express from 'express'
import adminRouter from './admin.router.js'
import userRouter from './user.router.js'

const router = express.Router()

router.use('/admin', adminRouter)
router.use('/', userRouter)

export default router
