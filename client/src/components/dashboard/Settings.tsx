import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PhotoIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClinic, setIsLoadingClinic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clases CSS mejoradas para inputs
  const inputClasses = "mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-gray-400 bg-white text-gray-900";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-1";
  const helperTextClasses = "mt-2 text-sm text-gray-500";
  const buttonPrimaryClasses = "inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md";
  const buttonSecondaryClasses = "inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200";
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [clinicData, setClinicData] = useState({
    name: localStorage.getItem('clinicName') || 'Clínica Bella',
    logo: localStorage.getItem('clinicLogo') || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Perfil actualizado correctamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClinicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClinicData({
      ...clinicData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('El archivo debe ser menor a 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const logoUrl = event.target?.result as string;
        setClinicData({
          ...clinicData,
          logo: logoUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingClinic(true);
    try {
      // Guardar en localStorage por ahora
      localStorage.setItem('clinicName', clinicData.name);
      if (clinicData.logo) {
        localStorage.setItem('clinicLogo', clinicData.logo);
      }
      
      toast.success('Configuración de clínica actualizada correctamente');
      
      // Recargar la página para aplicar cambios en el sidebar
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      toast.error('Error al actualizar configuración de clínica');
    } finally {
      setIsLoadingClinic(false);
    }
  };

  const handleRemoveLogo = () => {
    setClinicData({
      ...clinicData,
      logo: null,
    });
    localStorage.removeItem('clinicLogo');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Configuración del Perfil
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={labelClasses}>
                  Nombre
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre"
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="lastName" className={labelClasses}>
                  Apellido
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Ingresa tu apellido"
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClasses}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="phone" className={labelClasses}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={buttonPrimaryClasses}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Configuración de Clínica */}
      <div className="bg-white shadow rounded-lg mt-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <BuildingOfficeIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Configuración de Clínica
            </h3>
          </div>
          
          <form onSubmit={handleClinicSubmit} className="space-y-6">
            <div>
              <label htmlFor="clinicName" className={labelClasses}>
                Nombre de la Clínica
              </label>
              <input
                type="text"
                name="name"
                id="clinicName"
                value={clinicData.name}
                onChange={handleClinicChange}
                placeholder="Ej: Clínica Estética Bella"
                className={inputClasses}
                required
              />
              <p className={helperTextClasses}>
                Este nombre aparecerá en el sidebar y en todos los documentos
              </p>
            </div>

            <div>
              <label className={labelClasses}>
                Logo de la Clínica
              </label>
              
              {clinicData.logo ? (
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={clinicData.logo}
                      alt="Logo de la clínica"
                      className="h-16 w-16 object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Logo actual</p>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={buttonSecondaryClasses}
                      >
                        <PhotoIcon className="h-4 w-4 mr-2" />
                        Cambiar Logo
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors duration-200 bg-gray-50 hover:bg-gray-100">
                  <div className="space-y-3 text-center">
                    <PhotoIcon className="mx-auto h-16 w-16 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="logo-upload"
                        className="relative cursor-pointer bg-white rounded-lg px-3 py-1 font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 transition-colors duration-200"
                      >
                        <span>Subir logo</span>
                        <input
                          id="logo-upload"
                          name="logo-upload"
                          type="file"
                          className="sr-only"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">o arrastra y suelta aquí</p>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      PNG, JPG, GIF hasta 2MB
                    </p>
                  </div>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoadingClinic}
                className={buttonPrimaryClasses}
              >
                {isLoadingClinic ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Configuración'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
