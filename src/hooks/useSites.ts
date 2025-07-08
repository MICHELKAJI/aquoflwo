import { useState, useEffect } from 'react';
import { Site } from '../types';
import { getAllSites } from '../services/siteService';

export function useSites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const sites = await getAllSites();
      setSites(sites);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  return { sites, loading, error, refetch: fetchSites };
} 