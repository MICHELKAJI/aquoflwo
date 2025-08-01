import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Battery, Signal } from 'lucide-react';
import { Sensor, SensorDiagnostic, Site } from '../../../types';
import { getSensorDiagnostics } from '../../../services/sensorService';

interface SensorDiagnosticsProps {
  sensors: Sensor[];
  sites: Site[];
  currentUser: any;
}

export default function SensorDiagnostics({ sensors, sites, currentUser }: SensorDiagnosticsProps) {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [diagnostics, setDiagnostics] = useState<SensorDiagnostic[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSelectSensor = async (sensor: Sensor) => {
    setSelectedSensor(sensor);
    setLoading(true);
    try {
      const diagnosticData = await getSensorDiagnostics(sensor.id);
      setDiagnostics(diagnosticData);
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sensor Diagnostics</h2>
          <p className="text-gray-600">Detailed sensor health and performance monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des capteurs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Sensors</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {sensors.map(sensor => {
              const site = sites.find(s => s.id === sensor.siteId);
              return (
                <div 
                  key={sensor.id} 
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedSensor?.id === sensor.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelectSensor(sensor)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{sensor.name}</h4>
                      <p className="text-xs text-gray-500">{sensor.type} - {site?.name}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className={`flex items-center text-xs ${getBatteryColor(sensor.batteryLevel)}`}>
                          <Battery className="h-3 w-3 mr-1" />
                          {sensor.batteryLevel}%
                        </div>
                        <div className={`flex items-center text-xs ${getSignalColor(sensor.signalStrength)}`}>
                          <Signal className="h-3 w-3 mr-1" />
                          {sensor.signalStrength}%
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      sensor.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      sensor.status === 'MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {sensor.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Détails du capteur sélectionné */}
        {selectedSensor && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedSensor.name} - Diagnostics
                </h3>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading diagnostics...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Métriques principales */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Battery className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Battery</p>
                            <p className={`text-lg font-semibold ${getBatteryColor(selectedSensor.batteryLevel)}`}>
                              {selectedSensor.batteryLevel}%
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Signal className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Signal</p>
                            <p className={`text-lg font-semibold ${getSignalColor(selectedSensor.signalStrength)}`}>
                              {selectedSensor.signalStrength}%
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Activity className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Accuracy</p>
                            <p className={`text-lg font-semibold ${getPerformanceColor(selectedSensor.accuracy)}`}>
                              {selectedSensor.accuracy}%
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-xs text-gray-500">Last Update</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {new Date(selectedSensor.updatedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Historique des diagnostics */}
                    {diagnostics.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Diagnostics</h4>
                        <div className="space-y-3">
                          {diagnostics.slice(0, 5).map((diagnostic, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {new Date(diagnostic.timestamp).toLocaleString()}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  diagnostic.performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                                  diagnostic.performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  Score: {diagnostic.performanceScore}%
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="text-gray-500">Battery:</span>
                                  <span className={`ml-1 ${getBatteryColor(diagnostic.batteryLevel)}`}>
                                    {diagnostic.batteryLevel}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Signal:</span>
                                  <span className={`ml-1 ${getSignalColor(diagnostic.signalStrength)}`}>
                                    {diagnostic.signalStrength}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Accuracy:</span>
                                  <span className={`ml-1 ${getPerformanceColor(diagnostic.accuracy)}`}>
                                    {diagnostic.accuracy}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Temperature:</span>
                                  <span className="ml-1">{diagnostic.temperature}°C</span>
                                </div>
                              </div>
                              {diagnostic.errorCodes.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-xs text-red-600 font-medium">Errors:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {diagnostic.errorCodes.map((error, i) => (
                                      <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                        {error}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommandations */}
                    {diagnostics.length > 0 && diagnostics[0].recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Recommendations</h4>
                        <div className="space-y-2">
                          {diagnostics[0].recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{recommendation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 