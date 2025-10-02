import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { dashboardService, DashboardStats, SystemAlert } from '../../services/dashboardService';

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardStats, todaySchedule, systemAlerts] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getTodaySchedule(),
          dashboardService.getSystemAlerts()
        ]);

        setStats(dashboardStats);
        setTodayAppointments(todaySchedule);
        setAlerts(systemAlerts);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      name: 'Citas Hoy',
      value: stats?.appointments.today.toString() || '0',
      icon: CalendarIcon,
      color: 'bg-blue-500',
      change: `${stats?.appointments.monthly || 0} este mes`,
      changeType: 'positive' as const,
    },
    {
      name: 'Total Clientes',
      value: stats?.clients.total.toString() || '0',
      icon: UsersIcon,
      color: 'bg-green-500',
      change: `${stats?.clients.newThisMonth || 0} nuevos este mes`,
      changeType: 'positive' as const,
    },
    {
      name: 'Ingresos del Mes',
      value: `$${stats?.revenue.monthly.toLocaleString() || '0'}`,
      icon: CurrencyDollarIcon,
      color: 'bg-purple-500',
      change: `$${stats?.revenue.total.toLocaleString() || '0'} total`,
      changeType: 'positive' as const,
    },
    {
      name: 'Stock Bajo',
      value: stats?.inventory.lowStock.toString() || '0',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      change: `${stats?.inventory.outOfStock || 0} agotados`,
      changeType: 'negative' as const,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmada';
      case 'SCHEDULED':
        return 'Programada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'COMPLETED':
        return 'Completada';
      case 'IN_PROGRESS':
        return 'En Progreso';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen de la actividad de tu clínica</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Citas de Hoy</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {todayAppointments.length > 0 ? (
              todayAppointments.slice(0, 5).map((appointment: any) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {appointment.client.user.firstName} {appointment.client.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.treatments.map((t: any) => t.treatment.name).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(appointment.startTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No hay citas programadas para hoy</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CalendarIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Nueva Cita</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <UsersIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Nuevo Cliente</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CurrencyDollarIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Registrar Pago</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ExclamationTriangleIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Ver Alertas</p>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-900">
                <span className="font-medium">María García</span> confirmó su cita para mañana
              </p>
              <p className="text-xs text-gray-500">Hace 5 minutos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <UsersIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-900">
                Nuevo cliente registrado: <span className="font-medium">Ana López</span>
              </p>
              <p className="text-xs text-gray-500">Hace 15 minutos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <CurrencyDollarIcon className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-900">
                Pago recibido de <span className="font-medium">Carmen Ruiz</span> - $85.00
              </p>
              <p className="text-xs text-gray-500">Hace 1 hora</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
