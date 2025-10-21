import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  getInvoiceStats
} from '../controllers/invoiceController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener todas las facturas (solo admin y empleados)
router.get('/', authorize('admin', 'employee'), getInvoices);

// Obtener estadísticas de facturas (solo admin)
router.get('/stats', authorize('admin'), getInvoiceStats);

// Obtener factura por ID (admin, empleados y el cliente propietario)
router.get('/:id', authorize('admin', 'employee', 'client'), getInvoiceById);

// Crear nueva factura (solo admin y empleados)
router.post('/', authorize('admin', 'employee'), createInvoice);

// Actualizar estado de factura (solo admin y empleados)
router.patch('/:id/status', authorize('admin', 'employee'), updateInvoiceStatus);

export default router;
