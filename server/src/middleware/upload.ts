import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from './errorHandler';

// Crear directorio de uploads si no existe
const uploadsDir = path.join(process.cwd(), 'uploads', 'medical-history');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre con fecha, hora y cliente
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    const ext = path.extname(file.originalname);
    
    // Obtener información del cliente desde el body o usar genérico
    const clientInfo = req.body.clientName || req.body.clientId || 'cliente';
    const sanitizedClientInfo = clientInfo.replace(/[^a-zA-Z0-9]/g, '_');
    
    const filename = `${dateStr}_${timeStr}_${sanitizedClientInfo}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Filtro de archivos - solo imágenes
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new AppError('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WebP)', 400));
  }
};

// Configuración de multer
export const uploadMedicalImages = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 5 // Máximo 5 archivos por vez
  },
  fileFilter: fileFilter
});

// Middleware para manejar errores de multer
export const handleMulterError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('El archivo es demasiado grande. Máximo 5MB', 400));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Demasiados archivos. Máximo 5 archivos', 400));
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Campo de archivo inesperado', 400));
    }
  }
  next(error);
};
