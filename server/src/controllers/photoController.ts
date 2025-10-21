import { Request, Response } from 'express';
import { prisma } from '../index';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { z } from 'zod';

// Configuración de multer para subida de fotos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.env.UPLOAD_PATH || './uploads', 'photos');
    
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Verificar que sea una imagen
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 10 // Máximo 10 archivos por vez
  }
});

// Esquemas de validación
const uploadPhotoSchema = z.object({
  recordId: z.string(),
  type: z.enum(['BEFORE', 'DURING', 'AFTER', 'RESULT', 'FOLLOWUP']),
  bodyArea: z.string().optional(),
  angle: z.string().optional(),
  notes: z.string().optional(),
  takenAt: z.string().optional()
});

// Subir fotos
export const uploadPhotos = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se han subido archivos'
      });
    }

    const { recordId, type, bodyArea, angle, notes, takenAt } = req.body;
    
    // Validar datos
    const validatedData = uploadPhotoSchema.parse({
      recordId,
      type,
      bodyArea,
      angle,
      notes,
      takenAt
    });

    // Verificar que el registro existe
    const record = await prisma.appointmentRecord.findUnique({
      where: { id: validatedData.recordId }
    });

    if (!record) {
      // Eliminar archivos subidos si el registro no existe
      await Promise.all(files.map(file => fs.unlink(file.path).catch(() => {})));
      
      return res.status(404).json({
        success: false,
        message: 'Registro de cita no encontrado'
      });
    }

    // Crear registros de fotos en la base de datos
    const photoPromises = files.map(file => {
      return prisma.photo.create({
        data: {
          recordId: validatedData.recordId,
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimeType: file.mimetype,
          type: validatedData.type,
          bodyArea: validatedData.bodyArea,
          angle: validatedData.angle,
          notes: validatedData.notes,
          takenAt: validatedData.takenAt ? new Date(validatedData.takenAt) : new Date()
        }
      });
    });

    const photos = await Promise.all(photoPromises);

    res.status(201).json({
      success: true,
      message: `${photos.length} foto(s) subida(s) exitosamente`,
      data: photos
    });

  } catch (error) {
    console.error('Error al subir fotos:', error);
    
    // Limpiar archivos en caso de error
    const files = req.files as Express.Multer.File[];
    if (files) {
      await Promise.all(files.map(file => fs.unlink(file.path).catch(() => {})));
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener fotos de un registro
export const getRecordPhotos = async (req: Request, res: Response) => {
  try {
    const { recordId } = req.params;
    const { type, bodyArea } = req.query;

    const whereClause: any = { recordId };
    
    if (type) {
      whereClause.type = type;
    }
    
    if (bodyArea) {
      whereClause.bodyArea = bodyArea;
    }

    const photos = await prisma.photo.findMany({
      where: whereClause,
      orderBy: [
        { type: 'asc' },
        { takenAt: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: photos
    });

  } catch (error) {
    console.error('Error al obtener fotos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener fotos de un cliente
export const getClientPhotos = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { type, bodyArea, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = {
      record: {
        clientId
      }
    };
    
    if (type) {
      whereClause.type = type;
    }
    
    if (bodyArea) {
      whereClause.bodyArea = bodyArea;
    }

    const [photos, total] = await Promise.all([
      prisma.photo.findMany({
        where: whereClause,
        include: {
          record: {
            include: {
              appointment: {
                include: {
                  treatments: {
                    include: {
                      treatment: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { takenAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.photo.count({
        where: whereClause
      })
    ]);

    res.json({
      success: true,
      data: {
        photos,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener fotos del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar metadatos de foto
export const updatePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, bodyArea, angle, notes } = req.body;

    const photo = await prisma.photo.findUnique({
      where: { id }
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    const updatedPhoto = await prisma.photo.update({
      where: { id },
      data: {
        type,
        bodyArea,
        angle,
        notes
      }
    });

    res.json({
      success: true,
      message: 'Foto actualizada exitosamente',
      data: updatedPhoto
    });

  } catch (error) {
    console.error('Error al actualizar foto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar foto
export const deletePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const photo = await prisma.photo.findUnique({
      where: { id }
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    // Eliminar archivo físico
    try {
      await fs.unlink(photo.path);
    } catch (error) {
      console.warn('No se pudo eliminar el archivo físico:', error);
    }

    // Eliminar registro de la base de datos
    await prisma.photo.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Foto eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar foto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Servir archivo de foto
export const servePhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const photo = await prisma.photo.findUnique({
      where: { id }
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }

    // Verificar que el archivo existe
    try {
      await fs.access(photo.path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Archivo de foto no encontrado'
      });
    }

    // Configurar headers para la imagen
    res.setHeader('Content-Type', photo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${photo.originalName}"`);
    
    // Enviar archivo
    res.sendFile(path.resolve(photo.path));

  } catch (error) {
    console.error('Error al servir foto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener comparativa antes/después
export const getBeforeAfterComparison = async (req: Request, res: Response) => {
  try {
    const { recordId } = req.params;
    const { bodyArea } = req.query;

    const whereClause: any = {
      recordId,
      type: { in: ['BEFORE', 'AFTER', 'RESULT'] }
    };

    if (bodyArea) {
      whereClause.bodyArea = bodyArea;
    }

    const photos = await prisma.photo.findMany({
      where: whereClause,
      orderBy: [
        { type: 'asc' },
        { takenAt: 'asc' }
      ]
    });

    // Agrupar por tipo
    const comparison = {
      before: photos.filter(p => p.type === 'BEFORE'),
      after: photos.filter(p => p.type === 'AFTER'),
      result: photos.filter(p => p.type === 'RESULT')
    };

    res.json({
      success: true,
      data: comparison
    });

  } catch (error) {
    console.error('Error al obtener comparativa:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
