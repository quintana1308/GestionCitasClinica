import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import {
  upload,
  uploadPhotos,
  getRecordPhotos,
  getClientPhotos,
  updatePhoto,
  deletePhoto,
  servePhoto,
  getBeforeAfterComparison
} from '../controllers/photoController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Subir fotos (múltiples archivos)
router.post('/upload', authorize(['admin', 'employee']), upload.array('photos', 10), uploadPhotos);

// Obtener fotos de un registro específico
router.get('/record/:recordId', authorize(['admin', 'employee']), getRecordPhotos);

// Obtener fotos de un cliente
router.get('/client/:clientId', authorize(['admin', 'employee']), getClientPhotos);

// Obtener comparativa antes/después
router.get('/record/:recordId/comparison', authorize(['admin', 'employee']), getBeforeAfterComparison);

// Servir archivo de foto
router.get('/:id/file', servePhoto);

// Actualizar metadatos de foto
router.put('/:id', authorize(['admin', 'employee']), updatePhoto);

// Eliminar foto
router.delete('/:id', authorize(['admin', 'employee']), deletePhoto);

export default router;
