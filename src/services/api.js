import axios from 'axios';
import { toast } from 'react-toastify';
import { MS_AUTH_URL, MS_POSTS_URL } from '../config';
 
const api = axios.create({
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' }
});
 
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 502 || error.response?.status === 504) {
      console.error('❌ Error de Gateway:', error.response.status);
      const errorMessage = '⚠️ El servidor no responde. Por favor verifica tu conexión o intenta más tarde.';
      error.message = errorMessage;
      if (!document.querySelector('.Toastify__toast--error')) {
        toast.error(errorMessage, { autoClose: 5000, position: 'top-right' });
      }
    } else if (!error.response) {
      console.error('❌ Error de red:', error.message);
      const errorMessage = '⚠️ Error de conexión. Por favor verifica tu conexión a internet.';
      error.message = errorMessage;
      if (!document.querySelector('.Toastify__toast--error')) {
        toast.error(errorMessage, { autoClose: 5000, position: 'top-right' });
      }
    }
    return Promise.reject(error);
  }
);
 
export const authService = {
  login: async (email, password) => {
    const response = await api.post(`${MS_AUTH_URL}/login`, { email, password });
    return response.data;
  },
 
  me: async () => {
    const response = await api.get(`${MS_AUTH_URL}/me`);
    return response.data;
  },
 
  // ✅ CORREGIDO: solo una definición de register, con tipoCuenta como parámetro
  register: async (tipoCuenta, formData) => {
    const response = await api.post(
      `${MS_AUTH_URL}/register/${tipoCuenta}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};
 
export const postService = {
  getPosts: async () => {
    const response = await api.get(`${MS_POSTS_URL}/`);
    return response.data;
  },
  createPost: async (formData) => {
    const response = await api.post(`${MS_POSTS_URL}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  likePost: async (postId) => {
    const response = await api.post(`${MS_POSTS_URL}/${postId}/like`);
    return response.data;
  },
  commentPost: async (postId, contenido) => {
    const response = await api.post(`${MS_POSTS_URL}/${postId}/comment`, { contenido });
    return response.data;
  },
  deletePost: async (postId) => {
    const response = await api.delete(`${MS_POSTS_URL}/${postId}`);
    return response.data;
  },
};
 
export default api;