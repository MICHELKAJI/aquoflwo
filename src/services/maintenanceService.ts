import api from './api';
import { MaintenanceReport } from '../types';

export const getAllMaintenanceReports = async (): Promise<MaintenanceReport[]> => {
  try {
    const response = await api.get('/maintenance-reports');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports de maintenance:', error);
    throw error;
  }
};

export const getMaintenanceReportsBySite = async (siteId: string): Promise<MaintenanceReport[]> => {
  try {
    const response = await api.get(`/maintenance-reports/site/${siteId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports du site:', error);
    throw error;
  }
};

export const getMaintenanceReportById = async (reportId: string): Promise<MaintenanceReport> => {
  try {
    const response = await api.get(`/maintenance-reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du rapport:', error);
    throw error;
  }
};

export const createMaintenanceReport = async (report: Omit<MaintenanceReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceReport> => {
  try {
    const response = await api.post('/maintenance-reports', report);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du rapport:', error);
    throw error;
  }
};

export const updateMaintenanceReport = async (reportId: string, updates: Partial<MaintenanceReport>): Promise<MaintenanceReport> => {
  try {
    const response = await api.put(`/maintenance-reports/${reportId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rapport:', error);
    throw error;
  }
};

export const deleteMaintenanceReport = async (reportId: string): Promise<void> => {
  try {
    await api.delete(`/maintenance-reports/${reportId}`);
  } catch (error) {
    console.error('Erreur lors de la suppression du rapport:', error);
    throw error;
  }
};

export const generateMaintenanceReport = async (filters: {
  siteId?: string;
  startDate?: Date;
  endDate?: Date;
  type?: string;
  status?: string;
}): Promise<Blob> => {
  try {
    const response = await api.post('/maintenance-reports/generate', filters, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    throw error;
  }
}; 