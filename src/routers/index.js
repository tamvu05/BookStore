import express from 'express'
import viewRouter from './viewRouters/index.js'
import apiRouter from './apiRouters/index.js'

const router = express.Router()

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)

router.use('/api', asyncHandler(apiRouter))
router.use('/', asyncHandler(viewRouter))

// handling error
router.use((err, req, res, next) => {
   
    const status = err.status || 500; 
    const message = err.message || 'Lỗi hệ thống không xác định';
    
    res.status(status).json({
        success: false,
        status: status,
        message: message
    });
});

export default router
