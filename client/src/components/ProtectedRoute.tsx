import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - No autenticado, redirigiendo a /');
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && user) {
    // La estructura es: user.roles[0].role.name
    console.log('ProtectedRoute - Estructura completa de roles:', JSON.stringify(user.roles, null, 2));
    const userRoleNames = user.roles.map((roleObj: any) => {
      console.log('ProtectedRoute - Procesando rol:', roleObj);
      // Intentar diferentes estructuras posibles
      const roleName = roleObj.role?.name || roleObj.name || roleObj;
      console.log('ProtectedRoute - Nombre extraído:', roleName);
      return roleName;
    });
    console.log('ProtectedRoute - Roles del usuario:', userRoleNames, 'Roles permitidos:', allowedRoles);
    const hasPermission = allowedRoles.some(role => userRoleNames.includes(role));
    if (!hasPermission) {
      console.log('ProtectedRoute - Sin permisos, redirigiendo a /');
      return <Navigate to="/" replace />;
    }
  }

  console.log('ProtectedRoute - Acceso permitido');
  return <>{children}</>;
};

export default ProtectedRoute;
