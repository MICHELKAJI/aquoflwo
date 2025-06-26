import axios from 'axios';
import { Household } from '../types';

// URL de l'API - en production, utilisez l'URL Railway
const API_URL = import.meta.env.PROD 
  ? 'https://backendaquo-production.up.railway.app/api/households'
  : (import.meta.env.VITE_API_URL || '/api') + '/households';

export const getAllHouseholds = async (): Promise<Household[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getHouseholdById = async (id: string): Promise<Household> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createHousehold = async (householdData: Omit<Household, 'id' | 'createdAt'>): Promise<Household> => {
  const token = localStorage.getItem('token');
  const response = await axios.post(API_URL, householdData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const updateHousehold = async (id: string, householdData: Partial<Household>): Promise<Household> => {
  const token = localStorage.getItem('token');
  const response = await axios.patch(`${API_URL}/${id}`, householdData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const deleteHousehold = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}; 