import React, { useState, useEffect } from 'react';
import { AlertTriangle, Battery, Signal, Activity, Wrench, Droplets, Save, RotateCcw } from 'lucide-react';
import { AlertThresholds } from '../../types/settings';
import { getAlertThresholds, updateAlertThresholds, resetToDefaults } from '../../services/settingsService';

interface AlertThresholdsPanelProps {
  onSettingsChange: () => void;
}

export default function AlertThresholdsPanel({ onSettingsChange }: AlertThresholdsPanelProps) {
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    low_water_level: { warning: 30, critical: 20, emergency: 10 },
    battery_level: { warning: 20, critical: 10 },
    signal_strength: { warning: 30, critical: 15 },
    maintenance_interval: { preventive: 30, inspection: 7, emergency: 1 },
    accuracy_threshold: { warning: 85, critical: 70 },
    calibration_reminder: { days_before: 7 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchThresholds();
  }, []);

  const fetchThresholds = async () => {
    try {
      setLoading(true);
      const data = await getAlertThresholds();
      // Ensure all required properties exist with defaults
      const defaults = {
        low_water_level: { warning: 30, critical: 20, emergency: 10 },
        battery_level: { warning: 20, critical: 10 },
        signal_strength: { warning: 30, critical: 15 },
        maintenance_interval: { preventive: 30, inspection: 7, emergency: 1 },
        accuracy_threshold: { warning: 85, critical: 70 },
        calibration_reminder: { days_before: 7 }
      };
      const completeThresholds = {
        ...defaults,
        ...data
      };
      setThresholds(completeThresholds);
    } catch (error: any) {
      setError('Error loading alert thresholds');
    } finally {
      setLoading(false);
    }
  };

  const handleThresholdChange = (category: keyof AlertThresholds, field: string, value: number) => {
    setThresholds(prev => ({
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
      await updateAlertThresholds(thresholds);
      setSuccessMessage('Alert thresholds saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError('Error saving alert thresholds');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetToDefaults('alerts');
      await fetchThresholds();
      setSuccessMessage('Alert thresholds reset successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError('Error resetting alert thresholds');
    } finally {
      setLoading(false);
    }
  };

  const renderSlider = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    unit: string,
    onChange: (value: number) => void,
    color: string = 'blue'
  ) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500">{value} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-${color}`}
      />
    </div>
  );

  const renderThresholdSection = (
    title: string,
    icon: React.ComponentType<any>,
    sectionThresholds: any,
    fields: { key: string; label: string; min: number; max: number; step: number; unit: string }[]
  ) => {
    const Icon = icon;
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <div className="space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              {renderSlider(
                field.label,
                sectionThresholds?.[field.key] || 0,
                field.min,
                field.max,
                field.step,
                field.unit,
                (value) => handleThresholdChange(
                  title.toLowerCase().replace(' ', '_') as keyof AlertThresholds,
                  field.key,
                  value
                )
              )}
            </div>
          ))}
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
          Configure alert thresholds for different system parameters. 
          Alerts will be triggered when values exceed these thresholds.
        </p>
      </div>

      {/* Seuils de niveau d'eau */}
             {renderThresholdSection(
         'Water Level',
         Droplets,
         thresholds.low_water_level,
         [
           { key: 'warning', label: 'Warning Threshold', min: 10, max: 50, step: 5, unit: '%' },
           { key: 'critical', label: 'Critical Threshold', min: 5, max: 30, step: 5, unit: '%' },
           { key: 'emergency', label: 'Emergency Threshold', min: 1, max: 15, step: 1, unit: '%' }
         ]
       )}

      {/* Seuils de batterie */}
             {renderThresholdSection(
         'Battery',
         Battery,
         thresholds.battery_level,
         [
           { key: 'warning', label: 'Warning Threshold', min: 10, max: 50, step: 5, unit: '%' },
           { key: 'critical', label: 'Critical Threshold', min: 5, max: 30, step: 5, unit: '%' }
         ]
       )}

      {/* Seuils de signal */}
             {renderThresholdSection(
         'Signal',
         Signal,
         thresholds.signal_strength,
         [
           { key: 'warning', label: 'Warning Threshold', min: 20, max: 60, step: 5, unit: '%' },
           { key: 'critical', label: 'Critical Threshold', min: 10, max: 40, step: 5, unit: '%' }
         ]
       )}

      {/* Seuils de précision */}
             {renderThresholdSection(
         'Accuracy',
         Activity,
         thresholds.accuracy_threshold,
         [
           { key: 'warning', label: 'Warning Threshold', min: 70, max: 95, step: 5, unit: '%' },
           { key: 'critical', label: 'Critical Threshold', min: 50, max: 85, step: 5, unit: '%' }
         ]
       )}

      {/* Intervalles de maintenance */}
             {renderThresholdSection(
         'Maintenance',
         Wrench,
         thresholds.maintenance_interval,
         [
           { key: 'preventive', label: 'Preventive Maintenance', min: 7, max: 90, step: 1, unit: 'days' },
           { key: 'inspection', label: 'Inspection', min: 1, max: 30, step: 1, unit: 'days' },
           { key: 'emergency', label: 'Emergency', min: 1, max: 7, step: 1, unit: 'days' }
         ]
       )}

      {/* Rappel de calibration */}
      <div className="bg-gray-50 rounded-lg p-6">
                 <div className="flex items-center space-x-2 mb-4">
           <Wrench className="h-5 w-5 text-gray-600" />
           <h3 className="text-lg font-medium text-gray-900">Calibration</h3>
         </div>
         <div className="space-y-4">
            {renderSlider(
              'Reminder before expiration',
              thresholds.calibration_reminder?.days_before || 7,
              1,
              30,
              1,
              'days',
              (value) => handleThresholdChange('calibration_reminder', 'days_before', value)
            )}
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
           <span>Reset</span>
         </button>
         <button
           onClick={handleSave}
           disabled={loading}
           className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
         >
           <Save className="h-4 w-4" />
           <span>Save</span>
         </button>
      </div>

      {/* Styles CSS pour les sliders */}
      <style dangerouslySetInnerHTML={{__html: `
        .slider-blue::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider-blue::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}} />
    </div>
  );
} 