import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus
} from '../controllers/employeeController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener todos los empleados
router.get('/', authorize('admin'), getEmployees);

// Obtener empleado por ID
router.get('/:id', authorize('admin'), getEmployee);

// Crear nuevo empleado
router.post('/', authorize('admin'), createEmployee);

// Actualizar empleado
router.put('/:id', authorize('admin'), updateEmployee);

// Cambiar estado del empleado
router.patch('/:id/status', authorize('admin'), toggleEmployeeStatus);

// Eliminar empleado
router.delete('/:id', authorize('admin'), deleteEmployee);

export default router;
