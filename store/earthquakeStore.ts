import { create } from 'zustand';
import { EarthquakeEvent, NotificationSettings, UserLocation } from '../types/earthquake';

interface EarthquakeFilters {
  minMagnitude: number;
  maxDistance?: number;
  maxDepth?: number;
}

interface EarthquakeStore {
  earthquakes: EarthquakeEvent[];
  filteredEarthquakes: EarthquakeEvent[];
  selectedEarthquake: EarthquakeEvent | null;
  userLocation: UserLocation | null;
  notificationSettings: NotificationSettings;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  filters: EarthquakeFilters;

  // Actions
  setEarthquakes: (earthquakes: EarthquakeEvent[]) => void;
  addEarthquake: (earthquake: EarthquakeEvent) => void;
  setSelectedEarthquake: (earthquake: EarthquakeEvent | null) => void;
  setUserLocation: (location: UserLocation) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  setLoading: (loading: boolean) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
  updateLastUpdate: () => void;
  setFilters: (filters: Partial<EarthquakeFilters>) => void;
}

// Helper function to format magnitude
export const formatMagnitude = (magnitude: number): string => {
  return magnitude.toFixed(1);
};

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
  filteredEarthquakes: [],
  selectedEarthquake: null,
  userLocation: null,
  notificationSettings: defaultNotificationSettings,
  isLoading: false,
  isConnected: false,
  error: null,
  lastUpdate: null,
  connectionStatus: 'disconnected',
  filters: {
    minMagnitude: 0,
    maxDistance: undefined,
    maxDepth: undefined,
  },

  setEarthquakes: (earthquakes) => {
    const { filters } = get();
    const filtered = applyFilters(earthquakes, filters);
    set({ earthquakes, filteredEarthquakes: filtered, lastUpdate: new Date() });
  },

  addEarthquake: (earthquake) => {
    const { earthquakes, filters } = get();
    // Avoid duplicates
    if (!earthquakes.find(eq => eq.id === earthquake.id)) {
      const newEarthquakes = [earthquake, ...earthquakes].slice(0, 100); // Keep only latest 100
      const filtered = applyFilters(newEarthquakes, filters);
      set({
        earthquakes: newEarthquakes,
        filteredEarthquakes: filtered,
        lastUpdate: new Date()
      });
    }
  },

  setSelectedEarthquake: (earthquake) =>
    set({ selectedEarthquake: earthquake }),

  setUserLocation: (location) =>
    set({ userLocation: location }),

  updateNotificationSettings: (settings) =>
    set((state) => ({
      notificationSettings: { ...state.notificationSettings, ...settings }
    })),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setConnected: (connected) =>
    set({ isConnected: connected, connectionStatus: connected ? 'connected' : 'disconnected' }),

  setError: (error) =>
    set({ error }),

  setConnectionStatus: (status) =>
    set({ connectionStatus: status, isConnected: status === 'connected' }),

  updateLastUpdate: () =>
    set({ lastUpdate: new Date() }),

  setFilters: (newFilters) => {
    const { earthquakes, filters } = get();
    const updatedFilters = { ...filters, ...newFilters };
    const filtered = applyFilters(earthquakes, updatedFilters);
    set({ filters: updatedFilters, filteredEarthquakes: filtered });
  },
}));

// Helper function to apply filters
function applyFilters(earthquakes: EarthquakeEvent[], filters: EarthquakeFilters): EarthquakeEvent[] {
  return earthquakes.filter(eq => {
    if (eq.magnitude < filters.minMagnitude) return false;
    if (filters.maxDistance !== undefined && eq.distance !== undefined && eq.distance > filters.maxDistance) return false;
    if (filters.maxDepth !== undefined && eq.depth > filters.maxDepth) return false;
    return true;
  });
}
