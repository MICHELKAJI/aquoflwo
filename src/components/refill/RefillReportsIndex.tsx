import React from 'react';
import { FileText, BarChart3, Plus, Download, Users, Shield } from 'lucide-react';

interface RefillReportsIndexProps {
  userRole: 'USER' | 'SECTOR_MANAGER' | 'ADMIN' | 'TECHNICIAN';
  onNavigate: (view: 'list' | 'stats' | 'create' | 'admin') => void;
  siteId?: string;
  siteName?: string;
}

export default function RefillReportsIndex({ 
  userRole, 
  onNavigate, 
  siteId, 
  siteName 
}: RefillReportsIndexProps) {
  const canCreateReports = userRole === 'SECTOR_MANAGER' || userRole === 'ADMIN';
  const canViewAllSites = userRole === 'ADMIN';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 flex items-center">
          <FileText className="h-8 w-8 mr-3" />
          Rapports de Recharge
        </h1>
        <p className="mt-2 text-gray-600">
          {siteName 
            ? `Gestion des rapports de recharge pour ${siteName}`
            : 'Gestion des rapports de recharge d\'eau'
          }
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* View Reports */}
        <div 
          onClick={() => onNavigate('list')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900">
              Voir les Rapports
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Consultez la liste complète des rapports de recharge avec filtres et pagination.
          </p>
          <div className="flex items-center text-blue-600 text-sm font-medium">
            Accéder aux rapports
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* View Statistics */}
        <div 
          onClick={() => onNavigate('stats')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900">
              Statistiques
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Analysez les tendances de consommation et les métriques de recharge.
          </p>
          <div className="flex items-center text-green-600 text-sm font-medium">
            Voir les statistiques
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Create New Report - Only for authorized users */}
        {canCreateReports && (
          <div 
            onClick={() => onNavigate('create')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                Nouveau Rapport
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Créez un nouveau rapport de recharge avec tous les détails nécessaires.
            </p>
            <div className="flex items-center text-purple-600 text-sm font-medium">
              Créer un rapport
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Admin Overview - Only for admins */}
        {canViewAllSites && (
          <div 
            onClick={() => onNavigate('admin')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                Vue Administrateur
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Accédez à la vue d'ensemble des rapports pour tous les sites.
            </p>
            <div className="flex items-center text-red-600 text-sm font-medium">
              Vue d'ensemble
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Aperçu Rapide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">--</div>
            <div className="text-sm text-gray-600">Rapports ce mois</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">--</div>
            <div className="text-sm text-gray-600">Volume total (L)</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">--</div>
            <div className="text-sm text-gray-600">Coût moyen</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Cliquez sur "Statistiques" pour voir les données détaillées
        </p>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Guide d'utilisation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Pour les utilisateurs :</h4>
            <ul className="space-y-1">
              <li>• Consultez les rapports de recharge</li>
              <li>• Analysez les statistiques de consommation</li>
              <li>• Exportez les données en CSV/PDF</li>
            </ul>
          </div>
          {canCreateReports && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Pour les gestionnaires :</h4>
              <ul className="space-y-1">
                <li>• Créez de nouveaux rapports</li>
                <li>• Modifiez les rapports existants</li>
                <li>• Supprimez les rapports erronés</li>
                {canViewAllSites && <li>• Gérez tous les sites (Admin)</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
