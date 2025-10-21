import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import medicalHistoryService, { MedicalHistoryRecord, MedicalHistoryStats } from '../services/medicalHistoryService';
import { treatmentService, Treatment } from '../services/treatmentService';
import Modal from './Modal';
import ImageUpload from './ImageUpload';

interface MedicalHistoryTabProps {
  clientId: string;
  clientName: string;
}

interface MedicalHistoryFormData {
  diagnosis: string;
  treatment: string;
  notes: string;
  attachments: string[];
}

const MedicalHistoryTab: React.FC<MedicalHistoryTabProps> = ({ clientId, clientName }) => {
  const [records, setRecords] = useState<MedicalHistoryRecord[]>([]);
  const [stats, setStats] = useState<MedicalHistoryStats | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTreatments, setLoadingTreatments] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalHistoryRecord | null>(null);
  const [formData, setFormData] = useState<MedicalHistoryFormData>({
    diagnosis: '',
    treatment: '',
    notes: '',
    attachments: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadMedicalHistory();
    loadStats();
    loadTreatments();
  }, [clientId, currentPage]);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      const response = await medicalHistoryService.getClientMedicalHistory(clientId, currentPage, 10);
      setRecords(response.records);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Error al cargar historial médico:', error);
      toast.error('Error al cargar el historial médico');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await medicalHistoryService.getMedicalHistoryStats(clientId);
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const loadTreatments = async () => {
    try {
      setLoadingTreatments(true);
      const response = await treatmentService.getTreatments({ isActive: true });
      setTreatments(response.treatments || []);
    } catch (error) {
      console.error('Error al cargar tratamientos:', error);
      toast.error('Error al cargar los tratamientos');
    } finally {
      setLoadingTreatments(false);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await medicalHistoryService.createMedicalHistory({
        clientId,
        ...formData,
        attachments: formData.attachments.join(',')
      });
      
      toast.success('Registro creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      loadMedicalHistory();
      loadStats();
    } catch (error) {
      console.error('Error al crear registro:', error);
      toast.error('Error al crear el registro');
    }
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      await medicalHistoryService.updateMedicalHistory(selectedRecord.id, {
        ...formData,
        attachments: formData.attachments.join(',')
      });
      
      toast.success('Registro actualizado exitosamente');
      setShowEditModal(false);
      setSelectedRecord(null);
      resetForm();
      loadMedicalHistory();
    } catch (error) {
      console.error('Error al actualizar registro:', error);
      toast.error('Error al actualizar el registro');
    }
  };

  const handleDeleteRecord = async (record: MedicalHistoryRecord) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      return;
    }

    try {
      await medicalHistoryService.deleteMedicalHistory(record.id);
      toast.success('Registro eliminado exitosamente');
      loadMedicalHistory();
      loadStats();
    } catch (error) {
      console.error('Error al eliminar registro:', error);
      toast.error('Error al eliminar el registro');
    }
  };

  const openEditModal = (record: MedicalHistoryRecord) => {
    setSelectedRecord(record);
    setFormData({
      diagnosis: record.diagnosis || '',
      treatment: record.treatment,
      notes: record.notes || '',
      attachments: record.attachments ? record.attachments.split(',').filter(img => img.trim()) : []
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      diagnosis: '',
      treatment: '',
      notes: '',
      attachments: []
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Historial Médico - {clientName}
          </h2>
          {/* Botón oculto - Los registros se crean automáticamente al confirmar citas */}
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total Registros</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalRecords}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Registros Recientes</p>
                  <p className="text-2xl font-bold text-green-900">{stats.recentRecords.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <UserIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">Tratamientos Únicos</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {Object.keys(stats.treatmentDistribution).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de registros */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Registros Médicos</h3>
        </div>

        {records.length === 0 ? (
          <div className="p-6 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay registros</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando el primer registro médico para este cliente.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {records.map((record) => (
              <div key={record.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDate(record.date)}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {record.treatment}
                    </h4>
                    
                    {record.diagnosis && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Diagnóstico:</strong> {record.diagnosis}
                      </p>
                    )}
                    
                    {record.notes && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Notas:</strong> {record.notes}
                      </p>
                    )}
                    
                    {record.attachments && (
                      <div className="text-sm text-gray-600">
                        <strong className="flex items-center gap-1">
                          <PhotoIcon className="h-4 w-4" />
                          Imágenes adjuntas:
                        </strong>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {record.attachments.split(',').filter(img => img.trim()).map((imageUrl, idx) => (
                            <div key={idx} className="aspect-square bg-gray-100 rounded overflow-hidden">
                              <img
                                src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imageUrl.trim()}`}
                                alt={`Imagen ${idx + 1}`}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                                onLoad={() => console.log('Imagen cargada en historial:', `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imageUrl.trim()}`)}
                                onError={(e) => {
                                  console.error('Error cargando imagen en historial:', `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imageUrl.trim()}`);
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmM2Y0ZjYiLz4KICA8cGF0aCBkPSJNMTIgMTJoMTZ2MTZIMTJWMTJ6IiBzdHJva2U9IiM5Y2E3YWYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgogIDxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjIiIGZpbGw9IiM5Y2E3YWYiLz4KICA8cGF0aCBkPSJtMTIgMjQgNC00IDQgNCA4LTgiIHN0cm9rZT0iIzljYTdhZiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==';
                                }}
                                onClick={() => window.open(`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imageUrl.trim()}`, '_blank')}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openEditModal(record)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    {/* Botón de eliminar oculto */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <span className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal para crear registro */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nuevo Registro Médico"
        size="lg"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tratamiento *
            </label>
            <select
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loadingTreatments}
            >
              <option value="">
                {loadingTreatments ? 'Cargando tratamientos...' : 'Seleccionar tratamiento...'}
              </option>
              {treatments.map((treatment) => (
                <option key={treatment.id} value={treatment.name}>
                  {treatment.name} - ${Number(treatment.price).toFixed(2)}
                </option>
              ))}
            </select>
            {treatments.length === 0 && !loadingTreatments && (
              <p className="text-sm text-amber-600 mt-1">
                No hay tratamientos activos disponibles
              </p>
            )}
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imágenes
            </label>
            <ImageUpload
              images={formData.attachments}
              onImagesChange={(images) => setFormData({ ...formData, attachments: images })}
              maxImages={5}
              clientInfo={{ clientId, clientName }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Crear Registro
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal para editar registro */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRecord(null);
          resetForm();
        }}
        title="Editar Registro Médico"
        size="lg"
      >
        <form onSubmit={handleUpdateRecord} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tratamiento *
            </label>
            <select
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loadingTreatments}
            >
              <option value="">
                {loadingTreatments ? 'Cargando tratamientos...' : 'Seleccionar tratamiento...'}
              </option>
              {treatments.map((treatment) => (
                <option key={treatment.id} value={treatment.name}>
                  {treatment.name} - ${Number(treatment.price).toFixed(2)}
                </option>
              ))}
            </select>
            {treatments.length === 0 && !loadingTreatments && (
              <p className="text-sm text-amber-600 mt-1">
                No hay tratamientos activos disponibles
              </p>
            )}
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imágenes
            </label>
            <ImageUpload
              images={formData.attachments}
              onImagesChange={(images) => setFormData({ ...formData, attachments: images })}
              maxImages={5}
              clientInfo={{ clientId, clientName }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setSelectedRecord(null);
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Actualizar Registro
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MedicalHistoryTab;
