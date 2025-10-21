import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import Joi from 'joi';

// Esquemas de validación
const createRecordSchema = Joi.object({
  appointmentId: Joi.string().required(),
  treatmentsPerformed: Joi.array().items(Joi.object({
    treatmentId: Joi.string().required(),
    treatmentName: Joi.string().required(),
    details: Joi.string().optional(),
    quantity: Joi.number().min(1).default(1),
    notes: Joi.string().optional()
  })).required(),
  results: Joi.string().optional(),
  observations: Joi.string().optional(),
  complications: Joi.string().optional(),
  clientSatisfaction: Joi.number().min(1).max(5).optional(),
  requiresFollowUp: Joi.boolean().default(false),
  followUpDate: Joi.date().optional(),
  followUpNotes: Joi.string().optional()
});

const updateRecordSchema = Joi.object({
  treatmentsPerformed: Joi.array().items(Joi.object({
    treatmentId: Joi.string().required(),
    treatmentName: Joi.string().required(),
    details: Joi.string().optional(),
    quantity: Joi.number().min(1).default(1),
    notes: Joi.string().optional()
  })).optional(),
  results: Joi.string().optional(),
  observations: Joi.string().optional(),
  complications: Joi.string().optional(),
  clientSatisfaction: Joi.number().min(1).max(5).optional(),
  requiresFollowUp: Joi.boolean().optional(),
  followUpDate: Joi.date().optional(),
  followUpNotes: Joi.string().optional()
});

// Crear registro de cita completada
export const createAppointmentRecord = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { error, value } = createRecordSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const userId = req.user?.id;

    // Verificar que la cita existe y está completada
    const appointment = await prisma.appointment.findUnique({
      where: { id: validatedData.appointmentId },
      include: {
        client: true,
        employee: true,
        treatments: {
          include: {
            treatment: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    if (appointment.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden crear registros para citas completadas'
      });
    }

    // Verificar si ya existe un registro para esta cita
    const existingRecord = await prisma.appointmentRecord.findUnique({
      where: { appointmentId: validatedData.appointmentId }
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un registro para esta cita'
      });
    }

    // Crear el registro
    const record = await prisma.appointmentRecord.create({
      data: {
        appointmentId: validatedData.appointmentId,
        clientId: appointment.clientId,
        employeeId: appointment.employeeId!,
        date: appointment.date,
        treatmentsPerformed: validatedData.treatmentsPerformed,
        results: validatedData.results,
        observations: validatedData.observations,
        complications: validatedData.complications,
        clientSatisfaction: validatedData.clientSatisfaction,
        requiresFollowUp: validatedData.requiresFollowUp,
        followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : null,
        followUpNotes: validatedData.followUpNotes
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        employee: {
          include: {
            user: true
          }
        },
        photos: true,
        documents: true
      }
    });

    // Si requiere seguimiento, crear plan de seguimiento
    if (validatedData.requiresFollowUp && validatedData.followUpDate) {
      for (const treatment of validatedData.treatmentsPerformed) {
        await prisma.followUpPlan.create({
          data: {
            clientId: appointment.clientId,
            recordId: record.id,
            treatmentId: treatment.treatmentId,
            title: `Seguimiento - ${treatment.treatmentName}`,
            description: validatedData.followUpNotes,
            scheduledDate: new Date(validatedData.followUpDate),
            createdBy: userId!
          }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Registro de cita creado exitosamente',
      data: record
    });

  } catch (error) {
    console.error('Error al crear registro de cita:', error);
    
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

// Obtener historial médico de un cliente
export const getClientMedicalHistory = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [records, total] = await Promise.all([
      prisma.appointmentRecord.findMany({
        where: { clientId },
        include: {
          appointment: {
            include: {
              treatments: {
                include: {
                  treatment: true
                }
              }
            }
          },
          employee: {
            include: {
              user: true
            }
          },
          photos: {
            orderBy: { takenAt: 'asc' }
          },
          documents: true,
          followUpPlans: {
            include: {
              treatment: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.appointmentRecord.count({
        where: { clientId }
      })
    ]);

    res.json({
      success: true,
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
    console.error('Error al obtener historial médico:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener registro específico
export const getAppointmentRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await prisma.appointmentRecord.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            treatments: {
              include: {
                treatment: true
              }
            }
          }
        },
        client: {
          include: {
            user: true
          }
        },
        employee: {
          include: {
            user: true
          }
        },
        photos: {
          orderBy: { takenAt: 'asc' }
        },
        documents: true,
        followUpPlans: {
          include: {
            treatment: true
          }
        }
      }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado'
      });
    }

    res.json({
      success: true,
      data: record
    });

  } catch (error) {
    console.error('Error al obtener registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar registro
export const updateAppointmentRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateRecordSchema.parse(req.body);

    const record = await prisma.appointmentRecord.findUnique({
      where: { id }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado'
      });
    }

    const updatedRecord = await prisma.appointmentRecord.update({
      where: { id },
      data: {
        ...validatedData,
        followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : undefined
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        employee: {
          include: {
            user: true
          }
        },
        photos: true,
        documents: true,
        followUpPlans: true
      }
    });

    res.json({
      success: true,
      message: 'Registro actualizado exitosamente',
      data: updatedRecord
    });

  } catch (error) {
    console.error('Error al actualizar registro:', error);
    
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

// Obtener estadísticas del historial médico
export const getMedicalHistoryStats = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;

    const [
      totalRecords,
      averageSatisfaction,
      treatmentCounts,
      recentRecords
    ] = await Promise.all([
      prisma.appointmentRecord.count({
        where: { clientId }
      }),
      prisma.appointmentRecord.aggregate({
        where: { 
          clientId,
          clientSatisfaction: { not: null }
        },
        _avg: {
          clientSatisfaction: true
        }
      }),
      prisma.appointmentRecord.findMany({
        where: { clientId },
        select: {
          treatmentsPerformed: true
        }
      }),
      prisma.appointmentRecord.findMany({
        where: { clientId },
        include: {
          photos: true,
          followUpPlans: true
        },
        orderBy: { date: 'desc' },
        take: 5
      })
    ]);

    // Contar tratamientos por tipo
    const treatmentStats: Record<string, number> = {};
    treatmentCounts.forEach(record => {
      const treatments = record.treatmentsPerformed as any[];
      treatments.forEach(treatment => {
        treatmentStats[treatment.treatmentName] = (treatmentStats[treatment.treatmentName] || 0) + 1;
      });
    });

    const stats = {
      totalRecords,
      averageSatisfaction: averageSatisfaction._avg.clientSatisfaction || 0,
      treatmentStats,
      totalPhotos: recentRecords.reduce((sum, record) => sum + record.photos.length, 0),
      pendingFollowUps: recentRecords.reduce((sum, record) => 
        sum + record.followUpPlans.filter(plan => plan.status === 'PENDING').length, 0
      )
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
