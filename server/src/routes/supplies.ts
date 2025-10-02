import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getSupplies,
  getSupplyById,
  createSupply,
  updateSupply,
  updateSupplyStock,
  updateSupplyStatus,
  getLowStockSupplies,
  getSupplyCategories,
  getSupplyMovements
} from '../controllers/supplyController';

const router = Router();

// Rutas de inventario/insumos
router.get('/', authenticate, authorize('admin', 'employee'), getSupplies);
router.get('/low-stock', authenticate, authorize('admin', 'employee'), getLowStockSupplies);
router.get('/categories', authenticate, authorize('admin', 'employee'), getSupplyCategories);
router.get('/:id', authenticate, authorize('admin', 'employee'), getSupplyById);
router.post('/', authenticate, authorize('admin'), createSupply);
router.put('/:id', authenticate, authorize('admin'), updateSupply);
router.patch('/:id/stock', authenticate, authorize('admin', 'employee'), updateSupplyStock);
router.patch('/:id/status', authenticate, authorize('admin'), updateSupplyStatus);
router.get('/:id/movements', authenticate, authorize('admin', 'employee'), getSupplyMovements);

export default router;
