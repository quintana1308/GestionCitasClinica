import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  PlusIcon, 
  CreditCardIcon, 
  BanknotesIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  PencilIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { paymentService, Payment, PaymentFilters, PaymentMethod, PaymentStatus, PaymentStats } from '../../services/paymentService';
import Modal from '../Modal';

const Payments: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 12,
    search: '',
    status: undefined,
    method: undefined,
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filters]);


  // Efecto para abrir automáticamente un pago específico desde URL
  useEffect(() => {
    const paymentId = searchParams.get('paymentId');
    if (paymentId && payments.length > 0) {
      const payment = payments.find(p => p.id === paymentId);
      if (payment) {
        handleOpenDetailsModal(payment);
        // Limpiar el parámetro de la URL
        navigate('/dashboard/payments', { replace: true });
      }
    }
  }, [payments, searchParams, navigate]);


  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPayments(filters);
      setPayments(response.payments);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.response?.data?.message || 'Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await paymentService.getPaymentStats(filters.startDate, filters.endDate);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };


  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleFilterChange = (key: keyof PaymentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };


  const handleOpenDetailsModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleViewInvoice = (payment: Payment) => {
    if (payment.invoiceId) {
      // Navegar a la página de facturas con la factura específica seleccionada
      navigate(`/dashboard/invoices?invoiceId=${payment.invoiceId}`);
    } else {
      toast.error('Este pago no está asociado a una factura');
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    if (window.confirm('¿Marcar este pago como pagado?')) {
      try {
        await paymentService.markPaymentAsPaid(paymentId);
        toast.success('Pago marcado como pagado');
        fetchPayments();
        fetchStats();
        if (showDetailsModal) {
          setShowDetailsModal(false);
        }
      } catch (error: any) {
        console.error('Error marking payment as paid:', error);
        toast.error(error.response?.data?.message || 'Error al actualizar el pago');
      }
    }
  };

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

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'Pagado';
      case 'PENDING':
        return 'Pendiente';
      case 'OVERDUE':
        return 'Vencido';
      case 'CANCELLED':
        return 'Cancelado';
      case 'REFUNDED':
        return 'Reembolsado';
      default:
        return status;
    }
  };

  const getMethodIcon = (method: PaymentMethod, payment?: Payment) => {
    // Si es un pago automático, mostrar ícono de advertencia independientemente del método
    if (payment && isAutomaticPayment(payment)) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
    }
    
    switch (method) {
      case 'UNDEFINED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
      case 'CARD':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'CASH':
        return <BanknotesIcon className="h-5 w-5" />;
      case 'TRANSFER':
        return <BanknotesIcon className="h-5 w-5" />;
      case 'CHECK':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'FINANCING':
        return <CreditCardIcon className="h-5 w-5" />;
      default:
        return <CreditCardIcon className="h-5 w-5" />;
    }
  };

  const getMethodText = (method: PaymentMethod, payment?: Payment) => {
    // Si es un pago automático, mostrar "Sin definir" independientemente del método
    if (payment && isAutomaticPayment(payment)) {
      return 'Sin definir';
    }
    
    switch (method) {
      case 'UNDEFINED':
        return 'Sin definir';
      case 'CARD':
        return 'Tarjeta';
      case 'CASH':
        return 'Efectivo';
      case 'TRANSFER':
        return 'Transferencia';
      case 'CHECK':
        return 'Cheque';
      case 'FINANCING':
        return 'Financiamiento';
      default:
        return method;
    }
  };

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getClientName = (payment: Payment) => {
    return `${payment.client.user.firstName} ${payment.client.user.lastName}`;
  };

  const getTreatmentNames = (payment: Payment) => {
    if (!payment.appointment?.treatments || payment.appointment.treatments.length === 0) {
      return 'Sin tratamiento asociado';
    }
    return payment.appointment.treatments.map(t => t.treatment.name).join(', ');
  };

  const isAutomaticPayment = (payment: Payment) => {
    return payment.method === 'UNDEFINED' || !payment.method;
  };

  const getMostUsedMethod = (): PaymentMethod => {
    if (payments.length === 0) return 'CASH';
    
    const methodCounts = payments.reduce((acc, payment) => {
      const method = payment.method || 'UNDEFINED';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(methodCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as PaymentMethod;
  };

  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOverdue = payments.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Pagos</h1>
          <p className="text-gray-600">Visualización y seguimiento de abonos realizados</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Abonos</p>
              <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
              <p className="text-xs text-gray-500">Registros de pagos</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Abonos Procesados</p>
              <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Dinero recibido</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <BanknotesIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Método Más Usado</p>
              <p className="text-lg font-bold text-purple-600">
                {payments.length > 0 ? getMethodText(getMostUsedMethod()) : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">Forma de pago preferida</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <DocumentTextIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Facturas Vinculadas</p>
              <p className="text-2xl font-bold text-orange-600">
                {payments.filter(p => p.invoiceId).length}
              </p>
              <p className="text-xs text-gray-500">Con factura asociada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cliente, transacción..."
                className="input-field pl-10"
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
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
              onChange={(e) => handleFilterChange('status', e.target.value as PaymentStatus | '')}
            >
              <option value="">Todos</option>
              <option value="PAID">Pagado</option>
              <option value="PENDING">Pendiente</option>
              <option value="OVERDUE">Vencido</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="REFUNDED">Reembolsado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select 
              className="input-field"
              value={filters.method || ''}
              onChange={(e) => handleFilterChange('method', e.target.value as PaymentMethod | '')}
            >
              <option value="">Todos</option>
              <option value="UNDEFINED">Sin definir</option>
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="TRANSFER">Transferencia</option>
              <option value="CHECK">Cheque</option>
              <option value="FINANCING">Financiamiento</option>
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

      {/* Payments Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tratamiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha del Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No hay pagos registrados</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getClientName(payment)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.client.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{getTreatmentNames(payment)}</div>
                      {payment.appointmentId && (
                        <div className="text-sm text-gray-500">#{payment.appointmentId.slice(0, 8)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${Number(payment.amount).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getMethodIcon(payment.method, payment)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getMethodText(payment.method, payment)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.paidDate ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(payment.paidDate)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Fecha de pago
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className={`text-sm ${payment.status === 'OVERDUE' || (payment.status === 'PENDING' && isOverdue(payment.dueDate)) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {payment.dueDate ? formatDate(payment.dueDate) : 'Sin fecha'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Vence
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        {payment.status !== 'PAID' && payment.status !== 'CANCELLED' && !isAutomaticPayment(payment) && (
                          <button 
                            onClick={() => handleMarkAsPaid(payment.id)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Marcar Pagado
                          </button>
                        )}
                        {payment.invoiceId && (
                          <button 
                            onClick={() => handleViewInvoice(payment)}
                            className="text-purple-600 hover:text-purple-900 flex items-center"
                          >
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            Ver Factura
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenDetailsModal(payment)}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Detalles
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Detalles del Pago"
        size="lg"
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedPayment.status)}`}>
                {getStatusText(selectedPayment.status)}
              </span>
              {selectedPayment.status !== 'PAID' && selectedPayment.status !== 'CANCELLED' && (
                <>
                  {!isAutomaticPayment(selectedPayment) ? (
                    <button
                      onClick={() => handleMarkAsPaid(selectedPayment.id)}
                      className="btn-primary text-sm flex items-center"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Marcar como Pagado
                    </button>
                  ) : (
                    <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                      ⚠️ Pago automático - Gestionar desde Facturas
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Client Info */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Información del Cliente</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nombre:</span>
                  <span className="text-sm font-medium text-gray-900">{getClientName(selectedPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedPayment.client.user.email}</span>
                </div>
                {selectedPayment.client.user.phone && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Teléfono:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedPayment.client.user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Información del Pago</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monto:</span>
                  <span className="text-lg font-bold text-primary-600">${Number(selectedPayment.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Método de Pago:</span>
                  <div className="flex items-center">
                    {getMethodIcon(selectedPayment.method, selectedPayment)}
                    <span className="ml-2 text-sm font-medium text-gray-900">{getMethodText(selectedPayment.method, selectedPayment)}</span>
                  </div>
                </div>
                {selectedPayment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ID de Transacción:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedPayment.transactionId}</span>
                  </div>
                )}
                {selectedPayment.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fecha de Vencimiento:</span>
                    <span className={`text-sm font-medium ${isOverdue(selectedPayment.dueDate) && selectedPayment.status !== 'PAID' ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(selectedPayment.dueDate)}
                    </span>
                  </div>
                )}
                {selectedPayment.paidDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fecha de Pago:</span>
                    <span className="text-sm font-medium text-green-600">{formatDate(selectedPayment.paidDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fecha de Registro:</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(selectedPayment.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Appointment Info */}
            {selectedPayment.appointment && (
              <div className="border-b pb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Cita Asociada</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fecha de la Cita:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(selectedPayment.appointment.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tratamientos:</span>
                    <span className="text-sm font-medium text-gray-900">{getTreatmentNames(selectedPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estado de la Cita:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedPayment.appointment.status}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {selectedPayment.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Descripción / Notas</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedPayment.description}</p>
              </div>
            )}

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

    </div>
  );
};

export default Payments;
