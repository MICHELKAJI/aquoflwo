import React, { useState, useEffect } from 'react';
import { Droplets, Users, Phone, AlertTriangle, MapPin, Plus, Bell, Filter } from 'lucide-react';
import StatCard from '../common/StatCard';
import WaterLevelChart from '../common/WaterLevelChart';
import type { Site, User, Notification, Alert } from '../../types';
import { generateWaterLevelData } from '../../utils/mockData';
import { useAlerts } from '../../hooks/useAlerts';
import AlertList from '../alerts/AlertList';

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
      const response = await fetch(`/api/households`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newHousehold,
          siteId: site.id
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du ménage');
      }

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
      const response = await fetch(`/api/sites/${site.id}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newNotification,
          siteId: site.id,
          sentBy: currentUser.id
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la notification');
      }

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Sector - {site.name}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome {currentUser.name}, manager of sector {site.name}
        </p>
      </div>

      {/* Emergency Alert Button */}
      {levelPercentage < 20 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Critical Level Detected</h3>
                <p className="text-xs text-red-600">Reservoir level is dangerously low ({levelPercentage}%)</p>
              </div>
            </div>
            <button
              onClick={handleEmergencyAlert}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Emergency Alert
            </button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Current Level"
          value={`${levelPercentage}%`}
          icon={Droplets}
          color={levelPercentage >= 60 ? 'green' : levelPercentage >= 30 ? 'yellow' : 'red'}
        />
        <StatCard
          title="Served Households"
          value={site.households?.length || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Capacity"
          value={`${site.reservoirCapacity.toLocaleString()} L`}
          icon={MapPin}
          color="blue"
        />
        <StatCard
          title="Current Volume"
          value={`${site.currentLevel.toLocaleString()} L`}
          icon={Droplets}
          color={levelPercentage >= 60 ? 'green' : levelPercentage >= 30 ? 'yellow' : 'red'}
        />
      </div>

      {/* Water Level Chart */}
      <div className="mb-8">
        <WaterLevelChart 
          data={chartData} 
          capacity={site.reservoirCapacity}
          height={350}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Households List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sector Households</h3>
                <p className="text-sm text-gray-600">{site.households?.length} active households</p>
              </div>
              <button
                onClick={() => setShowAddHouseholdModal(true)}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New household
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {site.households?.map(household => (
              <div key={household.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{household.name}</h4>
                    <p className="text-xs text-gray-600">{household.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a 
                      href={`tel:${household.contact}`} 
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {household.contact}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Site Information & History */}
        <div className="space-y-6">
          {/* Site Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Address:</span>
                <span className="text-sm font-medium text-gray-900">{site.address}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last refill:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(site.createdAt).toLocaleDateString('en-US')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Created at:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(site.createdAt).toLocaleDateString('en-US')}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Automatic Alerts</h3>
              <p className="text-sm text-gray-600">Alerts automatically generated based on water level</p>
            </div>
            <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
              {siteNotifications.filter(n => n.type === 'EMERGENCY' || n.type === 'LOW_LEVEL').length > 0 ? (
                siteNotifications
                  .filter(n => n.type === 'EMERGENCY' || n.type === 'LOW_LEVEL')
                  .slice(0, 5)
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
                            {new Date(notification.sentAt).toLocaleDateString('en-US')} at {new Date(notification.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No active alert</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <button
                  onClick={() => setShowAddNotificationModal(true)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  New notification
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
              {siteNotifications.filter(n => n.type === 'GENERAL').length > 0 ? (
                siteNotifications
                  .filter(n => n.type === 'GENERAL')
                  .slice(0, 5)
                  .map(notification => (
                    <div key={notification.id} className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-1 rounded-full bg-blue-100 text-blue-600">
                          <Bell className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.sentAt).toLocaleDateString('en-US')} at {new Date(notification.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No notification</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Site Alerts</h3>
                <p className="text-sm text-gray-600">
                  {siteAlerts.filter(a => a.isActive).length} active alerts
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                      const type = e.target.value;
                      const filtered = type === 'all' 
                        ? siteAlerts 
                        : siteAlerts.filter(alert => alert.type === type);
                      setSiteAlerts(filtered);
                    }}
                  >
                    <option value="all">All types</option>
                    <option value="LOW_LEVEL">Low level</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                      const status = e.target.value;
                      const filtered = status === 'all'
                        ? siteAlerts
                        : siteAlerts.filter(alert => 
                            status === 'active' ? alert.isActive : !alert.isActive
                          );
                      setSiteAlerts(filtered);
                    }}
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            {alertsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading alerts...</p>
              </div>
            ) : (
              <AlertList
                alerts={siteAlerts}
                onUpdateAlert={updateAlert}
              />
            )}
          </div>
        </div>
      </div>

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