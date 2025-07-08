import React, { useState, useEffect } from 'react';
import { Droplet, MapPin, User, Edit, Trash2, Plus } from 'lucide-react';
import { User as UserType, Household } from '../../types';
import SiteForm from './SiteForm';
import { getAllSites } from '../../services/siteService';
import { getSectorManagers } from '../../services/userService';

interface Site {
  id: string;
  name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  reservoirCapacity: number;
  currentLevel: number;
  lastRefill: string;
  status: 'active' | 'maintenance' | 'emergency';
  sectorManager: UserType;
  households: Household[];
  createdAt: string;
  updatedAt: string;
}

interface SiteListProps {
  onSiteSelect?: (site: Site) => void;
}

export default function SiteList({ onSiteSelect }: SiteListProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [sectorManagers, setSectorManagers] = useState([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSites();
    fetchSectorManagers();
  }, []);

  const fetchSites = async () => {
    try {
      const data = await getAllSites();
      setSites(data);
    } catch (error) {
      setError('Erreur lors du chargement des sites');
      console.error('Erreur:', error);
    }
  };

  const fetchSectorManagers = async () => {
    try {
      const data = await getSectorManagers();
      setSectorManagers(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleCreateSite = async (siteData: any) => {
    try {
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteData)
      });

      if (!response.ok) throw new Error('Erreur lors de la création du site');
      
      await fetchSites();
      setIsFormOpen(false);
    } catch (error) {
      setError('Erreur lors de la création du site');
      console.error('Erreur:', error);
    }
  };

  const handleUpdateSite = async (siteData: any) => {
    try {
      const response = await fetch(`/api/sites/${selectedSite?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteData)
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du site');
      
      await fetchSites();
      setSelectedSite(null);
      setIsFormOpen(false);
    } catch (error) {
      setError('Erreur lors de la mise à jour du site');
      console.error('Erreur:', error);
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) return;

    try {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression du site');
      
      await fetchSites();
    } catch (error) {
      setError('Erreur lors de la suppression du site');
      console.error('Erreur:', error);
    }
  };

  const getLevelPercentage = (currentLevel: number, capacity: number) => {
    return Math.round((currentLevel / capacity) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Distribution Sites</h1>
        <button
          onClick={() => {
            setSelectedSite(null);
            setIsFormOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New site
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {isFormOpen ? (
        <SiteForm
          site={selectedSite || undefined}
          sectorManagers={sectorManagers}
          onSubmit={selectedSite ? handleUpdateSite : handleCreateSite}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedSite(null);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map(site => (
            <div
              key={site.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{site.name}</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedSite(site);
                      setIsFormOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSite(site.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{site.location.address}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-2" />
                  <span>{site.sectorManager.name}</span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-gray-600">
                      <Droplet className="h-5 w-5 mr-2" />
                      <span>Reservoir level</span>
                    </div>
                    <span className="text-sm font-medium">
                      {getLevelPercentage(site.currentLevel, site.reservoirCapacity)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${getLevelPercentage(site.currentLevel, site.reservoirCapacity)}%`
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {site.currentLevel}L / {site.reservoirCapacity}L
                  </div>
                </div>

                {onSiteSelect && (
                  <button
                    onClick={() => onSiteSelect(site)}
                    className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    View details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 