import api from './authService';

export type SupplyStatus = 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED' | 'DISCONTINUED';
export type MovementType = 'IN' | 'OUT' | 'ADJUST' | 'EXPIRED';

export interface Supply {
  id: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  maxStock?: number;
  unitCost: number;
  supplier?: string;
  expiryDate?: Date;
  status: SupplyStatus;
  createdAt: Date;
  updatedAt: Date;
  movements?: SupplyMovement[];
  _count?: {
    movements: number;
  };
}

export interface SupplyMovement {
  id: string;
  supplyId: string;
  type: MovementType;
  quantity: number;
  unitCost?: number;
  reason?: string;
  reference?: string;
  createdBy: string;
  createdAt: Date;
}

export interface CreateSupplyData {
  name: string;
  description?: string;
  category: string;
  unit: string;
  stock?: number;
  minStock?: number;
  maxStock?: number;
  unitCost: number;
  supplier?: string;
  expiryDate?: string;
}

export interface UpdateSupplyData {
  name?: string;
  description?: string;
  category?: string;
  unit?: string;
  minStock?: number;
  maxStock?: number;
  unitCost?: number;
  supplier?: string;
  expiryDate?: string;
}

export interface UpdateStockData {
  type: MovementType;
  quantity: number;
  reason?: string;
  unitCost?: number;
}

export interface SupplyFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: SupplyStatus;
  lowStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const supplyService = {
  // Obtener todos los insumos con filtros
  getSupplies: async (filters: SupplyFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/supplies?${params.toString()}`);
    return response.data.data;
  },

  // Obtener un insumo por ID
  getSupplyById: async (id: string): Promise<Supply> => {
    const response = await api.get(`/supplies/${id}`);
    return response.data.data.supply;
  },

  // Crear un nuevo insumo
  createSupply: async (supplyData: CreateSupplyData): Promise<Supply> => {
    const response = await api.post('/supplies', supplyData);
    return response.data.data.supply;
  },

  // Actualizar un insumo
  updateSupply: async (id: string, supplyData: UpdateSupplyData): Promise<Supply> => {
    const response = await api.put(`/supplies/${id}`, supplyData);
    return response.data.data.supply;
  },

  // Actualizar stock de un insumo
  updateSupplyStock: async (id: string, stockData: UpdateStockData) => {
    const response = await api.patch(`/supplies/${id}/stock`, stockData);
    return response.data;
  },

  // Cambiar estado de un insumo
  updateSupplyStatus: async (id: string, status: SupplyStatus) => {
    const response = await api.patch(`/supplies/${id}/status`, { status });
    return response.data;
  },

  // Obtener insumos con stock bajo
  getLowStockSupplies: async (): Promise<Supply[]> => {
    const response = await api.get('/supplies/low-stock');
    return response.data.data.supplies;
  },

  // Obtener categorías de insumos
  getSupplyCategories: async (): Promise<string[]> => {
    const response = await api.get('/supplies/categories');
    return response.data.data.categories;
  },

  // Obtener historial de movimientos de un insumo
  getSupplyMovements: async (id: string, page: number = 1, limit: number = 20) => {
    const response = await api.get(`/supplies/${id}/movements?page=${page}&limit=${limit}`);
    return response.data.data;
  }
};
