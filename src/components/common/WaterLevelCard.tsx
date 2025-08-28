import { Droplets, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { getLatestWaterLevel } from '../../services/waterLevelService';

interface WaterLevelCardProps {
  siteId: string;
  capacity: number;
  title?: string;
  showPercentage?: boolean;
  className?: string;
  refreshInterval?: number; // en millisecondes
}

export default function WaterLevelCard({ 
  siteId, 
  capacity, 
  title = 'Water Level',
  showPercentage = true, 
  className = '',
  refreshInterval = 30000 // 30 secondes par défaut
}: WaterLevelCardProps) {
  const [level, setLevel] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les données
  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await getLatestWaterLevel(siteId);
      
      if (data) {
        setLevel(data.level);
        setLastUpdate(new Date(data.timestamp));
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching water level data:', err);
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [siteId]);

  // Chargement initial
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mise à jour périodique
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(loadData, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [loadData, refreshInterval]);

  // Gestion du rafraîchissement manuel
  const handleRefresh = () => {
    if (!isRefreshing) {
      loadData();
    }
  };

  const percentage = Math.min(100, Math.max(0, Math.round((level / capacity) * 100)));
  const color = percentage >= 60 ? 'bg-green-500' : percentage >= 30 ? 'bg-yellow-500' : 'bg-red-500';
  const textColor = percentage >= 60 ? 'text-green-600' : percentage >= 30 ? 'text-yellow-600' : 'text-red-600';

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm border border-red-200 ${className}`}>
        <div className="text-red-500 text-sm">{error}</div>
        <button 
          onClick={handleRefresh}
          className="mt-2 text-xs text-blue-500 hover:text-blue-700 flex items-center"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Droplets className="h-4 w-4 mr-2 text-blue-500" />
          <span className="text-sm font-medium text-gray-600">{title}</span>
        </div>
        <div className="flex items-center">
          {showPercentage && (
            <span className={`text-sm font-medium mr-2 ${textColor}`}>
              {percentage}%
            </span>
          )}
          <button 
            onClick={handleRefresh}
            className="text-gray-400 hover:text-blue-500 transition-colors"
            disabled={isRefreshing}
            title="Rafraîchir"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{level.toFixed(1)} / {capacity} L</span>
        <span>Mis à jour: {lastUpdate.toLocaleTimeString('fr-FR')}</span>
      </div>
    </div>
  );
}
