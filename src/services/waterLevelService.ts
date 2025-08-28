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

class WaterLevelService {
  public async getWaterLevels(siteId: string): Promise<WaterLevelData[]> {
    try {
      const response = await api.get<WaterLevelDataPoint[]>(`/water-levels?siteId=${siteId}&limit=24`);
      return response.data.map(item => ({
        timestamp: new Date(item.timestamp),
        level: item.distance,
        source: item.source,
        siteId: item.siteId
      }));
    } catch (error) {
      console.error('Error fetching water levels:', error);
      throw error;
    }
  }

  public async getLatestWaterLevel(siteId: string): Promise<WaterLevelData | null> {
    try {
      const response = await api.get<WaterLevelDataPoint[]>(`/water-levels?siteId=${siteId}&limit=1`);
      if (response.data.length === 0) return null;
      
      const item = response.data[0];
      return {
        timestamp: new Date(item.timestamp),
        level: item.distance,
        source: item.source,
        siteId: item.siteId
      };
    } catch (error) {
      console.error('Error fetching latest water level:', error);
      throw error;
    }
  }

  public async postWaterLevel(siteId: string, distance: number, source: string = 'manual'): Promise<void> {
    try {
      await api.post('/water-levels', { siteId, distance, source });
    } catch (error) {
      console.error('Error posting water level:', error);
      throw error;
    }
  }
}

export const waterLevelService = new WaterLevelService();

export const getWaterLevels = waterLevelService.getWaterLevels.bind(waterLevelService);
export const getLatestWaterLevel = waterLevelService.getLatestWaterLevel.bind(waterLevelService);
export const postWaterLevel = waterLevelService.postWaterLevel.bind(waterLevelService);
