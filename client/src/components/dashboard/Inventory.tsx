import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ExclamationTriangleIcon, 
  CubeIcon,
  PencilIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { supplyService, Supply, SupplyFilters, CreateSupplyData, UpdateSupplyData, UpdateStockData, SupplyStatus, MovementType } from '../../services/supplyService';
import Modal from '../Modal';

const Inventory: React.FC = () => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SupplyFilters>({
    page: 1,
    limit: 12,
    search: '',
    category: '',
    status: undefined,
    lowStock: false,
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
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showMovementsHistoryModal, setShowMovementsHistoryModal] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateSupplyData>({
    name: '',
    description: '',
    category: '',
    unit: '',
    stock: 0,
    minStock: 0,
    maxStock: undefined,
    unitCost: 0,
    supplier: '',
    expiryDate: ''
  });

  const [editFormData, setEditFormData] = useState<UpdateSupplyData>({
    name: '',
    description: '',
    category: '',
    unit: '',
    minStock: 0,
    maxStock: undefined,
    unitCost: 0,
    supplier: '',
    expiryDate: ''
  });

  const [movementData, setMovementData] = useState<UpdateStockData>({
    type: 'IN',
    quantity: 0,
    reason: '',
    unitCost: undefined
  });

  useEffect(() => {
    fetchSupplies();
    fetchCategories();
  }, [filters]);

  const fetchSupplies = async () => {
    try {
      setLoading(true);
      const response = await supplyService.getSupplies(filters);
      setSupplies(response.supplies);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Error fetching supplies:', err);
      setError(err.response?.data?.message || 'Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await supplyService.getSupplyCategories();
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

  const handleFilterChange = (key: keyof SupplyFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      unit: '',
      stock: 0,
      minStock: 0,
      maxStock: undefined,
      unitCost: 0,
      supplier: '',
      expiryDate: ''
    });
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (supply: Supply) => {
    setSelectedSupply(supply);
    setEditFormData({
      name: supply.name,
      description: supply.description || '',
      category: supply.category,
      unit: supply.unit,
      minStock: supply.minStock,
      maxStock: supply.maxStock || undefined,
      unitCost: Number(supply.unitCost),
      supplier: supply.supplier || '',
      expiryDate: supply.expiryDate ? new Date(supply.expiryDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleOpenMovementModal = (supply: Supply) => {
    setSelectedSupply(supply);
    setMovementData({
      type: 'IN',
      quantity: 0,
      reason: '',
      unitCost: Number(supply.unitCost)
    });
    setShowMovementModal(true);
  };

  const handleOpenMovementsHistory = (supply: Supply) => {
    setSelectedSupply(supply);
    setShowMovementsHistoryModal(true);
  };

  const handleCreateSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.unit || formData.unitCost <= 0) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);
      await supplyService.createSupply(formData);
      toast.success('Insumo creado exitosamente');
      setShowCreateModal(false);
      fetchSupplies();
    } catch (err: any) {
      console.error('Error creating supply:', err);
      toast.error(err.response?.data?.message || 'Error al crear el insumo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSupply) return;

    if (!editFormData.name || !editFormData.category || !editFormData.unit) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setSubmitting(true);
      await supplyService.updateSupply(selectedSupply.id, editFormData);
      toast.success('Insumo actualizado exitosamente');
      setShowEditModal(false);
      fetchSupplies();
    } catch (err: any) {
      console.error('Error updating supply:', err);
      toast.error(err.response?.data?.message || 'Error al actualizar el insumo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSupply) return;

    if (movementData.quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    try {
      setSubmitting(true);
      await supplyService.updateSupplyStock(selectedSupply.id, movementData);
      toast.success('Movimiento registrado exitosamente');
      setShowMovementModal(false);
      fetchSupplies();
    } catch (err: any) {
      console.error('Error registering movement:', err);
      toast.error(err.response?.data?.message || 'Error al registrar el movimiento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: ['stock', 'minStock', 'maxStock', 'unitCost'].includes(name) ? Number(value) : value 
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ 
      ...prev, 
      [name]: ['minStock', 'maxStock', 'unitCost'].includes(name) ? Number(value) : value 
    }));
  };

  const handleMovementInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMovementData(prev => ({ 
      ...prev, 
      [name]: ['quantity', 'unitCost'].includes(name) ? Number(value) : value 
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Disponible';
      case 'low_stock':
        return 'Stock Bajo';
      case 'out_of_stock':
        return 'Agotado';
      case 'expired':
        return 'Vencido';
      default:
        return status;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Medicamento':
        return 'bg-purple-100 text-purple-800';
      case 'Consumible':
        return 'bg-blue-100 text-blue-800';
      case 'Equipo':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const getStockBarColor = (current: number, min: number) => {
    if (current === 0) return 'bg-red-500';
    if (current <= min) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-600">Control de insumos, medicamentos y equipos</p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nuevo Insumo
        </button>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card border-l-4 border-red-500">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-red-900">Productos Agotados</h3>
              <p className="text-red-700">
                {supplies.filter(s => s.status === 'OUT_OF_STOCK').length} producto(s) sin stock
              </p>
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-yellow-500">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-yellow-900">Stock Bajo</h3>
              <p className="text-yellow-700">
                {supplies.filter(s => s.status === 'LOW_STOCK').length} producto(s) con stock mínimo
              </p>
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-orange-500">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-orange-900">Próximos a Vencer</h3>
              <p className="text-orange-700">
                {supplies.filter(s => s.expiryDate && isExpiringSoon(s.expiryDate.toString())).length} producto(s) vence(n) pronto
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, descripción o proveedor..."
                className="input-field pl-10"
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
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
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value as SupplyStatus | '')}
            >
              <option value="">Todos</option>
              <option value="ACTIVE">Disponible</option>
              <option value="LOW_STOCK">Stock Bajo</option>
              <option value="OUT_OF_STOCK">Agotado</option>
              <option value="EXPIRED">Vencido</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              checked={filters.lowStock || false}
              onChange={(e) => handleFilterChange('lowStock', e.target.checked)}
            />
            <span className="ml-2 text-sm text-gray-700">Mostrar solo productos con stock bajo</span>
          </label>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supplies.map((supply) => (
          <div key={supply.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(supply.category)}`}>
                {supply.category}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(supply.status)}`}>
                {getStatusText(supply.status)}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {supply.name}
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              {supply.description}
            </p>

            {/* Stock Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Stock Actual</span>
                <span className="text-gray-900">
                  {supply.stock} {supply.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStockBarColor(supply.stock, supply.minStock)}`}
                  style={{ width: `${getStockPercentage(supply.stock, supply.maxStock || supply.minStock * 2)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Min: {supply.minStock}</span>
                <span>Max: {supply.maxStock || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Costo unitario:</span>
                <span className="font-medium">${Number(supply.unitCost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor total:</span>
                <span className="font-medium">${(supply.stock * Number(supply.unitCost)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Proveedor:</span>
                <span className="font-medium text-right">{supply.supplier}</span>
              </div>
              {supply.expiryDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Vencimiento:</span>
                  <span className={`font-medium ${isExpiringSoon(supply.expiryDate.toString()) ? 'text-orange-600' : ''}`}>
                    {new Date(supply.expiryDate).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex space-x-2 mt-4">
              <button 
                onClick={() => handleOpenEditModal(supply)}
                className="flex-1 btn-outline text-sm py-2 flex items-center justify-center"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Editar
              </button>
              <button 
                onClick={() => handleOpenMovementModal(supply)}
                className="flex-1 btn-primary text-sm py-2 flex items-center justify-center"
              >
                <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />
                Movimiento
              </button>
            </div>
            <button 
              onClick={() => handleOpenMovementsHistory(supply)}
              className="w-full mt-2 text-xs text-primary-600 hover:text-primary-700 flex items-center justify-center"
            >
              <ClockIcon className="h-4 w-4 mr-1" />
              Ver Historial de Movimientos
            </button>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
          <div className="text-sm text-gray-600">Total Productos</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {supplies.filter(s => s.status === 'ACTIVE').length}
          </div>
          <div className="text-sm text-gray-600">En Stock</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">
            ${supplies.reduce((sum, s) => sum + (s.stock * Number(s.unitCost)), 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Valor Total Inventario</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {supplies.filter(s => s.status === 'LOW_STOCK' || s.status === 'OUT_OF_STOCK').length}
          </div>
          <div className="text-sm text-gray-600">Requieren Atención</div>
        </div>
      </div>

      {/* Create Supply Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Insumo"
        size="lg"
      >
        <form onSubmit={handleCreateSupply} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
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
                <option value="Medicamento">Medicamento</option>
                <option value="Consumible">Consumible</option>
                <option value="Equipo">Equipo</option>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad <span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="unidad">Unidad</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="gr">Gramos (gr)</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="litro">Litros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Inicial <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="input-field"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo Unitario ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleInputChange}
                className="input-field"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Mínimo
              </label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleInputChange}
                className="input-field"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Máximo
              </label>
              <input
                type="number"
                name="maxStock"
                value={formData.maxStock || ''}
                onChange={handleInputChange}
                className="input-field"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
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
              {submitting ? 'Creando...' : 'Crear Insumo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Supply Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Insumo"
        size="lg"
      >
        <form onSubmit={handleUpdateSupply} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
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
                <option value="Medicamento">Medicamento</option>
                <option value="Consumible">Consumible</option>
                <option value="Equipo">Equipo</option>
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
                Unidad <span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                value={editFormData.unit}
                onChange={handleEditInputChange}
                className="input-field"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="unidad">Unidad</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="gr">Gramos (gr)</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="litro">Litros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo Unitario ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="unitCost"
                value={editFormData.unitCost}
                onChange={handleEditInputChange}
                className="input-field"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Mínimo
              </label>
              <input
                type="number"
                name="minStock"
                value={editFormData.minStock}
                onChange={handleEditInputChange}
                className="input-field"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Máximo
              </label>
              <input
                type="number"
                name="maxStock"
                value={editFormData.maxStock || ''}
                onChange={handleEditInputChange}
                className="input-field"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor
              </label>
              <input
                type="text"
                name="supplier"
                value={editFormData.supplier}
                onChange={handleEditInputChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                name="expiryDate"
                value={editFormData.expiryDate}
                onChange={handleEditInputChange}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Para modificar el stock, usa el botón "Movimiento" en la tarjeta del producto.
            </p>
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
              {submitting ? 'Actualizando...' : 'Actualizar Insumo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Movement Modal */}
      <Modal
        isOpen={showMovementModal}
        onClose={() => setShowMovementModal(false)}
        title={`Registrar Movimiento - ${selectedSupply?.name}`}
        size="md"
      >
        <form onSubmit={handleMovement} className="space-y-4">
          {selectedSupply && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Stock Actual:</span>
                  <span className="ml-2 font-bold text-gray-900">
                    {selectedSupply.stock} {selectedSupply.unit}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Costo Unitario:</span>
                  <span className="ml-2 font-bold text-gray-900">
                    ${Number(selectedSupply.unitCost).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Movimiento <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={movementData.type}
              onChange={handleMovementInputChange}
              className="input-field"
              required
            >
              <option value="IN">Entrada (Agregar stock)</option>
              <option value="OUT">Salida (Reducir stock)</option>
              <option value="ADJUST">Ajuste de inventario</option>
              <option value="EXPIRED">Producto vencido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={movementData.quantity}
              onChange={handleMovementInputChange}
              className="input-field"
              min="1"
              required
            />
          </div>

          {movementData.type === 'IN' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo Unitario (opcional)
              </label>
              <input
                type="number"
                name="unitCost"
                value={movementData.unitCost || ''}
                onChange={handleMovementInputChange}
                className="input-field"
                min="0"
                step="0.01"
                placeholder="Dejar vacío para usar el costo actual"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón / Comentario
            </label>
            <textarea
              name="reason"
              value={movementData.reason}
              onChange={handleMovementInputChange}
              className="input-field"
              rows={3}
              placeholder="Describe el motivo del movimiento..."
            />
          </div>

          {selectedSupply && movementData.quantity > 0 && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
              <p className="text-sm text-primary-800">
                <strong>Stock resultante:</strong>{' '}
                {movementData.type === 'IN' || movementData.type === 'ADJUST'
                  ? selectedSupply.stock + movementData.quantity
                  : selectedSupply.stock - movementData.quantity}{' '}
                {selectedSupply.unit}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowMovementModal(false)}
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
              {submitting ? 'Registrando...' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Movements History Modal */}
      <Modal
        isOpen={showMovementsHistoryModal}
        onClose={() => setShowMovementsHistoryModal(false)}
        title={`Historial de Movimientos - ${selectedSupply?.name}`}
        size="xl"
      >
        <div className="space-y-4">
          {selectedSupply && selectedSupply.movements && selectedSupply.movements.length > 0 ? (
            <div className="space-y-3">
              {selectedSupply.movements.map((movement: any) => (
                <div key={movement.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        movement.type === 'IN' ? 'bg-green-100 text-green-800' :
                        movement.type === 'OUT' ? 'bg-red-100 text-red-800' :
                        movement.type === 'ADJUST' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {movement.type === 'IN' ? 'Entrada' :
                         movement.type === 'OUT' ? 'Salida' :
                         movement.type === 'ADJUST' ? 'Ajuste' : 'Vencido'}
                      </div>
                      <span className="font-bold text-gray-900">
                        {movement.type === 'IN' ? '+' : '-'}{movement.quantity} {selectedSupply.unit}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(movement.createdAt).toLocaleString('es-ES')}
                    </span>
                  </div>
                  {movement.reason && (
                    <p className="text-sm text-gray-600 mt-2">{movement.reason}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No hay movimientos registrados</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setShowMovementsHistoryModal(false)}
              className="btn-outline"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
