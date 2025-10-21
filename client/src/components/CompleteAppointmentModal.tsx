import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import medicalHistoryService from '../services/medicalHistoryService';
import Modal from './Modal';

interface CompleteAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    client: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
    date: string;
    startTime: string;
    endTime: string;
    treatments: Array<{
      treatment: {
        name: string;
        duration: number;
      };
    }>;
  };
  onSuccess: () => void;
}

interface CompleteAppointmentFormData {
  diagnosis: string;
  treatment: string;
  notes: string;
  attachments: string;
  requiresFollowUp: boolean;
  followUpDate: string;
  followUpNotes: string;
}

const CompleteAppointmentModal: React.FC<CompleteAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CompleteAppointmentFormData>({
    diagnosis: '',
    treatment: appointment?.treatments?.map(t => t.treatment.name).join(', ') || '',
    notes: '',
    attachments: '',
    requiresFollowUp: false,
    followUpDate: '',
    followUpNotes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    try {
      setLoading(true);
      
      await medicalHistoryService.completeAppointmentWithHistory(appointment.id, {
        diagnosis: formData.diagnosis || undefined,
        treatment: formData.treatment || undefined,
        notes: formData.notes || undefined,
        attachments: formData.attachments || undefined,
        requiresFollowUp: formData.requiresFollowUp,
        followUpDate: formData.followUpDate || undefined,
        followUpNotes: formData.followUpNotes || undefined
      });

      toast.success('Cita completada y historial médico creado exitosamente');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error al completar cita:', error);
      toast.error('Error al completar la cita');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      diagnosis: '',
      treatment: appointment?.treatments?.map(t => t.treatment.name).join(', ') || '',
      notes: '',
      attachments: '',
      requiresFollowUp: false,
      followUpDate: '',
      followUpNotes: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Completar Cita"
      size="lg"
    >
      <div className="space-y-6">
        {/* Información de la cita */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5" />
            Información de la Cita
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-blue-800">Cliente:</p>
              <p className="text-blue-700">
                {appointment.client.user.firstName} {appointment.client.user.lastName}
              </p>
            </div>
            
            <div>
              <p className="font-medium text-blue-800 flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Fecha:
              </p>
              <p className="text-blue-700">{formatDate(appointment.date)}</p>
            </div>
            
            <div>
              <p className="font-medium text-blue-800 flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                Horario:
              </p>
              <p className="text-blue-700">
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </p>
            </div>
            
            <div>
              <p className="font-medium text-blue-800">Tratamientos:</p>
              <div className="text-blue-700">
                {appointment.treatments.map((t, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span>• {t.treatment.name}</span>
                    <span className="text-xs">({t.treatment.duration} min)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de historial médico */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <DocumentTextIcon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Registro de Historial Médico
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tratamiento Realizado
              </label>
              <input
                type="text"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del tratamiento realizado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnóstico
              </label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Diagnóstico o evaluación"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones y Resultados
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observaciones del profesional, resultados obtenidos, reacciones del cliente, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivos Adjuntos
            </label>
            <input
              type="text"
              value={formData.attachments}
              onChange={(e) => setFormData({ ...formData, attachments: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="URLs de fotos o documentos (separadas por comas)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Puedes agregar URLs de fotos antes/después, consentimientos, etc.
            </p>
          </div>

          {/* Sección de seguimiento */}
          <div className="border-t pt-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="requiresFollowUp"
                checked={formData.requiresFollowUp}
                onChange={(e) => setFormData({ ...formData, requiresFollowUp: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requiresFollowUp" className="ml-2 text-sm font-medium text-gray-700">
                Requiere seguimiento o retoque
              </label>
            </div>

            {formData.requiresFollowUp && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Seguimiento
                  </label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas de Seguimiento
                  </label>
                  <input
                    type="text"
                    value={formData.followUpNotes}
                    onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Retoque en zona frontal"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Completando...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  Completar Cita
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CompleteAppointmentModal;
