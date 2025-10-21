import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  DocumentTextIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { invoiceService, Invoice, InvoiceFilters, InvoiceStats } from '../../services/invoiceService';
import { clientService, Client } from '../../services/clientService';
import Modal from '../Modal';

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InvoiceFilters>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'CASH',
    description: '',
    transactionId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchStats();
    fetchClients();
  }, [filters]);

  // Efecto para abrir automáticamente una factura específica desde URL
  useEffect(() => {
    const invoiceId = searchParams.get('invoiceId');
    if (invoiceId && invoices.length > 0) {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        handleOpenDetailsModal(invoice);
        // Limpiar el parámetro de la URL
        navigate('/dashboard/invoices', { replace: true });
      }
    }
  }, [invoices, searchParams, navigate]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getInvoices(filters);
      setInvoices(response.data.invoices);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Error al cargar facturas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await invoiceService.getInvoiceStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clientService.getClients({ limit: 1000 });
      setClients(response.data.clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleFilterChange = (key: keyof InvoiceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleOpenDetailsModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handleViewPayment = (paymentId: string) => {
    // Navegar a la página de pagos con el pago específico seleccionado
    navigate(`/dashboard/payments?paymentId=${paymentId}`);
  };

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      amount: invoice.pendingAmount,
      method: 'CASH',
      description: `Abono a factura ${invoice.id}`,
      transactionId: ''
    });
    setShowPaymentModal(true);
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      setSubmitting(true);
      await invoiceService.createPayment({
        clientId: selectedInvoice.clientId,
        invoiceId: selectedInvoice.id,
        appointmentId: selectedInvoice.appointmentId,
        amount: paymentData.amount,
        method: paymentData.method,
        description: paymentData.description,
        transactionId: paymentData.transactionId
      });

      toast.success('Abono registrado exitosamente');
      setShowPaymentModal(false);
      fetchInvoices();
      fetchStats();
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast.error(error.response?.data?.message || 'Error al registrar abono');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PARTIAL':
        return 'bg-blue-100 text-blue-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'PARTIAL':
        return 'Parcial';
      case 'PAID':
        return 'Pagado';
      case 'OVERDUE':
        return 'Vencido';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClientName = (invoice: Invoice) => {
    return `${invoice.client.user.firstName} ${invoice.client.user.lastName}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Facturas</h1>
          <p className="text-gray-600">Administra las facturas y abonos de la clínica</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Facturas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingInvoices + stats.partialInvoices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monto Pendiente</p>
                <p className="text-2xl font-bold text-gray-900">${stats.pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Buscar por cliente..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select 
              className="input-field"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="PARTIAL">Parcial</option>
              <option value="PAID">Pagado</option>
              <option value="OVERDUE">Vencido</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              className="input-field"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              className="input-field"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getClientName(invoice)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {invoice.client.user.email}
                    </div>
                    {invoice.appointment && (
                      <div className="text-xs text-gray-400">
                        Cita: {formatDate(invoice.appointment.date)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${Number(invoice.amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Pagado: ${invoice.paidAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Pendiente: ${invoice.pendingAmount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${(invoice.paidAmount / Number(invoice.amount)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {((invoice.paidAmount / Number(invoice.amount)) * 100).toFixed(1)}% pagado
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(invoice.createdAt)}
                    </div>
                    {invoice.dueDate && (
                      <div className="text-xs text-gray-500">
                        Vence: {formatDate(invoice.dueDate)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2 justify-end">
                      {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                        <button 
                          onClick={() => handleOpenPaymentModal(invoice)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Abonar
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenDetailsModal(invoice)}
                        className="text-primary-600 hover:text-primary-900 flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Detalles
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> de{' '}
                  <span className="font-medium">{pagination.total}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Detalles de la Factura"
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Invoice Info */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Factura #{selectedInvoice.id.slice(0, 8)}
                </h3>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                  {getStatusText(selectedInvoice.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cliente:</p>
                  <p className="font-medium">{getClientName(selectedInvoice)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monto Total:</p>
                  <p className="font-medium text-lg">${Number(selectedInvoice.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monto Pagado:</p>
                  <p className="font-medium text-green-600">${selectedInvoice.paidAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monto Pendiente:</p>
                  <p className="font-medium text-red-600">${selectedInvoice.pendingAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Appointment Information */}
            {selectedInvoice.appointment && (
              <div className="border-b pb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Información de la Cita
                </h4>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Fecha y Hora:</p>
                      <p className="font-medium text-blue-900">
                        {formatDateTime(selectedInvoice.appointment.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado de la Cita:</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedInvoice.appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        selectedInvoice.appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        selectedInvoice.appointment.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                        selectedInvoice.appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedInvoice.appointment.status === 'COMPLETED' ? 'Completada' :
                         selectedInvoice.appointment.status === 'CONFIRMED' ? 'Confirmada' :
                         selectedInvoice.appointment.status === 'SCHEDULED' ? 'Programada' :
                         selectedInvoice.appointment.status === 'CANCELLED' ? 'Cancelada' :
                         selectedInvoice.appointment.status}
                      </span>
                    </div>
                  </div>
                  
                  {selectedInvoice.appointment.treatments && selectedInvoice.appointment.treatments.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Tratamientos:</p>
                      <div className="space-y-2">
                        {selectedInvoice.appointment.treatments.map((treatment, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded-md p-3 border">
                            <div>
                              <p className="font-medium text-gray-900">{treatment.treatment.name}</p>
                              {treatment.treatment.description && (
                                <p className="text-sm text-gray-600">{treatment.treatment.description}</p>
                              )}
                            </div>
                            {treatment.treatment.price && (
                              <div className="text-right">
                                <p className="font-medium text-gray-900">${Number(treatment.treatment.price).toFixed(2)}</p>
                                <p className="text-xs text-gray-500">
                                  {treatment.treatment.duration ? `${treatment.treatment.duration} min` : ''}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedInvoice.appointment.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Notas de la Cita:</p>
                      <p className="text-sm text-gray-800 bg-white rounded-md p-2 border mt-1">
                        {selectedInvoice.appointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment History */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Historial de Pagos ({selectedInvoice.paymentsCount})
              </h4>
              
              {selectedInvoice.payments.length > 0 ? (
                <div className="space-y-2">
                  {selectedInvoice.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">${Number(payment.amount).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{payment.method}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-900">
                          {payment.paidDate ? formatDate(payment.paidDate) : formatDate(payment.createdAt)}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          payment.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <button
                          onClick={() => handleViewPayment(payment.id)}
                          className="text-primary-600 hover:text-primary-900 flex items-center text-sm"
                        >
                          <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                          Ver Pago
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay pagos registrados</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn-outline"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Registrar Abono"
        size="md"
      >
        {selectedInvoice && (
          <form onSubmit={handleCreatePayment} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <h4 className="font-medium text-blue-900">
                Factura #{selectedInvoice.id.slice(0, 8)}
              </h4>
              <p className="text-sm text-blue-700">
                Cliente: {getClientName(selectedInvoice)}
              </p>
              <p className="text-sm text-blue-700">
                Monto pendiente: ${selectedInvoice.pendingAmount.toFixed(2)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto del Abono <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="input-field"
                  min="0.01"
                  max={selectedInvoice.pendingAmount}
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="CASH">Efectivo</option>
                  <option value="CARD">Tarjeta</option>
                  <option value="TRANSFER">Transferencia</option>
                  <option value="CHECK">Cheque</option>
                  <option value="FINANCING">Financiamiento</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID de Transacción
              </label>
              <input
                type="text"
                value={paymentData.transactionId}
                onChange={(e) => setPaymentData(prev => ({ ...prev, transactionId: e.target.value }))}
                className="input-field"
                placeholder="Ej: TRX123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={paymentData.description}
                onChange={(e) => setPaymentData(prev => ({ ...prev, description: e.target.value }))}
                className="input-field"
                rows={3}
                placeholder="Detalles del abono..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="btn-outline"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Registrando...' : 'Registrar Abono'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Invoices;
