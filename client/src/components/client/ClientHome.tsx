import React from 'react';
import { CalendarIcon, ClockIcon, CreditCardIcon, UserIcon } from '@heroicons/react/24/outline';

const ClientHome: React.FC = () => {
  // Datos de ejemplo del cliente
  const clientData = {
    name: 'María González',
    code: 'CLI001',
    nextAppointment: {
      id: 'APT001',
      treatment: 'Limpieza Facial Profunda',
      date: '2024-01-20T10:30:00',
      status: 'confirmed',
      cost: 75.00
    },
    recentAppointments: [
      {
        id: 'APT002',
        treatment: 'Tratamiento Anti-edad',
        date: '2024-01-10T14:00:00',
        status: 'completed',
        cost: 150.00
      },
      {
        id: 'APT003',
        treatment: 'Masaje Corporal',
        date: '2024-01-05T11:30:00',
        status: 'completed',
        cost: 80.00
      }
    ],
    pendingPayments: [
      {
        id: 'PAY001',
        appointmentId: 'APT001',
        treatment: 'Limpieza Facial Profunda',
        amount: 75.00,
        dueDate: '2024-01-20T10:30:00'
      }
    ],
    stats: {
      totalAppointments: 12,
      completedTreatments: 10,
      totalSpent: 980.00,
      memberSince: '2023-06-15'
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">¡Bienvenida, {clientData.name}!</h1>
            <p className="text-primary-100">Código de cliente: {clientData.code}</p>
            <p className="text-primary-100">
              Cliente desde: {new Date(clientData.stats.memberSince).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{clientData.stats.totalAppointments}</div>
            <div className="text-primary-100">Citas totales</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="p-3 rounded-full bg-blue-100 mx-auto w-fit mb-3">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{clientData.stats.totalAppointments}</div>
          <div className="text-sm text-gray-600">Citas Totales</div>
        </div>
        <div className="card text-center">
          <div className="p-3 rounded-full bg-green-100 mx-auto w-fit mb-3">
            <ClockIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{clientData.stats.completedTreatments}</div>
          <div className="text-sm text-gray-600">Tratamientos Completados</div>
        </div>
        <div className="card text-center">
          <div className="p-3 rounded-full bg-purple-100 mx-auto w-fit mb-3">
            <CreditCardIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">${clientData.stats.totalSpent.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Invertido</div>
        </div>
        <div className="card text-center">
          <div className="p-3 rounded-full bg-orange-100 mx-auto w-fit mb-3">
            <UserIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">VIP</div>
          <div className="text-sm text-gray-600">Estado Cliente</div>
        </div>
      </div>

      {/* Next Appointment */}
      {clientData.nextAppointment && (
        <div className="card border-l-4 border-primary-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Próxima Cita</h2>
            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(clientData.nextAppointment.status)}`}>
              {getStatusText(clientData.nextAppointment.status)}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {clientData.nextAppointment.treatment}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {formatDate(clientData.nextAppointment.date)}
                </div>
                <div className="flex items-center">
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Costo: ${clientData.nextAppointment.cost.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button className="btn-primary">
                Confirmar Cita
              </button>
              <button className="btn-outline">
                Reprogramar
              </button>
              <button className="text-red-600 hover:text-red-800 text-sm">
                Cancelar Cita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Payments */}
      {clientData.pendingPayments.length > 0 && (
        <div className="card border-l-4 border-yellow-500">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pagos Pendientes</h2>
          <div className="space-y-3">
            {clientData.pendingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{payment.treatment}</h3>
                  <p className="text-sm text-gray-600">
                    Vence: {formatDate(payment.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ${payment.amount.toFixed(2)}
                  </div>
                  <button className="btn-primary text-sm mt-1">
                    Pagar Ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Citas Recientes</h2>
          <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
            Ver Todas
          </button>
        </div>
        <div className="space-y-3">
          {clientData.recentAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-gray-100">
                  <ClockIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{appointment.treatment}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(appointment.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                  {getStatusText(appointment.status)}
                </span>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  ${appointment.cost.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Agendar Nueva Cita
          </button>
          <button className="btn-outline flex items-center justify-center">
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Ver Historial de Pagos
          </button>
          <button className="btn-outline flex items-center justify-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Actualizar Perfil
          </button>
        </div>
      </div>

      {/* Treatment History Summary */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen de Tratamientos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Tratamientos Favoritos</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Limpieza Facial</span>
                <span className="text-sm font-medium">4 veces</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tratamiento Anti-edad</span>
                <span className="text-sm font-medium">3 veces</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Masaje Corporal</span>
                <span className="text-sm font-medium">3 veces</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Próximos Recordatorios</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Revisión mensual en 2 semanas
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Tratamiento de mantenimiento en 1 mes
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Evaluación anual en 3 meses
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHome;
