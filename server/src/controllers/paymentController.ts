import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

// Obtener todos los pagos con filtros y paginación
export const getPayments = async (
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
      method,
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
        { client: { user: { firstName: { contains: search as string } } } },
        { client: { user: { lastName: { contains: search as string } } } },
        { description: { contains: search as string } },
        { transactionId: { contains: search as string } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (method) {
      where.method = method;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Obtener pagos con paginación
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
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
              treatments: {
                include: {
                  treatment: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder }
      }),
      prisma.payment.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Pagos obtenidos exitosamente',
      data: {
        payments,
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

// Obtener un pago por ID
export const getPaymentById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
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

    if (!payment) {
      throw new AppError('Pago no encontrado', 404);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Pago obtenido exitosamente',
      data: { payment }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo pago
export const createPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      clientId,
      appointmentId,
      invoiceId,
      amount,
      method,
      description,
      transactionId,
      dueDate
    } = req.body;

    if (!clientId || !amount || !method) {
      throw new AppError('Cliente, monto y método de pago son requeridos', 400);
    }

    if (!invoiceId) {
      throw new AppError('ID de factura es requerido para crear un abono', 400);
    }

    if (amount <= 0) {
      throw new AppError('El monto debe ser mayor a 0', 400);
    }

    if (!Object.values(PaymentMethod).includes(method)) {
      throw new AppError('Método de pago inválido', 400);
    }

    // Verificar que el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      throw new AppError('Cliente no encontrado', 404);
    }

    // Verificar que la factura existe y pertenece al cliente
    const invoice = await (prisma as any).invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: {
          where: { status: PaymentStatus.PAID }
        }
      }
    });

    if (!invoice) {
      throw new AppError('Factura no encontrada', 404);
    }

    if (invoice.clientId !== clientId) {
      throw new AppError('La factura no pertenece al cliente especificado', 400);
    }

    // Verificar que el abono no exceda el monto pendiente
    const paidAmount = invoice.payments.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
    const pendingAmount = Number(invoice.amount) - paidAmount;

    if (amount > pendingAmount) {
      throw new AppError(`El abono ($${amount}) excede el monto pendiente ($${pendingAmount.toFixed(2)})`, 400);
    }

    // Verificar que la cita existe (si se especifica)
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appointment) {
        throw new AppError('Cita no encontrada', 404);
      }

      if (appointment.clientId !== clientId) {
        throw new AppError('La cita no pertenece al cliente especificado', 400);
      }
    }

    const newPayment = await (prisma as any).payment.create({
      data: {
        clientId,
        appointmentId,
        invoiceId, // Nueva relación con factura
        amount: Number(amount),
        method,
        status: PaymentStatus.PAID, // Los abonos se marcan como pagados directamente
        description: description || `Abono a factura ${invoiceId}`,
        transactionId,
        paidDate: new Date(), // Fecha de pago
        dueDate: dueDate ? new Date(dueDate) : null
      },
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
        appointment: {
          select: {
            id: true,
            date: true
          }
        }
      }
    });

    // Actualizar automáticamente el estado de la factura
    try {
      // Recalcular el estado de la factura
      const updatedInvoice = await (prisma as any).invoice.findUnique({
        where: { id: invoiceId },
        include: {
          payments: {
            where: { status: PaymentStatus.PAID }
          }
        }
      });

      if (updatedInvoice) {
        const totalPaid = updatedInvoice.payments.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
        const totalAmount = Number(updatedInvoice.amount);
        
        let newStatus = updatedInvoice.status;
        
        if (totalPaid >= totalAmount) {
          newStatus = 'PAID';
        } else if (totalPaid > 0) {
          newStatus = 'PARTIAL';
        }

        if (newStatus !== updatedInvoice.status) {
          await (prisma as any).invoice.update({
            where: { id: invoiceId },
            data: { status: newStatus }
          });
          console.log(`Estado de factura ${invoiceId} actualizado a ${newStatus}`);
        }
      }
    } catch (invoiceUpdateError) {
      console.error('Error actualizando estado de factura:', invoiceUpdateError);
      // No fallar la creación del pago por este error
    }

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Payment',
        entityId: newPayment.id,
        newData: newPayment,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Abono registrado exitosamente y estado de factura actualizado',
      data: { payment: newPayment }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Actualizar un pago
export const updatePayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      amount,
      method,
      description,
      transactionId,
      dueDate
    } = req.body;

    // Verificar que el pago existe
    const existingPayment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      throw new AppError('Pago no encontrado', 404);
    }

    // No permitir modificar pagos completados
    if (existingPayment.status === PaymentStatus.PAID) {
      throw new AppError('No se pueden modificar pagos completados', 400);
    }

    // Validaciones
    if (amount !== undefined && amount <= 0) {
      throw new AppError('El monto debe ser mayor a 0', 400);
    }

    if (method && !Object.values(PaymentMethod).includes(method)) {
      throw new AppError('Método de pago inválido', 400);
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        amount: amount !== undefined ? Number(amount) : undefined,
        method,
        description,
        transactionId,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined
      },
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
        appointment: {
          select: {
            id: true,
            date: true
          }
        }
      }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Payment',
        entityId: id,
        oldData: existingPayment,
        newData: updatedPayment,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Pago actualizado exitosamente',
      data: { payment: updatedPayment }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Cambiar estado de un pago
export const updatePaymentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(PaymentStatus).includes(status)) {
      throw new AppError('Estado de pago inválido', 400);
    }

    // Verificar que el pago existe
    const existingPayment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      throw new AppError('Pago no encontrado', 404);
    }

    // Validar transiciones de estado
    const validTransitions: { [key: string]: string[] } = {
      PENDING: ['PAID', 'OVERDUE', 'CANCELLED'],
      PAID: ['REFUNDED'], // Solo se puede reembolsar
      OVERDUE: ['PAID', 'CANCELLED'],
      CANCELLED: ['PENDING'], // Solo se puede reactivar
      REFUNDED: [] // No se puede cambiar desde reembolsado
    };

    if (!validTransitions[existingPayment.status].includes(status)) {
      throw new AppError(`No se puede cambiar el estado de ${existingPayment.status} a ${status}`, 400);
    }

    const updateData: any = { status };
    
    // Si se marca como pagado, establecer fecha de pago
    if (status === PaymentStatus.PAID) {
      updateData.paidDate = new Date();
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: updateData,
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
        }
      }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Payment',
        entityId: id,
        oldData: { status: existingPayment.status },
        newData: { status },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: `Estado de pago actualizado a ${status}`,
      data: { payment: updatedPayment }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Marcar pago como pagado
export const markPaymentAsPaid = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;

    const existingPayment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!existingPayment) {
      throw new AppError('Pago no encontrado', 404);
    }

    if (existingPayment.status === PaymentStatus.PAID) {
      throw new AppError('El pago ya está marcado como pagado', 400);
    }

    // Temporal: verificar si es un pago automático que necesita ser configurado
    if (existingPayment.description?.includes('Pago por cita confirmada') && 
        !existingPayment.transactionId && 
        existingPayment.method === 'CASH') {
      throw new AppError('Este pago fue creado automáticamente. Primero debe registrar el método de pago y detalles antes de marcarlo como pagado.', 400);
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.PAID,
        paidDate: new Date(),
        transactionId: transactionId || existingPayment.transactionId
      },
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
        }
      }
    });

    // Registrar auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Payment',
        entityId: id,
        oldData: existingPayment,
        newData: { status: 'PAID', paidDate: updatedPayment.paidDate },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Pago marcado como pagado exitosamente',
      data: { payment: updatedPayment }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener pagos pendientes
export const getPendingPayments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        status: { in: [PaymentStatus.PENDING, PaymentStatus.OVERDUE] }
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
          select: {
            id: true,
            date: true
          }
        }
      },
      orderBy: [
        { status: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    const response: ApiResponse = {
      success: true,
      message: 'Pagos pendientes obtenidos exitosamente',
      data: { payments }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas de pagos
export const getPaymentStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [totalPayments, paidPayments, pendingPayments, overduePayments] = await Promise.all([
      prisma.payment.aggregate({
        where,
        _sum: { amount: true },
        _count: true
      }),
      prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.PAID },
        _sum: { amount: true },
        _count: true
      }),
      prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.PENDING },
        _sum: { amount: true },
        _count: true
      }),
      prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.OVERDUE },
        _sum: { amount: true },
        _count: true
      })
    ]);

    const stats = {
      total: {
        count: totalPayments._count,
        amount: Number(totalPayments._sum.amount || 0)
      },
      paid: {
        count: paidPayments._count,
        amount: Number(paidPayments._sum.amount || 0)
      },
      pending: {
        count: pendingPayments._count,
        amount: Number(pendingPayments._sum.amount || 0)
      },
      overdue: {
        count: overduePayments._count,
        amount: Number(overduePayments._sum.amount || 0)
      }
    };

    const response: ApiResponse = {
      success: true,
      message: 'Estadísticas de pagos obtenidas exitosamente',
      data: { stats }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
