export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'SECTOR_MANAGER' | 'ADMIN' | 'TECHNICIAN';
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
  memberCount: number;
  monthlyConsumption: number;
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

// Types pour les techniciens de maintenance
export interface Sensor {
  id: string;
  siteId: string;
  name: string;
  type: 'LEVEL' | 'PRESSURE' | 'FLOW' | 'TEMPERATURE' | 'QUALITY';
  model: string;
  serialNumber: string;
  installationDate: Date;
  lastCalibrationDate?: Date;
  nextCalibrationDate?: Date;
  batteryLevel: number;
  signalStrength: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'FAILED';
  accuracy: number;
  createdAt: Date;
  updatedAt: Date;
  site?: Site;
}

export interface SensorConfig {
  id: string;
  sensorId: string;
  parameter: string;
  value: string | number;
  unit: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  sensor?: Sensor;
}

export interface MaintenanceReport {
  id: string;
  siteId: string;
  technicianId: string;
  title: string;
  description: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'CALIBRATION' | 'INSTALLATION';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  startDate: Date;
  endDate?: Date;
  actionsTaken: string;
  partsUsed: string[];
  cost: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  site?: Site;
  technician?: User;
}

export interface SensorDiagnostic {
  id: string;
  sensorId: string;
  timestamp: Date;
  batteryLevel: number;
  signalStrength: number;
  accuracy: number;
  temperature: number;
  humidity: number;
  errorCodes: string[];
  performanceScore: number;
  recommendations: string[];
}

// Types pour les rapports de recharge
export interface RefillReport {
  id: string;
  siteId: string;
  reportedById: string;
  refillDate: Date;
  volumeRefilled: number; // en litres
  previousLevel: number | null; // pourcentage 0-100
  currentLevel: number; // pourcentage 0-100
  cost: number | null; // coût optionnel
  supplier: string | null; // fournisseur optionnel
  notes: string | null; // notes additionnelles
  createdAt: Date;
  updatedAt: Date;
  site?: Site;
  reportedBy?: User;
}

export interface RefillReportStats {
  totalVolumeRefilled: number;
  totalCost: number;
  averageVolumePerRefill: number;
  refillCount: number;
  averageDailyConsumption: number;
  costPerLiter: number;
  period: number; // nombre de jours
}

export interface RefillReportFilters {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface RefillReportFormData {
  volumeRefilled: number;
  currentLevel: number;
  refillDate?: Date;
  previousLevel?: number;
  cost?: number;
  supplier?: string;
  notes?: string;
}