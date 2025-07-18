import axios from 'axios';

interface DashboardStats {
  totalSites: number;
  totalHouseholds: number;
  pendingNotifications: number;
  averageWaterLevel: number;
}

// Remplacer la définition de API_URL par :
const API_URL = 'https://backendaquo-production.up.railway.app/api/dashboard';

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