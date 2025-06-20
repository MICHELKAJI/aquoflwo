import React, { useState, useEffect } from 'react';
import { Droplets, Users, MapPin, AlertTriangle, Plus } from 'lucide-react';
import StatCard from '../common/StatCard';
import WaterLevelChart from '../common/WaterLevelChart';
import { Site, Notification, User } from '../../types';
import { getAllSites } from '../../services/siteService';
import { getAllNotifications } from '../../services/notificationService';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  sites: Site[];
  notifications: Notification[];
}

export default function AdminDashboard({ onNavigate, sites, notifications }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
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
      try {
        setLoading(true);
        console.log('Début de la récupération des données...');
        
        const [sitesData, notificationsData] = await Promise.all([
          getAllSites(),
          getAllNotifications()
        ]);

        console.log('Données récupérées avec succès');
        notifications = notificationsData;
      } catch (err: any) {
        console.error('Erreur lors de la récupération des données:', err);
        setError(err.message);
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création de l\'utilisateur');
      }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

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
    </div>
  );
}