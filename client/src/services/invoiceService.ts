import api from './authService';

export type InvoiceStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  clientId: string;
  appointmentId?: string;
  amount: number;
  status: InvoiceStatus;
  description?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relaciones
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
    date: string;
    status: string;
    notes?: string;
    treatments: Array<{
      treatment: {
        name: string;
        description?: string;
        price?: number;
        duration?: number;
      };
    }>;
  };
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    method: string;
    paidDate?: string;
    createdAt: string;
  }>;
  
  // Campos calculados
  paidAmount: number;
  pendingAmount: number;
  paymentsCount: number;
}

export interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus | '';
  clientId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateInvoiceData {
  clientId: string;
  appointmentId?: string;
  amount: number;
  description?: string;
  dueDate?: string;
}

export interface InvoiceStats {
  totalInvoices: number;
  pendingInvoices: number;
  partialInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface CreatePaymentData {
  clientId: string;
  invoiceId: string;
  appointmentId?: string;
  amount: number;
  method: string;
  description?: string;
  transactionId?: string;
  dueDate?: string;
}

class InvoiceService {
  // Obtener todas las facturas
  async getInvoices(filters: InvoiceFilters = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/invoices?${params.toString()}`);
    return response.data;
  }

  // Obtener factura por ID
  async getInvoiceById(id: string) {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  }

  // Crear nueva factura
  async createInvoice(data: CreateInvoiceData) {
    const response = await api.post('/invoices', data);
    return response.data;
  }

  // Actualizar estado de factura
  async updateInvoiceStatus(id: string) {
    const response = await api.patch(`/invoices/${id}/status`);
    return response.data;
  }

  // Obtener estadísticas de facturas
  async getInvoiceStats() {
    const response = await api.get('/invoices/stats');
    return response.data;
  }

  // Crear abono a una factura
  async createPayment(data: CreatePaymentData) {
    const response = await api.post('/payments', data);
    return response.data;
  }

  // Obtener pagos de una factura
  async getInvoicePayments(invoiceId: string) {
    const response = await api.get(`/payments?invoiceId=${invoiceId}`);
    return response.data;
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;
