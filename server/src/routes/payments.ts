import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  markPaymentAsPaid,
  getPendingPayments,
  getPaymentStats
} from '../controllers/paymentController';

const router = Router();

// Rutas de pagos
router.get('/', authenticate, authorize('admin', 'employee'), getPayments);
router.get('/pending', authenticate, authorize('admin', 'employee'), getPendingPayments);
router.get('/stats', authenticate, authorize('admin'), getPaymentStats);
router.get('/:id', authenticate, authorize('admin', 'employee'), getPaymentById);
router.post('/', authenticate, authorize('admin', 'employee'), createPayment);
router.put('/:id', authenticate, authorize('admin', 'employee'), updatePayment);
router.patch('/:id/status', authenticate, authorize('admin', 'employee'), updatePaymentStatus);
router.patch('/:id/mark-paid', authenticate, authorize('admin', 'employee'), markPaymentAsPaid);

export default router;
