import { Router } from 'express';
import { 
  login, 
  register, 
  loginWithClientCode, 
  getProfile, 
  updateProfile, 
  changePassword 
} from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/login', login);
router.post('/register', register);
router.post('/login/client', loginWithClientCode);

// Rutas protegidas
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
