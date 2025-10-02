import React, { useState } from 'react';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, KeyIcon } from '@heroicons/react/24/outline';

const ClientProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Datos de ejemplo del perfil del cliente
  const [profileData, setProfileData] = useState({
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+1 (555) 123-4567',
    address: 'Calle Principal 123, Ciudad, Estado 12345',
    birthDate: '1985-06-15',
    emergencyContact: {
      name: 'Juan González',
      phone: '+1 (555) 987-6543',
      relationship: 'Esposo'
    },
    medicalInfo: {
      allergies: 'Ninguna conocida',
      medications: 'Ninguna',
      conditions: 'Piel sensible',
      notes: 'Prefiere tratamientos suaves'
    },
    preferences: {
      notifications: true,
      emailReminders: true,
      smsReminders: false,
      preferredTime: 'morning'
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = () => {
    // Aquí iría la lógica para guardar el perfil
    setIsEditing(false);
    // Mostrar mensaje de éxito
  };

  const handleChangePassword = () => {
    // Aquí iría la lógica para cambiar la contraseña
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    // Mostrar mensaje de éxito
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
        </div>
        <div className="flex space-x-3">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center"
            >
              <UserIcon className="h-5 w-5 mr-2" />
              Editar Perfil
            </button>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={handleSaveProfile}
                className="btn-primary"
              >
                Guardar Cambios
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="btn-outline"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Picture and Basic Info */}
      <div className="card">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-12 w-12 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
            <p className="text-gray-600">Cliente desde junio 2023</p>
            <p className="text-sm text-gray-500">Código de cliente: CLI001</p>
          </div>
          {isEditing && (
            <button className="btn-outline text-sm">
              Cambiar Foto
            </button>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="input-field"
              />
            ) : (
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{profileData.name}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            {isEditing ? (
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="input-field"
              />
            ) : (
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{profileData.email}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                className="input-field"
              />
            ) : (
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-900">{profileData.phone}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento
            </label>
            {isEditing ? (
              <input
                type="date"
                value={profileData.birthDate}
                onChange={(e) => setProfileData({...profileData, birthDate: e.target.value})}
                className="input-field"
              />
            ) : (
              <div className="flex items-center">
                <span className="w-5 h-5 mr-2 flex items-center justify-center">🎂</span>
                <span className="text-gray-900">{formatDate(profileData.birthDate)}</span>
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            {isEditing ? (
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                className="input-field"
                rows={2}
              />
            ) : (
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <span className="text-gray-900">{profileData.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto de Emergencia</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.emergencyContact.name}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  emergencyContact: {...profileData.emergencyContact, name: e.target.value}
                })}
                className="input-field"
              />
            ) : (
              <span className="text-gray-900">{profileData.emergencyContact.name}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profileData.emergencyContact.phone}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  emergencyContact: {...profileData.emergencyContact, phone: e.target.value}
                })}
                className="input-field"
              />
            ) : (
              <span className="text-gray-900">{profileData.emergencyContact.phone}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relación
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.emergencyContact.relationship}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  emergencyContact: {...profileData.emergencyContact, relationship: e.target.value}
                })}
                className="input-field"
              />
            ) : (
              <span className="text-gray-900">{profileData.emergencyContact.relationship}</span>
            )}
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Médica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alergias
            </label>
            {isEditing ? (
              <textarea
                value={profileData.medicalInfo.allergies}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  medicalInfo: {...profileData.medicalInfo, allergies: e.target.value}
                })}
                className="input-field"
                rows={2}
              />
            ) : (
              <span className="text-gray-900">{profileData.medicalInfo.allergies}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicamentos
            </label>
            {isEditing ? (
              <textarea
                value={profileData.medicalInfo.medications}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  medicalInfo: {...profileData.medicalInfo, medications: e.target.value}
                })}
                className="input-field"
                rows={2}
              />
            ) : (
              <span className="text-gray-900">{profileData.medicalInfo.medications}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condiciones Médicas
            </label>
            {isEditing ? (
              <textarea
                value={profileData.medicalInfo.conditions}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  medicalInfo: {...profileData.medicalInfo, conditions: e.target.value}
                })}
                className="input-field"
                rows={2}
              />
            ) : (
              <span className="text-gray-900">{profileData.medicalInfo.conditions}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas Adicionales
            </label>
            {isEditing ? (
              <textarea
                value={profileData.medicalInfo.notes}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  medicalInfo: {...profileData.medicalInfo, notes: e.target.value}
                })}
                className="input-field"
                rows={2}
              />
            ) : (
              <span className="text-gray-900">{profileData.medicalInfo.notes}</span>
            )}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferencias</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horario Preferido para Citas
            </label>
            {isEditing ? (
              <select
                value={profileData.preferences.preferredTime}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  preferences: {...profileData.preferences, preferredTime: e.target.value}
                })}
                className="input-field"
              >
                <option value="morning">Mañana (8:00 AM - 12:00 PM)</option>
                <option value="afternoon">Tarde (12:00 PM - 6:00 PM)</option>
                <option value="evening">Noche (6:00 PM - 8:00 PM)</option>
              </select>
            ) : (
              <span className="text-gray-900">
                {profileData.preferences.preferredTime === 'morning' && 'Mañana (8:00 AM - 12:00 PM)'}
                {profileData.preferences.preferredTime === 'afternoon' && 'Tarde (12:00 PM - 6:00 PM)'}
                {profileData.preferences.preferredTime === 'evening' && 'Noche (6:00 PM - 8:00 PM)'}
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Notificaciones</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profileData.preferences.notifications}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    preferences: {...profileData.preferences, notifications: e.target.checked}
                  })}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Recibir notificaciones generales</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profileData.preferences.emailReminders}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    preferences: {...profileData.preferences, emailReminders: e.target.checked}
                  })}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Recordatorios por email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profileData.preferences.smsReminders}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    preferences: {...profileData.preferences, smsReminders: e.target.checked}
                  })}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Recordatorios por SMS</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seguridad</h3>
        {!isChangingPassword ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contraseña</p>
              <p className="text-xs text-gray-500">Última actualización: hace 3 meses</p>
            </div>
            <button 
              onClick={() => setIsChangingPassword(true)}
              className="btn-outline flex items-center"
            >
              <KeyIcon className="h-4 w-4 mr-2" />
              Cambiar Contraseña
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña Actual
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="input-field"
              />
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleChangePassword}
                className="btn-primary"
              >
                Cambiar Contraseña
              </button>
              <button 
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="btn-outline"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;
