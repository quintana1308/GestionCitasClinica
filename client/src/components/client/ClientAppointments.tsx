import React from 'react';
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ClientAppointments: React.FC = () => {
  // Datos de ejemplo de citas del cliente
  const appointments = [
    {
      id: 'APT001',
      treatment: 'Limpieza Facial Profunda',
      date: '2024-01-20T10:30:00',
      duration: 60,
      status: 'confirmed',
      cost: 75.00,
      professional: 'Dra. Ana Martínez',
      notes: 'Recordar traer productos de cuidado personal',
      canReschedule: true,
      canCancel: true
    },
    {
      id: 'APT002',
      treatment: 'Tratamiento Anti-edad',
      date: '2024-01-25T14:00:00',
      duration: 90,
      status: 'pending',
      cost: 150.00,
      professional: 'Dra. Carmen López',
      notes: 'Pendiente de confirmación',
      canReschedule: true,
      canCancel: true
    },
    {
      id: 'APT003',
      treatment: 'Masaje Corporal Relajante',
      date: '2024-01-15T11:30:00',
      duration: 60,
      status: 'completed',
      cost: 80.00,
      professional: 'Lic. María González',
      notes: 'Tratamiento completado satisfactoriamente',
      canReschedule: false,
      canCancel: false
    },
    {
      id: 'APT004',
      treatment: 'Depilación Láser',
      date: '2024-01-10T16:00:00',
      duration: 45,
      status: 'completed',
      cost: 120.00,
      professional: 'Dra. Ana Martínez',
      notes: 'Sesión 2 de 6 completada',
      canReschedule: false,
      canCancel: false
    },
    {
      id: 'APT005',
      treatment: 'Consulta de Evaluación',
      date: '2024-01-05T09:00:00',
      duration: 30,
      status: 'cancelled',
      cost: 0.00,
      professional: 'Dra. Carmen López',
      notes: 'Cancelada por el cliente',
      canReschedule: false,
      canCancel: false
    }
  ];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const upcomingAppointments = appointments.filter(apt => isUpcoming(apt.date) && apt.status !== 'cancelled');
  const pastAppointments = appointments.filter(apt => !isUpcoming(apt.date) || apt.status === 'cancelled');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Citas</h1>
          <p className="text-gray-600">Gestiona tus citas programadas y historial</p>
        </div>
        <button className="btn-primary flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Agendar Nueva Cita
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{upcomingAppointments.length}</div>
          <div className="text-sm text-gray-600">Próximas Citas</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {appointments.filter(apt => apt.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completadas</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {appointments.filter(apt => apt.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">
            ${appointments.filter(apt => apt.status === 'completed').reduce((sum, apt) => sum + apt.cost, 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Invertido</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select className="input-field">
              <option value="">Todas las citas</option>
              <option value="confirmed">Confirmadas</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
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

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Próximas Citas</h2>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-full bg-primary-100">
                      {getStatusIcon(appointment.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.treatment}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {formatDate(appointment.date)} a las {formatTime(appointment.date)}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          Duración: {appointment.duration} minutos
                        </div>
                        <div className="flex items-center">
                          <span className="w-4 h-4 mr-2 flex items-center justify-center">👩‍⚕️</span>
                          Profesional: {appointment.professional}
                        </div>
                        {appointment.cost > 0 && (
                          <div className="flex items-center">
                            <span className="w-4 h-4 mr-2 flex items-center justify-center">💰</span>
                            Costo: ${appointment.cost.toFixed(2)}
                          </div>
                        )}
                      </div>
                      {appointment.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                          <strong>Notas:</strong> {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    {appointment.status === 'pending' && (
                      <button className="btn-primary text-sm px-3 py-1">
                        Confirmar
                      </button>
                    )}
                    {appointment.canReschedule && (
                      <button className="btn-outline text-sm px-3 py-1">
                        Reprogramar
                      </button>
                    )}
                    {appointment.canCancel && (
                      <button className="text-red-600 hover:text-red-800 text-sm px-3 py-1">
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de Citas</h2>
        <div className="space-y-4">
          {pastAppointments.map((appointment) => (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-full bg-gray-100">
                    {getStatusIcon(appointment.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {appointment.treatment}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {formatDate(appointment.date)} a las {formatTime(appointment.date)}
                      </div>
                      <div className="flex items-center">
                        <span className="w-4 h-4 mr-2 flex items-center justify-center">👩‍⚕️</span>
                        Profesional: {appointment.professional}
                      </div>
                      {appointment.cost > 0 && (
                        <div className="flex items-center">
                          <span className="w-4 h-4 mr-2 flex items-center justify-center">💰</span>
                          Costo: ${appointment.cost.toFixed(2)}
                        </div>
                      )}
                    </div>
                    {appointment.notes && (
                      <div className="mt-2 p-2 bg-white rounded text-sm text-gray-700">
                        <strong>Notas:</strong> {appointment.notes}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  {appointment.status === 'completed' && (
                    <button className="btn-outline text-sm px-3 py-1">
                      Repetir Cita
                    </button>
                  )}
                  <button className="text-primary-600 hover:text-primary-800 text-sm px-3 py-1">
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="btn-primary flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Agendar Nueva Cita
          </button>
          <button className="btn-outline flex items-center justify-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Ver Disponibilidad
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientAppointments;
