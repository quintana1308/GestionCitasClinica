import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  CubeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

// Componente del logo de la clínica
const ClinicLogo: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center px-2">
    <img 
      src="/logo-clinica.png" 
      alt="Logo Clínica" 
      className="h-12 w-auto max-w-full object-contain"
      onError={(e) => {
        // Fallback en caso de que no se encuentre la imagen
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        target.nextElementSibling?.classList.remove('hidden');
      }}
    />
    {/* Fallback SVG si no se carga la imagen */}
    <div className="hidden h-12 w-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
      <svg viewBox="0 0 40 40" className="h-10 w-10">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#be185d" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" />
        <path 
          d="M20 8 L20 32 M8 20 L32 20" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="6" fill="none" stroke="white" strokeWidth="2" />
      </svg>
    </div>
  </div>
);

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Configuración fija de la clínica (personalización desactivada temporalmente)
  const clinicName = 'Clínica Bella';

  // Función para extraer nombres de roles
  const getUserRoles = () => {
    if (!user?.roles) return '';
    
    const roleNames = user.roles.map((roleObj: any) => {
      // Manejar diferentes estructuras posibles
      const roleName = roleObj.role?.name || roleObj.name || roleObj;
      
      // Convertir a texto más legible
      switch (roleName) {
        case 'admin':
          return 'Administrador Sistema';
        case 'employee':
          return 'Empleado';
        case 'client':
          return 'Cliente';
        default:
          return roleName;
      }
    });
    
    return roleNames.join(', ');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Citas', href: '/dashboard/appointments', icon: CalendarIcon },
    { name: 'Clientes', href: '/dashboard/clients', icon: UsersIcon },
    { name: 'Tratamientos', href: '/dashboard/treatments', icon: CubeIcon },
    { name: 'Inventario', href: '/dashboard/inventory', icon: CubeIcon },
    { name: 'Facturas', href: '/dashboard/invoices', icon: DocumentTextIcon },
    { name: 'Pagos', href: '/dashboard/payments', icon: CreditCardIcon },
    { name: 'Reportes', href: '/dashboard/reports', icon: ChartBarIcon },
    { name: 'Configuración', href: '/dashboard/settings', icon: CogIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 px-4 bg-primary-600">
        <ClinicLogo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {getUserRoles()}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-3 w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
