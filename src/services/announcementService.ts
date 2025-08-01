import axios from 'axios';
import { Announcement } from '../types';

// URL de l'API - en production, utilisez l'URL Railway
const API_URL = 'http://localhost:3001/api';

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

export const getAllAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const response = await api.get('/announcements');
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des annonces:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des annonces');
  }
};

export const getAnnouncementById = async (id: string): Promise<Announcement> => {
  try {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'annonce:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'annonce');
  }
};

export const createAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> => {
  try {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'annonce:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'annonce');
  }
};

export const updateAnnouncement = async (id: string, announcementData: Partial<Announcement>): Promise<Announcement> => {
  try {
    const response = await api.patch(`/announcements/${id}`, announcementData);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'annonce:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'annonce');
  }
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  try {
    await api.delete(`/announcements/${id}`);
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'annonce:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'annonce');
  }
}; 