import { Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';

// Esquemas de validación
const createFollowUpSchema = z.object({
  clientId: z.string(),
  recordId: z.string(),
  treatmentId: z.string(),
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  scheduledDate: z.string(),
  reminderDays: z.number().min(0).default(7),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.number().min(1).optional()
});

const updateFollowUpSchema = createFollowUpSchema.partial().extend({
  status: z.enum(['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'OVERDUE']).optional()
});

// Crear plan de seguimiento
export const createFollowUpPlan = async (req: Request, res: Response) => {
  try {
    const validatedData = createFollowUpSchema.parse(req.body);
    const userId = req.user?.id;

    // Verificar que el registro existe
    const record = await prisma.appointmentRecord.findUnique({
      where: { id: validatedData.recordId },
      include: {
        client: true,
        appointment: true
      }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Registro de cita no encontrado'
      });
    }

    // Verificar que el tratamiento existe
    const treatment = await prisma.treatment.findUnique({
      where: { id: validatedData.treatmentId }
    });

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Tratamiento no encontrado'
      });
    }

    const followUpPlan = await prisma.followUpPlan.create({
      data: {
        clientId: validatedData.clientId,
        recordId: validatedData.recordId,
        treatmentId: validatedData.treatmentId,
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        scheduledDate: new Date(validatedData.scheduledDate),
        reminderDays: validatedData.reminderDays,
        isRecurring: validatedData.isRecurring,
        recurringInterval: validatedData.recurringInterval,
        createdBy: userId!
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        treatment: true,
        record: {
          include: {
            appointment: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Plan de seguimiento creado exitosamente',
      data: followUpPlan
    });

  } catch (error) {
    console.error('Error al crear plan de seguimiento:', error);
    
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

// Obtener planes de seguimiento
export const getFollowUpPlans = async (req: Request, res: Response) => {
  try {
    const { 
      clientId, 
      status, 
      priority, 
      overdue,
      page = 1, 
      limit = 10 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const whereClause: any = {};

    if (clientId) {
      whereClause.clientId = clientId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    // Filtrar vencidos
    if (overdue === 'true') {
      whereClause.scheduledDate = {
        lt: new Date()
      };
      whereClause.status = {
        in: ['PENDING', 'SCHEDULED']
      };
    }

    const [plans, total] = await Promise.all([
      prisma.followUpPlan.findMany({
        where: whereClause,
        include: {
          client: {
            include: {
              user: true
            }
          },
          treatment: true,
          record: {
            include: {
              appointment: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { scheduledDate: 'asc' }
        ],
        skip,
        take: Number(limit)
      }),
      prisma.followUpPlan.count({
        where: whereClause
      })
    ]);

    // Actualizar estados vencidos automáticamente
    const now = new Date();
    const overdueIds = plans
      .filter(plan => 
        plan.scheduledDate < now && 
        ['PENDING', 'SCHEDULED'].includes(plan.status)
      )
      .map(plan => plan.id);

    if (overdueIds.length > 0) {
      await prisma.followUpPlan.updateMany({
        where: {
          id: { in: overdueIds }
        },
        data: {
          status: 'OVERDUE'
        }
      });
    }

    res.json({
      success: true,
      data: {
        plans,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener planes de seguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener plan específico
export const getFollowUpPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const plan = await prisma.followUpPlan.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: true
          }
        },
        treatment: true,
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
            },
            photos: true
          }
        }
      }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan de seguimiento no encontrado'
      });
    }

    res.json({
      success: true,
      data: plan
    });

  } catch (error) {
    console.error('Error al obtener plan de seguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar plan de seguimiento
export const updateFollowUpPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateFollowUpSchema.parse(req.body);

    const plan = await prisma.followUpPlan.findUnique({
      where: { id }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan de seguimiento no encontrado'
      });
    }

    const updateData: any = { ...validatedData };
    
    if (validatedData.scheduledDate) {
      updateData.scheduledDate = new Date(validatedData.scheduledDate);
    }

    // Si se marca como completado, agregar fecha de completado
    if (validatedData.status === 'COMPLETED' && plan.status !== 'COMPLETED') {
      updateData.completedDate = new Date();
    }

    const updatedPlan = await prisma.followUpPlan.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          include: {
            user: true
          }
        },
        treatment: true,
        record: true
      }
    });

    // Si es recurrente y se completó, crear el siguiente
    if (
      validatedData.status === 'COMPLETED' && 
      plan.isRecurring && 
      plan.recurringInterval
    ) {
      const nextDate = new Date(plan.scheduledDate);
      nextDate.setDate(nextDate.getDate() + plan.recurringInterval);

      await prisma.followUpPlan.create({
        data: {
          clientId: plan.clientId,
          recordId: plan.recordId,
          treatmentId: plan.treatmentId,
          title: plan.title,
          description: plan.description,
          priority: plan.priority,
          scheduledDate: nextDate,
          reminderDays: plan.reminderDays,
          isRecurring: plan.isRecurring,
          recurringInterval: plan.recurringInterval,
          createdBy: plan.createdBy
        }
      });
    }

    res.json({
      success: true,
      message: 'Plan de seguimiento actualizado exitosamente',
      data: updatedPlan
    });

  } catch (error) {
    console.error('Error al actualizar plan de seguimiento:', error);
    
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

// Eliminar plan de seguimiento
export const deleteFollowUpPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const plan = await prisma.followUpPlan.findUnique({
      where: { id }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan de seguimiento no encontrado'
      });
    }

    await prisma.followUpPlan.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Plan de seguimiento eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar plan de seguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener recordatorios próximos
export const getUpcomingReminders = async (req: Request, res: Response) => {
  try {
    const { days = 7 } = req.query;
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + Number(days));

    const reminders = await prisma.followUpPlan.findMany({
      where: {
        status: { in: ['PENDING', 'SCHEDULED'] },
        scheduledDate: {
          lte: reminderDate,
          gte: new Date()
        }
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        treatment: true,
        record: {
          include: {
            appointment: true
          }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    res.json({
      success: true,
      data: reminders
    });

  } catch (error) {
    console.error('Error al obtener recordatorios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de seguimiento
export const getFollowUpStats = async (req: Request, res: Response) => {
  try {
    const [
      totalPlans,
      pendingPlans,
      overduePlans,
      completedThisMonth,
      priorityStats
    ] = await Promise.all([
      prisma.followUpPlan.count(),
      prisma.followUpPlan.count({
        where: { status: 'PENDING' }
      }),
      prisma.followUpPlan.count({
        where: {
          status: { in: ['PENDING', 'SCHEDULED'] },
          scheduledDate: { lt: new Date() }
        }
      }),
      prisma.followUpPlan.count({
        where: {
          status: 'COMPLETED',
          completedDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.followUpPlan.groupBy({
        by: ['priority'],
        _count: true,
        where: {
          status: { in: ['PENDING', 'SCHEDULED'] }
        }
      })
    ]);

    const stats = {
      totalPlans,
      pendingPlans,
      overduePlans,
      completedThisMonth,
      priorityDistribution: priorityStats.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>)
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de seguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
