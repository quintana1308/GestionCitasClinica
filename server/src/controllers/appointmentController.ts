import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import { AppointmentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Obtener todas las citas con filtros y paginación
export const getAppointments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status,
      employeeId,
      clientId,
      startDate,
      endDate,
      sortBy = 'date', 
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { client: { user: { firstName: { contains: search as string, mode: 'insensitive' } } } },
        { client: { user: { lastName: { contains: search as string, mode: 'insensitive' } } } },
        { employee: { user: { firstName: { contains: search as string, mode: 'insensitive' } } } },
        { employee: { user: { lastName: { contains: search as string, mode: 'insensitive' } } } },
        { notes: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    // Obtener citas con paginación
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          client: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          employee: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          treatments: {
            include: {
              treatment: true
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder }
      }),
      prisma.appointment.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Citas obtenidas exitosamente',
      data: {
        appointments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener una cita por ID
export const getAppointmentById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        employee: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        treatments: {
          include: {
            treatment: true
          }
        },
        payments: true
      }
    });

    if (!appointment) {
      throw new AppError('Cita no encontrada', 404);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Cita obtenida exitosamente',
      data: { appointment }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Crear una nueva cita
export const createAppointment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      clientId,
      employeeId,
      date,
      startTime,
      endTime,
      treatmentIds,
      notes
    } = req.body;

    if (!clientId || !date || !startTime || !endTime || !treatmentIds || treatmentIds.length === 0) {
      throw new AppError('Cliente, fecha, hora de inicio, hora de fin y tratamientos son requeridos', 400);
    }

    // Validar fechas
    const appointmentDate = new Date(date);
    const appointmentStartTime = new Date(startTime);
    const appointmentEndTime = new Date(endTime);

    if (appointmentStartTime >= appointmentEndTime) {
      throw new AppError('La hora de inicio debe ser anterior a la hora de fin', 400);
    }

    if (appointmentDate < new Date()) {
      throw new AppError('No se pueden crear citas en fechas pasadas', 400);
    }

    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      throw new AppError('Cliente no encontrado', 404);
    }

    // Verificar que el empleado existe (si se especifica)
    if (employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId }
      });

      if (!employee) {
        throw new AppError('Empleado no encontrado', 404);
      }
    }

    // Verificar que los tratamientos existen
    const treatments = await prisma.treatment.findMany({
      where: {
        id: { in: treatmentIds },
        isActive: true
      }
    });

    if (treatments.length !== treatmentIds.length) {
      throw new AppError('Uno o más tratamientos no encontrados o están inactivos', 404);
    }

    // Verificar disponibilidad del empleado (si se especifica)
    if (employeeId) {
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          employeeId,
          date: appointmentDate,
          status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
          OR: [
            {
              AND: [
                { startTime: { lte: appointmentStartTime } },
                { endTime: { gt: appointmentStartTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: appointmentEndTime } },
                { endTime: { gte: appointmentEndTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: appointmentStartTime } },
                { endTime: { lte: appointmentEndTime } }
              ]
            }
          ]
        }
      });

      if (conflictingAppointment) {
        throw new AppError('El empleado ya tiene una cita programada en ese horario', 409);
      }
    }

    // Calcular monto total
    const totalAmount = treatments.reduce((sum, treatment) => sum + Number(treatment.price), 0);

    // Crear cita en transacción
    const newAppointment = await prisma.$transaction(async (tx) => {
      // Crear la cita
      const appointment = await tx.appointment.create({
        data: {
          clientId,
          employeeId,
          date: appointmentDate,
          startTime: appointmentStartTime,
          endTime: appointmentEndTime,
          status: AppointmentStatus.SCHEDULED,
          notes,
          totalAmount
        }
      });

      // Crear las relaciones con tratamientos
      for (const treatment of treatments) {
        await tx.appointmentTreatment.create({
          data: {
            appointmentId: appointment.id,
            treatmentId: treatment.id,
            quantity: 1,
            price: treatment.price,
            notes: `Tratamiento: ${treatment.name}`
          }
        });
      }

      return appointment;
    });

    // Obtener la cita completa
    const completeAppointment = await prisma.appointment.findUnique({
      where: { id: newAppointment.id },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        treatments: {
          include: {
            treatment: true
          }
        }
      }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Appointment',
        entityId: newAppointment.id,
        newData: JSON.parse(JSON.stringify(completeAppointment)),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Cita creada exitosamente',
      data: { appointment: completeAppointment }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Actualizar una cita
export const updateAppointment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      employeeId,
      date,
      startTime,
      endTime,
      notes,
      treatmentIds
    } = req.body;

    // Verificar que la cita existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        treatments: true
      }
    });

    if (!existingAppointment) {
      throw new AppError('Cita no encontrada', 404);
    }

    // No permitir modificar citas completadas o canceladas
    if (existingAppointment.status === 'COMPLETED' || existingAppointment.status === 'CANCELLED') {
      throw new AppError('No se pueden modificar citas completadas o canceladas', 400);
    }

    // Validar fechas si se proporcionan
    let appointmentDate = existingAppointment.date;
    let appointmentStartTime = existingAppointment.startTime;
    let appointmentEndTime = existingAppointment.endTime;

    if (date) appointmentDate = new Date(date);
    if (startTime) appointmentStartTime = new Date(startTime);
    if (endTime) appointmentEndTime = new Date(endTime);

    if (appointmentStartTime >= appointmentEndTime) {
      throw new AppError('La hora de inicio debe ser anterior a la hora de fin', 400);
    }

    // Verificar empleado si se especifica
    if (employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId }
      });

      if (!employee) {
        throw new AppError('Empleado no encontrado', 404);
      }

      // Verificar disponibilidad del empleado
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          employeeId,
          date: appointmentDate,
          status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
          id: { not: id },
          OR: [
            {
              AND: [
                { startTime: { lte: appointmentStartTime } },
                { endTime: { gt: appointmentStartTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: appointmentEndTime } },
                { endTime: { gte: appointmentEndTime } }
              ]
            },
            {
              AND: [
                { startTime: { gte: appointmentStartTime } },
                { endTime: { lte: appointmentEndTime } }
              ]
            }
          ]
        }
      });

      if (conflictingAppointment) {
        throw new AppError('El empleado ya tiene una cita programada en ese horario', 409);
      }
    }

    // Actualizar en transacción
    const updatedAppointment = await prisma.$transaction(async (tx) => {
      let totalAmount = existingAppointment.totalAmount;

      // Si se actualizan los tratamientos
      if (treatmentIds && treatmentIds.length > 0) {
        // Verificar que los tratamientos existen
        const treatments = await tx.treatment.findMany({
          where: {
            id: { in: treatmentIds },
            isActive: true
          }
        });

        if (treatments.length !== treatmentIds.length) {
          throw new AppError('Uno o más tratamientos no encontrados o están inactivos', 404);
        }

        // Eliminar tratamientos existentes
        await tx.appointmentTreatment.deleteMany({
          where: { appointmentId: id }
        });

        // Crear nuevos tratamientos
        for (const treatment of treatments) {
          await tx.appointmentTreatment.create({
            data: {
              appointmentId: id,
              treatmentId: treatment.id,
              quantity: 1,
              price: treatment.price,
              notes: `Tratamiento: ${treatment.name}`
            }
          });
        }

        totalAmount = new Decimal(treatments.reduce((sum, treatment) => sum + Number(treatment.price), 0));
      }

      // Actualizar la cita
      return tx.appointment.update({
        where: { id },
        data: {
          employeeId,
          date: appointmentDate,
          startTime: appointmentStartTime,
          endTime: appointmentEndTime,
          notes,
          totalAmount
        },
        include: {
          client: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          employee: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          treatments: {
            include: {
              treatment: true
            }
          }
        }
      });
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Appointment',
        entityId: id,
        oldData: existingAppointment,
        newData: updatedAppointment,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Cita actualizada exitosamente',
      data: { appointment: updatedAppointment }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Cambiar estado de una cita
export const updateAppointmentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(AppointmentStatus).includes(status)) {
      throw new AppError('Estado de cita inválido', 400);
    }

    // Verificar que la cita existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      throw new AppError('Cita no encontrada', 404);
    }

    // Validar transiciones de estado
    const validTransitions: { [key: string]: string[] } = {
      SCHEDULED: ['CONFIRMED', 'CANCELLED', 'IN_PROGRESS'],
      CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], // No se puede cambiar desde completado
      CANCELLED: ['SCHEDULED'], // Solo se puede reprogramar
      NO_SHOW: ['SCHEDULED'] // Solo se puede reprogramar
    };

    if (!validTransitions[existingAppointment.status].includes(status)) {
      throw new AppError(`No se puede cambiar el estado de ${existingAppointment.status} a ${status}`, 400);
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        treatments: {
          include: {
            treatment: true
          }
        }
      }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Appointment',
        entityId: id,
        oldData: { status: existingAppointment.status },
        newData: { status },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: `Estado de cita actualizado a ${status}`,
      data: { appointment: updatedAppointment }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Cancelar una cita
export const cancelAppointment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      throw new AppError('Cita no encontrada', 404);
    }

    if (existingAppointment.status === 'COMPLETED') {
      throw new AppError('No se puede cancelar una cita completada', 400);
    }

    if (existingAppointment.status === 'CANCELLED') {
      throw new AppError('La cita ya está cancelada', 400);
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { 
        status: AppointmentStatus.CANCELLED,
        notes: existingAppointment.notes ? 
          `${existingAppointment.notes}\n\nCancelada: ${reason || 'Sin razón especificada'}` :
          `Cancelada: ${reason || 'Sin razón especificada'}`
      }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Appointment',
        entityId: id,
        oldData: existingAppointment,
        newData: { status: 'CANCELLED', reason },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Cita cancelada exitosamente',
      data: { appointment: updatedAppointment }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener citas del día
export const getTodayAppointments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true
              }
            }
          }
        },
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        treatments: {
          include: {
            treatment: {
              select: {
                name: true,
                duration: true
              }
            }
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Citas del día obtenidas exitosamente',
      data: { appointments }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
