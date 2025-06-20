import axios from 'axios';
import { User } from '../types';

const API_URL = '/api';

// Créer une instance axios avec la configuration par défaut
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
  }
};

export const getSectorManagers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users/sector-managers');
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des chefs de secteur:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des chefs de secteur');
  }
}; 