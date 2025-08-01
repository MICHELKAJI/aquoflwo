import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, AlertTriangle, Clock, Save, RotateCcw } from 'lucide-react';
import { NotificationSettings } from '../../types/settings';
import { getNotificationSettings, updateNotificationSettings, resetToDefaults } from '../../services/settingsService';

interface NotificationSettingsPanelProps {
  onSettingsChange: () => void;
}

export default function NotificationSettingsPanel({ onSettingsChange }: NotificationSettingsPanelProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: {
      enabled: false,
      recipients: [],
      alert_types: ['CRITICAL', 'HIGH'],
      frequency: 'immediate'
    },
    sms_notifications: {
      enabled: false,
      recipients: [],
      alert_types: ['CRITICAL'],
      frequency: 'immediate'
    },
    push_notifications: {
      enabled: false,
      alert_types: ['CRITICAL', 'HIGH', 'MEDIUM'],
      critical_only: false
    },
    technical_alerts: {
      enabled: false,
      severity_levels: ['CRITICAL', 'HIGH'],
      auto_escalation: false,
      escalation_delay: 30
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getNotificationSettings();
      setSettings(data);
    } catch (error: any) {
      setError('Error loading notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (category: keyof NotificationSettings, field: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field]
      }
    }));
    onSettingsChange();
  };

  const handleSettingChange = (
    category: keyof NotificationSettings,
    field: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    onSettingsChange();
  };

  const handleAddRecipient = (type: 'email' | 'sms') => {
    const value = type === 'email' ? newEmail : newPhone;
    if (!value) return;

    const category = type === 'email' ? 'email_notifications' : 'sms_notifications';
    const currentRecipients = settings[category].recipients;
    
    if (!currentRecipients.includes(value)) {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          recipients: [...currentRecipients, value]
        }
      }));
      onSettingsChange();
    }

    if (type === 'email') setNewEmail('');
    else setNewPhone('');
  };

  const handleRemoveRecipient = (type: 'email' | 'sms', recipient: string) => {
    const category = type === 'email' ? 'email_notifications' : 'sms_notifications';
    const currentRecipients = settings[category].recipients;
    
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        recipients: currentRecipients.filter(r => r !== recipient)
      }
    }));
    onSettingsChange();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateNotificationSettings(settings);
      setSuccessMessage('Notification settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError('Error saving notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetToDefaults('notifications');
      await fetchSettings();
      setSuccessMessage('Notification settings reset successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError('Error resetting notification settings');
    } finally {
      setLoading(false);
    }
  };

  const alertTypes = [
    { value: 'CRITICAL', label: 'Critical', color: 'red' },
    { value: 'HIGH', label: 'High', color: 'orange' },
    { value: 'MEDIUM', label: 'Medium', color: 'yellow' },
    { value: 'LOW', label: 'Low', color: 'blue' }
  ];

  const frequencies = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' }
  ];

  const renderNotificationSection = (
    title: string,
    icon: React.ComponentType<any>,
    category: keyof NotificationSettings,
    data: any,
    type?: 'email' | 'sms'
  ) => {
    const Icon = icon;
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          <button
            onClick={() => handleToggle(category, 'enabled')}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              data.enabled
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>{data.enabled ? 'Enabled' : 'Disabled'}</span>
          </button>
        </div>

        {data.enabled && (
          <div className="space-y-4">
            {/* Types d'alertes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Types d'alertes
              </label>
              <div className="grid grid-cols-2 gap-2">
                {alertTypes.map(alertType => (
                  <label key={alertType.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.alert_types.includes(alertType.value)}
                      onChange={(e) => {
                        const currentTypes = data.alert_types;
                        const newTypes = e.target.checked
                          ? [...currentTypes, alertType.value]
                          : currentTypes.filter(t => t !== alertType.value);
                        handleSettingChange(category, 'alert_types', newTypes);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{alertType.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fréquence (pour email et SMS) */}
            {type && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence
                </label>
                <select
                  value={data.frequency}
                  onChange={(e) => handleSettingChange(category, 'frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Destinataires (pour email et SMS) */}
            {type && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinataires
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type={type === 'email' ? 'email' : 'tel'}
                      placeholder={type === 'email' ? 'email@exemple.com' : '+1234567890'}
                      value={type === 'email' ? newEmail : newPhone}
                      onChange={(e) => type === 'email' ? setNewEmail(e.target.value) : setNewPhone(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleAddRecipient(type)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="space-y-1">
                    {data.recipients.map((recipient: string, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded-md border">
                        <span className="text-sm text-gray-700">{recipient}</span>
                        <button
                          onClick={() => handleRemoveRecipient(type, recipient)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Options spécifiques */}
            {category === 'push_notifications' && (
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.critical_only}
                    onChange={(e) => handleSettingChange(category, 'critical_only', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Alertes critiques uniquement
                  </span>
                </label>
              </div>
            )}

            {category === 'technical_alerts' && (
              <div className="space-y-3">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.auto_escalation}
                      onChange={(e) => handleSettingChange(category, 'auto_escalation', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Escalade automatique
                    </span>
                  </label>
                </div>
                {data.auto_escalation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Délai d'escalade (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={data.escalation_delay}
                      onChange={(e) => handleSettingChange(category, 'escalation_delay', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Messages de statut */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Description */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
        <p className="text-sm">
          Configurez les paramètres de notification pour différents canaux de communication. 
          Les notifications peuvent être envoyées par email, SMS ou push selon les types d'alertes.
        </p>
      </div>

      {/* Notifications Email */}
      {renderNotificationSection(
        'Notifications Email',
        Mail,
        'email_notifications',
        settings.email_notifications,
        'email'
      )}

      {/* Notifications SMS */}
      {renderNotificationSection(
        'Notifications SMS',
        MessageSquare,
        'sms_notifications',
        settings.sms_notifications,
        'sms'
      )}

      {/* Notifications Push */}
      {renderNotificationSection(
        'Notifications Push',
        Smartphone,
        'push_notifications',
        settings.push_notifications
      )}

      {/* Alertes Techniques */}
      {renderNotificationSection(
        'Alertes Techniques',
        AlertTriangle,
        'technical_alerts',
        settings.technical_alerts
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          onClick={handleReset}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Réinitialiser</span>
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>Sauvegarder</span>
        </button>
      </div>
    </div>
  );
} 