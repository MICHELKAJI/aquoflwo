import React, { useState } from 'react';
import { Bell, Send, AlertTriangle, Droplets, Wrench, Users, Plus, X } from 'lucide-react';
import { Notification, Site } from '../../types';
import { useNavigate } from 'react-router-dom';
import { createNotification } from '../../services/notificationService';

interface NotificationsCenterProps {
  notifications: Notification[];
  sites: Site[];
  onSendNotification: (notification: Omit<Notification, 'id' | 'sentAt' | 'sentById'>) => void;
  onShowDashboard: () => void;
}

export default function NotificationsCenter({ notifications, sites, onSendNotification, onShowDashboard }: NotificationsCenterProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'LOW_LEVEL' | 'MAINTENANCE' | 'EMERGENCY'>('all');
  const [isVisible, setIsVisible] = useState(true);

  // Ajout des logs pour déboguer
  console.log('Notifications reçues:', notifications);
  console.log('Sites reçus:', sites);
  console.log('Type sélectionné:', selectedType);
  console.log('Notifications filtrées:', notifications.filter(notification => 
    selectedType === 'all' || notification.type === selectedType
  ));

  const handleClose = () => {
    onShowDashboard();
  };

  if (!isVisible) return null;

  const filteredNotifications = notifications.filter(notification => 
    selectedType === 'all' || notification.type === selectedType
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LOW_LEVEL': return AlertTriangle;
      case 'GENERAL': return Bell;
      case 'EMERGENCY': return AlertTriangle;
      case 'MAINTENANCE': return Wrench;
      case 'REFILL': return Droplets;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LOW_LEVEL': return 'text-yellow-600 bg-yellow-100';
      case 'GENERAL': return 'text-blue-600 bg-blue-100';
      case 'EMERGENCY': return 'text-red-600 bg-red-100';
      case 'MAINTENANCE': return 'text-purple-600 bg-purple-100';
      case 'REFILL': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-800 bg-green-100';
      case 'failed': return 'text-red-800 bg-red-100';
      case 'pending': return 'text-yellow-800 bg-yellow-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const handleCreateNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const siteId = formData.get('siteId') as string;
    const site = sites.find(s => s.id === siteId);
    const recipients = site?.households?.map(h => h.contact) || [];

    const newNotification = {
      type: formData.get('type') as 'LOW_LEVEL' | 'REFILL' | 'MAINTENANCE' | 'EMERGENCY' | 'GENERAL',
      message: formData.get('message') as string,
      status: 'PENDING' as const,
      siteId: siteId || '',
      recipients: recipients,
      sentById: 'current-user-id', // ← Ajouter cette ligne
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await createNotification(newNotification);
      setShowCreateForm(false);
    } catch (error) {
      // Gérer l'erreur
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage SMS alerts and automatic notifications
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Notification</span>
          </button>
          <button
            onClick={handleClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'LOW_LEVEL', label: 'Low Levels', count: notifications.filter(n => n.type === 'LOW_LEVEL').length },
            { id: 'MAINTENANCE', label: 'Maintenance', count: notifications.filter(n => n.type === 'MAINTENANCE').length },
            { id: 'EMERGENCY', label: 'Emergencies', count: notifications.filter(n => n.type === 'EMERGENCY').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id as 'all' | 'LOW_LEVEL' | 'MAINTENANCE' | 'EMERGENCY')}
              className={`${
                selectedType === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => {
              const TypeIcon = getTypeIcon(notification.type);
              const site = sites.find(s => s.id === notification.siteId);
              
              return (
                <div key={notification.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.message}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(notification.status)}`}>
                          {notification.status === 'SENT' ? 'Sent' :
                           notification.status === 'FAILED' ? 'Failed' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          {new Date(notification.sentAt).toLocaleDateString('en-US')} at {new Date(notification.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {site && (
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {site.name}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Send className="h-4 w-4 mr-1" />
                          {notification.recipients?.length ? `${notification.recipients.length} recipient(s)` : 'No recipient'}
                        </span>
                      </div>
                      
                      {notification.recipients?.length > 0 && (
                        <div className="mt-3">
                          <details className="text-xs">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                              View recipients ({notification.recipients.length})
                            </summary>
                            <div className="mt-2 pl-4 border-l-2 border-gray-200">
                              <div className="text-gray-600 space-y-1">
                                {notification.recipients.map((recipient, index) => (
                                  <div key={index} className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                    {recipient}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p>No notifications match the selected filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Notification Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">New Notification</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification type
                </label>
                <select
                  name="type"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW_LEVEL">Low level</option>
                  <option value="REFILL">Refill done</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concerned site
                </label>
                <select
                  name="siteId"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a site</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>
                      {site.name} ({site.households?.length || 0} households)
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Recipients will automatically be the contacts of the households of the selected site
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your message..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                >
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}