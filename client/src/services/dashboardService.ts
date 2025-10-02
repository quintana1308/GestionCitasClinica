import api from './authService';

export interface DashboardStats {
  appointments: {
    today: number;
    monthly: number;
    total: number;
    byStatus: {
      [key: string]: number;
    };
  };
  clients: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  revenue: {
    total: number;
    monthly: number;
    monthlyData: {
      month: string;
      revenue: number;
    }[];
  };
  payments: {
    pending: number;
    overdue: number;
  };
  inventory: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  popularTreatments: {
    name: string;
    price: number;
    appointmentCount: number;
  }[];
}

export interface SystemAlert {
  type: 'inventory' | 'payment' | 'appointment';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  data: any;
}

export interface RecentActivity {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
  };
}

export const dashboardService = {
  // Obtener estadísticas generales del dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data.data.stats;
  },

  // Obtener citas del día
  getTodaySchedule: async () => {
    const response = await api.get('/dashboard/schedule/today');
    return response.data.data.appointments;
  },

  // Obtener alertas del sistema
  getSystemAlerts: async (): Promise<SystemAlert[]> => {
    const response = await api.get('/dashboard/alerts');
    return response.data.data.alerts;
  },

  // Obtener actividad reciente
  getRecentActivity: async (limit: number = 20): Promise<RecentActivity[]> => {
    const response = await api.get(`/dashboard/activity?limit=${limit}`);
    return response.data.data.activities;
  }
};
