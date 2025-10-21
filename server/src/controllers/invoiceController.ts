import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import { PaymentStatus } from '@prisma/client';

// Enum temporal hasta que se actualicen completamente los tipos
const InvoiceStatus = {
  PENDING: 'PENDING' as const,
  PARTIAL: 'PARTIAL' as const,
  PAID: 'PAID' as const,
  OVERDUE: 'OVERDUE' as const,
  CANCELLED: 'CANCELLED' as const
};

// Obtener todas las facturas con filtros y paginación
export const getInvoices = async (
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
      clientId,
      startDate,
      endDate,
      sortBy = 'createdAt', 
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { client: { user: { firstName: { contains: search as string, mode: 'insensitive' } } } },
        { client: { user: { lastName: { contains: search as string, mode: 'insensitive' } } } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Obtener facturas con paginación
    const [invoices, total] = await Promise.all([
      (prisma as any).invoice.findMany({
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
          appointment: {
            select: {
              id: true,
              date: true,
              status: true,
              notes: true,
              treatments: {
                include: {
                  treatment: {
                    select: {
                      name: true,
                      description: true,
                      price: true,
                      duration: true
                    }
                  }
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
              paidDate: true,
              createdAt: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder }
      }),
      (prisma as any).invoice.count({ where })
    ]);

    // Calcular montos pagados para cada factura
    const invoicesWithCalculations = invoices.map((invoice: any) => {
      const paidAmount = invoice.payments
        .filter((payment: any) => payment.status === PaymentStatus.PAID)
        .reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
      
      const pendingAmount = Number(invoice.amount) - paidAmount;
      
      return {
        ...invoice,
        paidAmount,
        pendingAmount,
        paymentsCount: invoice.payments.length
      };
    });

    const response: ApiResponse = {
      success: true,
      message: 'Facturas obtenidas exitosamente',
      data: {
        invoices: invoicesWithCalculations,
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

// Obtener una factura por ID
export const getInvoiceById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const invoice = await (prisma as any).invoice.findUnique({
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
        appointment: {
          select: {
            id: true,
            date: true,
            status: true,
            notes: true,
            treatments: {
              include: {
                treatment: {
                  select: {
                    name: true,
                    description: true,
                    price: true,
                    duration: true
                  }
                }
              }
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!invoice) {
      throw new AppError('Factura no encontrada', 404);
    }

    // Calcular montos
    const paidAmount = invoice.payments
      .filter((payment: any) => payment.status === PaymentStatus.PAID)
      .reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
    
    const pendingAmount = Number(invoice.amount) - paidAmount;

    const response: ApiResponse = {
      success: true,
      message: 'Factura obtenida exitosamente',
      data: { 
        invoice: {
          ...invoice,
          paidAmount,
          pendingAmount,
          paymentsCount: invoice.payments.length
        }
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Crear una nueva factura
export const createInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      clientId,
      appointmentId,
      amount,
      description,
      dueDate
    } = req.body;

    if (!clientId || !amount || amount <= 0) {
      throw new AppError('Cliente y monto son requeridos', 400);
    }

    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      throw new AppError('Cliente no encontrado', 404);
    }

    // Verificar que la cita existe (si se especifica)
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appointment) {
        throw new AppError('Cita no encontrada', 404);
      }
    }

    const newInvoice = await (prisma as any).invoice.create({
      data: {
        clientId,
        appointmentId,
        amount,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: InvoiceStatus.PENDING
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
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Invoice',
        entityId: newInvoice.id,
        newData: JSON.parse(JSON.stringify(newInvoice)),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Factura creada exitosamente',
      data: { 
        invoice: {
          ...newInvoice,
          paidAmount: 0,
          pendingAmount: Number(newInvoice.amount),
          paymentsCount: 0
        }
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Actualizar estado de factura basado en pagos
export const updateInvoiceStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const invoice = await (prisma as any).invoice.findUnique({
      where: { id },
      include: {
        payments: {
          where: { status: PaymentStatus.PAID }
        }
      }
    });

    if (!invoice) {
      throw new AppError('Factura no encontrada', 404);
    }

    // Calcular monto pagado
    const paidAmount = invoice.payments.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
    const totalAmount = Number(invoice.amount);
    
    let newStatus = invoice.status;
    
    if (paidAmount === 0) {
      // Verificar si está vencida
      if (invoice.dueDate && new Date() > invoice.dueDate) {
        newStatus = InvoiceStatus.OVERDUE;
      } else {
        newStatus = InvoiceStatus.PENDING;
      }
    } else if (paidAmount >= totalAmount) {
      newStatus = InvoiceStatus.PAID;
    } else {
      newStatus = InvoiceStatus.PARTIAL;
    }

    // Actualizar solo si el estado cambió
    if (newStatus !== invoice.status) {
      const updatedInvoice = await (prisma as any).invoice.update({
        where: { id },
        data: { status: newStatus },
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
          payments: true
        }
      });

      // Registrar auditoría
      await prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'UPDATE',
          entity: 'Invoice',
          entityId: id,
          oldData: { status: invoice.status },
          newData: { status: newStatus },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      const response: ApiResponse = {
        success: true,
        message: `Estado de factura actualizado a ${newStatus}`,
        data: { 
          invoice: {
            ...updatedInvoice,
            paidAmount,
            pendingAmount: totalAmount - paidAmount
          }
        }
      };

      res.json(response);
    } else {
      const response: ApiResponse = {
        success: true,
        message: 'El estado de la factura no requiere actualización',
        data: { 
          invoice: {
            ...invoice,
            paidAmount,
            pendingAmount: totalAmount - paidAmount
          }
        }
      };

      res.json(response);
    }
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas de facturas
export const getInvoiceStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      totalInvoices,
      pendingInvoices,
      partialInvoices,
      paidInvoices,
      overdueInvoices,
      totalAmount,
      paidAmount
    ] = await Promise.all([
      (prisma as any).invoice.count(),
      (prisma as any).invoice.count({ where: { status: InvoiceStatus.PENDING } }),
      (prisma as any).invoice.count({ where: { status: InvoiceStatus.PARTIAL } }),
      (prisma as any).invoice.count({ where: { status: InvoiceStatus.PAID } }),
      (prisma as any).invoice.count({ where: { status: InvoiceStatus.OVERDUE } }),
      (prisma as any).invoice.aggregate({ _sum: { amount: true } }),
      prisma.payment.aggregate({ 
        _sum: { amount: true },
        where: { status: PaymentStatus.PAID }
      })
    ]);

    const stats = {
      totalInvoices,
      pendingInvoices,
      partialInvoices,
      paidInvoices,
      overdueInvoices,
      totalAmount: Number(totalAmount._sum.amount || 0),
      paidAmount: Number(paidAmount._sum.amount || 0),
      pendingAmount: Number(totalAmount._sum.amount || 0) - Number(paidAmount._sum.amount || 0)
    };

    const response: ApiResponse = {
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: { stats }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
