import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getTreatments,
  getTreatmentById,
  createTreatment,
  updateTreatment,
  toggleTreatmentStatus,
  deleteTreatment,
  getTreatmentCategories,
  getTreatmentStats
} from '../controllers/treatmentController';

const router = Router();

// Rutas de tratamientos
router.get('/', authenticate, getTreatments);
router.get('/categories', authenticate, getTreatmentCategories);
router.get('/:id', authenticate, getTreatmentById);
router.post('/', authenticate, authorize('admin'), createTreatment);
router.put('/:id', authenticate, authorize('admin'), updateTreatment);
router.patch('/:id/status', authenticate, authorize('admin'), toggleTreatmentStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteTreatment);
router.get('/:id/stats', authenticate, authorize('admin', 'employee'), getTreatmentStats);

export default router;
