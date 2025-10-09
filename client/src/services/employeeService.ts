import api from './authService';

export interface Employee {
  id: string;
  userId: string;
  position: string;
  specialties?: string;
  schedule?: any;
  salary?: number;
  hireDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface CreateEmployeeData {
  userId: string;
  position: string;
  specialties?: string;
  schedule?: any;
  salary?: number;
  hireDate: string;
}

export interface UpdateEmployeeData {
  position?: string;
  specialties?: string;
  schedule?: any;
  salary?: number;
  isActive?: boolean;
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  position?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const employeeService = {
  // Obtener todos los empleados con filtros
  getEmployees: async (filters: EmployeeFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/employees?${params.toString()}`);
    return response.data.data;
  },

  // Obtener un empleado por ID
  getEmployeeById: async (id: string): Promise<Employee> => {
    const response = await api.get(`/employees/${id}`);
    return response.data.data.employee;
  },

  // Crear un nuevo empleado
  createEmployee: async (employeeData: CreateEmployeeData): Promise<Employee> => {
    const response = await api.post('/employees', employeeData);
    return response.data.data.employee;
  },

  // Actualizar un empleado
  updateEmployee: async (id: string, employeeData: UpdateEmployeeData): Promise<Employee> => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data.data.employee;
  },

  // Eliminar un empleado
  deleteEmployee: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};
