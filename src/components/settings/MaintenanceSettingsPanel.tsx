import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, Users, AlertTriangle, Save, RotateCcw } from 'lucide-react';
import { MaintenanceSettings } from '../../types/settings';
import { getMaintenanceSettings, updateMaintenanceSettings, resetToDefaults } from '../../services/settingsService';

interface MaintenanceSettingsPanelProps {
  onSettingsChange: () => void;
}

export default function MaintenanceSettingsPanel({ onSettingsChange }: MaintenanceSettingsPanelProps) {
  const [settings, setSettings] = useState<MaintenanceSettings>({
    preventive_maintenance: {
      enabled: false,
      interval_days: 30,
      reminder_days: 7,
      auto_schedule: false
    },
    sensor_calibration: {
      enabled: false,
      interval_days: 90,
      reminder_days: 14,
      auto_detection: false
    },
    emergency_maintenance: {
      enabled: false,
      response_time_hours: 4,
      auto_alert: false,
      escalation_enabled: false
    },
    maintenance_teams: {
      primary_team: '',
      backup_team: '',
      emergency_contact: ''
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
      const data = await getMaintenanceSettings();
      setSettings(data);
    } catch (error: any) {
      setError('Erreur lors du chargement des paramètres de maintenance');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (category: keyof MaintenanceSettings, field: string) => {
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
    category: keyof MaintenanceSettings,
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
      await updateMaintenanceSettings(settings);
      setSuccessMessage('Paramètres de maintenance sauvegardés avec succès !');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError('Erreur lors de la sauvegarde des paramètres de maintenance');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetToDefaults('maintenance');
      await fetchSettings();
      setSuccessMessage('Paramètres de maintenance réinitialisés avec succès !');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError('Erreur lors de la réinitialisation des paramètres de maintenance');
    } finally {
      setLoading(false);
    }
  };

  const renderMaintenanceSection = (
    title: string,
    icon: React.ComponentType<any>,
    category: keyof MaintenanceSettings,
    data: any
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
            <Wrench className="h-4 w-4" />
            <span>{data.enabled ? 'Activé' : 'Désactivé'}</span>
          </button>
        </div>

        {data.enabled && (
          <div className="space-y-4">
            {category === 'preventive_maintenance' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intervalle (jours)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="365"
                    value={data.interval_days}
                    onChange={(e) => handleSettingChange(category, 'interval_days', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rappel avant (jours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={data.reminder_days}
                    onChange={(e) => handleSettingChange(category, 'reminder_days', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.auto_schedule}
                      onChange={(e) => handleSettingChange(category, 'auto_schedule', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Planification automatique
                    </span>
                  </label>
                </div>
              </div>
            )}

            {category === 'sensor_calibration' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intervalle (jours)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={data.interval_days}
                    onChange={(e) => handleSettingChange(category, 'interval_days', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rappel avant (jours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={data.reminder_days}
                    onChange={(e) => handleSettingChange(category, 'reminder_days', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.auto_detection}
                      onChange={(e) => handleSettingChange(category, 'auto_detection', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Détection automatique
                    </span>
                  </label>
                </div>
              </div>
            )}

            {category === 'emergency_maintenance' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temps de réponse (heures)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={data.response_time_hours}
                    onChange={(e) => handleSettingChange(category, 'response_time_hours', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.auto_alert}
                      onChange={(e) => handleSettingChange(category, 'auto_alert', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Alerte automatique
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.escalation_enabled}
                      onChange={(e) => handleSettingChange(category, 'escalation_enabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Escalade activée
                    </span>
                  </label>
                </div>
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
          Configurez les paramètres de maintenance préventive, de calibration des capteurs 
          et de maintenance d'urgence. Définissez également les équipes responsables.
        </p>
      </div>

      {/* Maintenance préventive */}
      {renderMaintenanceSection(
        'Maintenance Préventive',
        Calendar,
        'preventive_maintenance',
        settings.preventive_maintenance
      )}

      {/* Calibration des capteurs */}
      {renderMaintenanceSection(
        'Calibration des Capteurs',
        Wrench,
        'sensor_calibration',
        settings.sensor_calibration
      )}

      {/* Maintenance d'urgence */}
      {renderMaintenanceSection(
        'Maintenance d\'Urgence',
        AlertTriangle,
        'emergency_maintenance',
        settings.emergency_maintenance
      )}

      {/* Équipes de maintenance */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Équipes de Maintenance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Équipe principale
            </label>
            <input
              type="text"
              value={settings.maintenance_teams.primary_team}
              onChange={(e) => handleSettingChange('maintenance_teams', 'primary_team', e.target.value)}
              placeholder="Équipe A"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Équipe de secours
            </label>
            <input
              type="text"
              value={settings.maintenance_teams.backup_team}
              onChange={(e) => handleSettingChange('maintenance_teams', 'backup_team', e.target.value)}
              placeholder="Équipe B"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact d'urgence
            </label>
            <input
              type="text"
              value={settings.maintenance_teams.emergency_contact}
              onChange={(e) => handleSettingChange('maintenance_teams', 'emergency_contact', e.target.value)}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

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