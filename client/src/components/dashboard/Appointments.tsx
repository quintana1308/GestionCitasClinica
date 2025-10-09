import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  appointmentService,
  Appointment,
  AppointmentFilters,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentStatus
} from '../../services/appointmentService';
import { clientService, Client } from '../../services/clientService';
import { employeeService, Employee } from '../../services/employeeService';
import { treatmentService, Treatment } from '../../services/treatmentService';
import Modal from '../Modal';

const Appointments: React.FC = () => {
  // Estados principales
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Estados de datos
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);

  // Estados de filtros
  const [filters, setFilters] = useState<AppointmentFilters>({
    page: 1,
    limit: 12,
    search: '',
    status: undefined,
    employeeId: undefined,
    clientId: undefined,
    startDate: undefined,
    endDate: undefined,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Estado de paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // Estados de formularios
  const [searchClientTerm, setSearchClientTerm] = useState('');
  const [searchEmployeeTerm, setSearchEmployeeTerm] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const [formData, setFormData] = useState<CreateAppointmentData>({
    clientId: '',
    employeeId: '',
    date: '',
    startTime: '',
    endTime: '',
    treatmentIds: [],
    notes: ''
  });

  const [editFormData, setEditFormData] = useState<UpdateAppointmentData>({
    employeeId: '',
    date: '',
    startTime: '',
    endTime: '',
    treatmentIds: [],
    notes: ''
  });

  // Funciones auxiliares
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Programada';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'NO_SHOW':
        return 'No Asistió';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClientName = (appointment: Appointment) => {
    return `${appointment.client.user.firstName} ${appointment.client.user.lastName}`;
  };

  const getEmployeeName = (appointment: Appointment) => {
    return appointment.employee ? `${appointment.employee.user.firstName} ${appointment.employee.user.lastName}` : 'Sin asignar';
  };

  const getTreatmentNames = (appointment: Appointment) => {
    return appointment.treatments.map(at => at.treatment.name).join(', ');
  };

  // Funciones de carga de datos
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointments(filters);
      setAppointments(response.appointments);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      toast.error('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clientService.getClients({ limit: 100 });
      setClients(response.clients);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees({ limit: 100 });
      setEmployees(response.employees);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchTreatments = async () => {
    try {
      const response = await treatmentService.getTreatments({ isActive: true });
      setTreatments(response.treatments);
    } catch (err: any) {
      console.error('Error fetching treatments:', err);
    }
  };

  // Funciones de filtros
  const handleFilterChange = (key: keyof AppointmentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  // Funciones de manejo de citas
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.date || !formData.startTime || !formData.endTime || !formData.treatmentIds.length) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);
      
      // Combinar fecha con horas para crear objetos Date completos
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);
      
      const appointmentData: CreateAppointmentData = {
        ...formData,
        employeeId: formData.employeeId || undefined,
        date: new Date(formData.date).toISOString(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      };

      await appointmentService.createAppointment(appointmentData);
      toast.success('Cita creada exitosamente');
      setShowCreateModal(false);
      fetchAppointments();
      resetFormData();
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      toast.error(err.response?.data?.message || 'Error al crear la cita');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      setSubmitting(true);
      
      // Preparar datos con fechas completas
      const updateData: UpdateAppointmentData = {
        ...editFormData,
        // Convertir cadena vacía a undefined para employeeId
        employeeId: editFormData.employeeId || undefined
      };

      // Si se proporcionan fecha y horas, combinarlas correctamente
      if (editFormData.date && editFormData.startTime) {
        const startDateTime = new Date(`${editFormData.date}T${editFormData.startTime}:00`);
        updateData.startTime = startDateTime.toISOString();
      }

      if (editFormData.date && editFormData.endTime) {
        const endDateTime = new Date(`${editFormData.date}T${editFormData.endTime}:00`);
        updateData.endTime = endDateTime.toISOString();
      }

      if (editFormData.date) {
        updateData.date = new Date(editFormData.date).toISOString();
      }

      await appointmentService.updateAppointment(selectedAppointment.id, updateData);
      toast.success('Cita actualizada exitosamente');
      setShowEditModal(false);
      fetchAppointments();
    } catch (err: any) {
      console.error('Error updating appointment:', err);
      toast.error(err.response?.data?.message || 'Error al actualizar la cita');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setSubmitting(true);
      await appointmentService.cancelAppointment(selectedAppointment.id, cancelReason);
      toast.success('Cita cancelada exitosamente');
      setShowCancelModal(false);
      fetchAppointments();
      setCancelReason('');
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      toast.error(err.response?.data?.message || 'Error al cancelar la cita');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      toast.success(`Estado de cita actualizado a ${getStatusText(newStatus)}`);
      fetchAppointments();
      // Cerrar el modal de detalles si está abierto
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
    } catch (err: any) {
      console.error('Error updating appointment status:', err);
      toast.error(err.response?.data?.message || 'Error al actualizar el estado');
    }
  };

  // Funciones de modales
  const handleOpenCreateModal = () => {
    resetFormData();
    fetchClients();
    fetchEmployees();
    fetchTreatments();
    setShowCreateModal(true);
  };

  const handleOpenDetailsModal = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleOpenEditModal = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    fetchEmployees();
    fetchTreatments();

    // Populate edit form - convert dates to proper format
    const appointmentDate = new Date(appointment.date);
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);

    setEditFormData({
      employeeId: appointment.employeeId || '',
      date: appointmentDate.toISOString().split('T')[0],
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
      treatmentIds: appointment.treatments.map(at => at.treatment.id),
      notes: appointment.notes || ''
    });

    setShowEditModal(true);
  };

  const handleOpenCancelModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  // Funciones de formulario
  const resetFormData = () => {
    setFormData({
      clientId: '',
      employeeId: '',
      date: '',
      startTime: '',
      endTime: '',
      treatmentIds: [],
      notes: ''
    });
    setSearchClientTerm('');
    setSearchEmployeeTerm('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'treatmentIds' ? [value] : value
    }));
  };

  const handleTreatmentChange = (treatmentId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      treatmentIds: checked
        ? [...prev.treatmentIds, treatmentId]
        : prev.treatmentIds.filter(id => id !== treatmentId)
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'treatmentIds' ? [value] : value
    }));
  };

  const handleEditTreatmentChange = (treatmentId: string, checked: boolean) => {
    setEditFormData(prev => ({
      ...prev,
      treatmentIds: checked
        ? [...(prev.treatmentIds || []), treatmentId]
        : (prev.treatmentIds || []).filter(id => id !== treatmentId)
    }));
  };

  // useEffect para cargar datos iniciales
  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // useEffect para filtros de búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchClientTerm) {
        fetchClients();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchClientTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchEmployeeTerm) {
        fetchEmployees();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchEmployeeTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
          <p className="text-gray-600">Administra todas las citas de la clínica</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nueva Cita
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                placeholder="Cliente, empleado..."
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
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            >
              <option value="">Todos</option>
              <option value="SCHEDULED">Programada</option>
              <option value="CONFIRMED">Confirmada</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="COMPLETED">Completada</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="NO_SHOW">No Asistió</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empleado
            </label>
            <select
              className="input-field"
              value={filters.employeeId || ''}
              onChange={(e) => handleFilterChange('employeeId', e.target.value || undefined)}
            >
              <option value="">Todos</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.user.firstName} {emp.user.lastName}
                </option>
              ))}
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
              onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
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
              onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({
                  page: 1,
                  limit: 12,
                  search: '',
                  status: undefined,
                  employeeId: undefined,
                  clientId: undefined,
                  startDate: undefined,
                  endDate: undefined,
                  sortBy: 'date',
                  sortOrder: 'desc'
                });
              }}
              className="btn-outline text-sm"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
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
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <span className="ml-2 text-gray-500">Cargando citas...</span>
                    </div>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No hay citas registradas</p>
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getClientName(appointment)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.client.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{getTreatmentNames(appointment)}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {appointment.treatments.reduce((total, at) => total + at.treatment.duration, 0)} min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(appointment.date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getEmployeeName(appointment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Number(appointment.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenDetailsModal(appointment)}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(appointment)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                              title="Editar cita"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenCancelModal(appointment)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                              title="Cancelar cita"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && appointments.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => handleFilterChange('page', Math.min(pagination.pages, pagination.page + 1))}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span> de{' '}
                  <span className="font-medium">{pagination.total}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleFilterChange('page', pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                          pagination.page === pageNum
                            ? 'bg-primary-50 text-primary-600 border-primary-500'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleFilterChange('page', Math.min(pagination.pages, pagination.page + 1))}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Appointment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nueva Cita"
        size="lg"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
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
              {clients.length > 0 && searchClientTerm && !formData.clientId && (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empleado
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Sin asignar</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user.firstName} {emp.user.lastName} - {emp.position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Fin <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tratamientos <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
              {treatments.map((treatment) => (
                <label key={treatment.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={formData.treatmentIds.includes(treatment.id)}
                    onChange={(e) => handleTreatmentChange(treatment.id, e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">{treatment.name}</div>
                    <div className="text-xs text-gray-500">
                      {treatment.duration} min - ${treatment.price}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {formData.treatmentIds.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Monto total: ${treatments
                  .filter(t => formData.treatmentIds.includes(t.id))
                  .reduce((sum, t) => sum + Number(t.price), 0)
                  .toFixed(2)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="input-field"
              rows={3}
              placeholder="Observaciones adicionales..."
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
              {submitting ? 'Creando...' : 'Crear Cita'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Detalles de la Cita"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Status and Actions */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                {getStatusText(selectedAppointment.status)}
              </span>
              {selectedAppointment.status === 'SCHEDULED' && (
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'CONFIRMED')}
                  className="btn-primary text-sm flex items-center"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Confirmar Cita
                </button>
              )}
            </div>

            {/* Client Info */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Información del Cliente</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nombre:</span>
                  <span className="text-sm font-medium text-gray-900">{getClientName(selectedAppointment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedAppointment.client.user.email}</span>
                </div>
                {selectedAppointment.client.user.phone && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Teléfono:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedAppointment.client.user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Info */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Información de la Cita</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fecha:</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(selectedAppointment.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Horario:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Empleado:</span>
                  <span className="text-sm font-medium text-gray-900">{getEmployeeName(selectedAppointment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monto Total:</span>
                  <span className="text-lg font-bold text-primary-600">${Number(selectedAppointment.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Treatments */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Tratamientos</h3>
              <div className="space-y-2">
                {selectedAppointment.treatments.map((at) => (
                  <div key={at.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{at.treatment.name}</div>
                      <div className="text-xs text-gray-500">{at.treatment.duration} minutos</div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">${Number(at.price).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selectedAppointment.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notas</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedAppointment.notes}</p>
              </div>
            )}

            {/* Payments */}
            {selectedAppointment.payments && selectedAppointment.payments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Pagos Asociados</h3>
                <div className="space-y-2">
                  {selectedAppointment.payments.map((payment: any) => (
                    <div key={payment.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <div>
                        <div className="text-sm font-medium text-green-900">Pago #{payment.id.slice(0, 8)}</div>
                        <div className="text-xs text-green-700">{payment.method} - {payment.status}</div>
                      </div>
                      <div className="text-sm font-bold text-green-900">${Number(payment.amount).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
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

      {/* Edit Appointment Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Cita"
        size="lg"
      >
        <form onSubmit={handleEditAppointment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                name="date"
                value={editFormData.date}
                onChange={handleEditInputChange}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empleado
              </label>
              <select
                name="employeeId"
                value={editFormData.employeeId}
                onChange={handleEditInputChange}
                className="input-field"
              >
                <option value="">Sin asignar</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user.firstName} {emp.user.lastName} - {emp.position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Inicio
              </label>
              <input
                type="time"
                name="startTime"
                value={editFormData.startTime}
                onChange={handleEditInputChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora de Fin
              </label>
              <input
                type="time"
                name="endTime"
                value={editFormData.endTime}
                onChange={handleEditInputChange}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tratamientos
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
              {treatments.map((treatment) => (
                <label key={treatment.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={(editFormData.treatmentIds || []).includes(treatment.id)}
                    onChange={(e) => handleEditTreatmentChange(treatment.id, e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">{treatment.name}</div>
                    <div className="text-xs text-gray-500">
                      {treatment.duration} min - ${treatment.price}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              name="notes"
              value={editFormData.notes}
              onChange={handleEditInputChange}
              className="input-field"
              rows={3}
              placeholder="Observaciones adicionales..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
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
              {submitting ? 'Actualizando...' : 'Actualizar Cita'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Appointment Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar Cita"
        size="md"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-sm font-medium text-red-800">¿Estás seguro de cancelar esta cita?</h3>
              </div>
              <div className="mt-2 text-sm text-red-700">
                <p>Esta acción no se puede deshacer. La cita será marcada como cancelada.</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cliente:</span>
                <span className="text-sm font-medium text-gray-900">{getClientName(selectedAppointment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fecha:</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(selectedAppointment.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Horario:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tratamientos:</span>
                <span className="text-sm font-medium text-gray-900">{getTreatmentNames(selectedAppointment)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón de cancelación (opcional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Explica la razón de la cancelación..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="btn-outline"
                disabled={submitting}
              >
                Mantener Cita
              </button>
              <button
                onClick={handleCancelAppointment}
                className="btn-danger flex items-center"
                disabled={submitting}
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                {submitting ? 'Cancelando...' : 'Cancelar Cita'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Appointments;
