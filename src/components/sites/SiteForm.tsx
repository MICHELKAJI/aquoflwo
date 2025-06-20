import React, { useState, useEffect } from 'react';
import { MapPin, Droplet, User } from 'lucide-react';
import { getSectorManagers } from '../../services/userService';

interface SiteFormProps {
  site?: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    reservoirCapacity: number;
    currentLevel: number;
    sectorManagerId: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  onSubmit: (siteData: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    reservoirCapacity: number;
    currentLevel: number;
    sectorManagerId: string;
  }) => void;
  onCancel: () => void;
}

export default function SiteForm({ site, onSubmit, onCancel }: SiteFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    reservoirCapacity: '',
    currentLevel: '',
    sectorManagerId: ''
  });
  const [error, setError] = useState('');
  const [sectorManagers, setSectorManagers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectorManagers = async () => {
      try {
        const managers = await getSectorManagers();
        setSectorManagers(managers);
      } catch (err: any) {
        setError('Error loading sector managers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSectorManagers();
  }, []);

  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name,
        address: site.address,
        latitude: site.latitude.toString(),
        longitude: site.longitude.toString(),
        reservoirCapacity: site.reservoirCapacity.toString(),
        currentLevel: site.currentLevel.toString(),
        sectorManagerId: site.sectorManagerId
      });
    }
  }, [site]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation des champs obligatoires
    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude || 
        !formData.reservoirCapacity || !formData.sectorManagerId) {
      setError('Please fill in all required fields');
      return;
    }

    // Validation des valeurs numériques
    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);
    const reservoirCapacity = parseFloat(formData.reservoirCapacity);
    const currentLevel = parseFloat(formData.currentLevel) || 0;

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    if (isNaN(reservoirCapacity) || reservoirCapacity <= 0) {
      setError('Reservoir capacity must be a positive number');
      return;
    }

    if (isNaN(currentLevel) || currentLevel < 0) {
      setError('Current level must be a positive number or zero');
      return;
    }

    if (currentLevel > reservoirCapacity) {
      setError('Current level cannot exceed reservoir capacity');
      return;
    }

    onSubmit({
      name: formData.name,
      address: formData.address,
      latitude,
      longitude,
      reservoirCapacity,
      currentLevel,
      sectorManagerId: formData.sectorManagerId
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {site ? 'Edit Site' : 'Create New Site'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name *
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Distribution site name"
            />
            <Droplet className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <div className="relative">
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Complete site address"
            />
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude *
            </label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              required
              step="0.000001"
              min="-90"
              max="90"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Latitude (-90 à 90)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude *
            </label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              required
              step="0.000001"
              min="-180"
              max="180"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Longitude (-180 à 180)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reservoir Capacity (liters) *
          </label>
          <input
            type="number"
            name="reservoirCapacity"
            value={formData.reservoirCapacity}
            onChange={handleChange}
            required
            min="1"
            step="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Capacity in liters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Level (liters)
          </label>
          <input
            type="number"
            name="currentLevel"
            value={formData.currentLevel}
            onChange={handleChange}
            min="0"
            step="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Current level in liters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sector Manager *
          </label>
          <div className="relative">
            <select
              name="sectorManagerId"
              value={formData.sectorManagerId}
              onChange={handleChange}
              required
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="">Select a sector manager</option>
              {sectorManagers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.email})
                </option>
              ))}
            </select>
            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {loading && (
            <p className="mt-1 text-sm text-gray-500">Loading sector managers...</p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {site ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
} 