import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getTodayAppointments
} from '../controllers/appointmentController';

const router = Router();

// Rutas de citas
router.get('/', authenticate, getAppointments);
router.get('/today', authenticate, getTodayAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.post('/', authenticate, authorize('admin', 'employee'), createAppointment);
router.put('/:id', authenticate, authorize('admin', 'employee'), updateAppointment);
router.patch('/:id/status', authenticate, authorize('admin', 'employee'), updateAppointmentStatus);
router.patch('/:id/cancel', authenticate, authorize('admin', 'employee'), cancelAppointment);

export default router;
