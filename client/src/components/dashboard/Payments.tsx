import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  CreditCardIcon, 
  BanknotesIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { paymentService, Payment, PaymentFilters, CreatePaymentData, PaymentMethod, PaymentStatus, PaymentStats } from '../../services/paymentService';
import { clientService, Client } from '../../services/clientService';
import { appointmentService } from '../../services/appointmentService';
import Modal from '../Modal';

const Payments: React.FC = () => {
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchClientTerm, setSearchClientTerm] = useState('');
  
  const [formData, setFormData] = useState<CreatePaymentData>({
    clientId: '',
    appointmentId: '',
    amount: 0,
    method: 'CASH',
    description: '',
    transactionId: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filters]);

  useEffect(() => {
    if (showCreateModal) {
      fetchClients();
    }
  }, [showCreateModal]);

  useEffect(() => {
    if (formData.clientId) {
      fetchClientAppointments(formData.clientId);
    }
  }, [formData.clientId]);

  useEffect(() => {
    if (searchClientTerm) {
      const timer = setTimeout(() => {
        fetchClients(searchClientTerm);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchClientTerm]);

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

  const fetchClients = async (search?: string) => {
    try {
      const response = await clientService.getClients({
        search: search || '',
        isActive: true,
        limit: 50
      });
      setClients(response.clients);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchClientAppointments = async (clientId: string) => {
    try {
      const response = await appointmentService.getAppointments({
        clientId,
        limit: 100
      });
      setAppointments(response.appointments || []);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setAppointments([]);
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

  const handleOpenCreateModal = () => {
    setFormData({
      clientId: '',
      appointmentId: '',
      amount: 0,
      method: 'CASH',
      description: '',
      transactionId: '',
      dueDate: ''
    });
    setSearchClientTerm('');
    setAppointments([]);
    setShowCreateModal(true);
  };

  const handleOpenDetailsModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || formData.amount <= 0) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);
      await paymentService.createPayment(formData);
      toast.success('Pago registrado exitosamente');
      setShowCreateModal(false);
      fetchPayments();
      fetchStats();
    } catch (err: any) {
      console.error('Error creating payment:', err);
      toast.error(err.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setSubmitting(false);
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
      } catch (err: any) {
        console.error('Error marking payment as paid:', err);
        toast.error(err.response?.data?.message || 'Error al actualizar el pago');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'amount' ? Number(value) : value 
    }));
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

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
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

  const getMethodText = (method: PaymentMethod) => {
    switch (method) {
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

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const totalPaid = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOverdue = payments.filter(p => p.status === 'OVERDUE').reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
          <p className="text-gray-600">Control de pagos y facturación de clientes</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Registrar Pago
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pagos Completados</p>
              <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <BanknotesIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">${totalPending.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pagos Vencidos</p>
              <p className="text-2xl font-bold text-red-600">${totalOverdue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100">
              <CreditCardIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Facturado</p>
              <p className="text-2xl font-bold text-primary-600">${(totalPaid + totalPending + totalOverdue).toFixed(2)}</p>
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
                  Fecha Vencimiento
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
                        {getMethodIcon(payment.method)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getMethodText(payment.method)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${payment.status === 'OVERDUE' || (payment.status === 'PENDING' && isOverdue(payment.dueDate)) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {formatDate(payment.dueDate)}
                      </div>
                      {payment.paidDate && (
                        <div className="text-xs text-gray-500">
                          Pagado: {formatDate(payment.paidDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        {payment.status !== 'PAID' && payment.status !== 'CANCELLED' && (
                          <button 
                            onClick={() => handleMarkAsPaid(payment.id)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Marcar Pagado
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

      {/* Create Payment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Registrar Nuevo Pago"
        size="lg"
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar cliente..."
                className="input-field"
                value={searchClientTerm}
                onChange={(e) => setSearchClientTerm(e.target.value)}
                onFocus={() => fetchClients()}
              />
              {clients.length > 0 && searchClientTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, clientId: client.id }));
                        setSearchClientTerm(`${client.user.firstName} ${client.user.lastName}`);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{client.user.firstName} {client.user.lastName}</div>
                        <div className="text-sm text-gray-500">{client.user.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {formData.clientId && appointments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cita Asociada (Opcional)
              </label>
              <select
                name="appointmentId"
                value={formData.appointmentId}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Sin cita asociada</option>
                {appointments.map((apt: any) => (
                  <option key={apt.id} value={apt.id}>
                    {new Date(apt.date).toLocaleDateString('es-ES')} - {apt.treatments?.map((t: any) => t.treatment.name).join(', ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="input-field"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago <span className="text-red-500">*</span>
              </label>
              <select
                name="method"
                value={formData.method}
                onChange={handleInputChange}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID de Transacción
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Ej: TRX123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción / Notas
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input-field"
              rows={3}
              placeholder="Detalles adicionales del pago..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
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
              {submitting ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </Modal>

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
                <button
                  onClick={() => handleMarkAsPaid(selectedPayment.id)}
                  className="btn-primary text-sm flex items-center"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Marcar como Pagado
                </button>
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
                    {getMethodIcon(selectedPayment.method)}
                    <span className="ml-2 text-sm font-medium text-gray-900">{getMethodText(selectedPayment.method)}</span>
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
