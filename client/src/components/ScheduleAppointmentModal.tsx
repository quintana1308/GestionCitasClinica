import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import { appointmentService, CreateAppointmentData } from '../services/appointmentService';
import { clientService, Client } from '../services/clientService';
import { Treatment } from '../services/treatmentService';

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  treatment: Treatment | null;
  onSuccess?: () => void;
}

const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  treatment,
  onSuccess
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    clientId: '',
    date: '',
    startTime: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        clientId: '',
        date: '',
        startTime: '',
        notes: ''
      });
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchClients(searchTerm);
      }, searchTerm ? 500 : 0); // Debounce solo si hay búsqueda
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm, isOpen]);

  const fetchClients = async (search?: string) => {
    try {
      setLoadingClients(true);
      const response = await clientService.getClients({
        search: search || '',
        isActive: true,
        limit: 50
      });
      
      if (response && response.clients) {
        setClients(response.clients);
      } else {
        setClients([]);
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setClients([]);
      
      // Solo mostrar error si no es un problema de búsqueda vacía
      if (err.response?.status !== 404) {
        toast.error(err.response?.data?.message || 'Error al cargar los clientes');
      }
    } finally {
      setLoadingClients(false);
    }
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!treatment) return;

    if (!formData.clientId || !formData.date || !formData.startTime) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const endTime = calculateEndTime(formData.startTime, treatment.duration);

    const appointmentData: CreateAppointmentData = {
      clientId: formData.clientId,
      date: formData.date,
      startTime: `${formData.date}T${formData.startTime}:00`,
      endTime: `${formData.date}T${endTime}:00`,
      treatmentIds: [treatment.id],
      notes: formData.notes
    };

    try {
      setSubmitting(true);
      await appointmentService.createAppointment(appointmentData);
      toast.success('Cita agendada exitosamente');
      onClose();
      if (onSuccess) onSuccess();
      
      // Reset form
      setFormData({
        clientId: '',
        date: '',
        startTime: '',
        notes: ''
      });
      setSearchTerm('');
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      toast.error(err.response?.data?.message || 'Error al agendar la cita');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!treatment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Agendar Cita - ${treatment.name}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Treatment Info */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <h4 className="font-semibold text-primary-900 mb-2">Información del Tratamiento</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Duración:</span>
              <span className="ml-2 font-medium">{treatment.duration} minutos</span>
            </div>
            <div>
              <span className="text-gray-600">Precio:</span>
              <span className="ml-2 font-medium">${Number(treatment.price).toFixed(2)}</span>
            </div>
          </div>
          {treatment.description && (
            <p className="text-sm text-gray-600 mt-2">{treatment.description}</p>
          )}
        </div>

        {/* Client Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Buscar cliente por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field mb-2"
          />
          <select
            name="clientId"
            value={formData.clientId}
            onChange={handleInputChange}
            className="input-field"
            required
            disabled={loadingClients}
          >
            <option value="">
              {loadingClients ? 'Cargando...' : clients.length === 0 ? 'No hay clientes disponibles' : 'Seleccionar cliente...'}
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.user.firstName} {client.user.lastName} - {client.user.email}
              </option>
            ))}
          </select>
          {loadingClients && (
            <p className="text-sm text-gray-500 mt-1">
              <span className="inline-block animate-pulse">●</span> Cargando clientes...
            </p>
          )}
          {!loadingClients && clients.length === 0 && searchTerm && (
            <p className="text-sm text-amber-600 mt-1">
              No se encontraron clientes con "{searchTerm}"
            </p>
          )}
          {!loadingClients && clients.length === 0 && !searchTerm && (
            <p className="text-sm text-gray-500 mt-1">
              No hay clientes activos en el sistema
            </p>
          )}
        </div>

        {/* Date and Time */}
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
        </div>

        {/* Calculated End Time */}
        {formData.startTime && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Hora de finalización estimada:</span>{' '}
              {calculateEndTime(formData.startTime, treatment.duration)}
            </p>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas Adicionales
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="input-field"
            rows={3}
            placeholder="Información adicional sobre la cita..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
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
            {submitting ? 'Agendando...' : 'Agendar Cita'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleAppointmentModal;
