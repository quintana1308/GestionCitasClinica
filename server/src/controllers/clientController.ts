import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import { hashPassword, generateClientCode } from '../utils/auth';

// Obtener todos los clientes con filtros y paginación
export const getClients = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      isActive, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { user: { lastName: { contains: search as string, mode: 'insensitive' } } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
        { clientCode: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (isActive !== undefined) {
      where.user = { isActive: isActive === 'true' };
    }

    // Obtener clientes con paginación
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              isActive: true,
              createdAt: true,
              updatedAt: true
            }
          },
          appointments: {
            select: {
              id: true,
              date: true,
              status: true,
              totalAmount: true
            },
            orderBy: { date: 'desc' },
            take: 5
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder }
      }),
      prisma.client.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Clientes obtenidos exitosamente',
      data: {
        clients,
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

// Obtener un cliente por ID
export const getClientById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        },
        appointments: {
          include: {
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
          },
          orderBy: { date: 'desc' }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        medicalHistory: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!client) {
      throw new AppError('Cliente no encontrado', 404);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Cliente obtenido exitosamente',
      data: { client }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo cliente
export const createClient = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      medicalConditions,
      allergies
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Email, contraseña, nombre y apellido son requeridos', 400);
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new AppError('Ya existe un usuario con este email', 409);
    }

    // Obtener rol de cliente
    const clientRole = await prisma.role.findUnique({
      where: { name: 'client' }
    });

    if (!clientRole) {
      throw new AppError('Rol de cliente no encontrado', 500);
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear cliente en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          isActive: true
        }
      });

      // Asignar rol
      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: clientRole.id
        }
      });

      // Crear cliente
      const newClient = await tx.client.create({
        data: {
          userId: newUser.id,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender,
          address,
          emergencyContact,
          medicalConditions,
          allergies,
          clientCode: generateClientCode()
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              isActive: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      });

      return newClient;
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Client',
        entityId: result.id,
        newData: { clientCode: result.clientCode },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Cliente creado exitosamente',
      data: { client: result }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Actualizar un cliente
export const updateClient = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      medicalConditions,
      allergies
    } = req.body;

    // Verificar que el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingClient) {
      throw new AppError('Cliente no encontrado', 404);
    }

    // Actualizar en transacción
    const updatedClient = await prisma.$transaction(async (tx) => {
      // Actualizar usuario
      await tx.user.update({
        where: { id: existingClient.userId },
        data: {
          firstName,
          lastName,
          phone
        }
      });

      // Actualizar cliente
      return tx.client.update({
        where: { id },
        data: {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender,
          address,
          emergencyContact,
          medicalConditions,
          allergies
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              isActive: true,
              createdAt: true,
              updatedAt: true
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
        entity: 'Client',
        entityId: id,
        oldData: existingClient,
        newData: updatedClient,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: { client: updatedClient }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Activar/Desactivar cliente
export const toggleClientStatus = async (
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

    // Verificar que el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingClient) {
      throw new AppError('Cliente no encontrado', 404);
    }

    // Actualizar estado del usuario
    const updatedUser = await prisma.user.update({
      where: { id: existingClient.userId },
      data: { isActive }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Client',
        entityId: id,
        oldData: { isActive: existingClient.user.isActive },
        newData: { isActive },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: `Cliente ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: { isActive }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Eliminar cliente (soft delete)
export const deleteClient = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Verificar que el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: { 
        user: true,
        appointments: { where: { status: { in: ['SCHEDULED', 'CONFIRMED'] } } }
      }
    });

    if (!existingClient) {
      throw new AppError('Cliente no encontrado', 404);
    }

    // Verificar si tiene citas activas
    if (existingClient.appointments.length > 0) {
      throw new AppError('No se puede eliminar un cliente con citas programadas', 400);
    }

    // Desactivar usuario (soft delete)
    await prisma.user.update({
      where: { id: existingClient.userId },
      data: { isActive: false }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'Client',
        entityId: id,
        oldData: existingClient,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Cliente eliminado exitosamente'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas del cliente
export const getClientStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        appointments: true,
        payments: true
      }
    });

    if (!client) {
      throw new AppError('Cliente no encontrado', 404);
    }

    const stats = {
      totalAppointments: client.appointments.length,
      completedAppointments: client.appointments.filter(a => a.status === 'COMPLETED').length,
      cancelledAppointments: client.appointments.filter(a => a.status === 'CANCELLED').length,
      totalSpent: client.payments.reduce((sum, p) => sum + Number(p.amount), 0),
      pendingPayments: client.payments.filter(p => p.status === 'PENDING').length,
      lastAppointment: client.appointments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null
    };

    const response: ApiResponse = {
      success: true,
      message: 'Estadísticas del cliente obtenidas exitosamente',
      data: { stats }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
