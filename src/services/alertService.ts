import axios from 'axios';
import { Alert } from '../types';

// URL de l'API - en production, utilisez l'URL Railway
const API_URL = import.meta.env.PROD 
  ? 'https://backendaquo-production.up.railway.app/api'
  : (import.meta.env.VITE_API_URL || '/api');

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

export const getAllAlerts = async (): Promise<Alert[]> => {
  try {
    const response = await api.get('/alerts');
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des alertes:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des alertes');
  }
};

export const getAlertById = async (id: string): Promise<Alert> => {
  try {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'alerte:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'alerte');
  }
};

export const createAlert = async (alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alert> => {
  try {
    const response = await api.post('/alerts', alertData);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'alerte:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'alerte');
  }
};

export const updateAlert = async (id: string, alertData: Partial<Alert>): Promise<Alert> => {
  try {
    const response = await api.patch(`/alerts/${id}`, alertData);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'alerte:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'alerte');
  }
}; 