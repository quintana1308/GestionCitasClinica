import api from './authService';

export interface Client {
  id: string;
  userId: string;
  dateOfBirth?: Date | string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalConditions?: string;
  allergies?: string;
  clientCode: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
  appointments?: any[];
  payments?: any[];
}

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

export interface UpdateClientData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalConditions?: string;
  allergies?: string;
}

export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const clientService = {
  // Obtener todos los clientes con filtros
  getClients: async (filters: ClientFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/clients?${params.toString()}`);
    return response.data.data;
  },

  // Obtener un cliente por ID
  getClientById: async (id: string): Promise<Client> => {
    const response = await api.get(`/clients/${id}`);
    return response.data.data.client;
  },

  // Crear un nuevo cliente
  createClient: async (clientData: CreateClientData): Promise<Client> => {
    const response = await api.post('/clients', clientData);
    return response.data.data.client;
  },

  // Actualizar un cliente
  updateClient: async (id: string, clientData: UpdateClientData): Promise<Client> => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data.data.client;
  },

  // Activar/Desactivar cliente
  toggleClientStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/clients/${id}/status`, { isActive });
    return response.data;
  },

  // Eliminar cliente
  deleteClient: async (id: string) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  // Obtener estadísticas del cliente
  getClientStats: async (id: string) => {
    const response = await api.get(`/clients/${id}/stats`);
    return response.data.data.stats;
  }
};
