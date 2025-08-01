import React, { useState } from 'react';
import { Wrench, TestTube, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Sensor, Site } from '../../../types';
import { calibrateSensor, testSensor } from '../../../services/sensorService';

interface SensorCalibrationProps {
  sensors: Sensor[];
  sites: Site[];
  currentUser: any;
}

export default function SensorCalibration({ sensors, sites, currentUser }: SensorCalibrationProps) {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [calibrationData, setCalibrationData] = useState({
    referenceValue: '',
    tolerance: '',
    notes: ''
  });
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalibrate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSensor) return;

    setLoading(true);
    try {
      await calibrateSensor(selectedSensor.id, {
        referenceValue: parseFloat(calibrationData.referenceValue),
        tolerance: parseFloat(calibrationData.tolerance),
        notes: calibrationData.notes,
        calibratedBy: currentUser.id
      });
      
      alert('Calibration completed successfully');
      setCalibrationData({ referenceValue: '', tolerance: '', notes: '' });
    } catch (error) {
      console.error('Calibration error:', error);
      alert('Calibration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (sensor: Sensor) => {
    setLoading(true);
    try {
      const results = await testSensor(sensor.id);
      setTestResults(results);
    } catch (error) {
      console.error('Test error:', error);
      alert('Sensor test failed');
    } finally {
      setLoading(false);
    }
  };

  const getCalibrationStatus = (sensor: Sensor) => {
    if (!sensor.lastCalibrationDate) return 'Never calibrated';
    
    const lastCalibration = new Date(sensor.lastCalibrationDate);
    const daysSince = (Date.now() - lastCalibration.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSince > 30) return 'Calibration overdue';
    if (daysSince > 20) return 'Calibration due soon';
    return 'Recently calibrated';
  };

  const getCalibrationColor = (sensor: Sensor) => {
    const status = getCalibrationStatus(sensor);
    if (status === 'Calibration overdue') return 'text-red-600';
    if (status === 'Calibration due soon') return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sensor Calibration</h2>
          <p className="text-gray-600">Calibrate and test sensors for accuracy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des capteurs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Available Sensors</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {sensors.map(sensor => {
              const site = sites.find(s => s.id === sensor.siteId);
              return (
                <div key={sensor.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{sensor.name}</h4>
                      <p className="text-xs text-gray-500">{sensor.type} - {site?.name}</p>
                      <div className={`text-xs ${getCalibrationColor(sensor)}`}>
                        {getCalibrationStatus(sensor)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedSensor(sensor)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Calibrate
                      </button>
                      <button
                        onClick={() => handleTest(sensor)}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulaire de calibration */}
        {selectedSensor && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Calibrate: {selectedSensor.name}
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleCalibrate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reference Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={calibrationData.referenceValue}
                    onChange={(e) => setCalibrationData({...calibrationData, referenceValue: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tolerance (±)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={calibrationData.tolerance}
                    onChange={(e) => setCalibrationData({...calibrationData, tolerance: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={calibrationData.notes}
                    onChange={(e) => setCalibrationData({...calibrationData, notes: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setSelectedSensor(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Calibrating...' : 'Calibrate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Résultats de test */}
        {testResults && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Accuracy</span>
                  <span className={`text-sm ${testResults.accuracy > 95 ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.accuracy}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm text-gray-900">{testResults.responseTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <span className={`text-sm ${testResults.status === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 