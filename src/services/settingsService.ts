import api from './api';
import { 
  SystemSettings, 
  AlertThresholds, 
  SeasonalSettings, 
  NotificationSettings, 
  MaintenanceSettings, 
  SiteSettings 
} from '../types/settings';

// Récupérer les paramètres système généraux
export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const response = await api.get('/settings/system');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres système:', error);
    throw error;
  }
};

// Mettre à jour les paramètres système
export const updateSystemSettings = async (key: string, value: any): Promise<void> => {
  try {
    await api.put('/settings/system', { key, value });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres système:', error);
    throw error;
  }
};

// Récupérer les seuils d'alerte
export const getAlertThresholds = async (): Promise<AlertThresholds> => {
  try {
    const response = await api.get('/settings/alerts/thresholds');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des seuils d\'alerte:', error);
    throw error;
  }
};

// Mettre à jour les seuils d'alerte
export const updateAlertThresholds = async (thresholds: AlertThresholds): Promise<void> => {
  try {
    await api.put('/settings/alerts/thresholds', thresholds);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des seuils d\'alerte:', error);
    throw error;
  }
};

// Récupérer les paramètres saisonniers
export const getSeasonalSettings = async (): Promise<SeasonalSettings> => {
  try {
    const response = await api.get('/settings/seasonal');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres saisonniers:', error);
    throw error;
  }
};

// Mettre à jour les paramètres saisonniers
export const updateSeasonalSettings = async (settings: SeasonalSettings): Promise<void> => {
  try {
    await api.put('/settings/seasonal', settings);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres saisonniers:', error);
    throw error;
  }
};

// Récupérer les paramètres de notification
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  try {
    const response = await api.get('/settings/notifications');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres de notification:', error);
    throw error;
  }
};

// Mettre à jour les paramètres de notification
export const updateNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  try {
    await api.put('/settings/notifications', settings);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres de notification:', error);
    throw error;
  }
};

// Récupérer les paramètres de maintenance
export const getMaintenanceSettings = async (): Promise<MaintenanceSettings> => {
  try {
    const response = await api.get('/settings/maintenance');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres de maintenance:', error);
    throw error;
  }
};

// Mettre à jour les paramètres de maintenance
export const updateMaintenanceSettings = async (settings: MaintenanceSettings): Promise<void> => {
  try {
    await api.put('/settings/maintenance', settings);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres de maintenance:', error);
    throw error;
  }
};

// Récupérer les paramètres d'un site spécifique
export const getSiteSettings = async (siteId: string): Promise<SiteSettings> => {
  try {
    const response = await api.get(`/settings/site/${siteId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres du site:', error);
    throw error;
  }
};

// Mettre à jour les paramètres d'un site spécifique
export const updateSiteSettings = async (siteId: string, settings: Partial<SiteSettings>): Promise<void> => {
  try {
    await api.put(`/settings/site/${siteId}`, settings);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres du site:', error);
    throw error;
  }
};

// Réinitialiser les paramètres aux valeurs par défaut
export const resetToDefaults = async (category: string): Promise<void> => {
  try {
    await api.post(`/settings/reset/${category}`);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des paramètres:', error);
    throw error;
  }
};

// Exporter les paramètres
export const exportSettings = async (): Promise<Blob> => {
  try {
    const response = await api.get('/settings/export', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'exportation des paramètres:', error);
    throw error;
  }
};

// Importer les paramètres
export const importSettings = async (file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('settings', file);
    await api.post('/settings/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'importation des paramètres:', error);
    throw error;
  }
};

// Valider les paramètres avant sauvegarde
export const validateSettings = async (settings: any): Promise<{ valid: boolean; errors: string[] }> => {
  try {
    const response = await api.post('/settings/validate', settings);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la validation des paramètres:', error);
    throw error;
  }
}; 