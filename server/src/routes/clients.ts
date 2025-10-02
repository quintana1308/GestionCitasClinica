import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  toggleClientStatus,
  deleteClient,
  getClientStats
} from '../controllers/clientController';

const router = Router();

// Rutas de clientes
router.get('/', authenticate, authorize('admin', 'employee'), getClients);
router.get('/:id', authenticate, authorize('admin', 'employee'), getClientById);
router.post('/', authenticate, authorize('admin', 'employee'), createClient);
router.put('/:id', authenticate, authorize('admin', 'employee'), updateClient);
router.patch('/:id/status', authenticate, authorize('admin'), toggleClientStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteClient);
router.get('/:id/stats', authenticate, authorize('admin', 'employee'), getClientStats);

export default router;
