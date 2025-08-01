import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { RefillReport, RefillReportFilters, Site, User } from '../../types';
import { getRefillReports, deleteRefillReport, exportRefillReports } from '../../services/refillReportService';
import RefillReportForm from './RefillReportForm';
import RefillReportDetail from './RefillReportDetail';
import RefillReportStats from './RefillReportStats';

interface RefillReportsListProps {
  site: Site;
  currentUser: User;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail' | 'stats';

export default function RefillReportsList({ site, currentUser }: RefillReportsListProps) {
  const [reports, setReports] = useState<RefillReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedReport, setSelectedReport] = useState<RefillReport | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  
  // Filtres
  const [filters, setFilters] = useState<RefillReportFilters>({
    page: 1,
    limit: limit
  });

  const canCreateReports = currentUser.role === 'SECTOR_MANAGER' || currentUser.role === 'ADMIN';
  const canEditReport = (report: RefillReport) => {
    return currentUser.role === 'ADMIN' || 
           (currentUser.role === 'SECTOR_MANAGER' && report.reportedById === currentUser.id);
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await getRefillReports(site.id, filters);
      setReports(response.reports);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (error: any) {
      setError('Erreur lors du chargement des rapports de recharge');
      console.error('Error fetching refill reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (newFilters: Partial<RefillReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      return;
    }

    try {
      await deleteRefillReport(site.id, reportId);
      fetchReports();
    } catch (error: any) {
      setError('Erreur lors de la suppression du rapport');
      console.error('Error deleting report:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const blob = await exportRefillReports(site.id, format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapports-recharge-${site.name}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      setError('Erreur lors de l\'export des rapports');
      console.error('Error exporting reports:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (viewMode === 'create') {
    return (
      <RefillReportForm
        site={site}
        currentUser={currentUser}
        onSuccess={() => {
          setViewMode('list');
          fetchReports();
        }}
        onCancel={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'edit' && selectedReport) {
    return (
      <RefillReportForm
        site={site}
        currentUser={currentUser}
        report={selectedReport}
        onSuccess={() => {
          setViewMode('list');
          fetchReports();
        }}
        onCancel={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'detail' && selectedReport) {
    return (
      <RefillReportDetail
        report={selectedReport}
        site={site}
        currentUser={currentUser}
        onEdit={() => setViewMode('edit')}
        onDelete={() => {
          handleDelete(selectedReport.id);
          setViewMode('list');
        }}
        onBack={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'stats') {
    return (
      <RefillReportStats
        site={site}
        onBack={() => setViewMode('list')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Droplets className="h-6 w-6 text-blue-600" />
            Rapports de Recharge - {site.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Capacité du réservoir: {site.reservoirCapacity.toLocaleString()} L
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('stats')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            Statistiques
          </button>
          
          {canCreateReports && (
            <button
              onClick={() => setViewMode('create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nouveau Rapport
            </button>
          )}
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Filter className="h-4 w-4" />
            Filtres
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="sm:col-span-2 flex justify-end items-end">
              <button
                onClick={() => {
                  setFilters({ page: 1, limit });
                  setShowFilters(false);
                }}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des rapports */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des rapports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun rapport de recharge trouvé</p>
            {canCreateReports && (
              <button
                onClick={() => setViewMode('create')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Créer le premier rapport
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Tableau desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume (L)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Niveau après
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coût
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fournisseur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rapporté par
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(report.refillDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.volumeRefilled.toLocaleString()} L
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.currentLevel}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(report.cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.supplier || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.reportedBy?.name || 'Inconnu'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setViewMode('detail');
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {canEditReport(report) && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setViewMode('edit');
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={() => handleDelete(report.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards mobile */}
            <div className="md:hidden">
              {reports.map((report) => (
                <div key={report.id} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900">
                      {formatDate(report.refillDate)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setViewMode('detail');
                        }}
                        className="text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {canEditReport(report) && (
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setViewMode('edit');
                          }}
                          className="text-green-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Volume: {report.volumeRefilled.toLocaleString()} L</div>
                    <div>Niveau: {report.currentLevel}%</div>
                    <div>Coût: {formatCurrency(report.cost)}</div>
                    <div>Fournisseur: {report.supplier || '-'}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Affichage de {((currentPage - 1) * limit) + 1} à {Math.min(currentPage * limit, total)} sur {total} rapports
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
                      {currentPage} / {totalPages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
