import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Battery, Signal, Activity, CheckCircle, XCircle, Clock, Mail, MessageSquare, Settings, RefreshCw } from 'lucide-react';
import { TechnicalAlert, NotificationPreferences } from '../../../services/notificationService';
import { getTechnicalAlerts, getTechnicianSiteAlerts, markAlertAsRead, markTechnicianSiteAlertAsRead, getNotificationPreferences, updateNotificationPreferences } from '../../../services/notificationService';

interface TechnicalAlertsProps {
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

export default function TechnicalAlerts({ currentUser }: TechnicalAlertsProps) {
  const [alerts, setAlerts] = useState<TechnicalAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<TechnicalAlert[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    fetchAlerts();
    fetchPreferences();
  }, []);

  useEffect(() => {
    // Filtrer les alertes selon les critères sélectionnés
    let filtered = alerts;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(alert => alert.type === filterType);
    }
    
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filterSeverity);
    }
    
    setFilteredAlerts(filtered);
  }, [alerts, filterType, filterSeverity]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Récupérer les alertes liées aux sites du technicien et les alertes générées par les capteurs
      const data = await getTechnicianSiteAlerts(currentUser.id);
      setAlerts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const data = await getNotificationPreferences(currentUser.id);
      setPreferences(data);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des préférences:', err);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      // Utiliser la nouvelle fonction pour les alertes des sites du technicien
      await markTechnicianSiteAlertAsRead(alertId);
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
      // Mettre à jour aussi les alertes filtrées
      setFilteredAlerts(filteredAlerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadAlertIds = alerts.filter(alert => !alert.isRead).map(alert => alert.id);
      
      // Marquer toutes les alertes non lues comme lues
      await Promise.all(unreadAlertIds.map(alertId => markTechnicianSiteAlertAsRead(alertId)));
      
      // Mettre à jour l'état local
      setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
      setFilteredAlerts(filteredAlerts.map(alert => ({ ...alert, isRead: true })));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!preferences) return;
    
    try {
      const updatedPreferences = await updateNotificationPreferences(currentUser.id, updates);
      setPreferences(updatedPreferences);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getSeverityColor = (severity: TechnicalAlert['severity']) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: TechnicalAlert['type']) => {
    switch (type) {
      case 'BATTERY_LOW': return <Battery className="h-5 w-5" />;
      case 'SIGNAL_WEAK': return <Signal className="h-5 w-5" />;
      case 'ACCURACY_LOW': return <Activity className="h-5 w-5" />;
      case 'SENSOR_FAILED': return <AlertTriangle className="h-5 w-5" />;
      case 'MAINTENANCE_NEEDED': return <AlertTriangle className="h-5 w-5" />;
      case 'CALIBRATION_DUE': return <Clock className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getAlertTypeLabel = (type: TechnicalAlert['type']) => {
    switch (type) {
      case 'BATTERY_LOW': return 'Batterie Faible';
      case 'SIGNAL_WEAK': return 'Signal Faible';
      case 'ACCURACY_LOW': return 'Précision Faible';
      case 'SENSOR_FAILED': return 'Capteur Défaillant';
      case 'MAINTENANCE_NEEDED': return 'Maintenance Requise';
      case 'CALIBRATION_DUE': return 'Calibration Due';
      default: return 'Alerte Technique';
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const criticalAlerts = alerts.filter(alert => alert.severity === 'CRITICAL' && !alert.isRead);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alertes Techniques</h2>
          <p className="text-gray-600">Notifications sur l'état des capteurs</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <Settings className="h-5 w-5" />
            <span>Préférences</span>
          </button>
          <button
            onClick={fetchAlerts}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alertes Non Lues</p>
              <p className="text-2xl font-bold text-gray-900">{unreadAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critiques</p>
              <p className="text-2xl font-bold text-gray-900">{criticalAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Alertes</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lues</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.filter(a => a.isRead).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Préférences de notification */}
      {showPreferences && preferences && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Préférences de Notification</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Notifications Email</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => handleUpdatePreferences({ emailNotifications: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Notifications SMS</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.smsNotifications}
                    onChange={(e) => handleUpdatePreferences({ smsNotifications: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Notifications Push</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.pushNotifications}
                    onChange={(e) => handleUpdatePreferences({ pushNotifications: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Alertes Techniques</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.technicalAlerts}
                    onChange={(e) => handleUpdatePreferences({ technicalAlerts: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Rappels Maintenance</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.maintenanceReminders}
                    onChange={(e) => handleUpdatePreferences({ maintenanceReminders: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-gray-700">Alertes Critiques</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.criticalAlerts}
                    onChange={(e) => handleUpdatePreferences({ criticalAlerts: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des alertes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
                     <div className="flex items-center justify-between">
             <h3 className="text-lg font-medium text-gray-900">Alertes des Sites ({alerts.length})</h3>
             <div className="flex items-center space-x-3">
               {unreadAlerts.length > 0 && (
                 <button
                   onClick={handleMarkAllAsRead}
                   className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-700"
                   title="Marquer toutes comme lues"
                 >
                   <CheckCircle className="h-4 w-4" />
                   <span>Tout marquer comme lu</span>
                 </button>
               )}
               <button
                 onClick={fetchAlerts}
                 className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
               >
                 <RefreshCw className="h-4 w-4" />
                 <span>Actualiser</span>
               </button>
             </div>
           </div>
          <p className="text-sm text-gray-600 mt-1">
            Alertes liées aux sites du technicien et alertes générées par les capteurs
          </p>
          
          {/* Filtres */}
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="all">Tous les types</option>
                <option value="BATTERY_LOW">Batterie faible</option>
                <option value="SIGNAL_WEAK">Signal faible</option>
                <option value="ACCURACY_LOW">Précision faible</option>
                <option value="SENSOR_FAILED">Capteur défaillant</option>
                <option value="MAINTENANCE_NEEDED">Maintenance requise</option>
                <option value="CALIBRATION_DUE">Calibration due</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sévérité:</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="all">Toutes</option>
                <option value="CRITICAL">Critique</option>
                <option value="HIGH">Élevée</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="LOW">Faible</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {alerts.length === 0 ? 'Aucune alerte technique' : 'Aucune alerte ne correspond aux filtres'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`p-4 border rounded-lg ${alert.isRead ? 'bg-gray-50' : 'bg-white'} ${
                    alert.severity === 'CRITICAL' ? 'border-red-200' :
                    alert.severity === 'HIGH' ? 'border-orange-200' :
                    alert.severity === 'MEDIUM' ? 'border-yellow-200' :
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{getAlertTypeLabel(alert.type)}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          {!alert.isRead && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </div>
                                                 <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                         {alert.details && (
                           <div className="grid grid-cols-2 gap-4 text-sm">
                             <div>
                               <span className="text-gray-500">Capteur:</span>
                               <span className="ml-1 font-medium">{alert.details.sensorName || 'N/A'}</span>
                             </div>
                             <div>
                               <span className="text-gray-500">Site:</span>
                               <span className="ml-1 font-medium">{alert.details.siteName || 'N/A'}</span>
                             </div>
                             {alert.details.currentValue > 0 && (
                               <>
                                 <div>
                                   <span className="text-gray-500">Valeur actuelle:</span>
                                   <span className="ml-1 font-medium">{alert.details.currentValue} {alert.details.unit}</span>
                                 </div>
                                 <div>
                                   <span className="text-gray-500">Seuil:</span>
                                   <span className="ml-1 font-medium">{alert.details.threshold} {alert.details.unit}</span>
                                 </div>
                               </>
                             )}
                           </div>
                         )}
                                                 <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                           <span>Source: {alert.type.includes('SENSOR') ? 'Capteur' : 'Système'}</span>
                           <span>•</span>
                           <span>ID: {alert.sensorId || 'N/A'}</span>
                         </div>
                                                 <p className="text-xs text-gray-500 mt-2">
                           {alert.createdAt ? new Date(alert.createdAt).toLocaleString('fr-FR') : 'Date inconnue'}
                         </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Marquer comme lu"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
} 