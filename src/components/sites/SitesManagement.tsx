import React, { useState, useEffect } from 'react';
import { MapPin, Users, Droplets, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Site, User } from '../../types';
import { getSectorManagers } from '../../services/userService';
import SiteForm from './SiteForm';

interface SitesManagementProps {
  sites: Site[];
  onCreateSite: (site: Omit<Site, 'id' | 'createdAt'>) => void;
  onUpdateSite: (id: string, site: Partial<Site>) => void;
  onDeleteSite: (id: string) => void;
}

export default function SitesManagement({ 
  sites, 
  onCreateSite, 
  onUpdateSite, 
  onDeleteSite 
}: SitesManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [sectorManagers, setSectorManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSectorManagers = async () => {
      try {
        const managers = await getSectorManagers();
        setSectorManagers(managers);
      } catch (err: any) {
        setError('Erreur lors du chargement des chefs de secteur');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSectorManagers();
  }, []);

  const handleCreateSite = (siteData: Omit<Site, 'id' | 'createdAt'>) => {
    onCreateSite(siteData);
    setShowCreateForm(false);
  };

  const handleUpdateSite = (siteData: Partial<Site>) => {
    if (editingSite) {
      onUpdateSite(editingSite.id, siteData);
      setEditingSite(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Site Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span>New Site</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {sites.map((site) => (
            <li key={site.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Droplets className="h-5 w-5 text-blue-500 mr-2" />
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {site.name}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingSite(site)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDeleteSite(site.id)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {site.location}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <p>
                      Sector manager: {site.sectorManager?.name || 'Unassigned'}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showCreateForm && (
        <SiteForm
          onSubmit={handleCreateSite}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingSite && (
        <SiteForm
          site={editingSite}
          onSubmit={handleUpdateSite}
          onCancel={() => setEditingSite(null)}
        />
      )}
    </div>
  );
}