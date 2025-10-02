import api from './authService';

export interface Treatment {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number | string; // Puede venir como Decimal de Prisma
  category: string;
  isActive: boolean;
  supplies?: any;
  createdAt: Date;
  updatedAt: Date;
  appointments?: any[];
  _count?: {
    appointments: number;
  };
}

export interface CreateTreatmentData {
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  supplies?: any;
}

export interface UpdateTreatmentData {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  category?: string;
  supplies?: any;
}

export interface TreatmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const treatmentService = {
  // Obtener todos los tratamientos con filtros
  getTreatments: async (filters: TreatmentFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/treatments?${params.toString()}`);
    return response.data.data;
  },

  // Obtener un tratamiento por ID
  getTreatmentById: async (id: string): Promise<Treatment> => {
    const response = await api.get(`/treatments/${id}`);
    return response.data.data.treatment;
  },

  // Crear un nuevo tratamiento
  createTreatment: async (treatmentData: CreateTreatmentData): Promise<Treatment> => {
    const response = await api.post('/treatments', treatmentData);
    return response.data.data.treatment;
  },

  // Actualizar un tratamiento
  updateTreatment: async (id: string, treatmentData: UpdateTreatmentData): Promise<Treatment> => {
    const response = await api.put(`/treatments/${id}`, treatmentData);
    return response.data.data.treatment;
  },

  // Activar/Desactivar tratamiento
  toggleTreatmentStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/treatments/${id}/status`, { isActive });
    return response.data;
  },

  // Eliminar tratamiento
  deleteTreatment: async (id: string) => {
    const response = await api.delete(`/treatments/${id}`);
    return response.data;
  },

  // Obtener categorías de tratamientos
  getTreatmentCategories: async (): Promise<string[]> => {
    const response = await api.get('/treatments/categories');
    return response.data.data.categories;
  },

  // Obtener estadísticas del tratamiento
  getTreatmentStats: async (id: string) => {
    const response = await api.get(`/treatments/${id}/stats`);
    return response.data.data.stats;
  }
};
