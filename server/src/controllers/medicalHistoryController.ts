import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import Joi from 'joi';
import path from 'path';
import fs from 'fs';

// Esquemas de validación
const createMedicalHistorySchema = Joi.object({
  clientId: Joi.string().required(),
  appointmentId: Joi.string().optional(),
  diagnosis: Joi.string().allow('').optional(),
  treatment: Joi.string().required(),
  notes: Joi.string().allow('').optional(),
  attachments: Joi.string().allow('').optional() // URLs separadas por comas
});

const updateMedicalHistorySchema = Joi.object({
  diagnosis: Joi.string().allow('').optional(),
  treatment: Joi.string().allow('').optional(),
  notes: Joi.string().allow('').optional(),
  attachments: Joi.string().allow('').optional()
});

// Crear registro de historial médico
export const createMedicalHistory = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { error, value } = createMedicalHistorySchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const userId = req.user?.id;

    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: value.clientId },
      include: { user: true }
    });

    if (!client) {
      throw new AppError('Cliente no encontrado', 404);
    }

    // Crear el registro de historial médico
    const medicalHistory = await prisma.medicalHistory.create({
      data: {
        clientId: value.clientId,
        diagnosis: value.diagnosis,
        treatment: value.treatment,
        notes: value.notes,
        attachments: value.attachments,
        createdBy: userId!
      },
      include: {
        client: {
          include: {
            user: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Registro de historial médico creado exitosamente',
      data: medicalHistory
    });

  } catch (error) {
    next(error);
  }
};

// Obtener historial médico de un cliente
export const getClientMedicalHistory = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { clientId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [records, total] = await Promise.all([
      prisma.medicalHistory.findMany({
        where: { clientId },
        include: {
          client: {
            include: {
              user: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.medicalHistory.count({
        where: { clientId }
      })
    ]);

    res.json({
      success: true,
      message: 'Historial médico obtenido exitosamente',
      data: {
        records,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Obtener registro específico
export const getMedicalHistory = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const record = await prisma.medicalHistory.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: true
          }
        }
      }
    });

    if (!record) {
      throw new AppError('Registro no encontrado', 404);
    }

    res.json({
      success: true,
      message: 'Registro obtenido exitosamente',
      data: record
    });

  } catch (error) {
    next(error);
  }
};

// Actualizar registro
export const updateMedicalHistory = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { error, value } = updateMedicalHistorySchema.validate(req.body);
    
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const record = await prisma.medicalHistory.findUnique({
      where: { id }
    });

    if (!record) {
      throw new AppError('Registro no encontrado', 404);
    }

    const updatedRecord = await prisma.medicalHistory.update({
      where: { id },
      data: value,
      include: {
        client: {
          include: {
            user: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Registro actualizado exitosamente',
      data: updatedRecord
    });

  } catch (error) {
    next(error);
  }
};

// Eliminar registro
export const deleteMedicalHistory = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const record = await prisma.medicalHistory.findUnique({
      where: { id }
    });

    if (!record) {
      throw new AppError('Registro no encontrado', 404);
    }

    await prisma.medicalHistory.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Registro eliminado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas del historial médico
export const getMedicalHistoryStats = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { clientId } = req.params;

    const [
      totalRecords,
      recentRecords,
      treatmentCounts
    ] = await Promise.all([
      prisma.medicalHistory.count({
        where: { clientId }
      }),
      prisma.medicalHistory.findMany({
        where: { clientId },
        orderBy: { date: 'desc' },
        take: 5,
        include: {
          client: {
            include: {
              user: true
            }
          }
        }
      }),
      prisma.medicalHistory.groupBy({
        by: ['treatment'],
        where: { clientId },
        _count: true
      })
    ]);

    const stats = {
      totalRecords,
      recentRecords,
      treatmentDistribution: treatmentCounts.reduce((acc, item) => {
        acc[item.treatment] = item._count;
        return acc;
      }, {} as Record<string, number>)
    };

    res.json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: stats
    });

  } catch (error) {
    next(error);
  }
};

// Completar cita y crear historial médico automáticamente
export const completeAppointmentWithHistory = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const { 
      diagnosis, 
      treatment, 
      notes, 
      attachments,
      requiresFollowUp,
      followUpDate,
      followUpNotes 
    } = req.body;

    const userId = req.user?.id;

    // Verificar que la cita existe
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        treatments: {
          include: {
            treatment: true
          }
        }
      }
    });

    if (!appointment) {
      throw new AppError('Cita no encontrada', 404);
    }

    if (appointment.status === 'COMPLETED') {
      throw new AppError('La cita ya está completada', 400);
    }

    // Usar transacción para actualizar cita y crear historial
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar estado de la cita
      const updatedAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' }
      });

      // Crear registro de historial médico
      const medicalHistory = await tx.medicalHistory.create({
        data: {
          clientId: appointment.clientId,
          diagnosis,
          treatment: treatment || appointment.treatments.map(t => t.treatment.name).join(', '),
          notes: notes || `Cita completada el ${new Date().toLocaleDateString()}. ${followUpNotes || ''}`,
          attachments,
          createdBy: userId!
        },
        include: {
          client: {
            include: {
              user: true
            }
          }
        }
      });

      return { appointment: updatedAppointment, medicalHistory };
    });

    res.json({
      success: true,
      message: 'Cita completada y historial médico creado exitosamente',
      data: result
    });

  } catch (error) {
    next(error);
  }
};

// Subir imágenes para historial médico
export const uploadMedicalHistoryImages = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      throw new AppError('No se han subido archivos', 400);
    }

    // Generar URLs de las imágenes subidas
    const imageUrls = files.map(file => {
      const relativePath = path.relative(process.cwd(), file.path);
      return `/${relativePath.replace(/\\/g, '/')}`;
    });

    res.json({
      success: true,
      message: 'Imágenes subidas exitosamente',
      data: {
        images: imageUrls,
        count: files.length
      }
    });

  } catch (error) {
    // Si hay error, eliminar archivos subidos
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    next(error);
  }
};

// Eliminar imagen del historial médico
export const deleteMedicalHistoryImage = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { imagePath } = req.body;
    
    if (!imagePath) {
      throw new AppError('Ruta de imagen requerida', 400);
    }

    // Construir ruta completa del archivo
    const fullPath = path.join(process.cwd(), imagePath.replace(/^\//, ''));
    
    // Verificar que el archivo existe y está en el directorio permitido
    const uploadsDir = path.join(process.cwd(), 'uploads', 'medical-history');
    if (!fullPath.startsWith(uploadsDir)) {
      throw new AppError('Ruta de archivo no válida', 400);
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });

  } catch (error) {
    next(error);
  }
};
