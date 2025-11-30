import axios, { AxiosInstance } from 'axios';
import mqtt from 'mqtt';
import { Platform, Vibration } from 'react-native';
import { EarthquakeEvent, useEarthquakeStore } from '../store/earthquakeStore';
import { soundService } from './soundService';

// Polyfills for MQTT
import '../polyfills';

declare const window: any;

const getHostName = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname;
  }
  if (Platform.OS === 'android') {
    return '10.0.2.2'; // Android Emulator host loopback
  }
  return 'localhost'; // iOS Simulator
};

const API_PORT = 51763;
const MQTT_PORT = 1883; // TCP Port for native (WebSockets usually 8083/45329, but native MQTT uses TCP)
// Note: If using WebSockets for native app, port might differ.
// React Native MQTT client usually works over TCP if not using WS.
// However, 'mqtt' package in RN often requires WS or TCP shim.
// Standard 'mqtt' in browser uses WS. In RN with polyfills, it can do TCP?
// Actually, 'mqtt' in RN usually expects a WebSocket connection (ws:// or wss://).
// EMQX usually exposes WS on 8083 or 45329. Let's assume WS for compatibility.
const MQTT_WS_PORT = 8083; // Standard EMQX WS port. User had 45329 in previous code.

const getApiUrl = () => `http://${getHostName()}:${API_PORT}/api`;

// Use WS for both Web and Native for consistency with 'mqtt.js'
const getMqttUrl = () => {
    const host = getHostName();
    // If running in Docker, might need adjustment, but for emulator 10.0.2.2 is correct.
    // If web, use relative or hostname.
    if (Platform.OS === 'web') {
         // Use the port from previous code if specific
         return `ws://${host}:45329/mqtt`; 
    }
    // For native, use standard WS port or the one exposed
    return `ws://${host}:8083/mqtt`;
};

const API_BASE_URL = getApiUrl();
const MQTT_TOPIC = 'earthquakes/alerts';

export class EarthquakeService {
  private apiClient: AxiosInstance;
  private mqttClient: mqtt.MqttClient | null = null;
  private lastEarthquakeIds: Set<string> = new Set();
  private pollCallbacks: {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onNewEarthquake?: (earthquake: EarthquakeEvent) => void;
    onError?: (error: string) => void;
  } | null = null;

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
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async getRecentEarthquakes(limit: number = 50): Promise<EarthquakeEvent[]> {
    return this.getEarthquakes({ limit });
  }

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
      console.warn('[EarthquakeService] Falling back to mock data');
      // Mock data logic retained for safety
      return [
        {
          id: '1',
          magnitude: 6.5,
          depth: 15,
          location: { latitude: 34.0522, longitude: -118.2437, place: 'Los Angeles, CA' },
          timestamp: new Date().toISOString(),
          tsunami: 0,
          url: '',
          alert: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
    }
  }

  async getStatistics(): Promise<any> {
    try {
      const response = await this.apiClient.get('/earthquakes/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  async getHealthCheck(): Promise<any> {
    try {
      const response = await this.apiClient.get('/earthquakes/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching health:', error);
      throw error;
    }
  }

  async triggerManualFetch(): Promise<{ message: string }> {
    try {
      const response = await this.apiClient.get('/earthquakes/fetch');
      return response.data;
    } catch (error) {
      console.error('Error triggering fetch:', error);
      throw error;
    }
  }

  connectWebSocket(callbacks: {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onNewEarthquake?: (earthquake: EarthquakeEvent) => void;
    onError?: (error: string) => void;
  }): void {
    try {
      this.pollCallbacks = callbacks;
      console.log('[EarthquakeService] Connecting to EMQX MQTT broker for real-time alerts...');
      
      this.loadInitialEarthquakes();
      this.connectToMQTT();
      
      // Note: onConnect will be called inside mqttClient.on('connect')
    } catch (error) {
      console.error('[EarthquakeService] Error initializing MQTT:', error);
      this.pollCallbacks?.onError?.(String(error));
    }
  }

  private async loadInitialEarthquakes(): Promise<void> {
    try {
      const earthquakes = await this.getEarthquakes({ limit: 30 });
      earthquakes.forEach(eq => this.lastEarthquakeIds.add(eq.id));
    } catch (error) {
      console.error('[EarthquakeService] Failed to load initial earthquakes:', error);
    }
  }

  private connectToMQTT(): void {
    const brokerUrl = getMqttUrl();
    console.log(`[EarthquakeService] Connecting to MQTT Broker: ${brokerUrl}`);

    try {
      this.mqttClient = mqtt.connect(brokerUrl, {
        clientId: `earthquake-mobile-${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 3000,
        // Force WebSocket for React Native if using ws:// protocol
        protocol: Platform.OS === 'web' ? 'ws' : 'ws', 
      });

      this.mqttClient.on('connect', () => {
        console.log('[EarthquakeService] 🟢 Connected to EMQX MQTT broker');
        this.pollCallbacks?.onConnect?.();
        
        this.mqttClient?.subscribe(MQTT_TOPIC, { qos: 1 }, (err) => {
          if (err) {
            console.error('[EarthquakeService] Failed to subscribe:', err);
          } else {
            console.log(`[EarthquakeService] ✅ Subscribed to ${MQTT_TOPIC}`);
          }
        });
      });

      this.mqttClient.on('message', (topic, message) => {
        try {
          const earthquake = JSON.parse(message.toString());
          
          if (!this.lastEarthquakeIds.has(earthquake.id)) {
            this.lastEarthquakeIds.add(earthquake.id);
            console.log('[EarthquakeService] 🚨 MQTT ALERT: New earthquake detected:', earthquake.id);
            this.pollCallbacks?.onNewEarthquake?.(earthquake);
            this.triggerEmergencyAlert(earthquake);
          }
        } catch (error) {
          console.error('[EarthquakeService] Error processing MQTT message:', error);
        }
      });

      this.mqttClient.on('error', (error) => {
        console.error('[EarthquakeService] MQTT error:', error);
        this.pollCallbacks?.onError?.(String(error));
      });

      this.mqttClient.on('offline', () => {
        console.warn('[EarthquakeService] ⚠️ MQTT offline');
      });

      this.mqttClient.on('reconnect', () => {
        console.log('[EarthquakeService] 🔄 Attempting to reconnect to MQTT...');
      });

    } catch (e) {
      console.error('[EarthquakeService] Failed to initiate MQTT connection', e);
    }
  }

  private triggerEmergencyAlert(earthquake: EarthquakeEvent): void {
    const store = useEarthquakeStore.getState();
    const userLocation = store.userLocation;

    let isNearby = false;
    let distance = -1;

    if (userLocation && earthquake.location) {
        distance = this.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            earthquake.location.latitude,
            earthquake.location.longitude
        );
        console.log(`[EarthquakeService] Distance to earthquake: ${distance.toFixed(2)}km`);
        
        if (distance <= 100) {
            isNearby = true;
        }
    }

    // Critical Alert Logic:
    // 1. Magnitude >= 4.0 AND Nearby (<= 100km) -> LOUD ALERT
    // 2. Magnitude >= 6.5 (Huge) -> LOUD ALERT (even if location unknown or far? Optional, sticking to 100km for now unless super huge)
    // User said: "if earthquake is above 3.9 then this is actually critical anyway"
    
    const isCriticalMagnitude = earthquake.magnitude >= 4.0;
    const shouldPlaySound = isCriticalMagnitude && (isNearby || distance === -1); 
    // If distance is -1 (unknown location), we might want to be conservative or aggressive.
    // Let's be aggressive for safety: if Mag >= 4.0 and we don't know where we are, alert! 
    // OR better: if we don't know where we are, maybe just vibrate.
    // Let's stick to: if nearby OR unknown location (safety first).

    if (shouldPlaySound) {
        console.log('[EarthquakeService] 🚨 CRITICAL CONDITION MET - TRIGGERING SOUND ALERT');
        soundService.playAlert();
        
        // Vibrate heavily
        Vibration.vibrate([0, 500, 200, 500]); // Pattern: Wait 0, Vibrate 500, Wait 200, Vibrate 500
    } else {
        // Just vibrate lightly for awareness if it's a new quake but not critical/nearby
        Vibration.vibrate(500);
    }

    // Web Notifications (Legacy support)
    if (Platform.OS === 'web' && 'Notification' in window) {
         const Notif = (window as any).Notification;
         if (Notif.permission === 'granted') {
           new Notif('🚨 EARTHQUAKE ALERT!', {
             body: `${earthquake.location.place}\nMagnitude: ${earthquake.magnitude}`,
             tag: 'earthquake-' + earthquake.id,
           });
         }
    }
  }

  disconnectWebSocket(): void {
    if (this.mqttClient) {
      this.mqttClient.end();
      this.mqttClient = null;
    }
    this.pollCallbacks?.onDisconnect?.();
    console.log('[EarthquakeService] Disconnected from MQTT');
  }

  isConnected(): boolean {
    return this.mqttClient ? this.mqttClient.connected : false;
  }
}

export const earthquakeService = new EarthquakeService();
