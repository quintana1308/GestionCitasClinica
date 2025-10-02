import api from './authService';

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id: string;
  clientId: string;
  employeeId?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  totalAmount?: number;
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
  employee?: {
    id: string;
    position: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  treatments: {
    id: string;
    quantity: number;
    price: number;
    notes?: string;
    treatment: {
      id: string;
      name: string;
      duration: number;
      price: number;
    };
  }[];
  payments?: any[];
}

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
  employeeId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  treatmentIds?: string[];
}

export interface AppointmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: AppointmentStatus;
  employeeId?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const appointmentService = {
  // Obtener todas las citas con filtros
  getAppointments: async (filters: AppointmentFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/appointments?${params.toString()}`);
    return response.data.data;
  },

  // Obtener una cita por ID
  getAppointmentById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data.data.appointment;
  },

  // Crear una nueva cita
  createAppointment: async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
    const response = await api.post('/appointments', appointmentData);
    return response.data.data.appointment;
  },

  // Actualizar una cita
  updateAppointment: async (id: string, appointmentData: UpdateAppointmentData): Promise<Appointment> => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data.data.appointment;
  },

  // Cambiar estado de una cita
  updateAppointmentStatus: async (id: string, status: AppointmentStatus) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  // Cancelar una cita
  cancelAppointment: async (id: string, reason?: string) => {
    const response = await api.patch(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  // Obtener citas del día
  getTodayAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments/today');
    return response.data.data.appointments;
  }
};
