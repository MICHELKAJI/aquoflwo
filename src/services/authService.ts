import axios from 'axios';
import { getAllSites, createSite } from '../services/siteService';
import { getAllNotifications } from '../services/notificationService';
import { User } from '../types';

// URL de l'API - en production, utilisez l'URL Railway
const API_URL = 'https://backendaquo.onrender.com';

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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    return { user, token };
  } catch (error: any) {
    console.error('Erreur de connexion:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erreur lors de la connexion');
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'utilisateur');
  }
}; 