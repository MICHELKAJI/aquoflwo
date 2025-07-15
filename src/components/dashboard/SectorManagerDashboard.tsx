import React, { useState, useEffect } from 'react';
import { Droplets, Users, Phone, AlertTriangle, MapPin, Plus, Bell, Filter } from 'lucide-react';
import StatCard from '../common/StatCard';
import WaterLevelChart from '../common/WaterLevelChart';
import type { Site, User, Notification, Alert } from '../../types';
import { generateWaterLevelData } from '../../utils/mockData';
import { useAlerts } from '../../hooks/useAlerts';
import AlertList from '../alerts/AlertList';
import { createHousehold } from '../../services/householdService';
import { createNotification } from '../../services/notificationService';

// @ts-ignore - Forcing recompilation
interface SectorManagerDashboardProps {
  currentUser: User;
  site: Site;
  notifications: Notification[];
}

export default function SectorManagerDashboard({ currentUser, site, notifications }: SectorManagerDashboardProps) {
  const [showAddHouseholdModal, setShowAddHouseholdModal] = useState(false);
  const [showAddNotificationModal, setShowAddNotificationModal] = useState(false);
  const [newHousehold, setNewHousehold] = useState({
    name: '',
    contact: '',
    address: '',
    siteId: '',
    isActive: true
  });
  const [newNotification, setNewNotification] = useState({
    message: '',
    type: 'info',
    priority: 'normal'
  });
  const [alertFilters, setAlertFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'households' | 'autoAlerts' | 'siteAlerts'>('dashboard');

  const { alerts, loading: alertsLoading, updateAlert } = useAlerts();
  const [siteAlerts, setSiteAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    setSiteAlerts(alerts.filter(alert => alert.siteId === site.id));
  }, [alerts, site.id]);

  // Ajout des logs pour déboguer
  console.log('Site:', site);
  console.log('Households:', site?.households);
  console.log('Active Households:', site?.households?.filter(h => h.isActive));

  const levelPercentage = Math.round((site.currentLevel / site.reservoirCapacity) * 100);
  const chartData = generateWaterLevelData(site.id, 14);
  const siteNotifications = notifications.filter(n => n.siteId === site.id);
  const emergencyContacts = site.households?.filter(h => h.isActive) || [];

  const handleEmergencyAlert = () => {
    alert('Alerte d\'urgence envoyée à l\'administration et aux ménages du secteur.');
  };

  const handleAddHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHousehold({
        ...newHousehold,
        siteId: site.id,
        updatedAt: new Date().toISOString()
      });

      setShowAddHouseholdModal(false);
      setNewHousehold({
        name: '',
        contact: '',
        address: '',
        siteId: '',
        isActive: true
      });
      // Rafraîchir la liste des ménages
      window.location.reload();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout du ménage');
    }
  };

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createNotification({
        type: 'GENERAL',
        message: newNotification.message,
        status: 'PENDING',
        siteId: site.id,
        recipients: site.households?.map(h => h.contact) || [],
        sentById: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setShowAddNotificationModal(false);
      setNewNotification({
        message: '',
        type: 'info',
        priority: 'normal'
      });
      // Rafraîchir la liste des notifications
      window.location.reload();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la notification');
    }
  };

  // Fonction pour filtrer les alertes
  const getFilteredAlerts = () => {
    return siteAlerts.filter(alert => {
      const typeMatch = alertFilters.type === 'all' || alert.type === alertFilters.type;
      const statusMatch = alertFilters.status === 'all' || 
        (alertFilters.status === 'active' && alert.isActive) ||
        (alertFilters.status === 'resolved' && !alert.isActive);
      
      let dateMatch = true;
      if (alertFilters.dateRange !== 'all') {
        const alertDate = new Date(alert.createdAt);
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        
        switch (alertFilters.dateRange) {
          case 'today':
            dateMatch = alertDate.toDateString() === now.toDateString();
            break;
          case 'week':
            dateMatch = (now.getTime() - alertDate.getTime()) <= 7 * oneDay;
            break;
          case 'month':
            dateMatch = (now.getTime() - alertDate.getTime()) <= 30 * oneDay;
            break;
        }
      }
      
      return typeMatch && statusMatch && dateMatch;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Menu horizontal (onglets) */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none transition-all ${activeTab === 'dashboard' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none transition-all ${activeTab === 'households' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300'}`}
            onClick={() => setActiveTab('households')}
          >
            Sector Households
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none transition-all ${activeTab === 'autoAlerts' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300'}`}
            onClick={() => setActiveTab('autoAlerts')}
          >
            Automatic Alerts
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none transition-all ${activeTab === 'siteAlerts' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300'}`}
            onClick={() => setActiveTab('siteAlerts')}
          >
            Site Alerts
          </button>
        </nav>
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Statistiques principales */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              title="Capacité du réservoir"
              value={`${site.reservoirCapacity.toLocaleString()} L`}
              icon={MapPin}
              color="blue"
            />
            <StatCard
              title="Niveau actuel"
              value={`${site.currentLevel.toLocaleString()} L`}
              icon={Droplets}
              color={levelPercentage >= 60 ? 'green' : levelPercentage >= 30 ? 'yellow' : 'red'}
            />
            <StatCard
              title="Estimation (%)"
              value={`${levelPercentage}%`}
              icon={Droplets}
              color={levelPercentage >= 60 ? 'green' : levelPercentage >= 30 ? 'yellow' : 'red'}
            />
            <StatCard
              title="Ménages du secteur"
              value={`${(site.households ?? []).length}`}
              icon={Users}
              color="blue"
            />
          </div>
          {/* Infos importantes du site */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col justify-between">
              <div>
                <h1 className="text-2xl font-bold text-blue-900 mb-2">{site.name}</h1>
                <p className="text-sm text-gray-600 mb-1">Adresse : <span className="font-medium text-gray-900">{site.address}</span></p>
                <p className="text-sm text-gray-600 mb-1">Responsable : <span className="font-medium text-gray-900">{currentUser.name}</span></p>
                <p className="text-sm text-gray-600 mb-1">Capacité : <span className="font-medium text-gray-900">{site.reservoirCapacity.toLocaleString()} L</span></p>
                <p className="text-sm text-gray-600 mb-1">Niveau actuel : <span className="font-medium text-gray-900">{site.currentLevel.toLocaleString()} L</span></p>
                <p className="text-sm text-gray-600 mb-1">Dernier remplissage : <span className="font-medium text-gray-900">{new Date(site.createdAt).toLocaleDateString('fr-FR')}</span></p>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      levelPercentage >= 60 ? 'bg-green-500' :
                      levelPercentage >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${levelPercentage}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">{levelPercentage}%</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6 flex items-center justify-center">
              <WaterLevelChart 
                data={chartData} 
                capacity={site.reservoirCapacity}
                height={300}
              />
            </div>
          </div>
        </div>
      )}
      {activeTab === 'households' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Ménages du secteur</h2>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {(site.households ?? []).length > 0 ? (site.households ?? []).map(household => (
              <div key={household.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{household.name}</h4>
                    <p className="text-xs text-gray-600">{household.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{household.contact}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500">Aucun ménage enregistré.</div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'autoAlerts' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Alertes automatiques</h2>
          <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
            {siteNotifications.filter(n => n.type === 'EMERGENCY' || n.type === 'LOW_LEVEL').length > 0 ? (
              siteNotifications
                .filter(n => n.type === 'EMERGENCY' || n.type === 'LOW_LEVEL')
                .slice(0, 10)
                .map(notification => (
                  <div key={notification.id} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${
                        notification.type === 'EMERGENCY' ? 'bg-red-100 text-red-600' :
                        notification.type === 'LOW_LEVEL' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <AlertTriangle className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.sentAt).toLocaleDateString('fr-FR')} à {new Date(notification.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="p-8 text-center text-gray-500">Aucune alerte automatique.</div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'siteAlerts' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Alertes du site</h2>
          <AlertList
            alerts={siteAlerts}
            onUpdateAlert={updateAlert}
          />
        </div>
      )}
      {/* Modals... (inchangés) */}
      {/* Modal d'ajout de ménage */}
      {showAddHouseholdModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add new household
            </h2>

            <form onSubmit={handleAddHousehold} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Household name
                </label>
                <input
                  type="text"
                  value={newHousehold.name}
                  onChange={(e) => setNewHousehold({ ...newHousehold, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact (phone)
                </label>
                <input
                  type="tel"
                  value={newHousehold.contact}
                  onChange={(e) => setNewHousehold({ ...newHousehold, contact: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={newHousehold.address}
                  onChange={(e) => setNewHousehold({ ...newHousehold, address: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddHouseholdModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de création de notification */}
      {showAddNotificationModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create new notification
            </h2>

            <form onSubmit={handleAddNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newNotification.priority}
                  onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddNotificationModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}