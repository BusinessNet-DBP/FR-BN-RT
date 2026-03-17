/**
 * Servicio API - Cliente HTTP para consumir microservicios
 */
import axios from 'axios';
import { toast } from 'react-toastify';
import { MS_AUTH_URL, MS_USER_URL } from '../config';

// Crear instancia de axios
const api = axios.create({
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 502 || error.response?.status === 504) {
      // Error de Gateway (Backend no disponible)
      console.error('❌ Error de Gateway:', error.response.status);
      const errorMessage = '⚠️ El servidor no responde. Por favor verifica tu conexión o intenta más tarde.';
      error.message = errorMessage;
      // Mostrar toast de error (evitar duplicados verificando si ya existe uno)
      if (!document.querySelector('.Toastify__toast--error')) {
        toast.error(errorMessage, {
          autoClose: 5000,
          position: 'top-right'
        });
      }
    } else if (!error.response) {
      // Error de red (sin respuesta del servidor)
      console.error('❌ Error de red:', error.message);
      const errorMessage = '⚠️ Error de conexión. Por favor verifica tu conexión a internet.';
      error.message = errorMessage;
      if (!document.querySelector('.Toastify__toast--error')) {
        toast.error(errorMessage, {
          autoClose: 5000,
          position: 'top-right'
        });
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH SERVICE
// ============================================================================

export const authService = {
  login: async (email, password) => {
    const response = await api.post(`${MS_AUTH_URL}/login`, {
      email,
      password
    });
    return response.data;
  },

  me: async () => {
    const response = await api.get(`${MS_AUTH_URL}/me`);
    return response.data;
  },
  register: async (data) => {
    const response = await api.post(`${MS_AUTH_URL}/register`, data);
    return response.data;
  }

};

// ============================================================================
// USER SERVICE
// ============================================================================

export const userService = {
  getUsers: async () => {
    const response = await api.get(`${MS_USER_URL}/users`);
    return response.data;
  },
  getUser: async (id) => {
    const response = await api.get(`${MS_USER_URL}/users/${id}`);
    return response.data;
  }
};

export default api;