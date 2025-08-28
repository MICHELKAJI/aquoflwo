import api from './api';

export interface WaterLevelDataPoint {
  timestamp: string;
  distance: number;
  source: string;
  siteId: string;
}

export interface WaterLevelData {
  timestamp: Date;
  level: number; // en cm
  source: string;
  siteId: string;
}

type WaterLevelCallback = (data: WaterLevelData) => void;

class WaterLevelService {
  private static instance: WaterLevelService;
  private callbacks: Map<string, Set<WaterLevelCallback>> = new Map();
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 seconde

  private constructor() {
    this.connectWebSocket();
  }

  public static getInstance(): WaterLevelService {
    if (!WaterLevelService.instance) {
      WaterLevelService.instance = new WaterLevelService();
    }
    return WaterLevelService.instance;
  }

  private connectWebSocket() {
    // Utilisez votre URL de base API et remplacez http par ws
    const wsUrl = `${window.location.origin.replace('http', 'ws')}/ws/water-levels`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const data: WaterLevelDataPoint = JSON.parse(event.data);
        const waterLevelData: WaterLevelData = {
          timestamp: new Date(data.timestamp),
          level: data.distance,
          source: data.source,
          siteId: data.siteId
        };

        // Notify all callbacks for this site
        const siteCallbacks = this.callbacks.get(data.siteId) || [];
        siteCallbacks.forEach(callback => callback(waterLevelData));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connectWebSocket();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  public subscribe(siteId: string, callback: WaterLevelCallback): () => void {
    if (!this.callbacks.has(siteId)) {
      this.callbacks.set(siteId, new Set());
    }
    
    const callbacks = this.callbacks.get(siteId)!;
    callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.callbacks.delete(siteId);
      }
    };
  }

  public async getWaterLevels(siteId: string): Promise<WaterLevelData[]> {
    try {
      const response = await api.get(`/api/water-levels?siteId=${siteId}`);
      return response.data.map((point: WaterLevelDataPoint) => ({
        timestamp: new Date(point.timestamp),
        level: point.distance,
        source: point.source,
        siteId: point.siteId
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des niveaux d\'eau:', error);
      throw error;
    }
  }

  public async postWaterLevel(siteId: string, distance: number, source: string): Promise<WaterLevelData> {
    try {
      const response = await api.post('/api/water-levels', {
        siteId,
        distance,
        source
      });
      return {
        timestamp: new Date(response.data.timestamp),
        level: response.data.distance,
        source: response.data.source,
        siteId: response.data.siteId
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du niveau d\'eau:', error);
      throw error;
    }
  }
}

export const waterLevelService = WaterLevelService.getInstance();

export const getWaterLevels = waterLevelService.getWaterLevels.bind(waterLevelService);
export const postWaterLevel = waterLevelService.postWaterLevel.bind(waterLevelService);
