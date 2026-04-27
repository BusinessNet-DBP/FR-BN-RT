/**
 * Configuración de BusinessNet
 */
 
// API Gateway
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
 
// Microservicios
export const MS_AUTH_URL = import.meta.env.VITE_MS_AUTH_URL || 'http://localhost:8001/api/v1/auth';
export const MS_POSTS_URL  = import.meta.env.VITE_MS_POSTS_URL  || 'http://localhost:8003/api/v1/posts';
export const MS_POSTS_BASE = import.meta.env.VITE_MS_POSTS_BASE || 'http://localhost:8003';

 
// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'BusinessNet',
  version: '1.0.0',
};

const config = {
  API_BASE_URL,
  MS_AUTH_URL,
  MS_POSTS_URL,
  MS_POSTS_BASE,
};


export default config;