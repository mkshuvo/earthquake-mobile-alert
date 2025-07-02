import { create } from 'zustand';
import { EarthquakeEvent, UserLocation, NotificationSettings } from '../types/earthquake';

interface EarthquakeStore {
  earthquakes: EarthquakeEvent[];
  userLocation: UserLocation | null;
  notificationSettings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';

  // Actions
  setEarthquakes: (earthquakes: EarthquakeEvent[]) => void;
  addEarthquake: (earthquake: EarthquakeEvent) => void;
  setUserLocation: (location: UserLocation) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
  updateLastUpdate: () => void;
}

const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  minimumMagnitude: 4.0,
  maxDistance: 500, // 500km radius
  enableSound: true,
  enableVibration: true,
  quietHours: {
    enabled: false,
    startHour: 22, // 10 PM
    endHour: 7,    // 7 AM
  },
};

export const useEarthquakeStore = create<EarthquakeStore>((set, get) => ({
  earthquakes: [],
  userLocation: null,
  notificationSettings: defaultNotificationSettings,
  isLoading: false,
  error: null,
  lastUpdate: null,
  connectionStatus: 'disconnected',

  setEarthquakes: (earthquakes) => 
    set({ earthquakes, lastUpdate: new Date() }),

  addEarthquake: (earthquake) => {
    const { earthquakes } = get();
    // Avoid duplicates
    if (!earthquakes.find(eq => eq.id === earthquake.id)) {
      set({ 
        earthquakes: [earthquake, ...earthquakes].slice(0, 100), // Keep only latest 100
        lastUpdate: new Date() 
      });
    }
  },

  setUserLocation: (location) => 
    set({ userLocation: location }),

  updateNotificationSettings: (settings) =>
    set((state) => ({
      notificationSettings: { ...state.notificationSettings, ...settings }
    })),

  setLoading: (loading) => 
    set({ isLoading: loading }),

  setError: (error) => 
    set({ error }),

  setConnectionStatus: (status) => 
    set({ connectionStatus: status }),

  updateLastUpdate: () => 
    set({ lastUpdate: new Date() }),
}));
