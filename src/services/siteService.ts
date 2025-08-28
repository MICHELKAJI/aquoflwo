import axios from 'axios';
import { Site } from '../types';

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

export const getAllSites = async (): Promise<Site[]> => {
  try {
    const response = await api.get('/sites');
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des sites:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des sites');
  }
};

export const getSiteById = async (id: string): Promise<Site> => {
  try {
    const response = await api.get(`/sites/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la récupération du site:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du site');
  }
};

export const createSite = async (siteData: Omit<Site, 'id' | 'createdAt'>): Promise<Site> => {
  try {
    // Adapter le format des données pour correspondre au schéma Prisma
    const adaptedData = {
      name: siteData.name,
      address: siteData.address,
      latitude: siteData.latitude,
      longitude: siteData.longitude,
      reservoirCapacity: siteData.reservoirCapacity,
      currentLevel: siteData.currentLevel,
      sectorManagerId: siteData.sectorManagerId
    };

    console.log('Données envoyées au serveur:', adaptedData);

    const response = await api.post('/sites', adaptedData);
    return response.data;
  } catch (error: any) {
    console.error('Erreur détaillée:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw new Error(error.response?.data?.message || error.response?.data?.error || 'Erreur lors de la création du site');
  }
};

export const updateSite = async (id: string, siteData: Partial<Site>): Promise<Site> => {
  try {
    // Adapter le format des données pour correspondre au backend
    const adaptedData = siteData.location ? {
      ...siteData,
      address: siteData.location.address,
      latitude: siteData.location.coordinates.lat,
      longitude: siteData.location.coordinates.lng,
      location: undefined // Supprimer l'ancien format
    } : siteData;

    const response = await api.put(`/sites/${id}`, adaptedData);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du site:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du site');
  }
};

export const deleteSite = async (id: string): Promise<void> => {
  try {
    await api.delete(`/sites/${id}`);
  } catch (error: any) {
    console.error('Erreur lors de la suppression du site:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du site');
  }
}; 