import { User, Site, Notification, Announcement, WaterLevelData } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+1234567890',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sector Manager',
    email: 'manager@example.com',
    phone: '+1234567891',
    role: 'SECTOR_MANAGER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockSites: Site[] = [
  {
    id: '1',
    name: 'Site Principal',
    status: 'active',
    location: {
      address: '123 Rue Principale',
      coordinates: {
        latitude: 48.8566,
        longitude: 2.3522
      }
    },
    reservoirCapacity: 10000,
    currentLevel: 7500,
    lastRefill: new Date().toISOString(),
    sectorManager: mockUsers[0],
    households: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'low_level',
    message: 'Niveau d\'eau bas détecté',
    status: 'sent',
    siteId: '1',
    sentAt: new Date().toISOString(),
    recipientId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Maintenance Planifiée',
    content: 'Une maintenance est prévue ce weekend',
    type: 'maintenance',
    isPublished: true,
    createdAt: new Date()
  }
];

export function generateWaterLevelData(siteId: string, days: number = 7): WaterLevelData[] {
  const data: WaterLevelData[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(12, 0, 0, 0);
    
    data.push({
      timestamp: date,
      level: Math.floor(Math.random() * 1000),
      siteId
    });
  }
  
  return data;
} 