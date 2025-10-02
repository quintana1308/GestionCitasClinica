import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    navigate('/login/admin');
  };

  const handleClientAccess = () => {
    navigate('/login/client');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Clínica Estética Bella
          </h1>
          <p className="text-gray-600 mb-8">
            Sistema de Gestión de Citas
          </p>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Panel Administrativo</h2>
              <p className="text-gray-600 mb-4">
                Gestiona citas, clientes, inventario y reportes
              </p>
              <button 
                onClick={handleAdminAccess}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Acceder como Admin
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Portal del Cliente</h2>
              <p className="text-gray-600 mb-4">
                Revisa tus citas y historial de tratamientos
              </p>
              <button 
                onClick={handleClientAccess}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                Acceder como Cliente
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>© 2024 Clínica Estética Bella</p>
            <p className="mt-2">
              <strong>Credenciales Admin:</strong> admin@clinica.com / Admin123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
