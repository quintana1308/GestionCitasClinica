import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { treatmentService, Treatment, TreatmentFilters } from '../../services/treatmentService';

// Función para obtener el color de popularidad basado en el número de citas
const getPopularityColor = (appointmentCount: number): string => {
  if (appointmentCount >= 10) return 'bg-green-500';
  if (appointmentCount >= 5) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Función para calcular popularidad basada en el número de citas
const calculatePopularity = (appointmentCount: number): number => {
  // Normalizar a un porcentaje (máximo 20 citas = 100%)
  return Math.min((appointmentCount / 20) * 100, 100);
};

const Treatments: React.FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TreatmentFilters>({
    page: 1,
    limit: 12,
    search: '',
    category: '',
    isActive: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchTreatments();
    fetchCategories();
  }, [filters]);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const response = await treatmentService.getTreatments(filters);
      setTreatments(response.treatments);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Error fetching treatments:', err);
      setError(err.response?.data?.message || 'Error al cargar los tratamientos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await treatmentService.getTreatmentCategories();
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleFilterChange = (key: keyof TreatmentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleToggleStatus = async (treatmentId: string, isActive: boolean) => {
    try {
      await treatmentService.toggleTreatmentStatus(treatmentId, !isActive);
      fetchTreatments();
    } catch (err: any) {
      console.error('Error updating treatment status:', err);
      setError(err.response?.data?.message || 'Error al actualizar el estado del tratamiento');
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Facial':
        return 'bg-pink-100 text-pink-800';
      case 'Corporal':
        return 'bg-blue-100 text-blue-800';
      case 'Láser':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Tratamientos</h1>
          <p className="text-gray-600">Gestiona todos los servicios de la clínica</p>
        </div>
        <button className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Tratamiento
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select className="input-field">
              {categories.map((category) => (
                <option key={category} value={category === 'Todos' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select className="input-field">
              <option value="">Todos</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Mínimo
            </label>
            <input
              type="number"
              placeholder="$0"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Máximo
            </label>
            <input
              type="number"
              placeholder="$500"
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Treatments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {treatments.map((treatment) => (
          <div key={treatment.id} className={`card hover:shadow-lg transition-shadow ${!treatment.isActive ? 'opacity-75' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(treatment.category)}`}>
                {treatment.category}
              </span>
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${treatment.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-gray-500">
                  {treatment.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {treatment.name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {treatment.description}
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {treatment.duration} min
                </div>
                <div className="flex items-center text-lg font-bold text-gray-900">
                  <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                  {Number(treatment.price).toFixed(2)}
                </div>
              </div>

              {/* Popularity Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Popularidad</span>
                  <span>{Math.round(calculatePopularity(treatment._count?.appointments || 0))}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getPopularityColor(treatment._count?.appointments || 0)}`}
                    style={{ width: `${calculatePopularity(treatment._count?.appointments || 0)}%` }}
                  ></div>
                </div>
              </div>

              {/* Supplies */}
              {treatment.supplies && Array.isArray(treatment.supplies) && treatment.supplies.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Insumos necesarios:</p>
                  <div className="flex flex-wrap gap-1">
                    {treatment.supplies.map((supply: string, index: number) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {supply}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 btn-outline text-sm py-2">
                Editar
              </button>
              <button className="flex-1 btn-primary text-sm py-2">
                Agendar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-sm text-gray-600">Total Tratamientos</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">4</div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">$104</div>
          <div className="text-sm text-gray-600">Precio Promedio</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">78%</div>
          <div className="text-sm text-gray-600">Popularidad Promedio</div>
        </div>
      </div>
    </div>
  );
};

export default Treatments;
