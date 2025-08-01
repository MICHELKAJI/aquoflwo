import React, { useState, useEffect } from 'react';
import { Droplets, Users, MapPin, AlertTriangle, Plus, Home, Activity, FileText } from 'lucide-react';
import StatCard from '../common/StatCard';
import WaterLevelChart from '../common/WaterLevelChart';
import { Site, Notification, User, Sensor } from '../../types';
import { getAllSites } from '../../services/siteService';
import { getAllNotifications } from '../../services/notificationService';
import { createUser, getAllUsers } from '../../services/userService';
import { getAllSensors } from '../../services/sensorService';
import AdminRefillReportsOverview from '../refill/AdminRefillReportsOverview';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  sites: Site[];
  notifications: Notification[];
}

export default function AdminDashboard({ onNavigate, sites: initialSites, notifications: initialNotifications }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'lists' | 'refillReports'>('overview');
  const [activeListTab, setActiveListTab] = useState<'sites' | 'users' | 'households' | 'sensors'>('sites');
  const [sites, setSites] = useState<Site[]>(initialSites || []);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || []);
  const [users, setUsers] = useState<User[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'USER'
  });
  const [userError, setUserError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ajouter un délai entre les requêtes pour éviter les erreurs 429
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        
        // Récupérer les données avec des délais entre chaque requête
        const [sitesData, usersData, sensorsData, notificationsData] = await Promise.all([
          getAllSites().catch(err => {
            console.warn('Erreur lors de la récupération des sites:', err);
            return [];
          }),
          delay(100).then(() => getAllUsers().catch(err => {
            console.warn('Erreur lors de la récupération des utilisateurs:', err);
            return [];
          })),
          delay(200).then(() => getAllSensors().catch(err => {
            console.warn('Erreur lors de la récupération des capteurs:', err);
            return [];
          })),
          delay(300).then(() => getAllNotifications().catch(err => {
            console.warn('Erreur lors de la récupération des notifications:', err);
            return [];
          }))
        ]);

        setSites(sitesData);
        setUsers(usersData);
        setSensors(sensorsData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        // Ne pas afficher d'alerte pour éviter de spammer l'utilisateur
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalCapacity = sites?.reduce((sum, site) => sum + site.reservoirCapacity, 0) || 0;
  const totalCurrentLevel = sites?.reduce((sum, site) => sum + site.currentLevel, 0) || 0;
  const averageLevel = totalCapacity > 0 ? Math.round((totalCurrentLevel / totalCapacity) * 100) : 0;
  
  const criticalSites = sites?.filter(site => (site.currentLevel / site.reservoirCapacity) < 0.3) || [];
  const totalHouseholds = sites?.reduce((sum, site) => sum + (site.households?.length || 0), 0) || 0;
  const recentNotifications = notifications?.filter(n => 
    new Date(n.sentAt).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000
  ) || [];

  // Filtrer les données par type
  const allHouseholds = sites.flatMap(site => site.households || []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');

    try {
      await createUser({ 
        ...newUser, 
        updatedAt: new Date().toISOString(), 
        role: newUser.role as "USER" | "SECTOR_MANAGER" | "ADMIN" | "TECHNICIAN"
      });
      setShowUserModal(false);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'USER'
      });
    } catch (error: any) {
      setUserError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderOverview = () => (
    <>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Sites"
          value={sites?.length || 0}
          icon={MapPin}
          color="blue"
          onClick={() => onNavigate('sites')}
        />
        <StatCard
          title="Average Level"
          value={`${averageLevel}%`}
          icon={Droplets}
          color={averageLevel >= 60 ? 'green' : averageLevel >= 30 ? 'yellow' : 'red'}
          trend={{ value: 5, isPositive: averageLevel > 50 }}
        />
        <StatCard
          title="Active Alerts"
          value={criticalSites.length}
          icon={AlertTriangle}
          color={criticalSites.length === 0 ? 'green' : 'red'}
          onClick={() => onNavigate('notifications')}
        />
        <StatCard
          title="Served Households"
          value={totalHouseholds}
          icon={Users}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Water Level Chart */}
      {!error && sites?.length > 0 && (
        <div className="mb-8">
          <WaterLevelChart 
            data={sites.map(site => ({
              timestamp: new Date(site.createdAt),
              level: site.currentLevel,
              siteId: site.id
            }))}
            capacity={totalCapacity}
          />
        </div>
      )}

      {/* Sites Status Grid */}
      {!error && sites?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {sites.map(site => {
            const levelPercentage = Math.round((site.currentLevel / site.reservoirCapacity) * 100);
            
            return (
              <div key={site.id} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{site.name}</h3>
                      <p className="text-sm text-gray-600">{site.address}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Sector Manager: {site.sectorManager?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        levelPercentage >= 60 ? 'text-green-600' :
                        levelPercentage >= 30 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {levelPercentage}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {site.currentLevel.toLocaleString()} / {site.reservoirCapacity.toLocaleString()} L
                      </div>
                    </div>
                  </div>
                  
                  {/* Level Bar */}
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
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {site.households?.length} households served
                    </span>
                    <span className="text-gray-500">
                      Last refill: {new Date(site.createdAt).toLocaleDateString('en-US')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Notifications */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
            <button 
              onClick={() => onNavigate('notifications')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {!error && recentNotifications.length > 0 ? (
            recentNotifications.slice(0, 5).map(notification => (
              <div key={notification.id} className="p-6 flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  notification.type === 'EMERGENCY' ? 'bg-red-100 text-red-600' :
                  notification.type === 'LOW_LEVEL' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.sentAt).toLocaleDateString('en-US')} at {new Date(notification.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className={`px-2 py-1 text-xs rounded-full ${
                  notification.status === 'SENT' ? 'bg-green-100 text-green-800' :
                  notification.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {notification.status === 'SENT' ? 'Sent' :
                   notification.status === 'FAILED' ? 'Failed' : 'Pending'}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{error ? 'Loading error' : 'No recent notifications'}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderLists = () => {
    return (
      <div className="space-y-6">
        {/* Navigation des onglets pour les listes */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveListTab('sites')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeListTab === 'sites'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MapPin className="h-4 w-4 inline mr-2" />
                Sites ({sites.length})
              </button>
              <button
                onClick={() => setActiveListTab('users')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeListTab === 'users'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveListTab('households')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeListTab === 'households'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="h-4 w-4 inline mr-2" />
                Households ({allHouseholds.length})
              </button>
              <button
                onClick={() => setActiveListTab('sensors')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeListTab === 'sensors'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Activity className="h-4 w-4 inline mr-2" />
                Sensors ({sensors.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeListTab === 'sites' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Sites ({sites.length})
                </h3>
                <button
                  onClick={() => onNavigate('sites')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Manage sites
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Households</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sites.map(site => {
                    const levelPercentage = Math.round((site.currentLevel / site.reservoirCapacity) * 100);
                    return (
                      <tr key={site.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{site.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{site.address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`text-sm font-medium ${
                              levelPercentage >= 60 ? 'text-green-600' :
                              levelPercentage >= 30 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {levelPercentage}%
                            </div>
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  levelPercentage >= 60 ? 'bg-green-500' :
                                  levelPercentage >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${levelPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{site.households?.length || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{site.sectorManager?.name || 'Not assigned'}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeListTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Users ({users.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.role === 'SECTOR_MANAGER' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'TECHNICIAN' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString('en-US')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeListTab === 'households' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Households ({allHouseholds.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumption</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allHouseholds.map(household => {
                    const site = sites.find(s => s.households?.some(h => h.id === household.id));
                    return (
                      <tr key={household.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{household.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{household.address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{site?.name || 'Unknown site'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{household.memberCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{household.monthlyConsumption} L/month</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeListTab === 'sensors' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Installed Sensors ({sensors.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sensor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sensors.map(sensor => {
                    const site = sites.find(s => s.id === sensor.siteId);
                    return (
                      <tr key={sensor.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{sensor.name}</div>
                          <div className="text-xs text-gray-500">{sensor.model}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{sensor.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{site?.name || 'Unknown site'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            sensor.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            sensor.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                            sensor.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sensor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${
                            sensor.batteryLevel > 80 ? 'text-green-600' :
                            sensor.batteryLevel > 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {sensor.batteryLevel}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${
                            sensor.accuracy > 95 ? 'text-green-600' :
                            sensor.accuracy > 85 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {sensor.accuracy}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Overview of all water distribution sites
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('sites')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Site
          </button>
          <button
            onClick={() => setShowUserModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            New User
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('lists')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'lists'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Listes détaillées
          </button>
          <button
            onClick={() => setActiveTab('refillReports')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'refillReports'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Rapports de Recharge
          </button>
        </nav>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'lists' && renderLists()}
      {activeTab === 'refillReports' && (
        <AdminRefillReportsOverview />
      )}

      {/* Modal de création d'utilisateur */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create New User
            </h2>

            {userError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {userError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USER">User</option>
                  <option value="SECTOR_MANAGER">Sector Manager</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
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