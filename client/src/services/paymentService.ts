import api from './authService';

export type PaymentMethod = 'UNDEFINED' | 'CASH' | 'CARD' | 'TRANSFER' | 'CHECK' | 'FINANCING';
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';

export interface Payment {
  id: string;
  clientId: string;
  appointmentId?: string;
  invoiceId?: string; // Nueva relación con factura
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  description?: string;
  transactionId?: string;
  dueDate?: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
  };
  appointment?: {
    id: string;
    date: Date;
    status: string;
    treatments: {
      treatment: {
        name: string;
      };
    }[];
  };
}

export interface CreatePaymentData {
  clientId: string;
  appointmentId?: string;
  amount: number;
  method: PaymentMethod;
  description?: string;
  transactionId?: string;
  dueDate?: string;
}

export interface UpdatePaymentData {
  amount?: number;
  method?: PaymentMethod;
  description?: string;
  transactionId?: string;
  dueDate?: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentStats {
  total: {
    count: number;
    amount: number;
  };
  paid: {
    count: number;
    amount: number;
  };
  pending: {
    count: number;
    amount: number;
  };
  overdue: {
    count: number;
    amount: number;
  };
}

export const paymentService = {
  // Obtener todos los pagos con filtros
  getPayments: async (filters: PaymentFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/payments?${params.toString()}`);
    return response.data.data;
  },

  // Obtener un pago por ID
  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data.data.payment;
  },

  // Crear un nuevo pago
  createPayment: async (paymentData: CreatePaymentData): Promise<Payment> => {
    const response = await api.post('/payments', paymentData);
    return response.data.data.payment;
  },

  // Actualizar un pago
  updatePayment: async (id: string, paymentData: UpdatePaymentData): Promise<Payment> => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data.data.payment;
  },

  // Cambiar estado de un pago
  updatePaymentStatus: async (id: string, status: PaymentStatus) => {
    const response = await api.patch(`/payments/${id}/status`, { status });
    return response.data;
  },

  // Marcar pago como pagado
  markPaymentAsPaid: async (id: string, transactionId?: string) => {
    const response = await api.patch(`/payments/${id}/mark-paid`, { transactionId });
    return response.data;
  },

  // Obtener pagos pendientes
  getPendingPayments: async (): Promise<Payment[]> => {
    const response = await api.get('/payments/pending');
    return response.data.data.payments;
  },

  // Obtener estadísticas de pagos
  getPaymentStats: async (startDate?: string, endDate?: string): Promise<PaymentStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/payments/stats?${params.toString()}`);
    return response.data.data.stats;
  }
};
