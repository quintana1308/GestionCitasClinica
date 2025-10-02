import React from 'react';
import { ChartBarIcon, DocumentTextIcon, ArrowTrendingUpIcon, CalendarIcon } from '@heroicons/react/24/outline';

const Reports: React.FC = () => {
  // Datos de ejemplo para gráficos
  const monthlyRevenue = [
    { month: 'Ene', revenue: 4500, appointments: 45 },
    { month: 'Feb', revenue: 5200, appointments: 52 },
    { month: 'Mar', revenue: 4800, appointments: 48 },
    { month: 'Abr', revenue: 6100, appointments: 61 },
    { month: 'May', revenue: 5800, appointments: 58 },
    { month: 'Jun', revenue: 6500, appointments: 65 }
  ];

  const treatmentPopularity = [
    { name: 'Limpieza Facial', count: 85, percentage: 35 },
    { name: 'Tratamiento Anti-edad', count: 72, percentage: 30 },
    { name: 'Depilación Láser', count: 48, percentage: 20 },
    { name: 'Masaje Corporal', count: 36, percentage: 15 }
  ];

  const clientStats = {
    totalClients: 156,
    newThisMonth: 23,
    returningClients: 89,
    averageVisits: 3.2
  };

  const financialStats = {
    totalRevenue: 32900,
    totalExpenses: 12400,
    netProfit: 20500,
    profitMargin: 62.3
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600">Estadísticas y métricas del negocio</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-outline flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Exportar PDF
          </button>
          <button className="btn-primary flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select className="input-field">
              <option value="this_month">Este mes</option>
              <option value="last_month">Mes anterior</option>
              <option value="this_quarter">Este trimestre</option>
              <option value="this_year">Este año</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input type="date" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input type="date" className="input-field" />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full">
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-600">${financialStats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-500">+12% vs mes anterior</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Citas</p>
              <p className="text-2xl font-bold text-blue-600">289</p>
              <p className="text-xs text-blue-500">+8% vs mes anterior</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ganancia Neta</p>
              <p className="text-2xl font-bold text-purple-600">${financialStats.netProfit.toLocaleString()}</p>
              <p className="text-xs text-purple-500">{financialStats.profitMargin}% margen</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <DocumentTextIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
              <p className="text-2xl font-bold text-orange-600">{clientStats.totalClients}</p>
              <p className="text-xs text-orange-500">+{clientStats.newThisMonth} nuevos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos Mensuales</h3>
          <div className="space-y-4">
            {monthlyRevenue.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 w-8">{data.month}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${(data.revenue / 7000) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">${data.revenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{data.appointments} citas</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Treatment Popularity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tratamientos Más Populares</h3>
          <div className="space-y-4">
            {treatmentPopularity.map((treatment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 flex-1">{treatment.name}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${treatment.percentage * 2.5}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{treatment.count}</div>
                  <div className="text-xs text-gray-500">{treatment.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Summary */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Financiero</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ingresos Totales</span>
              <span className="text-sm font-medium text-green-600">
                +${financialStats.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Gastos Totales</span>
              <span className="text-sm font-medium text-red-600">
                -${financialStats.totalExpenses.toLocaleString()}
              </span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Ganancia Neta</span>
              <span className="text-sm font-bold text-primary-600">
                ${financialStats.netProfit.toLocaleString()}
              </span>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{financialStats.profitMargin}%</div>
                <div className="text-xs text-green-700">Margen de Ganancia</div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Analytics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Clientes</h3>
          <div className="space-y-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{clientStats.totalClients}</div>
              <div className="text-xs text-blue-700">Clientes Totales</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">{clientStats.newThisMonth}</div>
                <div className="text-xs text-green-700">Nuevos</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <div className="text-lg font-bold text-purple-600">{clientStats.returningClients}</div>
                <div className="text-xs text-purple-700">Recurrentes</div>
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{clientStats.averageVisits}</div>
              <div className="text-xs text-orange-700">Visitas Promedio</div>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Rendimiento</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tasa de Ocupación</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="text-sm font-medium">78%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Satisfacción Cliente</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <span className="text-sm font-medium">92%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Puntualidad</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-medium">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Retención Cliente</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
                <span className="text-sm font-medium">89%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Opciones de Exportación</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-outline flex items-center justify-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Reporte Financiero PDF
          </button>
          <button className="btn-outline flex items-center justify-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Análisis de Clientes Excel
          </button>
          <button className="btn-outline flex items-center justify-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
            Reporte de Rendimiento
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
