import React from 'react';
import { PlusIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const Payments: React.FC = () => {
  // Datos de ejemplo
  const payments = [
    {
      id: 1,
      clientName: 'María González',
      clientCode: 'CLI001',
      appointmentId: 'APT001',
      treatmentName: 'Limpieza Facial Profunda',
      amount: 75.00,
      method: 'card',
      status: 'completed',
      date: '2024-01-15T10:30:00',
      dueDate: '2024-01-15T10:30:00',
      notes: 'Pago realizado al finalizar el tratamiento'
    },
    {
      id: 2,
      clientName: 'Ana Rodríguez',
      clientCode: 'CLI002',
      appointmentId: 'APT002',
      treatmentName: 'Tratamiento Anti-edad',
      amount: 150.00,
      method: 'cash',
      status: 'completed',
      date: '2024-01-14T14:00:00',
      dueDate: '2024-01-14T14:00:00',
      notes: 'Cliente pagó en efectivo'
    },
    {
      id: 3,
      clientName: 'Carmen Silva',
      clientCode: 'CLI003',
      appointmentId: 'APT003',
      treatmentName: 'Depilación Láser',
      amount: 120.00,
      method: 'transfer',
      status: 'pending',
      date: null,
      dueDate: '2024-01-20T16:00:00',
      notes: 'Pendiente de pago antes de la cita'
    },
    {
      id: 4,
      clientName: 'Laura Martín',
      clientCode: 'CLI004',
      appointmentId: 'APT004',
      treatmentName: 'Masaje Corporal Relajante',
      amount: 80.00,
      method: 'card',
      status: 'overdue',
      date: null,
      dueDate: '2024-01-10T11:00:00',
      notes: 'Pago vencido - contactar cliente'
    },
    {
      id: 5,
      clientName: 'Isabel López',
      clientCode: 'CLI005',
      appointmentId: 'APT005',
      treatmentName: 'Peeling Químico',
      amount: 95.00,
      method: 'card',
      status: 'partial',
      date: '2024-01-12T09:15:00',
      dueDate: '2024-01-12T09:15:00',
      notes: 'Pago parcial de $50 - resta $45'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencido';
      case 'partial':
        return 'Parcial';
      default:
        return status;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'cash':
        return <BanknotesIcon className="h-5 w-5" />;
      case 'transfer':
        return <BanknotesIcon className="h-5 w-5" />;
      default:
        return <CreditCardIcon className="h-5 w-5" />;
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'card':
        return 'Tarjeta';
      case 'cash':
        return 'Efectivo';
      case 'transfer':
        return 'Transferencia';
      default:
        return method;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalCompleted = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
          <p className="text-gray-600">Control de pagos y facturación de clientes</p>
        </div>
        <button className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Registrar Pago
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CreditCardIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pagos Completados</p>
              <p className="text-2xl font-bold text-green-600">${totalCompleted.toFixed(2)}</p>
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
              <BanknotesIcon className="h-6 w-6 text-red-600" />
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
              <p className="text-2xl font-bold text-primary-600">${(totalCompleted + totalPending + totalOverdue).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Cliente
            </label>
            <input
              type="text"
              placeholder="Nombre o código..."
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select className="input-field">
              <option value="">Todos</option>
              <option value="completed">Completado</option>
              <option value="pending">Pendiente</option>
              <option value="overdue">Vencido</option>
              <option value="partial">Parcial</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select className="input-field">
              <option value="">Todos</option>
              <option value="card">Tarjeta</option>
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              className="input-field"
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
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.clientName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.clientCode}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.treatmentName}</div>
                    <div className="text-sm text-gray-500">#{payment.appointmentId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${payment.amount.toFixed(2)}
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
                    <div className={`text-sm ${payment.status === 'overdue' || (payment.status === 'pending' && isOverdue(payment.dueDate)) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {formatDate(payment.dueDate)}
                    </div>
                    {payment.date && (
                      <div className="text-xs text-gray-500">
                        Pagado: {formatDate(payment.date)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      {payment.status !== 'completed' && (
                        <button className="text-green-600 hover:text-green-900">
                          Registrar Pago
                        </button>
                      )}
                      <button className="text-primary-600 hover:text-primary-900">
                        Ver Detalles
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Notes */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas de Pagos Recientes</h3>
        <div className="space-y-3">
          {payments.filter(p => p.notes).map((payment) => (
            <div key={payment.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(payment.status).includes('green') ? 'bg-green-500' : getStatusColor(payment.status).includes('yellow') ? 'bg-yellow-500' : getStatusColor(payment.status).includes('red') ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    {payment.clientName} - {payment.treatmentName}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {payment.date ? formatDate(payment.date) : 'Pendiente'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Payments;
