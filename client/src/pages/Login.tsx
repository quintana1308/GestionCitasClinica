import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
  email?: string;
  clientCode?: string;
  password: string;
}

interface LoginProps {
  isClientLogin?: boolean;
}

const loginSchema = yup.object({
  email: yup.string().when('$isClientLogin', {
    is: (value: boolean) => value === false,
    then: (schema) => schema.email('Email inválido').required('Email es requerido'),
    otherwise: (schema) => schema.notRequired(),
  }),
  clientCode: yup.string().when('$isClientLogin', {
    is: (value: boolean) => value === true,
    then: (schema) => schema.required('Código de cliente es requerido'),
    otherwise: (schema) => schema.notRequired(),
  }),
  password: yup.string().required('Contraseña es requerida'),
});

const Login: React.FC<LoginProps> = ({ isClientLogin = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithClientCode } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    context: { isClientLogin },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      if (isClientLogin && data.clientCode) {
        await loginWithClientCode(data.clientCode, data.password);
        console.log('Login cliente exitoso, navegando a /client');
        toast.success('¡Bienvenido!');
        // Usar setTimeout para permitir que el estado se actualice antes de navegar
        setTimeout(() => {
          navigate('/client');
        }, 500);
      } else if (!isClientLogin && data.email) {
        await login(data.email, data.password);
        console.log('Login admin exitoso, navegando a /dashboard');
        toast.success('¡Bienvenido!');
        // Usar setTimeout para permitir que el estado se actualice antes de navegar
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isClientLogin ? 'Portal del Cliente' : 'Panel Administrativo'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isClientLogin 
              ? 'Accede con tu código de cliente' 
              : 'Inicia sesión en tu cuenta'
            }
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {!isClientLogin ? (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="input-field mt-1"
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="clientCode" className="block text-sm font-medium text-gray-700">
                  Código de Cliente
                </label>
                <input
                  {...register('clientCode')}
                  type="text"
                  className="input-field mt-1"
                  placeholder="CLI123456"
                />
                {errors.clientCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.clientCode.message}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                {...register('password')}
                type="password"
                className="input-field mt-1"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate(isClientLogin ? '/login' : '/client-login')}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              {isClientLogin 
                ? '¿Eres administrador o empleado? Haz clic aquí' 
                : '¿Eres cliente? Accede con tu código'
              }
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2024 Clínica Estética Bella. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
