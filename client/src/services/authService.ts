import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configurar axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirigir a la página principal en lugar de /login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  loginWithClientCode: async (clientCode: string, password: string) => {
    const response = await api.post('/auth/login/client', { clientCode, password });
    return response.data.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data.data.user;
  },

  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/profile', userData);
    return response.data.data.user;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default api;
