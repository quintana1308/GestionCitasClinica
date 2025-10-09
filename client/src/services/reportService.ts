import api from './authService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { dashboardService } from './dashboardService';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  period?: 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'custom';
}

export interface ReportStats {
  financial: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    byStatus: {
      [key: string]: number;
    };
  };
  clients: {
    total: number;
    newClients: number;
    returningClients: number;
    averageVisits: number;
  };
  treatments: {
    name: string;
    count: number;
    revenue: number;
    percentage: number;
  }[];
  monthlyRevenue: {
    month: string;
    revenue: number;
    appointments: number;
    expenses: number;
  }[];
  performance: {
    occupancyRate: number;
    clientSatisfaction: number;
    punctuality: number;
    clientRetention: number;
  };
}

export const reportService = {
  // Obtener estadísticas de reportes con filtros
  getReportStats: async (filters: ReportFilters = {}): Promise<ReportStats> => {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.period) params.append('period', filters.period);

    const response = await api.get(`/dashboard/stats?${params.toString()}`);
    return response.data.data.stats;
  },

  // Exportar reporte financiero a PDF
  exportFinancialPDF: async (filters: ReportFilters = {}) => {
    try {
      // Obtener datos del dashboard
      const stats = await dashboardService.getDashboardStats();
      
      // Crear documento PDF
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229); // Color primary
      doc.text('Reporte Financiero', 14, 20);
      
      // Información del período
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const periodText = filters.startDate && filters.endDate 
        ? `Período: ${filters.startDate} al ${filters.endDate}`
        : `Generado: ${new Date().toLocaleDateString('es-ES')}`;
      doc.text(periodText, 14, 28);
      
      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 32, 196, 32);
      
      // Resumen Financiero
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Resumen Financiero', 14, 42);
      
      autoTable(doc, {
        startY: 48,
        head: [['Concepto', 'Valor']],
        body: [
          ['Ingresos Totales', `$${Number(stats.revenue.total).toLocaleString()}`],
          ['Total de Citas', stats.appointments.total.toString()],
          ['Citas Completadas', (stats.appointments.byStatus['COMPLETED'] || 0).toString()],
          ['Citas Canceladas', (stats.appointments.byStatus['CANCELLED'] || 0).toString()],
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14 }
      });
      
      // Estadísticas de Clientes
      const finalY = (doc as any).lastAutoTable.finalY || 90;
      doc.setFontSize(14);
      doc.text('Estadísticas de Clientes', 14, finalY + 10);
      
      autoTable(doc, {
        startY: finalY + 16,
        head: [['Métrica', 'Cantidad']],
        body: [
          ['Total de Clientes', stats.clients.total.toString()],
          ['Clientes Nuevos', stats.clients.newThisMonth.toString()],
          ['Clientes Activos', stats.clients.active.toString()],
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14 }
      });
      
      // Tratamientos Populares
      const finalY2 = (doc as any).lastAutoTable.finalY || 140;
      if (finalY2 < 250) {
        doc.setFontSize(14);
        doc.text('Tratamientos Más Populares', 14, finalY2 + 10);
        
        const treatmentData = stats.popularTreatments.slice(0, 5).map(t => [
          t.name,
          t.appointmentCount.toString(),
          `$${Number(t.price).toLocaleString()}`
        ]);
        
        autoTable(doc, {
          startY: finalY2 + 16,
          head: [['Tratamiento', 'Cantidad', 'Precio']],
          body: treatmentData,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] },
          margin: { left: 14 }
        });
      }
      
      // Pie de página
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      // Descargar PDF
      const fileName = `reporte-financiero-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      return { success: true, message: 'PDF descargado exitosamente' };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  },

  // Exportar análisis de clientes a Excel
  exportClientsExcel: async (filters: ReportFilters = {}) => {
    try {
      // Obtener datos del dashboard
      const stats = await dashboardService.getDashboardStats();
      
      // Crear workbook
      const wb = XLSX.utils.book_new();
      
      // Hoja 1: Resumen General
      const summaryData = [
        ['ANÁLISIS DE CLIENTES'],
        [''],
        ['Período:', filters.startDate && filters.endDate 
          ? `${filters.startDate} al ${filters.endDate}` 
          : new Date().toLocaleDateString('es-ES')],
        ['Generado:', new Date().toLocaleString('es-ES')],
        [''],
        ['RESUMEN GENERAL'],
        ['Métrica', 'Valor'],
        ['Total de Clientes', stats.clients.total],
        ['Clientes Nuevos Este Mes', stats.clients.newThisMonth],
        ['Clientes Activos', stats.clients.active],
        [''],
        ['ESTADÍSTICAS DE CITAS'],
        ['Métrica', 'Valor'],
        ['Total de Citas', stats.appointments.total],
        ['Citas del Mes', stats.appointments.monthly],
        ['Citas Completadas', stats.appointments.byStatus['COMPLETED'] || 0],
        ['Citas Canceladas', stats.appointments.byStatus['CANCELLED'] || 0],
        ['Citas Pendientes', stats.appointments.byStatus['SCHEDULED'] || 0],
      ];
      
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Estilo para el título
      ws1['A1'].s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'center' }
      };
      
      // Ancho de columnas
      ws1['!cols'] = [
        { wch: 30 },
        { wch: 20 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');
      
      // Hoja 2: Tratamientos Populares
      const treatmentData = [
        ['TRATAMIENTOS MÁS POPULARES'],
        [''],
        ['Tratamiento', 'Cantidad de Citas', 'Precio', 'Ingresos Totales'],
        ...stats.popularTreatments.map(t => [
          t.name,
          t.appointmentCount,
          Number(t.price),
          Number(t.price) * t.appointmentCount
        ])
      ];
      
      const ws2 = XLSX.utils.aoa_to_sheet(treatmentData);
      ws2['!cols'] = [
        { wch: 30 },
        { wch: 18 },
        { wch: 15 },
        { wch: 18 }
      ];
      
      XLSX.utils.book_append_sheet(wb, ws2, 'Tratamientos');
      
      // Hoja 3: Ingresos Mensuales
      if (stats.revenue.monthlyData && stats.revenue.monthlyData.length > 0) {
        const revenueData = [
          ['INGRESOS MENSUALES'],
          [''],
          ['Mes', 'Ingresos'],
          ...stats.revenue.monthlyData.map(m => [
            m.month,
            Number(m.revenue)
          ]),
          [''],
          ['TOTAL', stats.revenue.total]
        ];
        
        const ws3 = XLSX.utils.aoa_to_sheet(revenueData);
        ws3['!cols'] = [
          { wch: 15 },
          { wch: 20 }
        ];
        
        XLSX.utils.book_append_sheet(wb, ws3, 'Ingresos');
      }
      
      // Descargar archivo
      const fileName = `analisis-clientes-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      return { success: true, message: 'Excel descargado exitosamente' };
    } catch (error) {
      console.error('Error generating Excel:', error);
      throw error;
    }
  },

  // Generar reporte general (PDF + Excel)
  generateReport: async (filters: ReportFilters = {}) => {
    try {
      console.log('=== INICIO generateReport ===');
      // Obtener datos una sola vez
      const stats = await dashboardService.getDashboardStats();
      
      // Generar PDF
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229);
      doc.text('Reporte Financiero', 14, 20);
      
      // Información del período
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const periodText = filters.startDate && filters.endDate 
        ? `Período: ${filters.startDate} al ${filters.endDate}`
        : `Generado: ${new Date().toLocaleDateString('es-ES')}`;
      doc.text(periodText, 14, 28);
      
      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 32, 196, 32);
      
      // Resumen Financiero
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Resumen Financiero', 14, 42);
      
      autoTable(doc, {
        startY: 48,
        head: [['Concepto', 'Valor']],
        body: [
          ['Ingresos Totales', `$${Number(stats.revenue.total).toLocaleString()}`],
          ['Total de Citas', stats.appointments.total.toString()],
          ['Citas Completadas', (stats.appointments.byStatus['COMPLETED'] || 0).toString()],
          ['Citas Canceladas', (stats.appointments.byStatus['CANCELLED'] || 0).toString()],
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14 }
      });
      
      // Estadísticas de Clientes
      const finalY = (doc as any).lastAutoTable.finalY || 90;
      doc.setFontSize(14);
      doc.text('Estadísticas de Clientes', 14, finalY + 10);
      
      autoTable(doc, {
        startY: finalY + 16,
        head: [['Métrica', 'Cantidad']],
        body: [
          ['Total de Clientes', stats.clients.total.toString()],
          ['Clientes Nuevos', stats.clients.newThisMonth.toString()],
          ['Clientes Activos', stats.clients.active.toString()],
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 14 }
      });
      
      // Tratamientos Populares
      const finalY2 = (doc as any).lastAutoTable.finalY || 140;
      if (finalY2 < 250) {
        doc.setFontSize(14);
        doc.text('Tratamientos Más Populares', 14, finalY2 + 10);
        
        const treatmentData = stats.popularTreatments.slice(0, 5).map(t => [
          t.name,
          t.appointmentCount.toString(),
          `$${Number(t.price).toLocaleString()}`
        ]);
        
        autoTable(doc, {
          startY: finalY2 + 16,
          head: [['Tratamiento', 'Cantidad', 'Precio']],
          body: treatmentData,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] },
          margin: { left: 14 }
        });
      }
      
      // Pie de página
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      // Descargar PDF
      const pdfFileName = `reporte-financiero-${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('Descargando PDF:', pdfFileName);
      doc.save(pdfFileName);
      
      // Generar Excel
      console.log('Generando Excel...');
      const wb = XLSX.utils.book_new();
      
      // Hoja 1: Resumen General
      const summaryData = [
        ['ANÁLISIS DE CLIENTES'],
        [''],
        ['Período:', filters.startDate && filters.endDate 
          ? `${filters.startDate} al ${filters.endDate}` 
          : new Date().toLocaleDateString('es-ES')],
        ['Generado:', new Date().toLocaleString('es-ES')],
        [''],
        ['RESUMEN GENERAL'],
        ['Métrica', 'Valor'],
        ['Total de Clientes', stats.clients.total],
        ['Clientes Nuevos Este Mes', stats.clients.newThisMonth],
        ['Clientes Activos', stats.clients.active],
        [''],
        ['ESTADÍSTICAS DE CITAS'],
        ['Métrica', 'Valor'],
        ['Total de Citas', stats.appointments.total],
        ['Citas del Mes', stats.appointments.monthly],
        ['Citas Completadas', stats.appointments.byStatus['COMPLETED'] || 0],
        ['Citas Canceladas', stats.appointments.byStatus['CANCELLED'] || 0],
        ['Citas Pendientes', stats.appointments.byStatus['SCHEDULED'] || 0],
      ];
      
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      ws1['A1'].s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'center' }
      };
      ws1['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');
      
      // Hoja 2: Tratamientos Populares
      const treatmentData = [
        ['TRATAMIENTOS MÁS POPULARES'],
        [''],
        ['Tratamiento', 'Cantidad de Citas', 'Precio', 'Ingresos Totales'],
        ...stats.popularTreatments.map(t => [
          t.name,
          t.appointmentCount,
          Number(t.price),
          Number(t.price) * t.appointmentCount
        ])
      ];
      
      const ws2 = XLSX.utils.aoa_to_sheet(treatmentData);
      ws2['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 15 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Tratamientos');
      
      // Hoja 3: Ingresos Mensuales
      if (stats.revenue.monthlyData && stats.revenue.monthlyData.length > 0) {
        const revenueData = [
          ['INGRESOS MENSUALES'],
          [''],
          ['Mes', 'Ingresos'],
          ...stats.revenue.monthlyData.map(m => [m.month, Number(m.revenue)]),
          [''],
          ['TOTAL', stats.revenue.total]
        ];
        
        const ws3 = XLSX.utils.aoa_to_sheet(revenueData);
        ws3['!cols'] = [{ wch: 15 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, ws3, 'Ingresos');
      }
      
      // Descargar Excel
      const excelFileName = `analisis-clientes-${new Date().toISOString().split('T')[0]}.xlsx`;
      console.log('Descargando Excel:', excelFileName);
      XLSX.writeFile(wb, excelFileName);
      
      console.log('=== FIN generateReport ===');
      return { 
        success: true, 
        message: 'Reportes generados: PDF y Excel descargados exitosamente' 
      };
    } catch (error) {
      console.error('Error generating reports:', error);
      throw error;
    }
  }
};
