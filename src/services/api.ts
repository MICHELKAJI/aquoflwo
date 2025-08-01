import axios from 'axios';

// URL de l'API - en production, utilisez l'URL Railway
const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
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

// Intercepteur pour gérer les erreurs 429 (Too Many Requests)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      console.warn('Rate limit atteint, attente avant retry...');
      // Attendre 2 secondes avant de retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Retry la requête une seule fois
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

export default api; 