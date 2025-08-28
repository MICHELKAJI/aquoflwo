import { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getWaterLevels } from '../../services/waterLevelService';

// Définition du type pour les données du capteur
interface SensorWaterLevelData {
  timestamp: string;
  level?: number;
  distance?: number;
  source: string;
  [key: string]: any; // Pour les propriétés supplémentaires
}

interface WaterLevelChartProps {
  siteId: string;
  capacity: number;
  height?: number;
  refreshInterval?: number; // en millisecondes
  simpleMode?: boolean; // Mode simple pour afficher uniquement la barre de progression
  showTitle?: boolean; // Afficher ou non le titre
  showLastUpdate?: boolean; // Afficher ou non la date de dernière mise à jour
  className?: string; // Classes CSS supplémentaires
}

export default function WaterLevelChart({ 
  siteId, 
  capacity, 
  height = 300, 
  refreshInterval = 60000,
  simpleMode = false,
  showTitle = true,
  showLastUpdate = true,
  className = ''
}: WaterLevelChartProps) {
  const [waterLevelData, setWaterLevelData] = useState<SensorWaterLevelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWaterLevels = async () => {
    try {
      setIsLoading(true);
      const data = await getWaterLevels(siteId);
      setWaterLevelData(data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des données de niveau d\'eau:', err);
      setError('Impossible de charger les données du capteur');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Chargement initial
    fetchWaterLevels();

    // Configuration de l'actualisation automatique
    const intervalId = setInterval(fetchWaterLevels, refreshInterval);

    // Nettoyage de l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, [siteId, refreshInterval]);

  // Conversion des données du capteur vers le format attendu par le graphique
  const formatData = waterLevelData.map(item => {
    // Utiliser 'level' si disponible, sinon utiliser 'distance' (pour la rétrocompatibilité)
    const level = 'level' in item ? item.level : (item as any).distance || 0;
    return {
      ...item,
      timestamp: new Date(item.timestamp).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      level,
      percentage: Math.round((level / capacity) * 100),
    };
  });

  const getColor = (percentage: number) => {
    if (percentage >= 60) return '#10b981'; // green
    if (percentage >= 30) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  // Récupérer le dernier niveau d'eau disponible
  const lastDataPoint = waterLevelData[waterLevelData.length - 1];
  const currentLevel = lastDataPoint 
    ? ('level' in lastDataPoint ? lastDataPoint.level : (lastDataPoint as any).distance || 0)
    : 0;
  const currentPercentage = waterLevelData.length > 0 ? Math.round((currentLevel / capacity) * 100) : 0;

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="text-center text-red-500 p-4">
          {error}
          <button 
            onClick={fetchWaterLevels}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Si en mode simple, on affiche uniquement la barre de progression
  if (simpleMode) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-between items-center mb-1">
          {showTitle && <span className="text-sm font-medium text-gray-700">Niveau d'eau</span>}
          <span className="text-sm font-medium">
            {currentLevel.toFixed(1)} cm ({currentPercentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-in-out ${
              currentPercentage >= 60 ? 'bg-green-500' :
              currentPercentage >= 30 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, currentPercentage))}%` }}
          />
        </div>
        {showLastUpdate && (
          <div className="text-xs text-gray-500 mt-1">
            Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
          </div>
        )}
      </div>
    );
  }

  // Mode détaillé avec graphique
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Niveau d'eau en temps réel</h3>
          <p className="text-sm text-gray-500">Site: {siteId}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Niveau actuel: {currentLevel.toFixed(1)} cm
            </div>
            <div className={`text-sm font-bold ${
              currentPercentage >= 60 ? 'text-green-600' :
              currentPercentage >= 30 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {currentPercentage}% de la capacité
            </div>
            <div className="text-xs text-gray-400">
              Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
            </div>
          </div>
        </div>
      </div>
      
      {/* Barre de progression horizontale */}
      <div className="w-full bg-gray-200 rounded-full h-6 mb-6 overflow-hidden relative">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-in-out ${
            currentPercentage >= 60 ? 'bg-green-500' :
            currentPercentage >= 30 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, currentPercentage))}%` }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
            {currentPercentage}%
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-gray-600">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={formatData}>
          <defs>
            <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={getColor(currentPercentage)} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={getColor(currentPercentage)} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="timestamp" 
            className="text-xs text-gray-500"
          />
          <YAxis 
            className="text-xs text-gray-500"
            tickFormatter={(value) => `${Math.round((value / capacity) * 100)}%`}
          />
          <Tooltip 
            formatter={(value: number) => [
              `${value.toFixed(1)} cm (${Math.round((value / capacity) * 100)}%)`,
              'Niveau'
            ]}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Area
            type="monotone"
            dataKey="level"
            stroke={getColor(currentPercentage)}
            strokeWidth={2}
            fill="url(#colorLevel)"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Niveau optimal (60%+)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Niveau modéré (30-60%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Niveau critique (&lt;30%)</span>
        </div>
        <button 
          onClick={fetchWaterLevels}
          className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 text-gray-700 flex items-center"
          title="Actualiser les données"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
      </div>
    </div>
  );
}