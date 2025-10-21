import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import {
  createAppointmentRecord,
  getClientMedicalHistory,
  getAppointmentRecord,
  updateAppointmentRecord,
  getMedicalHistoryStats
} from '../controllers/appointmentRecordController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear registro de cita completada
router.post('/', authorize(['admin', 'employee']), createAppointmentRecord);

// Obtener historial médico de un cliente
router.get('/client/:clientId', authorize(['admin', 'employee']), getClientMedicalHistory);

// Obtener estadísticas del historial médico
router.get('/client/:clientId/stats', authorize(['admin', 'employee']), getMedicalHistoryStats);

// Obtener registro específico
router.get('/:id', authorize(['admin', 'employee']), getAppointmentRecord);

// Actualizar registro
router.put('/:id', authorize(['admin', 'employee']), updateAppointmentRecord);

export default router;
