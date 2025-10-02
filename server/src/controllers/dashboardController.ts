import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import { AppointmentStatus, PaymentStatus, SupplyStatus } from '@prisma/client';

// Interfaz para las alertas del dashboard
interface DashboardAlert {
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  data?: any;
}

// Obtener estadísticas generales del dashboard
export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Estadísticas de citas
    const [
      todayAppointments,
      monthlyAppointments,
      totalAppointments,
      appointmentsByStatus
    ] = await Promise.all([
      prisma.appointment.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.appointment.count({
        where: {
          date: {
            gte: startOfMonth
          }
        }
      }),
      prisma.appointment.count(),
      prisma.appointment.groupBy({
        by: ['status'],
        _count: true
      })
    ]);

    // Estadísticas de clientes
    const [totalClients, activeClients, newClientsThisMonth] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({
        where: {
          user: {
            isActive: true
          }
        }
      }),
      prisma.client.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      })
    ]);

    // Estadísticas de pagos
    const [
      totalRevenue,
      monthlyRevenue,
      pendingPayments,
      overduePayments
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.PAID
        },
        _sum: {
          amount: true
        }
      }),
      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.PAID,
          paidDate: {
            gte: startOfMonth
          }
        },
        _sum: {
          amount: true
        }
      }),
      prisma.payment.count({
        where: {
          status: PaymentStatus.PENDING
        }
      }),
      prisma.payment.count({
        where: {
          status: PaymentStatus.OVERDUE
        }
      })
    ]);

    // Estadísticas de inventario
    const [
      totalSupplies,
      lowStockSupplies,
      outOfStockSupplies
    ] = await Promise.all([
      prisma.supply.count({
        where: {
          status: {
            not: SupplyStatus.DISCONTINUED
          }
        }
      }),
      prisma.supply.count({
        where: {
          status: SupplyStatus.LOW_STOCK
        }
      }),
      prisma.supply.count({
        where: {
          status: SupplyStatus.OUT_OF_STOCK
        }
      })
    ]);

    // Tratamientos más populares
    const popularTreatments = await prisma.appointmentTreatment.groupBy({
      by: ['treatmentId'],
      _count: {
        treatmentId: true
      },
      orderBy: {
        _count: {
          treatmentId: 'desc'
        }
      },
      take: 5
    });

    const treatmentDetails = await Promise.all(
      popularTreatments.map(async (item) => {
        const treatment = await prisma.treatment.findUnique({
          where: { id: item.treatmentId },
          select: { name: true, price: true }
        });
        return {
          ...treatment,
          appointmentCount: item._count.treatmentId
        };
      })
    );

    // Ingresos por mes (últimos 6 meses)
    const monthlyRevenueData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      const revenue = await prisma.payment.aggregate({
        where: {
          status: PaymentStatus.PAID,
          paidDate: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          amount: true
        }
      });

      monthlyRevenueData.push({
        month: monthStart.toISOString().slice(0, 7),
        revenue: Number(revenue._sum.amount || 0)
      });
    }

    const stats = {
      appointments: {
        today: todayAppointments,
        monthly: monthlyAppointments,
        total: totalAppointments,
        byStatus: appointmentsByStatus.reduce((acc: any, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {})
      },
      clients: {
        total: totalClients,
        active: activeClients,
        newThisMonth: newClientsThisMonth
      },
      revenue: {
        total: Number(totalRevenue._sum.amount || 0),
        monthly: Number(monthlyRevenue._sum.amount || 0),
        monthlyData: monthlyRevenueData
      },
      payments: {
        pending: pendingPayments,
        overdue: overduePayments
      },
      inventory: {
        total: totalSupplies,
        lowStock: lowStockSupplies,
        outOfStock: outOfStockSupplies
      },
      popularTreatments: treatmentDetails
    };

    const response: ApiResponse = {
      success: true,
      message: 'Estadísticas del dashboard obtenidas exitosamente',
      data: { stats }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener citas del día
export const getTodaySchedule = async (
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
      message: 'Horario del día obtenido exitosamente',
      data: { appointments }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener alertas del sistema
export const getSystemAlerts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const alerts: DashboardAlert[] = [];

    // Alertas de stock bajo
    const lowStockSupplies = await prisma.supply.findMany({
      where: {
        OR: [
          { status: SupplyStatus.LOW_STOCK },
          { status: SupplyStatus.OUT_OF_STOCK }
        ]
      },
      select: {
        id: true,
        name: true,
        stock: true,
        minStock: true,
        status: true
      }
    });

    lowStockSupplies.forEach(supply => {
      alerts.push({
        type: 'inventory',
        severity: supply.status === SupplyStatus.OUT_OF_STOCK ? 'high' : 'medium',
        title: supply.status === SupplyStatus.OUT_OF_STOCK ? 'Producto agotado' : 'Stock bajo',
        message: `${supply.name}: ${supply.stock} unidades (mínimo: ${supply.minStock})`,
        data: { supplyId: supply.id }
      });
    });

    // Alertas de pagos vencidos
    const overduePayments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.OVERDUE
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      take: 10
    });

    overduePayments.forEach(payment => {
      alerts.push({
        type: 'payment',
        severity: 'high',
        title: 'Pago vencido',
        message: `${payment.client.user.firstName} ${payment.client.user.lastName}: $${payment.amount}`,
        data: { paymentId: payment.id }
      });
    });

    // Alertas de citas próximas sin confirmar
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const unconfirmedAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        },
        status: AppointmentStatus.SCHEDULED
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      take: 5
    });

    unconfirmedAppointments.forEach(appointment => {
      alerts.push({
        type: 'appointment',
        severity: 'medium',
        title: 'Cita sin confirmar',
        message: `${appointment.client.user.firstName} ${appointment.client.user.lastName} - ${appointment.startTime.toLocaleTimeString()}`,
        data: { appointmentId: appointment.id }
      });
    });

    // Ordenar alertas por severidad
    const severityOrder = { high: 3, medium: 2, low: 1 };
    alerts.sort((a, b) => severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder]);

    const response: ApiResponse = {
      success: true,
      message: 'Alertas del sistema obtenidas exitosamente',
      data: { alerts }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener resumen de actividad reciente
export const getRecentActivity = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = Number(req.query.limit) || 20;

    const recentActivity = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Actividad reciente obtenida exitosamente',
      data: { activities: recentActivity }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
