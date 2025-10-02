import React from 'react';
import { CreditCardIcon, ExclamationTriangleIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const ClientPayments: React.FC = () => {
  // Datos de ejemplo de pagos del cliente
  const payments = [
    {
      id: 'PAY001',
      appointmentId: 'APT001',
      treatment: 'Limpieza Facial Profunda',
      amount: 75.00,
      method: 'card',
      status: 'pending',
      dueDate: '2024-01-20T10:30:00',
      paymentDate: null,
      description: 'Pago pendiente para cita del 20 de enero'
    },
    {
      id: 'PAY002',
      appointmentId: 'APT002',
      treatment: 'Tratamiento Anti-edad',
      amount: 150.00,
      method: 'cash',
      status: 'completed',
      dueDate: '2024-01-15T14:00:00',
      paymentDate: '2024-01-15T14:00:00',
      description: 'Pago realizado en efectivo al finalizar el tratamiento'
    },
    {
      id: 'PAY003',
      appointmentId: 'APT003',
      treatment: 'Masaje Corporal Relajante',
      amount: 80.00,
      method: 'card',
      status: 'completed',
      dueDate: '2024-01-10T11:30:00',
      paymentDate: '2024-01-10T11:30:00',
      description: 'Pago con tarjeta de crédito'
    },
    {
      id: 'PAY004',
      appointmentId: 'APT004',
      treatment: 'Depilación Láser - Sesión 2',
      amount: 120.00,
      method: 'transfer',
      status: 'completed',
      dueDate: '2024-01-05T16:00:00',
      paymentDate: '2024-01-05T15:45:00',
      description: 'Transferencia bancaria realizada antes de la cita'
    },
    {
      id: 'PAY005',
      appointmentId: 'APT005',
      treatment: 'Peeling Químico',
      amount: 95.00,
      method: 'card',
      status: 'overdue',
      dueDate: '2024-01-08T09:00:00',
      paymentDate: null,
      description: 'Pago vencido - contactar para regularizar'
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencido';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const completedPayments = payments.filter(p => p.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Pagos</h1>
          <p className="text-gray-600">Gestiona tus pagos y historial financiero</p>
        </div>
        <button className="btn-primary flex items-center">
          <CreditCardIcon className="h-5 w-5 mr-2" />
          Realizar Pago
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
              <p className="text-sm font-medium text-gray-600">Total Pagado</p>
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
              <p className="text-sm font-medium text-gray-600">Pendiente</p>
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
              <p className="text-sm font-medium text-gray-600">Vencido</p>
              <p className="text-2xl font-bold text-red-600">${totalOverdue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100">
              <BanknotesIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-primary-600">${(totalPaid + totalPending + totalOverdue).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {(totalPending > 0 || totalOverdue > 0) && (
        <div className="card border-l-4 border-yellow-500 bg-yellow-50">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-yellow-900">Pagos Pendientes</h3>
              <p className="text-yellow-800">
                Tienes ${(totalPending + totalOverdue).toFixed(2)} en pagos pendientes.
                {totalOverdue > 0 && ` ${totalOverdue.toFixed(2)} están vencidos.`}
              </p>
              <button className="btn-primary mt-2">
                Pagar Ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select className="input-field">
              <option value="">Todos</option>
              <option value="completed">Pagados</option>
              <option value="pending">Pendientes</option>
              <option value="overdue">Vencidos</option>
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
            <input type="date" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input type="date" className="input-field" />
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pagos Pendientes</h2>
          <div className="space-y-4">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className={`border rounded-lg p-4 ${payment.status === 'overdue' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${payment.status === 'overdue' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                      {getMethodIcon(payment.method)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {payment.treatment}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="w-4 h-4 mr-2 flex items-center justify-center">💰</span>
                          Monto: ${payment.amount.toFixed(2)}
                        </div>
                        <div className="flex items-center">
                          <span className="w-4 h-4 mr-2 flex items-center justify-center">📅</span>
                          Vencimiento: {formatDate(payment.dueDate)}
                          {isOverdue(payment.dueDate, payment.status) && (
                            <span className="ml-2 text-red-600 font-medium">(Vencido)</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="w-4 h-4 mr-2 flex items-center justify-center">💳</span>
                          Método preferido: {getMethodText(payment.method)}
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-white rounded text-sm text-gray-700">
                        {payment.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <button className="btn-primary text-sm px-4 py-2">
                      Pagar Ahora
                    </button>
                    <button className="btn-outline text-sm px-4 py-2">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de Pagos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Fecha de Pago
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
                        {payment.treatment}
                      </div>
                      <div className="text-sm text-gray-500">
                        #{payment.appointmentId}
                      </div>
                    </div>
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
                    <div className="text-sm text-gray-900">
                      {payment.paymentDate ? formatDate(payment.paymentDate) : '-'}
                    </div>
                    {payment.status !== 'completed' && (
                      <div className={`text-xs ${isOverdue(payment.dueDate, payment.status) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        Vence: {formatDate(payment.dueDate)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      {payment.status !== 'completed' && (
                        <button className="text-green-600 hover:text-green-900">
                          Pagar
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

      {/* Payment Methods */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Métodos de Pago Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
            <CreditCardIcon className="h-12 w-12 text-primary-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Tarjeta de Crédito/Débito</h3>
            <p className="text-sm text-gray-600">Pago seguro con tarjeta</p>
            <button className="btn-primary w-full mt-3">
              Pagar con Tarjeta
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
            <BanknotesIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Transferencia Bancaria</h3>
            <p className="text-sm text-gray-600">Transferencia directa</p>
            <button className="btn-outline w-full mt-3">
              Ver Datos Bancarios
            </button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
            <BanknotesIcon className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Efectivo</h3>
            <p className="text-sm text-gray-600">Pago en la clínica</p>
            <button className="btn-outline w-full mt-3">
              Programar Pago
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPayments;
