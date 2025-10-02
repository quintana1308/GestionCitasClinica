import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest, LoginCredentials, RegisterData, ApiResponse } from '../types';
import { hashPassword, comparePassword, generateToken, generateClientCode, validatePassword, sanitizeUser } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';

export const login = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password }: LoginCredentials = req.body;

    if (!email || !password) {
      throw new AppError('Email y contraseña son requeridos', 400);
    }

    // Buscar usuario con roles
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        client: true,
        employee: true
      }
    });

    if (!user || !user.isActive) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Generar token
    const roles = user.roles.map(userRole => userRole.role.name);
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roles
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        user: sanitizeUser(user),
        roles
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName, phone, role }: RegisterData = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      throw new AppError('Todos los campos obligatorios deben ser completados', 400);
    }

    // Validar contraseña
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.message!, 400);
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new AppError('Ya existe un usuario con este email', 409);
    }

    // Buscar rol
    const userRole = await prisma.role.findUnique({
      where: { name: role }
    });

    if (!userRole) {
      throw new AppError('Rol no válido', 400);
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          phone,
        }
      });

      // Asignar rol
      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: userRole.id
        }
      });

      // Si es cliente, crear registro de cliente
      if (role === 'client') {
        await tx.client.create({
          data: {
            userId: newUser.id,
            clientCode: generateClientCode()
          }
        });
      }

      // Si es empleado, crear registro de empleado
      if (role === 'employee') {
        await tx.employee.create({
          data: {
            userId: newUser.id,
            position: 'general',
            hireDate: new Date()
          }
        });
      }

      return newUser;
    });

    // Obtener usuario completo
    const user = await prisma.user.findUnique({
      where: { id: result.id },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        client: true,
        employee: true
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: sanitizeUser(user)
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const loginWithClientCode = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { clientCode, password } = req.body;

    if (!clientCode || !password) {
      throw new AppError('Código de cliente y contraseña son requeridos', 400);
    }

    // Buscar cliente por código
    const client = await prisma.client.findUnique({
      where: { clientCode },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: true
              }
            }
          }
        }
      }
    });

    if (!client || !client.user.isActive) {
      throw new AppError('Código de cliente inválido', 401);
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(password, client.user.password);
    if (!isValidPassword) {
      throw new AppError('Contraseña inválida', 401);
    }

    // Generar token
    const roles = client.user.roles.map(userRole => userRole.role.name);
    const token = generateToken({
      userId: client.user.id,
      email: client.user.email,
      roles
    });

    const response: ApiResponse = {
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        user: sanitizeUser(client.user),
        client,
        roles
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        client: true,
        employee: true
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: {
        user: sanitizeUser(user)
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado', 401);
    }

    const { firstName, lastName, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone
      },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        client: true,
        employee: true
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: sanitizeUser(updatedUser)
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado', 401);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Contraseña actual y nueva contraseña son requeridas', 400);
    }

    // Verificar contraseña actual
    const isValidPassword = await comparePassword(currentPassword, req.user.password);
    if (!isValidPassword) {
      throw new AppError('Contraseña actual incorrecta', 400);
    }

    // Validar nueva contraseña
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.message!, 400);
    }

    // Hash de la nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        entity: 'User',
        entityId: req.user.id,
        newData: { action: 'password_changed' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Contraseña actualizada exitosamente'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
