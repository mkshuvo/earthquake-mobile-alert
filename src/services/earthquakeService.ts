import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';
import { EarthquakeEvent } from '../store/earthquakeStore';

declare const window: any;

// Use dynamic API URL based on environment
const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    // Web platform - use relative or same-origin URL
    return `${window.location.protocol}//${window.location.hostname}:51763/api`;
  }
  // Native platform
  return 'http://localhost:51763/api';
};

const getWsUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    // Web platform
    return `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:51763`;
  }
  // Native platform
  return 'http://localhost:51763';
};

const API_BASE_URL = getApiUrl();
const WS_URL = getWsUrl();

export class EarthquakeService {
  private apiClient: AxiosInstance;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch earthquakes with optional filters
   */
  async getEarthquakes(
    filters?: Partial<{
      minMagnitude: number;
      maxMagnitude: number;
      location: string;
      startDate: string;
      endDate: string;
      limit: number;
    }>,
  ): Promise<EarthquakeEvent[]> {
    try {
      console.log(`[EarthquakeService] Fetching earthquakes from ${API_BASE_URL}`, filters);
      const response = await this.apiClient.get('/earthquakes', {
        params: filters,
      });
      console.log(`[EarthquakeService] Successfully fetched ${response.data.length} earthquakes from backend`);
      return response.data;
    } catch (error) {
      console.error(`[EarthquakeService] Error fetching earthquakes from ${API_BASE_URL}:`, error);
      // Return mock data for development
      console.warn('[EarthquakeService] Falling back to mock data');
      return [
        {
          id: '1',
          magnitude: 6.5,
          depth: 15,
          location: {
            latitude: 34.0522,
            longitude: -118.2437,
            place: 'Los Angeles, CA',
          },
          timestamp: new Date().toISOString(),
          tsunami: 0,
          url: '',
          alert: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          magnitude: 5.2,
          depth: 20,
          location: {
            latitude: 37.7749,
            longitude: -122.4194,
            place: 'San Francisco, CA',
          },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          tsunami: 0,
          url: '',
          alert: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          magnitude: 4.8,
          depth: 10,
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            place: 'New York, NY',
          },
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          tsunami: 0,
          url: '',
          alert: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  }

  /**
   * Get earthquake statistics
   */
  async getStatistics(): Promise<any> {
    try {
      const response = await this.apiClient.get('/earthquakes/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  /**
   * Get health check status
   */
  async getHealthCheck(): Promise<any> {
    try {
      const response = await this.apiClient.get('/earthquakes/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching health:', error);
      throw error;
    }
  }

  /**
   * Trigger manual fetch of earthquake data
   */
  async triggerManualFetch(): Promise<{ message: string }> {
    try {
      const response = await this.apiClient.get('/earthquakes/fetch');
      return response.data;
    } catch (error) {
      console.error('Error triggering fetch:', error);
      throw error;
    }
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  connectWebSocket(callbacks: {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onNewEarthquake?: (earthquake: EarthquakeEvent) => void;
    onError?: (error: string) => void;
  }): void {
    try {
      this.socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.socket?.emit('subscribe-earthquakes');
        callbacks.onConnect?.();
      });

      this.socket.on('disconnect', (reason: string) => {
        console.log('WebSocket disconnected:', reason);
        callbacks.onDisconnect?.();
      });

      this.socket.on('new-earthquake', (earthquake: EarthquakeEvent) => {
        console.log('New earthquake received:', earthquake);
        callbacks.onNewEarthquake?.(earthquake);
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('WebSocket error:', error);
        callbacks.onError?.(error.message);
      });

      this.socket.on('error', (error: any) => {
        console.error('Socket error:', error);
        callbacks.onError?.(error);
      });
    } catch (error) {
      console.error('Error establishing WebSocket:', error);
      callbacks.onError?.(String(error));
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.socket) {
      this.socket.emit('unsubscribe-earthquakes');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const earthquakeService = new EarthquakeService();
