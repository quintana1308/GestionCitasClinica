import React, { useState } from 'react';
import { 
  XMarkIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Modal from './Modal';
import MedicalHistoryTab from './MedicalHistoryTab';
import { Client } from '../services/clientService';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  isOpen,
  onClose,
  client
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  if (!client) return null;

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return 'No especificado';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: Date | string | undefined | null) => {
    if (!dateOfBirth) return 'No especificado';
    const today = new Date();
    const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} años`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${client.user.firstName} ${client.user.lastName}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Información Personal
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5" />
                Historial Médico
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Información básica */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre Completo
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {client.user.firstName} {client.user.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{client.user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {client.user.phone || 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Código de Cliente
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">
                    {client.clientCode}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Nacimiento
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(client.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Edad
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {calculateAge(client.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Género
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {client.gender || 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    client.user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {client.user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Información de Contacto
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {client.address || 'No especificada'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contacto de Emergencia
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {client.emergencyContact || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Información médica */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Información Médica
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Condiciones Médicas
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {client.medicalConditions || 'Ninguna reportada'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Alergias
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {client.allergies || 'Ninguna reportada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de registro */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Información de Registro
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Registro
                  </label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    {formatDate(client.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Última Actualización
                  </label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    {formatDate(client.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <MedicalHistoryTab 
            clientId={client.id}
            clientName={`${client.user.firstName} ${client.user.lastName}`}
          />
        )}
      </div>
    </Modal>
  );
};

export default ClientDetailsModal;
