import React, { useState, useEffect } from 'react';
import { Calendar, Sun, CloudRain, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { SeasonalSettings } from '../../types/settings';
import { getSeasonalSettings, updateSeasonalSettings, resetToDefaults } from '../../services/settingsService';

interface SeasonalSettingsPanelProps {
  onSettingsChange: () => void;
}

export default function SeasonalSettingsPanel({ onSettingsChange }: SeasonalSettingsPanelProps) {
  const [settings, setSettings] = useState<SeasonalSettings>({
    dry_season: {
      enabled: false,
      start_month: 1,
      end_month: 6,
      adjustments: {
        water_level_threshold: 20,
        maintenance_frequency: 15,
        alert_sensitivity: 1.2
      }
    },
    rainy_season: {
      enabled: false,
      start_month: 7,
      end_month: 12,
      adjustments: {
        water_level_threshold: 40,
        maintenance_frequency: 30,
        alert_sensitivity: 0.8
      }
    },
    peak_usage: {
      enabled: false,
      start_hour: 6,
      end_hour: 22,
      adjustments: {
        monitoring_frequency: 5,
        alert_threshold: 1.5
      }
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
      const data = await getSeasonalSettings();
      const defaults = {
        dry_season: {
          enabled: false,
          start_month: 1,
          end_month: 6,
          adjustments: {
            water_level_threshold: 20,
            maintenance_frequency: 15,
            alert_sensitivity: 1.2
          }
        },
        rainy_season: {
          enabled: false,
          start_month: 7,
          end_month: 12,
          adjustments: {
            water_level_threshold: 40,
            maintenance_frequency: 30,
            alert_sensitivity: 0.8
          }
        },
        peak_usage: {
          enabled: false,
          start_hour: 6,
          end_hour: 22,
          adjustments: {
            monitoring_frequency: 5,
            alert_threshold: 1.5
          }
        }
      };
      const completeSettings = {
        ...defaults,
        ...data
      };
      setSettings(completeSettings);
    } catch (error: any) {
      setError('Error loading seasonal settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (season: keyof SeasonalSettings) => {
    setSettings(prev => ({
      ...prev,
      [season]: {
        ...prev[season],
        enabled: !prev[season].enabled
      }
    }));
    onSettingsChange();
  };

  const handleSettingChange = (
    season: keyof SeasonalSettings,
    field: string,
    value: number | boolean
  ) => {
    setSettings(prev => ({
      ...prev,
      [season]: {
        ...prev[season],
        [field]: value
      }
    }));
    onSettingsChange();
  };

  const handleAdjustmentChange = (
    season: keyof SeasonalSettings,
    adjustment: string,
    value: number
  ) => {
    setSettings(prev => ({
      ...prev,
      [season]: {
        ...prev[season],
        adjustments: {
          ...prev[season].adjustments,
          [adjustment]: value
        }
      }
    }));
    onSettingsChange();
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateSeasonalSettings(settings);
      setSuccessMessage('Seasonal settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError('Error saving seasonal settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetToDefaults('seasonal');
      await fetchSettings();
      setSuccessMessage('Seasonal settings reset successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError('Error resetting seasonal settings');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const renderSeasonSection = (
    title: string,
    icon: React.ComponentType<any>,
    season: keyof SeasonalSettings,
    seasonData: any
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
            onClick={() => handleToggle(season)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              seasonData.enabled
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {seasonData.enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            <span>{seasonData.enabled ? 'Enabled' : 'Disabled'}</span>
          </button>
        </div>

        {seasonData.enabled && (
          <div className="space-y-4">
            {/* Période */}
            <div className="grid grid-cols-2 gap-4">
                               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Start Month
                   </label>
                <select
                  value={seasonData.start_month}
                  onChange={(e) => handleSettingChange(season, 'start_month', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {months.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
                               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     End Month
                   </label>
                <select
                  value={seasonData.end_month}
                  onChange={(e) => handleSettingChange(season, 'end_month', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {months.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ajustements */}
            <div className="border-t border-gray-200 pt-4">
                             <h4 className="text-sm font-medium text-gray-900 mb-3">Automatic Adjustments</h4>
              <div className="space-y-3">
                {season === 'peak_usage' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                                               <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Start Hour
                           </label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={seasonData.start_hour}
                          onChange={(e) => handleSettingChange(season, 'start_hour', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                                             <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           End Hour
                         </label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={seasonData.end_hour}
                          onChange={(e) => handleSettingChange(season, 'end_hour', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                                             <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Monitoring Frequency (min)
                         </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={seasonData.adjustments.monitoring_frequency}
                          onChange={(e) => handleAdjustmentChange(season, 'monitoring_frequency', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                                             <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Alert Threshold (multiplier)
                         </label>
                        <input
                          type="number"
                          min="0.5"
                          max="3"
                          step="0.1"
                          value={seasonData.adjustments.alert_threshold}
                          onChange={(e) => handleAdjustmentChange(season, 'alert_threshold', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         Water Level Threshold (%)
                       </label>
                      <input
                        type="number"
                        min="10"
                        max="80"
                        value={seasonData.adjustments.water_level_threshold}
                        onChange={(e) => handleAdjustmentChange(season, 'water_level_threshold', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         Maintenance Frequency (days)
                       </label>
                      <input
                        type="number"
                        min="7"
                        max="90"
                        value={seasonData.adjustments.maintenance_frequency}
                        onChange={(e) => handleAdjustmentChange(season, 'maintenance_frequency', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         Alert Sensitivity
                       </label>
                      <input
                        type="number"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={seasonData.adjustments.alert_sensitivity}
                        onChange={(e) => handleAdjustmentChange(season, 'alert_sensitivity', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
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
           Configure automatic adjustments based on seasons and peak periods. 
           The system will automatically adapt thresholds and monitoring frequency.
         </p>
      </div>

      {/* Saison sèche */}
             {renderSeasonSection(
         'Dry Season',
         Sun,
         'dry_season',
         settings.dry_season
       )}

       {/* Rainy Season */}
       {renderSeasonSection(
         'Rainy Season',
         CloudRain,
         'rainy_season',
         settings.rainy_season
       )}

       {/* Peak Period */}
       {renderSeasonSection(
         'Peak Period',
         Clock,
         'peak_usage',
         settings.peak_usage
       )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                 <button
           onClick={handleReset}
           disabled={loading}
           className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
         >
           <Calendar className="h-4 w-4" />
           <span>Reset</span>
         </button>
         <button
           onClick={handleSave}
           disabled={loading}
           className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
         >
           <Calendar className="h-4 w-4" />
           <span>Save</span>
         </button>
      </div>
    </div>
  );
} 