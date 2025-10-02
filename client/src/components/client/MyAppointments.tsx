import React from 'react';

const MyAppointments: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Citas</h1>
        <p className="mt-2 text-gray-600">
          Revisa y gestiona tus citas programadas
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {/* Cita 1 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Limpieza Facial Profunda
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Dr. María González - Sala 2
                  </p>
                  <p className="text-sm text-gray-500">
                    15 de Septiembre, 2024 - 2:00 PM
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Confirmada
                  </span>
                  <button className="text-primary-600 hover:text-primary-900 text-sm font-medium">
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>

            {/* Cita 2 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Tratamiento Antiarrugas
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Dr. Carlos Ruiz - Sala 1
                  </p>
                  <p className="text-sm text-gray-500">
                    22 de Septiembre, 2024 - 10:00 AM
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pendiente
                  </span>
                  <button className="text-primary-600 hover:text-primary-900 text-sm font-medium">
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
