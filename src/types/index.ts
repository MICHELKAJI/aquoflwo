export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'SECTOR_MANAGER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export type SiteStatus = 'active' | 'maintenance' | 'emergency';

export interface Site {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  reservoirCapacity: number;
  currentLevel: number;
  sectorManagerId: string;
  createdAt: Date;
  updatedAt: Date;
  sectorManager?: User;
  households?: Household[];
  notifications?: Notification[];
}

export interface Household {
  id: string;
  name: string;
  contact: string;
  address: string;
  isActive: boolean;
  siteId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'LOW_LEVEL' | 'REFILL' | 'MAINTENANCE' | 'EMERGENCY' | 'GENERAL';
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED';
  sentAt: string;
  recipients: string[];
  siteId: string;
  sentById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'news' | 'maintenance' | 'emergency';
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
}

export interface WaterLevelData {
  timestamp: Date;
  level: number;
  siteId: string;
}

export enum AlertType {
  LOW_WATER_LEVEL = 'LOW_WATER_LEVEL',
  SENSOR_FAILURE = 'SENSOR_FAILURE',
  PUMP_FAILURE = 'PUMP_FAILURE',
  LEAK_DETECTED = 'LEAK_DETECTED',
  MAINTENANCE_DUE = 'MAINTENANCE_DUE'
}

export enum AlertLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY'
}

export interface Alert {
  id: string;
  siteId: string;
  type: AlertType;
  message: string;
  level: AlertLevel;
  isActive: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  actionTaken?: string;
  actionTakenAt?: Date;
  site?: Site;
  createdBy?: User;
}