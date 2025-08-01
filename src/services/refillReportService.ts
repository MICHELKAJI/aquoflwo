import api from './api';
import { RefillReport, RefillReportStats, RefillReportFilters, RefillReportFormData } from '../types';

export interface PaginatedRefillReports {
  reports: RefillReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Créer un rapport de recharge
export const createRefillReport = async (siteId: string, data: RefillReportFormData): Promise<RefillReport> => {
  const response = await api.post(`/refill-reports/${siteId}`, data);
  return response.data;
};

// Lister les rapports avec pagination et filtres
export const getRefillReports = async (
  siteId: string, 
  filters: RefillReportFilters = {}
): Promise<PaginatedRefillReports> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  const response = await api.get(`/refill-reports/${siteId}?${params.toString()}`);
  return response.data;
};

// Récupérer un rapport spécifique
export const getRefillReport = async (siteId: string, reportId: string): Promise<RefillReport> => {
  const response = await api.get(`/refill-reports/${siteId}/${reportId}`);
  return response.data;
};

// Modifier un rapport
export const updateRefillReport = async (
  siteId: string, 
  reportId: string, 
  data: Partial<RefillReportFormData>
): Promise<RefillReport> => {
  const response = await api.patch(`/refill-reports/${siteId}/${reportId}`, data);
  return response.data;
};

// Supprimer un rapport
export const deleteRefillReport = async (siteId: string, reportId: string): Promise<void> => {
  await api.delete(`/refill-reports/${siteId}/${reportId}`);
};

// Obtenir les statistiques de consommation
export const getRefillReportStats = async (siteId: string, period: number = 30): Promise<RefillReportStats> => {
  const response = await api.get(`/refill-reports/${siteId}/stats?period=${period}`);
  return response.data;
};

// Export des rapports (optionnel)
export const exportRefillReports = async (
  siteId: string, 
  format: 'csv' | 'pdf' = 'csv',
  filters: RefillReportFilters = {}
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('format', format);
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  const response = await api.get(`/refill-reports/${siteId}/export?${params.toString()}`, {
    responseType: 'blob'
  });
  return response.data;
};
