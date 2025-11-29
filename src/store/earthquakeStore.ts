import moment from 'moment';
import { create } from 'zustand';

export interface EarthquakeEvent {
  id: string;
  magnitude: number;
  location: {
    latitude: number;
    longitude: number;
    place: string;
  };
  depth: number;
  timestamp: string;
  url: string;
  alert?: string;
  tsunami: number;
  createdAt: string;
  updatedAt: string;
}

export interface EarthquakeStore {
  earthquakes: EarthquakeEvent[];
  filteredEarthquakes: EarthquakeEvent[];
  selectedEarthquake: EarthquakeEvent | null;
  isLoading: boolean;
  error: string | null;
  userLocation: { latitude: number; longitude: number } | null;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  filters: {
    minMagnitude: number;
    maxMagnitude: number;
    location?: string;
    timeRange: 'all' | '24h' | '7d' | '30d';
  };
  isConnected: boolean;

  // Actions
  setEarthquakes: (earthquakes: EarthquakeEvent[]) => void;
  addEarthquake: (earthquake: EarthquakeEvent) => void;
  setSelectedEarthquake: (earthquake: EarthquakeEvent | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUserLocation: (location: { latitude: number; longitude: number }) => void;
  setMapRegion: (region: any) => void;
  setFilters: (filters: Partial<EarthquakeStore['filters']>) => void;
  filterEarthquakes: () => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

const initialFilters = {
  minMagnitude: 0,
  maxMagnitude: 10,
  timeRange: 'all' as const,
};

const initialMapRegion = {
  latitude: 20.0,
  longitude: 120.0,
  latitudeDelta: 60,
  longitudeDelta: 60,
};

export const useEarthquakeStore = create<EarthquakeStore>((set, get) => ({
  earthquakes: [],
  filteredEarthquakes: [],
  selectedEarthquake: null,
  isLoading: false,
  error: null,
  userLocation: null,
  mapRegion: initialMapRegion,
  filters: initialFilters,
  isConnected: false,

  setEarthquakes: (earthquakes) =>
    set((state) => {
      const updated = { earthquakes };
      const filtered = applyFilters(earthquakes, state.filters);
      return { ...updated, filteredEarthquakes: filtered };
    }),

  addEarthquake: (earthquake) =>
    set((state) => {
      const earthquakes = [earthquake, ...state.earthquakes].slice(0, 500);
      const filtered = applyFilters(earthquakes, state.filters);
      return {
        earthquakes,
        filteredEarthquakes: filtered,
        selectedEarthquake: earthquake,
      };
    }),

  setSelectedEarthquake: (earthquake) =>
    set(() => ({ selectedEarthquake: earthquake })),

  setLoading: (loading) => set(() => ({ isLoading: loading })),

  setError: (error) => set(() => ({ error })),

  setUserLocation: (location) =>
    set(() => ({
      userLocation: location,
      mapRegion: {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 10,
        longitudeDelta: 10,
      },
    })),

  setMapRegion: (region) => set(() => ({ mapRegion: region })),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  filterEarthquakes: () => {
    const state = get();
    const filtered = applyFilters(state.earthquakes, state.filters);
    set(() => ({ filteredEarthquakes: filtered }));
  },

  setConnected: (connected) => set(() => ({ isConnected: connected })),

  reset: () =>
    set(() => ({
      earthquakes: [],
      filteredEarthquakes: [],
      selectedEarthquake: null,
      isLoading: false,
      error: null,
      filters: initialFilters,
    })),
}));

// Helper function to apply filters
function applyFilters(
  earthquakes: EarthquakeEvent[],
  filters: EarthquakeStore['filters'],
): EarthquakeEvent[] {
  return earthquakes.filter((eq) => {
    // Magnitude filter
    if (eq.magnitude < filters.minMagnitude || eq.magnitude > filters.maxMagnitude) {
      return false;
    }

    // Location filter
    if (filters.location) {
      const searchTerm = filters.location.toLowerCase();
      if (
        !eq.location.place.toLowerCase().includes(searchTerm)
      ) {
        return false;
      }
    }

    // Time range filter
    if (filters.timeRange !== 'all') {
      const now = moment();
      const eventTime = moment(eq.timestamp);
      const hoursAgo =
        filters.timeRange === '24h'
          ? 24
          : filters.timeRange === '7d'
            ? 24 * 7
            : 24 * 30;

      if (now.diff(eventTime, 'hours') > hoursAgo) {
        return false;
      }
    }

    return true;
  });
}
