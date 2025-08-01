export interface AlertThresholds {
  low_water_level: { warning: number; critical: number; emergency: number };
  battery_level: { warning: number; critical: number };
  signal_strength: { warning: number; critical: number };
  maintenance_interval: { preventive: number; inspection: number; emergency: number };
  accuracy_threshold: { warning: number; critical: number };
  calibration_reminder: { days_before: number };
}

export interface SeasonalSettings {
  dry_season: { 
    enabled: boolean; 
    start_month: number; 
    end_month: number; 
    adjustments: {
      water_level_threshold: number;
      maintenance_frequency: number;
      alert_sensitivity: number;
    }
  };
  rainy_season: { 
    enabled: boolean; 
    start_month: number; 
    end_month: number; 
    adjustments: {
      water_level_threshold: number;
      maintenance_frequency: number;
      alert_sensitivity: number;
    }
  };
  peak_usage: { 
    enabled: boolean; 
    start_hour: number; 
    end_hour: number; 
    adjustments: {
      monitoring_frequency: number;
      alert_threshold: number;
    }
  };
}

export interface NotificationSettings {
  email_notifications: {
    enabled: boolean;
    recipients: string[];
    alert_types: string[];
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  sms_notifications: {
    enabled: boolean;
    recipients: string[];
    alert_types: string[];
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  push_notifications: {
    enabled: boolean;
    alert_types: string[];
    critical_only: boolean;
  };
  technical_alerts: {
    enabled: boolean;
    severity_levels: string[];
    auto_escalation: boolean;
    escalation_delay: number; // minutes
  };
}

export interface MaintenanceSettings {
  preventive_maintenance: {
    enabled: boolean;
    interval_days: number;
    reminder_days: number;
    auto_schedule: boolean;
  };
  sensor_calibration: {
    enabled: boolean;
    interval_days: number;
    reminder_days: number;
    auto_detection: boolean;
  };
  emergency_maintenance: {
    enabled: boolean;
    response_time_hours: number;
    auto_alert: boolean;
    escalation_enabled: boolean;
  };
  maintenance_teams: {
    primary_team: string;
    backup_team: string;
    emergency_contact: string;
  };
}

export interface SystemSettings {
  general: {
    system_name: string;
    timezone: string;
    language: string;
    date_format: string;
    auto_backup: boolean;
    backup_frequency: 'daily' | 'weekly' | 'monthly';
  };
  monitoring: {
    data_collection_interval: number; // minutes
    data_retention_days: number;
    real_time_monitoring: boolean;
    alert_cooldown: number; // minutes
  };
  security: {
    session_timeout: number; // minutes
    max_login_attempts: number;
    password_expiry_days: number;
    two_factor_auth: boolean;
  };
  integration: {
    mqtt_enabled: boolean;
    mqtt_broker: string;
    api_rate_limit: number;
    webhook_enabled: boolean;
    webhook_url: string;
  };
}

export interface SiteSettings {
  site_id: string;
  custom_thresholds: AlertThresholds;
  custom_seasonal: SeasonalSettings;
  custom_notifications: NotificationSettings;
  custom_maintenance: MaintenanceSettings;
  is_active: boolean;
  last_updated: Date;
}

export type SettingsCategory = 'general' | 'alerts' | 'seasonal' | 'notifications' | 'maintenance' | 'system'; 