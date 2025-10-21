import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getDashboardStats,
  getTodaySchedule,
  getSystemAlerts,
  getRecentActivity,
  getRecentAppointments
} from '../controllers/dashboardController';

const router = Router();

// Rutas del dashboard
router.get('/stats', authenticate, authorize('admin', 'employee'), getDashboardStats);
router.get('/schedule/today', authenticate, authorize('admin', 'employee'), getTodaySchedule);
router.get('/appointments/recent', authenticate, authorize('admin', 'employee'), getRecentAppointments);
router.get('/alerts', authenticate, authorize('admin', 'employee'), getSystemAlerts);
router.get('/activity', authenticate, authorize('admin'), getRecentActivity);

export default router;
