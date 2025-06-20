import { useState, useEffect } from 'react';
import { Alert } from '../types';
import { getAllAlerts, createAlert, updateAlert } from '../services/alertService';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAllAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const addAlert = async (alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newAlert = await createAlert(alertData);
      setAlerts(prev => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  };

  const handleUpdateAlert = async (id: string, alertData: Partial<Alert>) => {
    try {
      const updatedAlert = await updateAlert(id, alertData);
      setAlerts(prev => prev.map(alert => 
        alert.id === id ? updatedAlert : alert
      ));
      return updatedAlert;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    addAlert,
    updateAlert: handleUpdateAlert
  };
} 