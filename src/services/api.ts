import axios from 'axios';

// URL de l'API - en production, utilisez l'URL Railway
const API_URL = import.meta.env.PROD 
  ? 'https://backendaquo-production.up.railway.app/api'
  : (import.meta.env.VITE_API_URL || '/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; 