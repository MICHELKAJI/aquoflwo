import axios from 'axios';
import { Notification } from '../types';

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

export const getAllNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des notifications:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des notifications');
  }
};

export const getNotificationById = async (id: string): Promise<Notification> => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération de la notification:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la notification');
  }
};

export const createNotification = async (notificationData: Omit<Notification, 'id' | 'sentAt'>): Promise<Notification> => {
  try {
    const response = await api.post('/', notificationData);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la création de la notification:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la création de la notification');
  }
};

export const updateNotificationStatus = async (id: string, status: 'sent' | 'failed' | 'pending'): Promise<Notification> => {
  try {
    const response = await api.patch(`/${id}`, { status });
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la notification');
  }
};

export const deleteNotification = async (id: string): Promise<void> => {
  try {
    await api.delete(`/${id}`);
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la notification:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la notification');
  }
}; 