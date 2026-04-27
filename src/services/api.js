import axios from 'axios';
import { toast } from 'react-toastify';
import { MS_AUTH_URL, MS_USER_URL, MS_POSTS_URL } from '../config';

const api = axios.create({
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    } else if (error.response?.status === 502 || error.response?.status === 504) {
      const msg = '⚠️ El servidor no responde. Intenta más tarde.';
      if (!document.querySelector('.Toastify__toast--error')) {
        toast.error(msg, { autoClose: 5000 });
      }
    } else if (!error.response) {
      const msg = '⚠️ Error de conexión. Verifica tu internet.';
      if (!document.querySelector('.Toastify__toast--error')) {
        toast.error(msg, { autoClose: 5000 });
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  login: async (email, password) => {
    const response = await api.post(`${MS_AUTH_URL}/login`, { email, password });
    return response.data;
  },
  me: async () => {
    const response = await api.get(`${MS_AUTH_URL}/me`);
    return response.data;
  },
  register: async (data) => {
    const response = await api.post(`${MS_AUTH_URL}/register`, data);
    return response.data;
  },
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userService = {
  getUsers: async () => {
    const response = await api.get(`${MS_USER_URL}/users`);
    return response.data;
  },
  getUser: async (id) => {
    const response = await api.get(`${MS_USER_URL}/users/${id}`);
    return response.data;
  },
};

// ── Posts ─────────────────────────────────────────────────────────────────────
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