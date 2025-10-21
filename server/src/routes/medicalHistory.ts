import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { uploadMedicalImages, handleMulterError } from '../middleware/upload';
import {
  createMedicalHistory,
  getClientMedicalHistory,
  getMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
  getMedicalHistoryStats,
  completeAppointmentWithHistory,
  uploadMedicalHistoryImages,
  deleteMedicalHistoryImage
} from '../controllers/medicalHistoryController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Completar cita y crear historial médico
router.post('/complete-appointment/:appointmentId', authorize('admin', 'employee'), completeAppointmentWithHistory);

// Crear registro de historial médico
router.post('/', authorize('admin', 'employee'), createMedicalHistory);

// Obtener historial médico de un cliente
router.get('/client/:clientId', authorize('admin', 'employee'), getClientMedicalHistory);

// Obtener estadísticas del historial médico
router.get('/client/:clientId/stats', authorize('admin', 'employee'), getMedicalHistoryStats);

// Obtener registro específico
router.get('/:id', authorize('admin', 'employee'), getMedicalHistory);

// Actualizar registro
router.put('/:id', authorize('admin', 'employee'), updateMedicalHistory);

// Eliminar registro
router.delete('/:id', authorize('admin', 'employee'), deleteMedicalHistory);

// Subir imágenes para historial médico
router.post('/upload-images', authorize('admin', 'employee'), uploadMedicalImages.array('images', 5), handleMulterError, uploadMedicalHistoryImages);

// Eliminar imagen del historial médico
router.post('/delete-image', authorize('admin', 'employee'), deleteMedicalHistoryImage);

export default router;
