import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const response: ApiResponse = {
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  };

  res.status(404).json(response);
};
