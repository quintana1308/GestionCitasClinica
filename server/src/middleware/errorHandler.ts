import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Error interno del servidor';

  // Error personalizado
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Error de validación de Prisma
  if (error.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Datos de entrada inválidos';
  }

  // Error de constraint único de Prisma
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    if (prismaError.code === 'P2002') {
      statusCode = 409;
      message = 'Ya existe un registro con estos datos';
    }
    if (prismaError.code === 'P2025') {
      statusCode = 404;
      message = 'Registro no encontrado';
    }
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Error de validación de Joi
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  }

  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  };

  res.status(statusCode).json(response);
};
