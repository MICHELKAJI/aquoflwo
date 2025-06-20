import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteForm from '../components/sites/SiteForm';
import { createSite } from '../services/siteService';
import { getAllUsers } from '../services/userService';

export default function NewSitePage() {
  const navigate = useNavigate();
  const [sectorManagers, setSectorManagers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSectorManagers = async () => {
      try {
        const users = await getAllUsers();
        const managers = users.filter(user => user.role === 'SECTOR_MANAGER');
        setSectorManagers(managers);
      } catch (err: any) {
        setError('Erreur lors du chargement des chefs de secteur');
        console.error(err);
      }
    };

    fetchSectorManagers();
  }, []);

  const handleSubmit = async (siteData: any) => {
    try {
      await createSite(siteData);
      navigate('/sites');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du site');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      <SiteForm
        sectorManagers={sectorManagers}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/sites')}
      />
    </div>
  );
} 