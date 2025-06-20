import React from 'react';
import { Alert, AlertLevel, AlertType } from '../../types';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AlertListProps {
  alerts: Alert[];
  onUpdateAlert?: (id: string, data: Partial<Alert>) => void;
}

export default function AlertList({ alerts, onUpdateAlert }: AlertListProps) {
  const getLevelColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.EMERGENCY:
        return 'bg-red-100 text-red-800';
      case AlertLevel.CRITICAL:
        return 'bg-orange-100 text-orange-800';
      case AlertLevel.WARNING:
        return 'bg-yellow-100 text-yellow-800';
      case AlertLevel.INFO:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.LOW_WATER_LEVEL:
        return '💧';
      case AlertType.SENSOR_FAILURE:
        return '📡';
      case AlertType.PUMP_FAILURE:
        return '🔧';
      case AlertType.LEAK_DETECTED:
        return '💦';
      case AlertType.MAINTENANCE_DUE:
        return '🔨';
      default:
        return '⚠️';
    }
  };

  const handleResolve = async (alert: Alert) => {
    if (onUpdateAlert) {
      await onUpdateAlert(alert.id, {
        isActive: false,
        resolvedAt: new Date()
      });
    }
  };

  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
          <p>No active alerts</p>
        </div>
      ) : (
        alerts.map(alert => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${
              alert.isActive ? 'bg-white' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getLevelColor(alert.level)}`}>
                  <span className="text-xl">{getTypeIcon(alert.type)}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">
                      {alert.type.replace('_', ' ')}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(alert.level)}`}>
                      {alert.level}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Site: {alert.site?.name}</p>
                    <p>Created at: {new Date(alert.createdAt).toLocaleString('en-US')}</p>
                    {alert.actionTaken && (
                      <p className="mt-1">
                        Action taken: {alert.actionTaken}
                        {alert.actionTakenAt && (
                          <span> on {new Date(alert.actionTakenAt).toLocaleString('en-US')}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {alert.isActive && onUpdateAlert && (
                <button
                  onClick={() => handleResolve(alert)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Resolve alert"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
} 