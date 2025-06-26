import axios from 'axios';

interface DashboardStats {
  totalSites: number;
  totalHouseholds: number;
  pendingNotifications: number;
  averageWaterLevel: number;
}

// URL de l'API - en production, utilisez l'URL Railway
const API_URL = import.meta.env.PROD 
  ? 'https://backendaquo-production.up.railway.app/api/dashboard'
  : (import.meta.env.VITE_API_URL || '/api') + '/dashboard';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getWaterLevelHistory = async (siteId: string, days: number = 7): Promise<any[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/water-levels`, {
    params: { siteId, days },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getRecentActivity = async (): Promise<any[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/recent-activity`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}; 