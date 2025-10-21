import React, { useState, useEffect } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, CalendarIcon, UserGroupIcon, DocumentArrowDownIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { dashboardService, DashboardStats } from '../../services/dashboardService';
import { reportService, ReportFilters } from '../../services/reportService';

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Obtener el primer y último día del mes actual
  const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    };
  };

  const [filters, setFilters] = useState<ReportFilters>({
    period: 'this_month',
    ...getDefaultDates()
  });

  // Función para formatear el nombre del mes
  const formatMonthName = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { 
      month: 'long',
      year: 'numeric'
    });
  };

  // Calcular datos derivados de stats - solo meses con ingresos
  const monthlyRevenue = (stats?.revenue.monthlyData || [])
    .filter(data => data.revenue > 0) // Solo meses con ingresos
    .map(data => ({
      ...data,
      monthName: formatMonthName(data.month)
    }));
  
  const treatmentPopularity = stats?.popularTreatments.map((t, index, arr) => ({
    name: t.name,
    count: t.appointmentCount,
    revenue: Number(t.price) * t.appointmentCount,
    percentage: arr.length > 0 ? Math.round((t.appointmentCount / arr.reduce((sum, item) => sum + item.appointmentCount, 0)) * 100) : 0
  })) || [];

  const clientStats = {
    totalClients: stats?.clients.total || 0,
    newThisMonth: stats?.clients.newThisMonth || 0,
    returningClients: stats?.clients.active || 0,
    averageVisits: (stats?.clients.total && stats?.clients.total > 0) 
      ? (stats?.appointments.total || 0) / stats.clients.total 
      : 0
  };

  const financialStats = {
    totalRevenue: stats?.revenue.total || 0,
    totalExpenses: 0, // Calcular de gastos si existe
    netProfit: stats?.revenue.total || 0,
    profitMargin: 100
  };

  // Cargar datos al montar y cuando cambien los filtros
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    switch (period) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this_quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return;
    }

    setFilters({
      period: period as any,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const handleApplyFilters = () => {
    fetchStats();
    toast.success('Filtros aplicados');
  };

  const handleExportPDF = async () => {
    // Prevenir múltiples clics
    if (exportingPDF) return;
    
    try {
      setExportingPDF(true);
      console.log('Generando reporte PDF...');
      await reportService.exportFinancialPDF(filters);
      toast.success('Reporte PDF descargado exitosamente', {
        duration: 4000,
        icon: '📄'
      });
    } catch (err: any) {
      console.error('Error generating PDF report:', err);
      toast.error('Error al generar reporte PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    // Prevenir múltiples clics
    if (exportingExcel) return;
    
    try {
      setExportingExcel(true);
      console.log('Generando reporte Excel...');
      await reportService.exportClientsExcel(filters);
      toast.success('Reporte Excel descargado exitosamente', {
        duration: 4000,
        icon: '📊'
      });
    } catch (err: any) {
      console.error('Error generating Excel report:', err);
      toast.error('Error al generar reporte Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600">Estadísticas y métricas del negocio</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="btn-primary flex items-center"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            {exportingPDF ? 'Generando...' : 'Exportar PDF'}
          </button>
          <button 
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="btn-secondary flex items-center"
          >
            <TableCellsIcon className="h-5 w-5 mr-2" />
            {exportingExcel ? 'Generando...' : 'Exportar Excel'}
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
            <select 
              className="input-field"
              value={filters.period}
              onChange={(e) => handlePeriodChange(e.target.value)}
            >
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
            <input 
              type="date" 
              className="input-field"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, period: 'custom' }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input 
              type="date" 
              className="input-field"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, period: 'custom' }))}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleApplyFilters}
              className="btn-primary w-full"
            >
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
              <p className="text-2xl font-bold text-blue-600">{stats?.appointments.total || 0}</p>
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
              <UserGroupIcon className="h-6 w-6 text-orange-600" />
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
            {monthlyRevenue.length > 0 ? (
              monthlyRevenue.map((data, index) => {
                const maxRevenue = Math.max(...monthlyRevenue.map(d => d.revenue), 1);
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-700 w-32 capitalize">{data.monthName}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3 w-32">
                        <div 
                          className="bg-primary-600 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.max((data.revenue / maxRevenue) * 100, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">${Number(data.revenue).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{stats?.appointments.monthly || 0} citas</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hay ingresos registrados aún</p>
              </div>
            )}
          </div>
        </div>

        {/* Treatment Popularity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tratamientos Más Populares</h3>
          <div className="space-y-4">
            {treatmentPopularity.length > 0 ? (
              treatmentPopularity.map((treatment, index) => {
                const maxCount = Math.max(...treatmentPopularity.map(t => t.count), 1);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 flex-1">
                        {treatment.name}
                      </span>
                      <div className="text-right ml-4">
                        <div className="text-sm font-medium text-gray-900">{treatment.count} citas</div>
                        <div className="text-xs text-gray-500">{treatment.percentage}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.max((treatment.count / maxCount) * 100, 5)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hay datos de tratamientos disponibles</p>
              </div>
            )}
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

    </div>
  );
};

export default Reports;
