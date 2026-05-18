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
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 502 || error.response?.status === 504) {
      const msg = '⚠️ El servidor no responde. Por favor verifica tu conexión o intenta más tarde.';
      if (!document.querySelector('.Toastify__toast--error')) {
        toast.error(msg, { autoClose: 5000, position: 'top-right' });
      }
    } else if (!error.response) {
      const msg = '⚠️ Error de conexión. Por favor verifica tu conexión a internet.';
      if (!document.querySelector('.Toastify__toast--error')) {
        toast.error(msg, { autoClose: 5000, position: 'top-right' });
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
  register: async (tipoCuenta, formData) => {
    const response = await api.post(
      `${MS_AUTH_URL}/register/${tipoCuenta}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
  getUser: async (userId) => {
    const response = await api.get(`${MS_AUTH_URL}/users/${userId}`);
    return response.data;
  },
};

// ── Posts ─────────────────────────────────────────────────────────────────────
export const postService = {
  getPosts: async (tab = "recientes", categoria = null) => {
    const params = { tab };
    if (categoria && categoria !== "todos") params.categoria = categoria;
    const response = await api.get(`${MS_POSTS_URL}/`, { params });
    return response.data;
  },
  createPost: async (formData) => {
    const response = await api.post(`${MS_POSTS_URL}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  editPost: async (postId, data) => {
    const response = await api.put(`${MS_POSTS_URL}/${postId}`, data);
    return response.data;
  },
  deletePost: async (postId) => {
    await api.delete(`${MS_POSTS_URL}/${postId}`);
  },
  likePost: async (postId) => {
    const response = await api.post(`${MS_POSTS_URL}/${postId}/like`);
    return response.data;
  },
  registerView: async (postId) => {
    await api.post(`${MS_POSTS_URL}/${postId}/view`);
  },
  commentPost: async (postId, contenido) => {
    const response = await api.post(`${MS_POSTS_URL}/${postId}/comment`, { contenido });
    return response.data;
  },
  deleteComment: async (postId, commentId) => {
    await api.delete(`${MS_POSTS_URL}/${postId}/comment/${commentId}`);
  },
  likeComment: async (postId, commentId) => {
    const response = await api.post(`${MS_POSTS_URL}/${postId}/comment/${commentId}/like`);
    return response.data;
  },
  replyComment: async (postId, commentId, contenido) => {
    const response = await api.post(
      `${MS_POSTS_URL}/${postId}/comment/${commentId}/reply`,
      { contenido }
    );
    return response.data;
  },
  deleteReply: async (postId, commentId, replyId) => {
    await api.delete(`${MS_POSTS_URL}/${postId}/comment/${commentId}/reply/${replyId}`);
  },
  toggleFollow: async (targetId) => {
    const response = await api.post(`${MS_POSTS_URL}/usuarios/${targetId}/follow`);
    return response.data;
  },
  followStatus: async (targetId) => {
    const response = await api.get(`${MS_POSTS_URL}/usuarios/${targetId}/follow-status`);
    return response.data;
  },
  userStats: async (targetId) => {
    const response = await api.get(`${MS_POSTS_URL}/usuarios/${targetId}/stats`);
    return response.data;
  },
  getSeguidores: async (targetId) => {
    const response = await api.get(`${MS_POSTS_URL}/usuarios/${targetId}/seguidores`);
    return response.data;
  },
  getSiguiendo: async (targetId) => {
    const response = await api.get(`${MS_POSTS_URL}/usuarios/${targetId}/siguiendo`);
    return response.data;
  },
};

export default api;