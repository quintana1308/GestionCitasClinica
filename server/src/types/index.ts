import { Request } from 'express';
import { User, Role, UserRole } from '@prisma/client';

// Extender Request de Express para incluir usuario autenticado
export interface AuthenticatedRequest extends Request {
  user?: User & {
    roles: (UserRole & {
      role: Role;
    })[];
  };
}

// Tipos para respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'employee' | 'client';
}

export interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

// Tipos para citas
export interface CreateAppointmentData {
  clientId: string;
  employeeId?: string;
  date: string;
  startTime: string;
  endTime: string;
  treatmentIds: string[];
  notes?: string;
}

export interface UpdateAppointmentData {
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  employeeId?: string;
}

// Tipos para clientes
export interface CreateClientData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalConditions?: string;
  allergies?: string;
}

// Tipos para tratamientos
export interface CreateTreatmentData {
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  supplies?: any;
}

// Tipos para inventario
export interface CreateSupplyData {
  name: string;
  description?: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  maxStock?: number;
  unitCost: number;
  supplier?: string;
  expiryDate?: string;
}

export interface SupplyMovementData {
  supplyId: string;
  type: 'IN' | 'OUT' | 'ADJUST' | 'EXPIRED';
  quantity: number;
  unitCost?: number;
  reason?: string;
  reference?: string;
}

// Tipos para pagos
export interface CreatePaymentData {
  clientId: string;
  appointmentId?: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'TRANSFER' | 'CHECK' | 'FINANCING';
  description?: string;
  dueDate?: string;
}

// Tipos para reportes
export interface DashboardStats {
  totalClients: number;
  totalAppointments: number;
  todayAppointments: number;
  monthlyRevenue: number;
  lowStockItems: number;
  pendingPayments: number;
}

export interface RevenueReport {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// Tipos para filtros y paginación
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AppointmentFilters extends PaginationQuery {
  status?: string;
  clientId?: string;
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ClientFilters extends PaginationQuery {
  search?: string;
  isActive?: boolean;
}

export interface SupplyFilters extends PaginationQuery {
  category?: string;
  status?: string;
  lowStock?: boolean;
}

// Tipos para validación
export interface ValidationError {
  field: string;
  message: string;
}

// Tipos para archivos
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Re-exportar tipos de Prisma necesarios
export type { 
  User, 
  Role, 
  UserRole, 
  Client, 
  Employee, 
  Appointment, 
  Treatment, 
  Supply, 
  Payment, 
  AppointmentStatus, 
  PaymentStatus, 
  SupplyStatus,
  MovementType,
  PaymentMethod
} from '@prisma/client';
