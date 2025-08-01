import React, { useState, useEffect } from 'react';
import { Settings, AlertTriangle, Calendar, Bell, Wrench, Database, Download, Upload, Save, RotateCcw } from 'lucide-react';
import { SettingsCategory } from '../../types/settings';
import AlertThresholdsPanel from './AlertThresholdsPanel';
import SeasonalSettingsPanel from './SeasonalSettingsPanel';
import NotificationSettingsPanel from './NotificationSettingsPanel';
import MaintenanceSettingsPanel from './MaintenanceSettingsPanel';
import SystemSettingsPanel from './SystemSettingsPanel';

interface SettingsDashboardProps {
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

export default function SettingsDashboard({ currentUser }: SettingsDashboardProps) {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (currentUser.role !== 'ADMIN') {
      setError('Access denied. Only administrators can access system settings.');
    }
  }, [currentUser.role]);

  const categories = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'alerts', label: 'Alert Thresholds', icon: AlertTriangle },
    { id: 'seasonal', label: 'Seasonal Configuration', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'system', label: 'System', icon: Database },
  ];

  const handleCategoryChange = (category: SettingsCategory) => {
    if (hasUnsavedChanges) {
      const confirmChange = window.confirm(
        'You have unsaved changes. Do you really want to change section?'
      );
      if (!confirmChange) return;
    }
    setActiveCategory(category);
    setHasUnsavedChanges(false);
  };

  const handleSettingsChange = () => {
    setHasUnsavedChanges(true);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // La sauvegarde sera gérée par chaque panel
      setHasUnsavedChanges(false);
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (category: string) => {
    const confirmReset = window.confirm(
      `Êtes-vous sûr de vouloir réinitialiser les paramètres ${category} aux valeurs par défaut ?`
    );
    if (!confirmReset) return;

    setLoading(true);
    try {
      // La réinitialisation sera gérée par chaque panel
      setSuccessMessage(`${category} settings reset successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      // L'export sera géré par le service
      setSuccessMessage('Settings exported successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (file: File) => {
    setLoading(true);
    try {
      // L'import sera géré par le service
      setSuccessMessage('Settings imported successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPanel = () => {
    switch (activeCategory) {
      case 'alerts':
        return <AlertThresholdsPanel onSettingsChange={handleSettingsChange} />;
      case 'seasonal':
        return <SeasonalSettingsPanel onSettingsChange={handleSettingsChange} />;
      case 'notifications':
        return <NotificationSettingsPanel onSettingsChange={handleSettingsChange} />;
      case 'maintenance':
        return <MaintenanceSettingsPanel onSettingsChange={handleSettingsChange} />;
      case 'system':
        return <SystemSettingsPanel onSettingsChange={handleSettingsChange} />;
      default:
        return <SystemSettingsPanel onSettingsChange={handleSettingsChange} />;
    }
  };

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                  <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            Only administrators can access system settings.
          </p>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
                    <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-2 text-gray-600">
            AquoFlow system configuration for administration
          </p>
        </div>
            <div className="flex space-x-3">
              {hasUnsavedChanges && (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  <span>Save</span>
                </button>
              )}
              <button
                onClick={handleExport}
                disabled={loading}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                <Download className="h-5 w-5" />
                                  <span>Export</span>
              </button>
              <label className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md cursor-pointer disabled:opacity-50">
                <Upload className="h-5 w-5" />
                                  <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Messages de statut */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Navigation par onglets */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id as SettingsCategory)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {categories.find(c => c.id === activeCategory)?.label}
              </h2>
              <button
                onClick={() => handleReset(activeCategory)}
                disabled={loading}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderPanel()
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 