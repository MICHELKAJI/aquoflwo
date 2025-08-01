import api from './api';

export interface TechnicalAlert {
  id: string;
  sensorId: string;
  siteId: string;
  type: 'BATTERY_LOW' | 'SIGNAL_WEAK' | 'ACCURACY_LOW' | 'SENSOR_FAILED' | 'MAINTENANCE_NEEDED' | 'CALIBRATION_DUE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details: {
    sensorName: string;
    siteName: string;
    currentValue: number;
    threshold: number;
    unit: string;
  };
  isRead: boolean;
  createdAt: Date;
  technicianId?: string;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  technicalAlerts: boolean;
  maintenanceReminders: boolean;
  criticalAlerts: boolean;
}

// Récupérer toutes les notifications
export const getAllNotifications = async (): Promise<any[]> => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    throw error;
  }
};

// Créer une nouvelle notification
export const createNotification = async (notification: any): Promise<any> => {
  try {
    const response = await api.post('/notifications', notification);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    throw error;
  }
};

// Envoyer une alerte technique aux techniciens du site
export const sendTechnicalAlert = async (alert: Omit<TechnicalAlert, 'id' | 'createdAt' | 'isRead'>): Promise<TechnicalAlert> => {
  try {
    const response = await api.post('/notifications/technical-alerts', alert);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'alerte technique:', error);
    throw error;
  }
};

// Récupérer les alertes techniques pour un technicien
export const getTechnicalAlerts = async (technicianId: string): Promise<TechnicalAlert[]> => {
  try {
    const response = await api.get(`/notifications/technical-alerts/${technicianId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes techniques:', error);
    throw error;
  }
};

// Récupérer les alertes liées aux sites du technicien et les alertes générées par les capteurs
export const getTechnicianSiteAlerts = async (technicianId: string): Promise<TechnicalAlert[]> => {
  try {
    const response = await api.get(`/notifications/technician-site-alerts/${technicianId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes des sites du technicien:', error);
    throw error;
  }
};

// Marquer une alerte comme lue
export const markAlertAsRead = async (alertId: string): Promise<void> => {
  try {
    await api.put(`/notifications/technical-alerts/${alertId}/read`);
  } catch (error) {
    console.error('Erreur lors du marquage de l\'alerte:', error);
    throw error;
  }
};

// Marquer une alerte de site technicien comme lue
export const markTechnicianSiteAlertAsRead = async (alertId: string): Promise<void> => {
  try {
    await api.put(`/notifications/technician-site-alerts/${alertId}/read`);
  } catch (error) {
    console.error('Erreur lors du marquage de l\'alerte de site technicien:', error);
    throw error;
  }
};

// Récupérer les préférences de notification d'un utilisateur
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences> => {
  try {
    const response = await api.get(`/notifications/preferences/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    throw error;
  }
};

// Mettre à jour les préférences de notification
export const updateNotificationPreferences = async (userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
  try {
    const response = await api.put(`/notifications/preferences/${userId}`, preferences);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    throw error;
  }
};

// Envoyer une notification par email
export const sendEmailNotification = async (data: {
  to: string;
  subject: string;
  message: string;
  template?: string;
}): Promise<void> => {
  try {
    await api.post('/notifications/email', data);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

// Envoyer une notification SMS
export const sendSMSNotification = async (data: {
  to: string;
  message: string;
}): Promise<void> => {
  try {
    await api.post('/notifications/sms', data);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du SMS:', error);
    throw error;
  }
};

// Générer un message d'alerte technique
export const generateTechnicalAlertMessage = (sensor: any, alertType: TechnicalAlert['type']): string => {
  const siteName = sensor.site?.name || 'Site inconnu';
  
  switch (alertType) {
    case 'BATTERY_LOW':
      return `Alerte: Batterie faible sur le capteur ${sensor.name} (${siteName}). Niveau: ${sensor.batteryLevel}%`;
    case 'SIGNAL_WEAK':
      return `Alerte: Signal faible sur le capteur ${sensor.name} (${siteName}). Force: ${sensor.signalStrength}%`;
    case 'ACCURACY_LOW':
      return `Alerte: Précision faible sur le capteur ${sensor.name} (${siteName}). Précision: ${sensor.accuracy}%`;
    case 'SENSOR_FAILED':
      return `URGENT: Capteur ${sensor.name} (${siteName}) en échec. Intervention requise immédiatement.`;
    case 'MAINTENANCE_NEEDED':
      return `Maintenance requise sur le capteur ${sensor.name} (${siteName}). Statut: ${sensor.status}`;
    case 'CALIBRATION_DUE':
      return `Calibration due pour le capteur ${sensor.name} (${siteName}). Dernière calibration: ${sensor.lastCalibrationDate ? new Date(sensor.lastCalibrationDate).toLocaleDateString('fr-FR') : 'Jamais'}`;
    default:
      return `Alerte technique sur le capteur ${sensor.name} (${siteName})`;
  }
};

// Déterminer la sévérité d'une alerte
export const determineAlertSeverity = (sensor: any, alertType: TechnicalAlert['type']): TechnicalAlert['severity'] => {
  switch (alertType) {
    case 'SENSOR_FAILED':
      return 'CRITICAL';
    case 'BATTERY_LOW':
      return sensor.batteryLevel < 20 ? 'HIGH' : 'MEDIUM';
    case 'SIGNAL_WEAK':
      return sensor.signalStrength < 30 ? 'HIGH' : 'MEDIUM';
    case 'ACCURACY_LOW':
      return sensor.accuracy < 70 ? 'HIGH' : 'MEDIUM';
    case 'MAINTENANCE_NEEDED':
      return 'MEDIUM';
    case 'CALIBRATION_DUE':
      return 'LOW';
    default:
      return 'MEDIUM';
  }
}; 