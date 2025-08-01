import { useState, useEffect } from 'react';
import { 
  Droplets, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Filter,
  Download,
  Eye,
  BarChart3
} from 'lucide-react';
import { Site, RefillReport, RefillReportStats, User } from '../../types';
import { getRefillReports, getRefillReportStats, exportRefillReports } from '../../services/refillReportService';
import { getAllSites } from '../../services/siteService';
import RefillReportDetail from './RefillReportDetail';

interface AdminRefillReportsOverviewProps {
  currentUser: User;
}

interface SiteStats {
  site: Site;
  stats: RefillReportStats;
  recentReports: RefillReport[];
}

export default function AdminRefillReportsOverview({ currentUser }: AdminRefillReportsOverviewProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteStats, setSiteStats] = useState<SiteStats[]>([]);
  const [selectedReport, setSelectedReport] = useState<RefillReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [selectedSite, setSelectedSite] = useState<string>('all');

  useEffect(() => {
    fetchSitesAndStats();
  }, [selectedPeriod]);

  const fetchSitesAndStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer tous les sites
      const sitesData = await getAllSites();
      setSites(sitesData);

      // Récupérer les statistiques pour chaque site
      const statsPromises = sitesData.map(async (site) => {
        try {
          const [stats, reportsData] = await Promise.all([
            getRefillReportStats(site.id, selectedPeriod),
            getRefillReports(site.id, { limit: 5 })
          ]);
          
          return {
            site,
            stats,
            recentReports: reportsData.reports
          };
        } catch (error) {
          console.error(`Error fetching stats for site ${site.id}:`, error);
          return {
            site,
            stats: {
              totalVolumeRefilled: 0,
              totalCost: 0,
              averageVolumePerRefill: 0,
              refillCount: 0,
              averageDailyConsumption: 0,
              costPerLiter: 0,
              period: selectedPeriod
            },
            recentReports: []
          };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      setSiteStats(statsResults);

    } catch (error: any) {
      setError('Erreur lors du chargement des données');
      console.error('Error fetching sites and stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async () => {
    try {
      // Exporter les rapports de tous les sites ou du site sélectionné
      if (selectedSite === 'all') {
        // Pour l'export global, on pourrait créer un endpoint spécial
        // ou exporter site par site et combiner
        alert('Export global en cours de développement');
      } else {
        const blob = await exportRefillReports(selectedSite, 'csv');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapports-recharge-${selectedSite}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error: any) {
      setError('Erreur lors de l\'export');
      console.error('Export error:', error);
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

  const getTotalStats = () => {
    const filteredStats = selectedSite === 'all' 
      ? siteStats 
      : siteStats.filter(s => s.site.id === selectedSite);

    return filteredStats.reduce((acc, { stats }) => ({
      totalVolumeRefilled: acc.totalVolumeRefilled + stats.totalVolumeRefilled,
      totalCost: acc.totalCost + stats.totalCost,
      refillCount: acc.refillCount + stats.refillCount,
      averageDailyConsumption: acc.averageDailyConsumption + stats.averageDailyConsumption
    }), {
      totalVolumeRefilled: 0,
      totalCost: 0,
      refillCount: 0,
      averageDailyConsumption: 0
    });
  };

  const totalStats = getTotalStats();

  if (selectedReport) {
    const reportSite = sites.find(s => s.id === selectedReport.siteId);
    if (reportSite) {
      return (
        <RefillReportDetail
          report={selectedReport}
          site={reportSite}
          currentUser={currentUser}
          onEdit={() => {}} // Admin ne peut pas modifier directement
          onDelete={() => {}} // Admin ne peut pas supprimer directement
          onBack={() => setSelectedReport(null)}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Droplets className="h-6 w-6 text-blue-600" />
            Vue d'Ensemble - Rapports de Recharge
          </h1>
          <p className="text-gray-600 mt-1">
            Supervision de tous les sites et rapports de recharge
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les sites</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>7 jours</option>
            <option value={30}>30 jours</option>
            <option value={90}>90 jours</option>
          </select>
          
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      ) : (
        <>
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Volume Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatNumber(totalStats.totalVolumeRefilled)} L
                  </p>
                </div>
                <Droplets className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {selectedPeriod} derniers jours
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Coût Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalStats.totalCost)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {totalStats.refillCount > 0 ? 
                  `${(totalStats.totalCost / totalStats.totalVolumeRefilled).toFixed(3)} €/L` : 
                  'Aucune donnée'
                }
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recharges</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalStats.refillCount}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {siteStats.filter(s => selectedSite === 'all' || s.site.id === selectedSite).length} site(s)
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Consommation/Jour</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatNumber(totalStats.averageDailyConsumption)} L
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Moyenne combinée
              </p>
            </div>
          </div>

          {/* Liste des sites avec leurs statistiques */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Statistiques par Site
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Site
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coût Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recharges
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Niveau Actuel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Derniers Rapports
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {siteStats
                    .filter(({ site }) => selectedSite === 'all' || site.id === selectedSite)
                    .map(({ site, stats, recentReports }) => (
                    <tr key={site.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {site.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {site.address}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(stats.totalVolumeRefilled)} L
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(stats.totalCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stats.refillCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${site.currentLevel}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900">{site.currentLevel}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-1">
                          {recentReports.slice(0, 3).map((report) => (
                            <button
                              key={report.id}
                              onClick={() => setSelectedReport(report)}
                              className="p-1 text-blue-600 hover:text-blue-900"
                              title={`Rapport du ${new Date(report.refillDate).toLocaleDateString('fr-FR')}`}
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                          ))}
                          {recentReports.length === 0 && (
                            <span className="text-gray-400">Aucun rapport</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Graphique de comparaison des sites */}
          {siteStats.length > 1 && selectedSite === 'all' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Comparaison des Sites
              </h2>
              
              <div className="space-y-4">
                {siteStats.map(({ site, stats }) => (
                  <div key={site.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">{site.name}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>{formatNumber(stats.totalVolumeRefilled)} L</span>
                      <span>{formatCurrency(stats.totalCost)}</span>
                      <span>{stats.refillCount} recharges</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
