import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { treatmentService, Treatment, TreatmentFilters, CreateTreatmentData, UpdateTreatmentData } from '../../services/treatmentService';
import Modal from '../Modal';
import ScheduleAppointmentModal from '../ScheduleAppointmentModal';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTreatmentData>({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: '',
    supplies: []
  });
  const [editFormData, setEditFormData] = useState<UpdateTreatmentData>({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: '',
    supplies: []
  });
  const [supplyInput, setSupplyInput] = useState('');

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
      toast.success(`Tratamiento ${!isActive ? 'activado' : 'desactivado'} exitosamente`);
      fetchTreatments();
    } catch (err: any) {
      console.error('Error updating treatment status:', err);
      toast.error(err.response?.data?.message || 'Error al actualizar el estado del tratamiento');
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      duration: 30,
      price: 0,
      category: '',
      supplies: []
    });
    setSupplyInput('');
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setEditFormData({
      name: treatment.name,
      description: treatment.description || '',
      duration: treatment.duration,
      price: Number(treatment.price),
      category: treatment.category,
      supplies: Array.isArray(treatment.supplies) ? treatment.supplies : []
    });
    setSupplyInput('');
    setShowEditModal(true);
  };

  const handleOpenScheduleModal = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setShowScheduleModal(true);
  };

  const handleCreateTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || formData.duration <= 0 || formData.price <= 0) {
      toast.error('Por favor completa todos los campos obligatorios correctamente');
      return;
    }

    try {
      setSubmitting(true);
      await treatmentService.createTreatment(formData);
      toast.success('Tratamiento creado exitosamente');
      setShowCreateModal(false);
      fetchTreatments();
    } catch (err: any) {
      console.error('Error creating treatment:', err);
      toast.error(err.response?.data?.message || 'Error al crear el tratamiento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTreatment) return;

    if (!editFormData.name || !editFormData.category || (editFormData.duration && editFormData.duration <= 0) || (editFormData.price && editFormData.price <= 0)) {
      toast.error('Por favor completa todos los campos correctamente');
      return;
    }

    try {
      setSubmitting(true);
      await treatmentService.updateTreatment(selectedTreatment.id, editFormData);
      toast.success('Tratamiento actualizado exitosamente');
      setShowEditModal(false);
      fetchTreatments();
    } catch (err: any) {
      console.error('Error updating treatment:', err);
      toast.error(err.response?.data?.message || 'Error al actualizar el tratamiento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTreatment = async (treatmentId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este tratamiento?')) {
      try {
        await treatmentService.deleteTreatment(treatmentId);
        toast.success('Tratamiento eliminado exitosamente');
        fetchTreatments();
      } catch (err: any) {
        console.error('Error deleting treatment:', err);
        toast.error(err.response?.data?.message || 'Error al eliminar el tratamiento');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'duration' || name === 'price' ? Number(value) : value }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: name === 'duration' || name === 'price' ? Number(value) : value }));
  };

  const handleAddSupply = () => {
    if (supplyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        supplies: [...(Array.isArray(prev.supplies) ? prev.supplies : []), supplyInput.trim()]
      }));
      setSupplyInput('');
    }
  };

  const handleAddSupplyEdit = () => {
    if (supplyInput.trim()) {
      setEditFormData(prev => ({
        ...prev,
        supplies: [...(Array.isArray(prev.supplies) ? prev.supplies : []), supplyInput.trim()]
      }));
      setSupplyInput('');
    }
  };

  const handleRemoveSupply = (index: number) => {
    setFormData(prev => ({
      ...prev,
      supplies: (Array.isArray(prev.supplies) ? prev.supplies : []).filter((_, i) => i !== index)
    }));
  };

  const handleRemoveSupplyEdit = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      supplies: (Array.isArray(prev.supplies) ? prev.supplies : []).filter((_, i) => i !== index)
    }));
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
        <button onClick={handleOpenCreateModal} className="btn-primary flex items-center">
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
            <select 
              className="input-field"
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select 
              className="input-field"
              value={filters.isActive === undefined ? '' : filters.isActive ? 'true' : 'false'}
              onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <option value="">Todos</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
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
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
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
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
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
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full mr-2 ${treatment.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-500">
                    {treatment.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleStatus(treatment.id, treatment.isActive)}
                  className={`text-xs px-2 py-1 rounded ${
                    treatment.isActive 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  title={treatment.isActive ? 'Desactivar' : 'Activar'}
                >
                  {treatment.isActive ? 'Desactivar' : 'Activar'}
                </button>
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
              <button 
                onClick={() => handleOpenEditModal(treatment)}
                className="flex-1 btn-outline text-sm py-2 flex items-center justify-center"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Editar
              </button>
              <button 
                onClick={() => handleOpenScheduleModal(treatment)}
                disabled={!treatment.isActive}
                className={`flex-1 text-sm py-2 flex items-center justify-center rounded-lg transition-colors ${
                  treatment.isActive
                    ? 'btn-primary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={!treatment.isActive ? 'No se puede agendar un tratamiento inactivo' : 'Agendar cita'}
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Agendar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
          <div className="text-sm text-gray-600">Total Tratamientos</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {treatments.filter(t => t.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Activos</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">
            ${treatments.length > 0 ? (treatments.reduce((sum, t) => sum + Number(t.price), 0) / treatments.length).toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-gray-600">Precio Promedio</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {treatments.length > 0 ? Math.round(treatments.reduce((sum, t) => sum + calculatePopularity(t._count?.appointments || 0), 0) / treatments.length) : 0}%
          </div>
          <div className="text-sm text-gray-600">Popularidad Promedio</div>
        </div>
      </div>

      {/* Create Treatment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Tratamiento"
        size="lg"
      >
        <form onSubmit={handleCreateTreatment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Tratamiento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Facial">Facial</option>
                <option value="Corporal">Corporal</option>
                <option value="Láser">Láser</option>
                <option value="Masajes">Masajes</option>
                <option value="Depilación">Depilación</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input-field"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (minutos) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="input-field"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="input-field"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insumos Necesarios
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={supplyInput}
                onChange={(e) => setSupplyInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSupply())}
                className="input-field flex-1"
                placeholder="Agregar insumo..."
              />
              <button
                type="button"
                onClick={handleAddSupply}
                className="btn-outline px-4"
              >
                Agregar
              </button>
            </div>
            {Array.isArray(formData.supplies) && formData.supplies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.supplies.map((supply: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                  >
                    {supply}
                    <button
                      type="button"
                      onClick={() => handleRemoveSupply(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              {submitting ? 'Creando...' : 'Crear Tratamiento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Treatment Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Tratamiento"
        size="lg"
      >
        <form onSubmit={handleUpdateTreatment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Tratamiento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={editFormData.category}
                onChange={handleEditInputChange}
                className="input-field"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Facial">Facial</option>
                <option value="Corporal">Corporal</option>
                <option value="Láser">Láser</option>
                <option value="Masajes">Masajes</option>
                <option value="Depilación">Depilación</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={editFormData.description}
              onChange={handleEditInputChange}
              className="input-field"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (minutos) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="duration"
                value={editFormData.duration}
                onChange={handleEditInputChange}
                className="input-field"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={editFormData.price}
                onChange={handleEditInputChange}
                className="input-field"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insumos Necesarios
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={supplyInput}
                onChange={(e) => setSupplyInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSupplyEdit())}
                className="input-field flex-1"
                placeholder="Agregar insumo..."
              />
              <button
                type="button"
                onClick={handleAddSupplyEdit}
                className="btn-outline px-4"
              >
                Agregar
              </button>
            </div>
            {Array.isArray(editFormData.supplies) && editFormData.supplies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {editFormData.supplies.map((supply: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                  >
                    {supply}
                    <button
                      type="button"
                      onClick={() => handleRemoveSupplyEdit(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              {submitting ? 'Actualizando...' : 'Actualizar Tratamiento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Schedule Appointment Modal */}
      <ScheduleAppointmentModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        treatment={selectedTreatment}
        onSuccess={() => {
          fetchTreatments();
          toast.success('¡Cita agendada! Puedes verla en la sección de Citas');
        }}
      />
    </div>
  );
};

export default Treatments;
