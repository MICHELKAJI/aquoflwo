import React, { useState, useEffect } from 'react';
import { Wrench, Settings, FileText, Activity, AlertTriangle, CheckCircle, Clock, Battery, Signal, Bell } from 'lucide-react';
import { Sensor, SensorConfig, MaintenanceReport, Site, SensorDiagnostic } from '../../types';
import { getAllSensors, getSensorDiagnostics } from '../../services/sensorService';
import { getAllMaintenanceReports } from '../../services/maintenanceService';
import { getAllSites } from '../../services/siteService';
import SensorManagement from './technician/SensorManagement';
import SensorCalibration from './technician/SensorCalibration';
import SensorDiagnostics from './technician/SensorDiagnostics';
import MaintenanceReports from './technician/MaintenanceReports';
import TechnicalAlerts from './technician/TechnicalAlerts';

interface TechnicianDashboardProps {
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

type TechnicianPage = 'overview' | 'sensors' | 'calibration' | 'diagnostics' | 'reports' | 'alerts';

export default function TechnicianDashboard({ currentUser }: TechnicianDashboardProps) {
  const [currentPage, setCurrentPage] = useState<TechnicianPage>('overview');
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [maintenanceReports, setMaintenanceReports] = useState<MaintenanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Ajouter un délai entre les requêtes pour éviter les erreurs 429
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Récupérer les données avec des délais entre chaque requête
      const [sensorsData, sitesData, reportsData] = await Promise.all([
        getAllSensors().catch(err => {
          console.warn('Erreur lors de la récupération des capteurs:', err);
          return [];
        }),
        delay(100).then(() => getAllSites().catch(err => {
          console.warn('Erreur lors de la récupération des sites:', err);
          return [];
        })),
        delay(200).then(() => getAllMaintenanceReports().catch(err => {
          console.warn('Erreur lors de la récupération des rapports:', err);
          return [];
        }))
      ]);

      setSensors(sensorsData);
      setSites(sitesData);
      setMaintenanceReports(reportsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigation = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
    { id: 'sensors', label: 'Gestion Capteurs', icon: Settings },
    { id: 'calibration', label: 'Calibration', icon: Wrench },
    { id: 'diagnostics', label: 'Diagnostics', icon: AlertTriangle },
    { id: 'reports', label: 'Rapports', icon: FileText },
    { id: 'alerts', label: 'Alertes', icon: Bell },
  ];

  const getStats = () => {
    const totalSensors = sensors.length;
    const activeSensors = sensors.filter(s => s.status === 'ACTIVE').length;
    const maintenanceNeeded = sensors.filter(s => s.status === 'MAINTENANCE').length;
    const failedSensors = sensors.filter(s => s.status === 'FAILED').length;
    const pendingReports = maintenanceReports.filter(r => r.status === 'PENDING').length;
    const urgentReports = maintenanceReports.filter(r => r.priority === 'URGENT').length;

    return {
      totalSensors,
      activeSensors,
      maintenanceNeeded,
      failedSensors,
      pendingReports,
      urgentReports
    };
  };

  const stats = getStats();

  const renderPage = () => {
    switch (currentPage) {
      case 'sensors':
        return (
          <SensorManagement 
            sensors={sensors}
            sites={sites}
            onRefresh={fetchData}
          />
        );
      case 'calibration':
        return (
          <SensorCalibration 
            sensors={sensors}
            sites={sites}
            currentUser={currentUser}
          />
        );
      case 'diagnostics':
        return (
          <SensorDiagnostics 
            sensors={sensors}
            sites={sites}
            currentUser={currentUser}
          />
        );
      case 'reports':
        return (
          <MaintenanceReports 
            maintenanceReports={maintenanceReports}
            sites={sites}
            currentUser={currentUser}
            onRefresh={fetchData}
          />
        );
      case 'alerts':
        return (
          <TechnicalAlerts 
            currentUser={currentUser}
          />
        );
      default:
        return (
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Settings className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Capteurs Totaux</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSensors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Capteurs Actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeSensors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Wrench className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Maintenance Nécessaire</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.maintenanceNeeded}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Capteurs Défaillants</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.failedSensors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rapports en Attente</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Urgences</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.urgentReports}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Capteurs nécessitant une attention */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Capteurs Nécessitant une Attention</h3>
              </div>
              <div className="p-6">
                {sensors.filter(s => s.status !== 'ACTIVE').length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucun capteur nécessite d'attention</p>
                ) : (
                  <div className="space-y-4">
                    {sensors.filter(s => s.status !== 'ACTIVE').map(sensor => (
                      <div key={sensor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            sensor.status === 'FAILED' ? 'bg-red-500' : 
                            sensor.status === 'MAINTENANCE' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`} />
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">{sensor.name}</p>
                            <p className="text-sm text-gray-500">{sensor.type} - {sensor.model}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Battery className="h-4 w-4 mr-1" />
                            {sensor.batteryLevel}%
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Signal className="h-4 w-4 mr-1" />
                            {sensor.signalStrength}%
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            sensor.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            sensor.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sensor.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Technicien</h1>
          <p className="mt-2 text-gray-600">Gestion des capteurs et maintenance du système</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {navigation.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as TechnicianPage)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {renderPage()}
      </div>
    </div>
  );
} 