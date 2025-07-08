import { useState, useEffect } from 'react';
import { Notification } from '../types';
import { getAllNotifications } from '../services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notifications = await getAllNotifications();
      setNotifications(notifications);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return { notifications, loading, error, refetch: fetchNotifications };
} 