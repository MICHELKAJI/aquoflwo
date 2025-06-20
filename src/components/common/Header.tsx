import React from 'react';
import { Droplets, Bell, User, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser?: {
    name: string;
    role: string;
  };
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Header({ currentUser, onNavigate, currentPage }: HeaderProps) {
  const navigation = [
    { id: 'public', label: 'Accueil Public', roles: ['admin', 'sector_manager'] },
    { id: 'dashboard', label: 'Tableau de Bord', roles: ['admin', 'sector_manager'] },
    { id: 'sites', label: 'Sites & Secteurs', roles: ['admin'] },
    { id: 'notifications', label: 'Notifications', roles: ['admin', 'sector_manager'] },
  ];

  const visibleNavItems = navigation.filter(item => 
    !currentUser || item.roles.includes(currentUser.role)
  );

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Droplets className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AquaFlow</span>
            </div>
            
            {currentUser && (
              <nav className="ml-10 flex space-x-8">
                {visibleNavItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`${
                      currentPage === item.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <button className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </button>
                
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{currentUser.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{currentUser.role.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-1 rounded-full text-gray-400 hover:text-gray-500">
                    <Settings className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => onNavigate('public')}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}