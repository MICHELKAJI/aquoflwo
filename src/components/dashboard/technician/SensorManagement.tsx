import React, { useState } from 'react';
import { Settings, Plus, Edit, Trash2, Battery, Signal, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Sensor, SensorConfig, Site } from '../../../types';
import { createSensor, updateSensor, deleteSensor, createSensorConfig, updateSensorConfig, deleteSensorConfig, checkAndSendAlerts, sendSensorUpdateAlert } from '../../../services/sensorService';

interface SensorManagementProps {
  sensors: Sensor[];
  sites: Site[];
  onRefresh: () => void;
}

export default function SensorManagement({ sensors, sites, onRefresh }: SensorManagementProps) {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<SensorConfig | null>(null);
  const [configs, setConfigs] = useState<SensorConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'LEVEL' as Sensor['type'],
    model: '',
    serialNumber: '',
    siteId: '',
    batteryLevel: 100,
    signalStrength: 100,
    accuracy: 95,
    status: 'ACTIVE' as Sensor['status'],
  });

  const [configFormData, setConfigFormData] = useState({
    parameter: '',
    value: '',
    unit: '',
    description: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (selectedSensor) {
        const updatedSensor = await updateSensor(selectedSensor.id, formData);
        // Envoyer une notification de mise à jour
        await sendSensorUpdateAlert(updatedSensor, 'UPDATED', sites);
        // Vérifier et envoyer des alertes automatiques
        await checkAndSendAlerts(updatedSensor, sites);
      } else {
        const newSensor = await createSensor({
          ...formData,
          installationDate: new Date(),
        });
        // Envoyer une notification de création
        await sendSensorUpdateAlert(newSensor, 'CREATED', sites);
        // Vérifier et envoyer des alertes automatiques
        await checkAndSendAlerts(newSensor, sites);
      }
      onRefresh();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sensorId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce capteur ?')) return;

    setLoading(true);
    setError(null);

    try {
      const sensorToDelete = sensors.find(s => s.id === sensorId);
      await deleteSensor(sensorId);
      if (sensorToDelete) {
        // Envoyer une notification de suppression
        await sendSensorUpdateAlert(sensorToDelete, 'DELETED', sites);
      }
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSensor) return;

    setLoading(true);
    setError(null);

    try {
      if (selectedConfig) {
        await updateSensorConfig(selectedConfig.id, configFormData);
      } else {
        await createSensorConfig({
          ...configFormData,
          sensorId: selectedSensor.id,
        });
      }
      onRefresh();
      handleCloseConfigModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigDelete = async (configId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) return;

    setLoading(true);
    setError(null);

    try {
      await deleteSensorConfig(configId);
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sensor?: Sensor) => {
    if (sensor) {
      setSelectedSensor(sensor);
      setFormData({
        name: sensor.name,
        type: sensor.type,
        model: sensor.model,
        serialNumber: sensor.serialNumber,
        siteId: sensor.siteId,
        batteryLevel: sensor.batteryLevel,
        signalStrength: sensor.signalStrength,
        accuracy: sensor.accuracy,
        status: sensor.status,
      });
    } else {
      setSelectedSensor(null);
      setFormData({
        name: '',
        type: 'LEVEL',
        model: '',
        serialNumber: '',
        siteId: '',
        batteryLevel: 100,
        signalStrength: 100,
        accuracy: 95,
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSensor(null);
    setError(null);
  };

  const handleOpenConfigModal = (config?: SensorConfig) => {
    if (config) {
      setSelectedConfig(config);
      setConfigFormData({
        parameter: config.parameter,
        value: config.value.toString(),
        unit: config.unit,
        description: config.description,
        isActive: config.isActive,
      });
    } else {
      setSelectedConfig(null);
      setConfigFormData({
        parameter: '',
        value: '',
        unit: '',
        description: '',
        isActive: true,
      });
    }
    setIsConfigModalOpen(true);
  };

  const handleCloseConfigModal = () => {
    setIsConfigModalOpen(false);
    setSelectedConfig(null);
    setError(null);
  };

  const getStatusColor = (status: Sensor['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 80) return 'text-green-600';
    if (level > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 80) return 'text-green-600';
    if (strength > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy > 95) return 'text-green-600';
    if (accuracy > 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Capteurs</h2>
          <p className="text-gray-600">Ajouter, modifier et supprimer les capteurs</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau Capteur</span>
        </button>
      </div>

      {/* Liste des capteurs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Capteurs ({sensors.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batterie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Précision
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sensors.map(sensor => {
                const site = sites.find(s => s.id === sensor.siteId);
                return (
                  <tr key={sensor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{sensor.name}</div>
                        <div className="text-sm text-gray-500">{sensor.model}</div>
                        <div className="text-xs text-gray-400">S/N: {sensor.serialNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{site?.name || 'Site inconnu'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{sensor.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(sensor.status)}`}>
                        {sensor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${getBatteryColor(sensor.batteryLevel)}`}>
                        <Battery className="h-4 w-4 mr-1" />
                        {sensor.batteryLevel}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${getSignalColor(sensor.signalStrength)}`}>
                        <Signal className="h-4 w-4 mr-1" />
                        {sensor.signalStrength}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${getAccuracyColor(sensor.accuracy)}`}>
                        <Activity className="h-4 w-4 mr-1" />
                        {sensor.accuracy}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal(sensor)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenConfigModal()}
                          className="text-purple-600 hover:text-purple-900"
                          title="Configurations"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sensor.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal pour ajouter/modifier un capteur */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedSensor ? 'Modifier le Capteur' : 'Nouveau Capteur'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as Sensor['type']})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="LEVEL">Niveau</option>
                    <option value="PRESSURE">Pression</option>
                    <option value="FLOW">Débit</option>
                    <option value="TEMPERATURE">Température</option>
                    <option value="QUALITY">Qualité</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Modèle</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Numéro de série</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Site</label>
                  <select
                    value={formData.siteId}
                    onChange={(e) => setFormData({...formData, siteId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Sélectionner un site</option>
                    {sites.map(site => (
                      <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Batterie (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.batteryLevel}
                      onChange={(e) => setFormData({...formData, batteryLevel: Number(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Signal (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.signalStrength}
                      onChange={(e) => setFormData({...formData, signalStrength: Number(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Précision (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.accuracy}
                      onChange={(e) => setFormData({...formData, accuracy: Number(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as Sensor['status']})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="ACTIVE">Actif</option>
                    <option value="INACTIVE">Inactif</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="FAILED">Défaillant</option>
                  </select>
                </div>
                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement...' : (selectedSensor ? 'Modifier' : 'Créer')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour les configurations */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedConfig ? 'Modifier la Configuration' : 'Nouvelle Configuration'}
              </h3>
              <form onSubmit={handleConfigSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Paramètre</label>
                  <input
                    type="text"
                    value={configFormData.parameter}
                    onChange={(e) => setConfigFormData({...configFormData, parameter: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valeur</label>
                  <input
                    type="text"
                    value={configFormData.value}
                    onChange={(e) => setConfigFormData({...configFormData, value: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unité</label>
                  <input
                    type="text"
                    value={configFormData.unit}
                    onChange={(e) => setConfigFormData({...configFormData, unit: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={configFormData.description}
                    onChange={(e) => setConfigFormData({...configFormData, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={configFormData.isActive}
                    onChange={(e) => setConfigFormData({...configFormData, isActive: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Configuration active</label>
                </div>
                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseConfigModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement...' : (selectedConfig ? 'Modifier' : 'Créer')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 