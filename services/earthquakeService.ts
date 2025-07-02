import axios from 'axios';
import { EarthquakeEvent } from '../types/earthquake';

class EarthquakeService {
  private readonly baseURL = 'http://localhost:3000'; // Your earthquake server URL
  private readonly usgsURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';

  async getRecentEarthquakes(limit: number = 50): Promise<EarthquakeEvent[]> {
    try {
      // Try to get data from your local server first
      const response = await axios.get(`${this.baseURL}/api/earthquakes/recent`, {
        params: { limit },
        timeout: 5000,
      });
      
      return this.transformEarthquakeData(response.data);
    } catch (error) {
      console.warn('Local server unavailable, falling back to USGS API');
      // Fallback to USGS API directly
      return this.getFromUSGS();
    }
  }

  private async getFromUSGS(): Promise<EarthquakeEvent[]> {
    try {
      const response = await axios.get(`${this.usgsURL}/all_hour.geojson`, {
        timeout: 10000,
      });

      return this.transformUSGSData(response.data);
    } catch (error) {
      console.error('Failed to fetch from USGS:', error);
      throw new Error('Unable to fetch earthquake data');
    }
  }

  private transformEarthquakeData(data: any[]): EarthquakeEvent[] {
    return data.map(item => ({
      id: item.id,
      magnitude: item.magnitude,
      location: {
        latitude: item.location.latitude,
        longitude: item.location.longitude,
        place: item.location.place,
      },
      depth: item.depth,
      timestamp: new Date(item.timestamp),
      url: item.url,
      alert: item.alert,
      tsunami: item.tsunami,
    }));
  }

  private transformUSGSData(data: any): EarthquakeEvent[] {
    if (!data.features) return [];

    return data.features.map((feature: any) => ({
      id: feature.id,
      magnitude: feature.properties.mag || 0,
      location: {
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        place: feature.properties.place || 'Unknown location',
      },
      depth: feature.geometry.coordinates[2] || 0,
      timestamp: new Date(feature.properties.time),
      url: feature.properties.url || '',
      alert: feature.properties.alert,
      tsunami: feature.properties.tsunami || 0,
    })).filter((eq: EarthquakeEvent) => eq.magnitude > 0); // Filter out invalid data
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default new EarthquakeService();
