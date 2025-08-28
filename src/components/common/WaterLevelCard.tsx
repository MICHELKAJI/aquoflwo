import { Droplets } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { waterLevelService, WaterLevelData } from '../../services/waterLevelService';

interface WaterLevelCardProps {
  siteId: string;
  capacity: number;
  title?: string;
  showPercentage?: boolean;
  className?: string;
}

export default function WaterLevelCard({ 
  siteId, 
  capacity, 
  title = 'Water Level',
  showPercentage = true, 
  className = ''
}: WaterLevelCardProps) {
  const [level, setLevel] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time updates via WebSocket
  const handleWaterLevelUpdate = useCallback((data: WaterLevelData) => {
    setLevel(data.level);
    setLastUpdate(new Date());
    setError(null);
  }, []);

  // Initial data fetch
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await waterLevelService.getWaterLevels(siteId);
      if (data && data.length > 0) {
        const lastData = data[data.length - 1];
        setLevel(lastData.level);
        setLastUpdate(new Date(lastData.timestamp));
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching water level data:', err);
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  }, [siteId]);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchInitialData();
    
    // Subscribe to real-time updates
    const unsubscribe = waterLevelService.subscribe(siteId, handleWaterLevelUpdate);
    
    // Cleanup subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, [siteId, fetchInitialData, handleWaterLevelUpdate]);

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
        {showPercentage && (
          <span className={`text-sm font-medium ${textColor}`}>
            {percentage}%
          </span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">0%</span>
        <span className="text-xs text-gray-500">50%</span>
        <span className="text-xs text-gray-500">100%</span>
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        {level.toFixed(1)} cm / {capacity} cm
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Last update: {lastUpdate.toLocaleTimeString('en-US')}
      </div>
    </div>
  );
}
