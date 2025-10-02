import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { clientService, Client, ClientFilters } from '../../services/clientService';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ClientFilters>({
    page: 1,
    limit: 10,
    search: '',
    isActive: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, [filters]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClients(filters);
      setClients(response.clients);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.response?.data?.message || 'Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleFilterChange = (key: keyof ClientFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleToggleStatus = async (clientId: string, isActive: boolean) => {
    try {
      await clientService.toggleClientStatus(clientId, !isActive);
      fetchClients();
    } catch (err: any) {
      console.error('Error updating client status:', err);
      setError(err.response?.data?.message || 'Error al actualizar el estado del cliente');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await clientService.deleteClient(clientId);
        fetchClients();
      } catch (err: any) {
        console.error('Error deleting client:', err);
        setError(err.response?.data?.message || 'Error al eliminar el cliente');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Activo' : 'Inactivo';
  };

  const calculateAge = (dateOfBirth: Date | string | null) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra la información de todos los clientes</p>
        </div>
        <button className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Cliente
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Cliente
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, email o código..."
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select className="input-field">
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            <select className="input-field">
              <option value="">Todos</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-lg">
                    {client.user.firstName.charAt(0)}{client.user.lastName.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {client.user.firstName} {client.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{client.clientCode}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.user.isActive)}`}>
                  {getStatusText(client.user.isActive)}
                </span>
                <button
                  onClick={() => handleToggleStatus(client.id, client.user.isActive)}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  {client.user.isActive ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                {client.user.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2" />
                {client.user.phone || 'No especificado'}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Edad:</span> {calculateAge(client.dateOfBirth || null)} años
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Dirección:</span> {client.address || 'No especificada'}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-900">{client.appointments?.length || 0}</span>
                  <p className="text-gray-500">Citas totales</p>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">
                    {new Date(client.createdAt).toLocaleDateString('es-ES')}
                  </span>
                  <p className="text-gray-500">Cliente desde</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button className="flex-1 btn-outline text-sm py-2">
                Ver Perfil
              </button>
              <button className="flex-1 btn-primary text-sm py-2">
                Nueva Cita
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">1</span> a <span className="font-medium">4</span> de{' '}
            <span className="font-medium">4</span> clientes
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Anterior
            </button>
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary-50 text-sm font-medium text-primary-600">
              1
            </button>
            <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Siguiente
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Clients;
