import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Placeholder para rutas de usuarios
router.get('/', authenticate, authorize('admin', 'employee'), (req, res) => {
  res.json({ success: true, message: 'Ruta de usuarios - En desarrollo' });
});

export default router;
