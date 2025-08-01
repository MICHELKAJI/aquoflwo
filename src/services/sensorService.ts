import api from './api';
import { Sensor, SensorConfig, SensorDiagnostic } from '../types';
import { sendTechnicalAlert, generateTechnicalAlertMessage, determineAlertSeverity } from './notificationService';

export const getAllSensors = async (): Promise<Sensor[]> => {
  try {
    const response = await api.get('/sensors');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des capteurs:', error);
    throw error;
  }
};

export const getSensorsBySite = async (siteId: string): Promise<Sensor[]> => {
  try {
    const response = await api.get(`/sensors/site/${siteId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des capteurs du site:', error);
    throw error;
  }
};

export const getSensorById = async (sensorId: string): Promise<Sensor> => {
  try {
    const response = await api.get(`/sensors/${sensorId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du capteur:', error);
    throw error;
  }
};

export const createSensor = async (sensor: Omit<Sensor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sensor> => {
  try {
    const response = await api.post('/sensors', sensor);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du capteur:', error);
    throw error;
  }
};

export const updateSensor = async (sensorId: string, updates: Partial<Sensor>): Promise<Sensor> => {
  try {
    const response = await api.put(`/sensors/${sensorId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du capteur:', error);
    throw error;
  }
};

export const deleteSensor = async (sensorId: string): Promise<void> => {
  try {
    await api.delete(`/sensors/${sensorId}`);
  } catch (error) {
    console.error('Erreur lors de la suppression du capteur:', error);
    throw error;
  }
};

export const calibrateSensor = async (sensorId: string, calibrationData: {
  accuracy: number;
  notes?: string;
}): Promise<Sensor> => {
  try {
    const response = await api.post(`/sensors/${sensorId}/calibrate`, calibrationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la calibration du capteur:', error);
    throw error;
  }
};

export const testSensor = async (sensorId: string): Promise<SensorDiagnostic> => {
  try {
    const response = await api.post(`/sensors/${sensorId}/test`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du test du capteur:', error);
    throw error;
  }
};

// Configuration des capteurs
export const getSensorConfigs = async (sensorId: string): Promise<SensorConfig[]> => {
  try {
    const response = await api.get(`/sensors/${sensorId}/configs`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des configurations:', error);
    throw error;
  }
};

export const createSensorConfig = async (config: Omit<SensorConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<SensorConfig> => {
  try {
    const response = await api.post('/sensor-configs', config);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la configuration:', error);
    throw error;
  }
};

export const updateSensorConfig = async (configId: string, updates: Partial<SensorConfig>): Promise<SensorConfig> => {
  try {
    const response = await api.put(`/sensor-configs/${configId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la configuration:', error);
    throw error;
  }
};

export const deleteSensorConfig = async (configId: string): Promise<void> => {
  try {
    await api.delete(`/sensor-configs/${configId}`);
  } catch (error) {
    console.error('Erreur lors de la suppression de la configuration:', error);
    throw error;
  }
};

// Diagnostics
export const getSensorDiagnostics = async (sensorId: string): Promise<SensorDiagnostic[]> => {
  try {
    const response = await api.get(`/sensors/${sensorId}/diagnostics`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des diagnostics:', error);
    throw error;
  }
};

// Fonction pour vérifier et envoyer des alertes automatiques
export const checkAndSendAlerts = async (sensor: Sensor, sites: any[]): Promise<void> => {
  try {
    const site = sites.find(s => s.id === sensor.siteId);
    const alerts: any[] = [];

    // Vérifier la batterie
    if (sensor.batteryLevel < 50) {
      alerts.push({
        type: 'BATTERY_LOW',
        severity: determineAlertSeverity(sensor, 'BATTERY_LOW'),
        message: generateTechnicalAlertMessage(sensor, 'BATTERY_LOW'),
        details: {
          sensorName: sensor.name,
          siteName: site?.name || 'Site inconnu',
          currentValue: sensor.batteryLevel,
          threshold: 50,
          unit: '%'
        }
      });
    }

    // Vérifier le signal
    if (sensor.signalStrength < 50) {
      alerts.push({
        type: 'SIGNAL_WEAK',
        severity: determineAlertSeverity(sensor, 'SIGNAL_WEAK'),
        message: generateTechnicalAlertMessage(sensor, 'SIGNAL_WEAK'),
        details: {
          sensorName: sensor.name,
          siteName: site?.name || 'Site inconnu',
          currentValue: sensor.signalStrength,
          threshold: 50,
          unit: '%'
        }
      });
    }

    // Vérifier la précision
    if (sensor.accuracy < 85) {
      alerts.push({
        type: 'ACCURACY_LOW',
        severity: determineAlertSeverity(sensor, 'ACCURACY_LOW'),
        message: generateTechnicalAlertMessage(sensor, 'ACCURACY_LOW'),
        details: {
          sensorName: sensor.name,
          siteName: site?.name || 'Site inconnu',
          currentValue: sensor.accuracy,
          threshold: 85,
          unit: '%'
        }
      });
    }

    // Vérifier le statut
    if (sensor.status === 'FAILED') {
      alerts.push({
        type: 'SENSOR_FAILED',
        severity: determineAlertSeverity(sensor, 'SENSOR_FAILED'),
        message: generateTechnicalAlertMessage(sensor, 'SENSOR_FAILED'),
        details: {
          sensorName: sensor.name,
          siteName: site?.name || 'Site inconnu',
          currentValue: 0,
          threshold: 0,
          unit: 'status'
        }
      });
    }

    if (sensor.status === 'MAINTENANCE') {
      alerts.push({
        type: 'MAINTENANCE_NEEDED',
        severity: determineAlertSeverity(sensor, 'MAINTENANCE_NEEDED'),
        message: generateTechnicalAlertMessage(sensor, 'MAINTENANCE_NEEDED'),
        details: {
          sensorName: sensor.name,
          siteName: site?.name || 'Site inconnu',
          currentValue: 0,
          threshold: 0,
          unit: 'status'
        }
      });
    }

    // Vérifier la calibration
    if (sensor.lastCalibrationDate) {
      const lastCalibration = new Date(sensor.lastCalibrationDate);
      const daysSinceCalibration = (Date.now() - lastCalibration.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceCalibration > 30) {
        alerts.push({
          type: 'CALIBRATION_DUE',
          severity: determineAlertSeverity(sensor, 'CALIBRATION_DUE'),
          message: generateTechnicalAlertMessage(sensor, 'CALIBRATION_DUE'),
          details: {
            sensorName: sensor.name,
            siteName: site?.name || 'Site inconnu',
            currentValue: daysSinceCalibration,
            threshold: 30,
            unit: 'jours'
          }
        });
      }
    }

    // Envoyer les alertes
    for (const alert of alerts) {
      await sendTechnicalAlert({
        sensorId: sensor.id,
        siteId: sensor.siteId,
        ...alert
      });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des alertes:', error);
  }
};

// Fonction pour envoyer une alerte de mise à jour de capteur
export const sendSensorUpdateAlert = async (sensor: Sensor, updateType: 'CREATED' | 'UPDATED' | 'DELETED', sites: any[]): Promise<void> => {
  try {
    const site = sites.find(s => s.id === sensor.siteId);
    const message = `Capteur ${sensor.name} (${site?.name || 'Site inconnu'}) ${updateType === 'CREATED' ? 'créé' : updateType === 'UPDATED' ? 'mis à jour' : 'supprimé'}`;
    
    await sendTechnicalAlert({
      sensorId: sensor.id,
      siteId: sensor.siteId,
      type: 'MAINTENANCE_NEEDED',
      severity: 'MEDIUM',
      message,
      details: {
        sensorName: sensor.name,
        siteName: site?.name || 'Site inconnu',
        currentValue: 0,
        threshold: 0,
        unit: 'update'
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'alerte de mise à jour:', error);
  }
};