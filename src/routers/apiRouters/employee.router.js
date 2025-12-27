import express from 'express'
import EmployeeController from '../../controllers/employee.controller.js'
import { checkLoginAdmin, isAdmin } from '../../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/partials', checkLoginAdmin, isAdmin, EmployeeController.getPartials)
router.get('/:id', checkLoginAdmin, isAdmin, EmployeeController.getById)
router.post('/', checkLoginAdmin, isAdmin, EmployeeController.create)
router.put('/:id', checkLoginAdmin, isAdmin, EmployeeController.update)
router.delete('/:id', checkLoginAdmin, isAdmin, EmployeeController.delete)

export default router
