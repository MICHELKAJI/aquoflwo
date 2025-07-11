import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import LandingPage from './components/public/LandingPage';
import LoginForm from './components/auth/LoginForm';
import AdminDashboard from './components/dashboard/AdminDashboard';
import SectorManagerDashboard from './components/dashboard/SectorManagerDashboard';
import SitesManagement from './components/sites/SitesManagement';
import NotificationsCenter from './components/notifications/NotificationsCenter';
import { User, Site, Notification, Announcement } from './types';
import { getCurrentUser } from './services/authService';
import { getAllSites, createSite, updateSite } from './services/siteService';
import { getAllNotifications } from './services/notificationService';
import { getAllAnnouncements } from './services/announcementService';

type Page = 'public' | 'login' | 'dashboard' | 'sites' | 'notifications';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('public');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier le token au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  // Charger les données de l'utilisateur
  const fetchUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Session expirée');
      }
      setCurrentUser(user);
      setCurrentPage('dashboard');
      await fetchInitialData();
    } catch (err: any) {
      console.error('Erreur lors de la récupération des données utilisateur:', err);
      localStorage.removeItem('token');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      console.log('Début de la récupération des données...');

      const [sitesData, notificationsData, announcementsData] = await Promise.all([
        getAllSites(),
        getAllNotifications(),
        getAllAnnouncements()
      ]);

      console.log('Données récupérées avec succès');
      setSites(sitesData);
      setNotifications(notificationsData);
      setAnnouncements(announcementsData);
    } catch (err: any) {
      console.error('Erreur détaillée:', err);
      setError(err.message || 'Erreur lors de la récupération des données');
    }
  };

  const handleLogin = async (user: User, token: string) => {
    try {
      setCurrentUser(user);
      setCurrentPage('dashboard');
      await fetchInitialData();
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', err);
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCurrentPage('public');
    setSites([]);
    setNotifications([]);
    setAnnouncements([]);
  };

  const handleNavigate = (page: string) => {
    if (page === 'public') {
      handleLogout();
    } else {
      setCurrentPage(page as Page);
    }
  };

  const handleCreateSite = async (newSite: Omit<Site, 'id' | 'createdAt'>) => {
    try {
      const site = await createSite(newSite);
      setSites([...sites, site]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateSite = async (id: string, updates: Partial<Site>) => {
    try {
      const updatedSite = await updateSite(id, updates);
      setSites(sites.map(site => 
        site.id === id ? updatedSite : site
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteSite = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const response = await fetch(`/api/sites/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du site');
      }

      setSites(sites.filter(site => site.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendNotification = async (newNotification: Omit<Notification, 'id' | 'sentAt' | 'sentById'>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newNotification,
          sentById: currentUser?.id
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de la notification');
      }

      const notification = await response.json();
      setNotifications([notification, ...notifications]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginForm 
            onLogin={handleLogin}
            onCancel={() => setCurrentPage('public')}
          />
        );
      
      case 'dashboard':
        if (!currentUser) return null;
        
        if (currentUser.role === 'ADMIN') {
          return (
            <AdminDashboard 
              sites={sites}
              notifications={notifications}
              onNavigate={handleNavigate}
            />
          );
        } else if (currentUser.role === 'SECTOR_MANAGER') {
          const userSite = sites.find(site => site.sectorManager?.id === currentUser.id);
          if (userSite) {
            return (
              <SectorManagerDashboard 
                currentUser={currentUser}
                site={userSite}
                notifications={notifications}
              />
            );
          }
        }
        return <div>Tableau de bord non disponible</div>;
      
      case 'sites':
        return (
          <SitesManagement 
            sites={sites}
            onCreateSite={handleCreateSite}
            onUpdateSite={handleUpdateSite}
            onDeleteSite={handleDeleteSite}
            onBack={() => setCurrentPage('dashboard')}
          />
        );
      
      case 'notifications':
        return (
          <NotificationsCenter 
            sites={sites}
            onShowDashboard={() => setCurrentPage('dashboard')}
          />
        );
      
      default:
        return (
          <LandingPage 
            announcements={announcements}
            sites={sites}
            onLogin={() => setCurrentPage('login')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {currentPage !== 'login' && (
        <Header 
          currentUser={currentUser ? {
            name: currentUser.name,
            role: currentUser.role
          } : undefined}
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />
      )}
      {renderPage()}
    </div>
  );
}

export default App;
