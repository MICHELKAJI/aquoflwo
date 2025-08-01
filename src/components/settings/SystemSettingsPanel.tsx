import React, { useState, useEffect } from 'react';
import { Settings, Database, Shield, Wifi, Save, RotateCcw } from 'lucide-react';
import { SystemSettings } from '../../types/settings';
import { getSystemSettings, updateSystemSettings, resetToDefaults } from '../../services/settingsService';

interface SystemSettingsPanelProps {
  onSettingsChange: () => void;
}

export default function SystemSettingsPanel({ onSettingsChange }: SystemSettingsPanelProps) {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      system_name: 'AquoFlow',
      timezone: 'UTC',
      language: 'fr',
      date_format: 'DD/MM/YYYY',
      auto_backup: false,
      backup_frequency: 'daily'
    },
    monitoring: {
      data_collection_interval: 5,
      data_retention_days: 365,
      real_time_monitoring: true,
      alert_cooldown: 10
    },
    security: {
      session_timeout: 30,
      max_login_attempts: 5,
      password_expiry_days: 90,
      two_factor_auth: false
    },
    integration: {
      mqtt_enabled: false,
      mqtt_broker: '',
      api_rate_limit: 100,
      webhook_enabled: false,
      webhook_url: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSystemSettings();
      const defaults = {
        general: {
          system_name: 'AquoFlow',
          timezone: 'UTC',
          language: 'fr',
          date_format: 'DD/MM/YYYY',
          auto_backup: false,
          backup_frequency: 'daily'
        },
        monitoring: {
          data_collection_interval: 5,
          data_retention_days: 365,
          real_time_monitoring: true,
          alert_cooldown: 10
        },
        security: {
          session_timeout: 30,
          max_login_attempts: 5,
          password_expiry_days: 90,
          two_factor_auth: false
        },
        integration: {
          mqtt_enabled: false,
          mqtt_broker: '',
          api_rate_limit: 100,
          webhook_enabled: false,
          webhook_url: ''
        }
      };
      const completeSettings = {
        ...defaults,
        ...data
      };
      setSettings(completeSettings);
    } catch (error: any) {
      setError('Erreur lors du chargement des paramètres système');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (
    category: keyof SystemSettings,
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

  const handleSave = async () => {
    try {
      setLoading(true);
      // Sauvegarder chaque catégorie séparément
      for (const [category, values] of Object.entries(settings)) {
        for (const [field, value] of Object.entries(values)) {
          await updateSystemSettings(`${category}.${field}`, value);
        }
      }
      setSuccessMessage('Paramètres système sauvegardés avec succès !');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError('Erreur lors de la sauvegarde des paramètres système');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetToDefaults('system');
      await fetchSettings();
      setSuccessMessage('Paramètres système réinitialisés avec succès !');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError('Erreur lors de la réinitialisation des paramètres système');
    } finally {
      setLoading(false);
    }
  };

  const timezones = [
    'UTC', 'Europe/Paris', 'America/New_York', 'Asia/Tokyo', 'Australia/Sydney'
  ];

  const languages = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' }
  ];

  const dateFormats = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
  ];

  const backupFrequencies = [
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' }
  ];

  const renderSystemSection = (
    title: string,
    icon: React.ComponentType<any>,
    category: keyof SystemSettings,
    data: any
  ) => {
    // Safety check to prevent undefined data errors
    if (!data) {
      return (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-5 w-5 bg-gray-300 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-300 rounded animate-pulse" />
          </div>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      );
    }
    
    const Icon = icon;
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <div className="space-y-4">
          {category === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du système
                </label>
                <input
                  type="text"
                  value={data.system_name}
                  onChange={(e) => handleSettingChange(category, 'system_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuseau horaire
                </label>
                <select
                  value={data.timezone}
                  onChange={(e) => handleSettingChange(category, 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Langue
                </label>
                <select
                  value={data.language}
                  onChange={(e) => handleSettingChange(category, 'language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format de date
                </label>
                <select
                  value={data.date_format}
                  onChange={(e) => handleSettingChange(category, 'date_format', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dateFormats.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.auto_backup}
                    onChange={(e) => handleSettingChange(category, 'auto_backup', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Sauvegarde automatique
                  </span>
                </label>
              </div>
              {data.auto_backup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fréquence de sauvegarde
                  </label>
                  <select
                    value={data.backup_frequency}
                    onChange={(e) => handleSettingChange(category, 'backup_frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {backupFrequencies.map(freq => (
                      <option key={freq.value} value={freq.value}>{freq.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {category === 'monitoring' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalle de collecte (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={data.data_collection_interval}
                  onChange={(e) => handleSettingChange(category, 'data_collection_interval', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rétention des données (jours)
                </label>
                <input
                  type="number"
                  min="30"
                  max="1095"
                  value={data.data_retention_days}
                  onChange={(e) => handleSettingChange(category, 'data_retention_days', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.real_time_monitoring}
                    onChange={(e) => handleSettingChange(category, 'real_time_monitoring', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Monitoring en temps réel
                  </span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Délai d'alerte (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={data.alert_cooldown}
                  onChange={(e) => handleSettingChange(category, 'alert_cooldown', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {category === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout de session (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={data.session_timeout}
                  onChange={(e) => handleSettingChange(category, 'session_timeout', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tentatives de connexion max
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={data.max_login_attempts}
                  onChange={(e) => handleSettingChange(category, 'max_login_attempts', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration mot de passe (jours)
                </label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={data.password_expiry_days}
                  onChange={(e) => handleSettingChange(category, 'password_expiry_days', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.two_factor_auth}
                    onChange={(e) => handleSettingChange(category, 'two_factor_auth', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Authentification à deux facteurs
                  </span>
                </label>
              </div>
            </div>
          )}

          {category === 'integration' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">MQTT</span>
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.mqtt_enabled}
                    onChange={(e) => handleSettingChange(category, 'mqtt_enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Activé</span>
                </label>
              </div>
              {data.mqtt_enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Broker MQTT
                  </label>
                  <input
                    type="text"
                    value={data.mqtt_broker}
                    onChange={(e) => handleSettingChange(category, 'mqtt_broker', e.target.value)}
                    placeholder="mqtt://localhost:1883"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite de taux API (req/min)
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={data.api_rate_limit}
                  onChange={(e) => handleSettingChange(category, 'api_rate_limit', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Webhooks</span>
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.webhook_enabled}
                    onChange={(e) => handleSettingChange(category, 'webhook_enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Activé</span>
                </label>
              </div>
              {data.webhook_enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Webhook
                  </label>
                  <input
                    type="url"
                    value={data.webhook_url}
                    onChange={(e) => handleSettingChange(category, 'webhook_url', e.target.value)}
                    placeholder="https://api.exemple.com/webhook"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>
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
          Configurez les paramètres généraux du système, la sécurité, le monitoring 
          et les intégrations externes.
        </p>
      </div>

      {/* Paramètres généraux */}
      {renderSystemSection(
        'Paramètres Généraux',
        Settings,
        'general',
        settings.general
      )}

      {/* Monitoring */}
      {renderSystemSection(
        'Monitoring',
        Database,
        'monitoring',
        settings.monitoring
      )}

      {/* Sécurité */}
      {renderSystemSection(
        'Sécurité',
        Shield,
        'security',
        settings.security
      )}

      {/* Intégrations */}
      {renderSystemSection(
        'Intégrations',
        Wifi,
        'integration',
        settings.integration
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