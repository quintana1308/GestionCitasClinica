import React, { useState } from 'react';
import toast from 'react-hot-toast';

const BookAppointment: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    treatmentId: '',
    date: '',
    time: '',
    notes: '',
  });

  const treatments = [
    { id: '1', name: 'Limpieza Facial Profunda', price: 150 },
    { id: '2', name: 'Tratamiento Antiarrugas', price: 450 },
    { id: '3', name: 'Peeling Químico', price: 300 },
    { id: '4', name: 'Hidratación Facial', price: 120 },
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simular reserva de cita
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Cita reservada exitosamente');
      setFormData({ treatmentId: '', date: '', time: '', notes: '' });
    } catch (error: any) {
      toast.error('Error al reservar la cita');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectedTreatment = treatments.find(t => t.id === formData.treatmentId);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reservar Cita</h1>
        <p className="mt-2 text-gray-600">
          Selecciona el tratamiento y horario de tu preferencia
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="treatmentId" className="block text-sm font-medium text-gray-700">
                Tratamiento
              </label>
              <select
                name="treatmentId"
                id="treatmentId"
                value={formData.treatmentId}
                onChange={handleChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Selecciona un tratamiento</option>
                {treatments.map(treatment => (
                  <option key={treatment.id} value={treatment.id}>
                    {treatment.name} - ${treatment.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Fecha
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Hora
                </label>
                <select
                  name="time"
                  id="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Selecciona una hora</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notas adicionales (opcional)
              </label>
              <textarea
                name="notes"
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Alguna información adicional sobre tu cita..."
              />
            </div>

            {selectedTreatment && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Resumen de la Cita
                </h3>
                <p className="text-sm text-gray-600">
                  <strong>Tratamiento:</strong> {selectedTreatment.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Precio:</strong> ${selectedTreatment.price}
                </p>
                {formData.date && (
                  <p className="text-sm text-gray-600">
                    <strong>Fecha:</strong> {new Date(formData.date).toLocaleDateString('es-ES')}
                  </p>
                )}
                {formData.time && (
                  <p className="text-sm text-gray-600">
                    <strong>Hora:</strong> {formData.time}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? 'Reservando...' : 'Reservar Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
