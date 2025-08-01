import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  Droplets, 
  DollarSign, 
  BarChart3, 
  Calendar,
  RefreshCw
} from 'lucide-react';
import { Site, RefillReportStats as StatsType, RefillReport } from '../../types';
import { getRefillReportStats, getRefillReports } from '../../services/refillReportService';

interface RefillReportStatsProps {
  site: Site;
  onBack: () => void;
}

type StatsPeriod = 7 | 30 | 90;

export default function RefillReportStats({ site, onBack }: RefillReportStatsProps) {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [recentReports, setRecentReports] = useState<RefillReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<StatsPeriod>(30);

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les statistiques
      const statsData = await getRefillReportStats(site.id, selectedPeriod);
      setStats(statsData);
      
      // Récupérer les rapports récents pour les graphiques
      const reportsData = await getRefillReports(site.id, {
        limit: 20,
        startDate: new Date(Date.now() - selectedPeriod * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setRecentReports(reportsData.reports);
      
    } catch (error: any) {
      setError('Erreur lors du chargement des statistiques');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(num));
  };

  const getPeriodLabel = (period: StatsPeriod) => {
    switch (period) {
      case 7: return '7 derniers jours';
      case 30: return '30 derniers jours';
      case 90: return '90 derniers jours';
    }
  };

  // Préparer les données pour les graphiques simples
  const prepareChartData = () => {
    if (!recentReports.length) return { levels: [], volumes: [], dates: [] };
    
    const sortedReports = [...recentReports].sort((a, b) => 
      new Date(a.refillDate).getTime() - new Date(b.refillDate).getTime()
    );
    
    return {
      levels: sortedReports.map(r => r.currentLevel),
      volumes: sortedReports.map(r => r.volumeRefilled),
      dates: sortedReports.map(r => new Date(r.refillDate).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      }))
    };
  };

  const chartData = prepareChartData();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques de Consommation</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques de Consommation</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || 'Erreur lors du chargement des statistiques'}
          <button 
            onClick={fetchStats}
            className="ml-4 text-red-700 hover:text-red-900 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Statistiques de Consommation
            </h1>
            <p className="text-gray-600">{site.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Période:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value) as StatsPeriod)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>7 jours</option>
            <option value={30}>30 jours</option>
            <option value={90}>90 jours</option>
          </select>
          <button
            onClick={fetchStats}
            className="p-2 text-gray-600 hover:text-gray-900"
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Volume Total Rechargé</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(stats.totalVolumeRefilled)} L
              </p>
            </div>
            <Droplets className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {getPeriodLabel(selectedPeriod)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coût Total</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalCost)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.costPerLiter.toFixed(3)} €/L en moyenne
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nombre de Recharges</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.refillCount}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {formatNumber(stats.averageVolumePerRefill)} L par recharge
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consommation Quotidienne</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatNumber(stats.averageDailyConsumption)} L
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Moyenne sur {selectedPeriod} jours
          </p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des niveaux */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution des Niveaux d'Eau
          </h3>
          {chartData.levels.length > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <div className="h-40 flex items-end justify-between gap-1">
                {chartData.levels.map((level, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(level / 100) * 140}px` }}
                      title={`${level}% le ${chartData.dates[index]}`}
                    />
                    <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                      {chartData.dates[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Volumes rechargés */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Volumes Rechargés par Période
          </h3>
          {chartData.volumes.length > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>0L</span>
                <span>{Math.max(...chartData.volumes).toLocaleString()}L</span>
              </div>
              <div className="h-40 flex items-end justify-between gap-1">
                {chartData.volumes.map((volume, index) => {
                  const maxVolume = Math.max(...chartData.volumes);
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${(volume / maxVolume) * 140}px` }}
                        title={`${volume.toLocaleString()}L le ${chartData.dates[index]}`}
                      />
                      <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                        {chartData.dates[index]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Analyse détaillée */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Analyse Détaillée - {getPeriodLabel(selectedPeriod)}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Efficacité</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Coût par litre:</span>
                <span className="font-semibold">{stats.costPerLiter.toFixed(3)} €/L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Volume moyen:</span>
                <span className="font-semibold">{formatNumber(stats.averageVolumePerRefill)} L</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Consommation</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Par jour:</span>
                <span className="font-semibold">{formatNumber(stats.averageDailyConsumption)} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Par recharge:</span>
                <span className="font-semibold">{(stats.period / stats.refillCount).toFixed(1)} jours</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Capacité</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700">Utilisation:</span>
                <span className="font-semibold">
                  {((stats.totalVolumeRefilled / site.reservoirCapacity) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Capacité restante:</span>
                <span className="font-semibold">{site.currentLevel}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations */}
      {stats.refillCount > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Recommandations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Optimisation des coûts</h4>
              <ul className="space-y-1 text-blue-700">
                {stats.costPerLiter > 0.05 && (
                  <li>• Négocier les tarifs avec les fournisseurs</li>
                )}
                {stats.refillCount / (stats.period / 7) > 2 && (
                  <li>• Considérer des recharges moins fréquentes mais plus importantes</li>
                )}
                <li>• Comparer les prix entre différents fournisseurs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Gestion de la consommation</h4>
              <ul className="space-y-1 text-blue-700">
                {stats.averageDailyConsumption > site.reservoirCapacity * 0.1 && (
                  <li>• Surveiller la consommation élevée</li>
                )}
                <li>• Planifier les recharges selon les tendances</li>
                <li>• Mettre en place des alertes préventives</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
