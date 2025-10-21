import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import {
  createFollowUpPlan,
  getFollowUpPlans,
  getFollowUpPlan,
  updateFollowUpPlan,
  deleteFollowUpPlan,
  getUpcomingReminders,
  getFollowUpStats
} from '../controllers/followUpController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener estadísticas de seguimiento
router.get('/stats', authorize(['admin', 'employee']), getFollowUpStats);

// Obtener recordatorios próximos
router.get('/reminders', authorize(['admin', 'employee']), getUpcomingReminders);

// Crear plan de seguimiento
router.post('/', authorize(['admin', 'employee']), createFollowUpPlan);

// Obtener planes de seguimiento (con filtros)
router.get('/', authorize(['admin', 'employee']), getFollowUpPlans);

// Obtener plan específico
router.get('/:id', authorize(['admin', 'employee']), getFollowUpPlan);

// Actualizar plan de seguimiento
router.put('/:id', authorize(['admin', 'employee']), updateFollowUpPlan);

// Eliminar plan de seguimiento
router.delete('/:id', authorize(['admin', 'employee']), deleteFollowUpPlan);

export default router;
