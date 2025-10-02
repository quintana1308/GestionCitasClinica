import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  CubeIcon,
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Citas', href: '/dashboard/appointments', icon: CalendarIcon },
    { name: 'Clientes', href: '/dashboard/clients', icon: UsersIcon },
    { name: 'Tratamientos', href: '/dashboard/treatments', icon: CubeIcon },
    { name: 'Inventario', href: '/dashboard/inventory', icon: CubeIcon },
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
      <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="ml-3">
            <h1 className="text-white text-lg font-semibold">Clínica Bella</h1>
          </div>
        </div>
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
              {user?.roles?.join(', ')}
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
