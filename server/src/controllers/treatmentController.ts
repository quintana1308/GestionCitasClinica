import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';

// Obtener todos los tratamientos con filtros y paginación
export const getTreatments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category,
      isActive, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      minPrice,
      maxPrice
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    // Obtener tratamientos con paginación
    const [treatments, total] = await Promise.all([
      prisma.treatment.findMany({
        where,
        include: {
          appointments: {
            select: {
              id: true,
              appointment: {
                select: {
                  id: true,
                  date: true,
                  status: true
                }
              }
            },
            orderBy: { 
              appointment: {
                date: 'desc'
              }
            },
            take: 5
          },
          _count: {
            select: {
              appointments: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder }
      }),
      prisma.treatment.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Tratamientos obtenidos exitosamente',
      data: {
        treatments,
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

// Obtener un tratamiento por ID
export const getTreatmentById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const treatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            appointment: {
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
                }
              }
            }
          },
          orderBy: { 
            appointment: {
              date: 'desc'
            }
          }
        },
        _count: {
          select: {
            appointments: true
          }
        }
      }
    });

    if (!treatment) {
      throw new AppError('Tratamiento no encontrado', 404);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Tratamiento obtenido exitosamente',
      data: { treatment }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo tratamiento
export const createTreatment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      duration,
      price,
      category,
      supplies
    } = req.body;

    if (!name || !duration || !price || !category) {
      throw new AppError('Nombre, duración, precio y categoría son requeridos', 400);
    }

    if (duration <= 0) {
      throw new AppError('La duración debe ser mayor a 0 minutos', 400);
    }

    if (price <= 0) {
      throw new AppError('El precio debe ser mayor a 0', 400);
    }

    // Verificar si ya existe un tratamiento con el mismo nombre
    const existingTreatment = await prisma.treatment.findFirst({
      where: { 
        name: { equals: name },
        isActive: true
      }
    });

    if (existingTreatment) {
      throw new AppError('Ya existe un tratamiento activo con este nombre', 409);
    }

    const newTreatment = await prisma.treatment.create({
      data: {
        name,
        description,
        duration: Number(duration),
        price: Number(price),
        category,
        supplies: supplies || null,
        isActive: true
      }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Treatment',
        entityId: newTreatment.id,
        newData: newTreatment,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Tratamiento creado exitosamente',
      data: { treatment: newTreatment }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Actualizar un tratamiento
export const updateTreatment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      duration,
      price,
      category,
      supplies
    } = req.body;

    // Verificar que el tratamiento existe
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id }
    });

    if (!existingTreatment) {
      throw new AppError('Tratamiento no encontrado', 404);
    }

    // Validaciones
    if (duration && duration <= 0) {
      throw new AppError('La duración debe ser mayor a 0 minutos', 400);
    }

    if (price && price <= 0) {
      throw new AppError('El precio debe ser mayor a 0', 400);
    }

    // Verificar si ya existe otro tratamiento con el mismo nombre
    if (name && name !== existingTreatment.name) {
      const duplicateTreatment = await prisma.treatment.findFirst({
        where: { 
          name: { equals: name },
          isActive: true,
          id: { not: id }
        }
      });

      if (duplicateTreatment) {
        throw new AppError('Ya existe un tratamiento activo con este nombre', 409);
      }
    }

    const updatedTreatment = await prisma.treatment.update({
      where: { id },
      data: {
        name,
        description,
        duration: duration ? Number(duration) : undefined,
        price: price ? Number(price) : undefined,
        category,
        supplies: supplies !== undefined ? supplies : undefined
      }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Treatment',
        entityId: id,
        oldData: existingTreatment,
        newData: updatedTreatment,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Tratamiento actualizado exitosamente',
      data: { treatment: updatedTreatment }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Activar/Desactivar tratamiento
export const toggleTreatmentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      throw new AppError('El estado debe ser un valor booleano', 400);
    }

    // Verificar que el tratamiento existe
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        appointments: {
          where: {
            appointment: {
              status: { in: ['SCHEDULED', 'CONFIRMED'] }
            }
          }
        }
      }
    });

    if (!existingTreatment) {
      throw new AppError('Tratamiento no encontrado', 404);
    }

    // Si se está desactivando, verificar que no tenga citas programadas
    if (!isActive && existingTreatment.appointments.length > 0) {
      throw new AppError('No se puede desactivar un tratamiento con citas programadas', 400);
    }

    const updatedTreatment = await prisma.treatment.update({
      where: { id },
      data: { isActive }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Treatment',
        entityId: id,
        oldData: { isActive: existingTreatment.isActive },
        newData: { isActive },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: `Tratamiento ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: { treatment: updatedTreatment }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Eliminar tratamiento
export const deleteTreatment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Verificar que el tratamiento existe
    const existingTreatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        appointments: true
      }
    });

    if (!existingTreatment) {
      throw new AppError('Tratamiento no encontrado', 404);
    }

    // Verificar si tiene citas asociadas
    if (existingTreatment.appointments.length > 0) {
      throw new AppError('No se puede eliminar un tratamiento con citas asociadas', 400);
    }

    await prisma.treatment.delete({
      where: { id }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'Treatment',
        entityId: id,
        oldData: existingTreatment,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Tratamiento eliminado exitosamente'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener categorías de tratamientos
export const getTreatmentCategories = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await prisma.treatment.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    });

    const categoryList = categories.map(c => c.category);

    const response: ApiResponse = {
      success: true,
      message: 'Categorías obtenidas exitosamente',
      data: { categories: categoryList }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas del tratamiento
export const getTreatmentStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const treatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            appointment: true
          }
        }
      }
    });

    if (!treatment) {
      throw new AppError('Tratamiento no encontrado', 404);
    }

    const totalAppointments = treatment.appointments.length;
    const completedAppointments = treatment.appointments.filter(a => a.appointment.status === 'COMPLETED').length;
    const totalRevenue = treatment.appointments
      .filter(a => a.appointment.status === 'COMPLETED')
      .reduce((sum, a) => sum + Number(a.appointment.totalAmount || 0), 0);

    const monthlyStats = treatment.appointments
      .filter(a => a.appointment.status === 'COMPLETED')
      .reduce((acc: any, appointmentTreatment) => {
        const month = new Date(appointmentTreatment.appointment.date).toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { count: 0, revenue: 0 };
        }
        acc[month].count++;
        acc[month].revenue += Number(appointmentTreatment.appointment.totalAmount || 0);
        return acc;
      }, {});

    const stats = {
      totalAppointments,
      completedAppointments,
      cancelledAppointments: treatment.appointments.filter(a => a.appointment.status === 'CANCELLED').length,
      totalRevenue,
      averageRevenue: completedAppointments > 0 ? totalRevenue / completedAppointments : 0,
      monthlyStats
    };

    const response: ApiResponse = {
      success: true,
      message: 'Estadísticas del tratamiento obtenidas exitosamente',
      data: { stats }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
