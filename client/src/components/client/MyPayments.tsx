import React from 'react';

const MyPayments: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Pagos</h1>
        <p className="mt-2 text-gray-600">
          Historial de pagos y facturas
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {/* Pago 1 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Limpieza Facial Profunda
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Factura #001234 - 15 de Agosto, 2024
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    $150.00
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Pagado
                  </span>
                  <button className="text-primary-600 hover:text-primary-900 text-sm font-medium">
                    Ver factura
                  </button>
                </div>
              </div>
            </div>

            {/* Pago 2 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Tratamiento Antiarrugas
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Factura #001235 - Pendiente
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    $450.00
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pendiente
                  </span>
                  <button className="text-primary-600 hover:text-primary-900 text-sm font-medium">
                    Pagar ahora
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

export default MyPayments;
