import React from 'react';
import { PlusIcon, ExclamationTriangleIcon, CubeIcon } from '@heroicons/react/24/outline';

const Inventory: React.FC = () => {
  // Datos de ejemplo
  const supplies = [
    {
      id: 1,
      name: 'Ácido Hialurónico',
      description: 'Ácido hialurónico para tratamientos faciales',
      category: 'Medicamento',
      unit: 'ml',
      stock: 50,
      minStock: 10,
      maxStock: 100,
      unitCost: 25.00,
      supplier: 'Laboratorios Estética',
      expiryDate: '2025-06-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Mascarillas Hidratantes',
      description: 'Mascarillas faciales hidratantes desechables',
      category: 'Consumible',
      unit: 'unidad',
      stock: 100,
      minStock: 20,
      maxStock: 200,
      unitCost: 2.50,
      supplier: 'Suministros Bella',
      expiryDate: '2025-12-31',
      status: 'active'
    },
    {
      id: 3,
      name: 'Aceite de Masaje',
      description: 'Aceite esencial para masajes corporales',
      category: 'Consumible',
      unit: 'ml',
      stock: 200,
      minStock: 50,
      maxStock: 500,
      unitCost: 0.15,
      supplier: 'Aromas Naturales',
      expiryDate: '2025-08-20',
      status: 'active'
    },
    {
      id: 4,
      name: 'Guantes Desechables',
      description: 'Guantes de nitrilo desechables',
      category: 'Consumible',
      unit: 'unidad',
      stock: 15,
      minStock: 100,
      maxStock: 1000,
      unitCost: 0.05,
      supplier: 'Suministros Médicos',
      expiryDate: '2026-01-15',
      status: 'low_stock'
    },
    {
      id: 5,
      name: 'Crema Antiarrugas',
      description: 'Crema especializada para tratamientos anti-edad',
      category: 'Medicamento',
      unit: 'gr',
      stock: 0,
      minStock: 5,
      maxStock: 50,
      unitCost: 45.00,
      supplier: 'Laboratorios Premium',
      expiryDate: '2025-03-10',
      status: 'out_of_stock'
    }
  ];

  const categories = ['Todos', 'Medicamento', 'Consumible', 'Equipo'];

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
        <div className="flex space-x-3">
          <button className="btn-outline flex items-center">
            <CubeIcon className="h-5 w-5 mr-2" />
            Movimiento
          </button>
          <button className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Insumo
          </button>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card border-l-4 border-red-500">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-red-900">Productos Agotados</h3>
              <p className="text-red-700">1 producto sin stock</p>
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-yellow-500">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-yellow-900">Stock Bajo</h3>
              <p className="text-yellow-700">1 producto con stock mínimo</p>
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-orange-500">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-orange-900">Próximos a Vencer</h3>
              <p className="text-orange-700">1 producto vence pronto</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre del producto..."
              className="input-field"
            />
          </div>
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
              <option value="active">Disponible</option>
              <option value="low_stock">Stock Bajo</option>
              <option value="out_of_stock">Agotado</option>
              <option value="expired">Vencido</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor
            </label>
            <select className="input-field">
              <option value="">Todos los proveedores</option>
              <option value="Laboratorios Estética">Laboratorios Estética</option>
              <option value="Suministros Bella">Suministros Bella</option>
              <option value="Aromas Naturales">Aromas Naturales</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vencimiento
            </label>
            <select className="input-field">
              <option value="">Todos</option>
              <option value="expiring">Próximos a vencer</option>
              <option value="expired">Vencidos</option>
            </select>
          </div>
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
                  style={{ width: `${getStockPercentage(supply.stock, supply.maxStock)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Min: {supply.minStock}</span>
                <span>Max: {supply.maxStock}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Costo unitario:</span>
                <span className="font-medium">${supply.unitCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor total:</span>
                <span className="font-medium">${(supply.stock * supply.unitCost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Proveedor:</span>
                <span className="font-medium text-right">{supply.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vencimiento:</span>
                <span className={`font-medium ${isExpiringSoon(supply.expiryDate) ? 'text-orange-600' : ''}`}>
                  {new Date(supply.expiryDate).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button className="flex-1 btn-outline text-sm py-2">
                Editar
              </button>
              <button className="flex-1 btn-primary text-sm py-2">
                Movimiento
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">5</div>
          <div className="text-sm text-gray-600">Total Productos</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">3</div>
          <div className="text-sm text-gray-600">En Stock</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">$1,847</div>
          <div className="text-sm text-gray-600">Valor Total Inventario</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">2</div>
          <div className="text-sm text-gray-600">Requieren Atención</div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
