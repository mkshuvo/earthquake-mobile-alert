import { create } from 'zustand';

/**
 * Formats a magnitude value with truncation to 1 decimal place (no rounding).
 * Example: 3.16 -> "3.1", 3.12 -> "3.1", 3.0 -> "3.0"
 */
export const formatMagnitude = (magnitude: number | null | undefined): string => {
  if (magnitude === null || magnitude === undefined) return '0.0';
  return (Math.trunc(magnitude * 10) / 10).toFixed(1);
};

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

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface EarthquakeFilters {
  minMagnitude: number;
  maxMagnitude: number;
  location: string;
  startDate: string;
  endDate: string;
  limit: number;
}

interface EarthquakeState {
  earthquakes: EarthquakeEvent[];
  filteredEarthquakes: EarthquakeEvent[];
  selectedEarthquake: EarthquakeEvent | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  mapRegion: Region;
  filters: EarthquakeFilters;

  setEarthquakes: (earthquakes: EarthquakeEvent[]) => void;
  addEarthquake: (earthquake: EarthquakeEvent) => void;
  setSelectedEarthquake: (earthquake: EarthquakeEvent | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnected: (connected: boolean) => void;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
  setMapRegion: (region: Region) => void;
  setFilters: (filters: Partial<EarthquakeFilters>) => void;
  filterEarthquakes: () => void;
}

export const useEarthquakeStore = create<EarthquakeState>((set) => ({
  earthquakes: [],
  filteredEarthquakes: [],
  selectedEarthquake: null,
  isLoading: false,
  error: null,
  isConnected: false,
  userLocation: null,
  mapRegion: {
    latitude: 20,
    longitude: 0,
    latitudeDelta: 100,
    longitudeDelta: 100,
  },
  filters: {
    minMagnitude: 0,
    maxMagnitude: 10,
    location: '',
    startDate: '',
    endDate: '',
    limit: 100,
  },

  setEarthquakes: (earthquakes) => set((state) => {
    // Deduplicate incoming earthquakes based on ID
    const uniqueEarthquakes = Array.from(
      new Map(earthquakes.map(eq => [eq.id, eq])).values()
    );

    // Apply current filters when setting earthquakes
    const { minMagnitude, maxMagnitude, location } = state.filters;
    const filtered = uniqueEarthquakes.filter((eq) => {
      const matchesMag = eq.magnitude >= minMagnitude && eq.magnitude <= maxMagnitude;
      const matchesLoc = location ? eq.location.place.toLowerCase().includes(location.toLowerCase()) : true;
      return matchesMag && matchesLoc;
    });
    
    return { 
      earthquakes: uniqueEarthquakes, 
      filteredEarthquakes: filtered 
    };
  }),
  
  addEarthquake: (earthquake) => set((state) => {
    const index = state.earthquakes.findIndex((eq) => eq.id === earthquake.id);
    
    let newEarthquakes;
    if (index !== -1) {
      // Update existing earthquake with new data
      newEarthquakes = [...state.earthquakes];
      newEarthquakes[index] = earthquake;
    } else {
      // Add new earthquake
      newEarthquakes = [earthquake, ...state.earthquakes];
    }

    newEarthquakes = newEarthquakes
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
    // Apply filters to new list
    const { minMagnitude, maxMagnitude, location } = state.filters;
    const filtered = newEarthquakes.filter((eq) => {
      const matchesMag = eq.magnitude >= minMagnitude && eq.magnitude <= maxMagnitude;
      const matchesLoc = location ? eq.location.place.toLowerCase().includes(location.toLowerCase()) : true;
      return matchesMag && matchesLoc;
    });

    return { 
      earthquakes: newEarthquakes,
      filteredEarthquakes: filtered 
    };
  }),

  setSelectedEarthquake: (earthquake) => set({ selectedEarthquake: earthquake }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setConnected: (isConnected) => set({ isConnected }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setMapRegion: (mapRegion) => set({ mapRegion }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  filterEarthquakes: () => set((state) => {
    const { minMagnitude, maxMagnitude, location } = state.filters;
    const filtered = state.earthquakes.filter((eq) => {
      const matchesMag = eq.magnitude >= minMagnitude && eq.magnitude <= maxMagnitude;
      const matchesLoc = location ? eq.location.place.toLowerCase().includes(location.toLowerCase()) : true;
      return matchesMag && matchesLoc;
    });
    return { filteredEarthquakes: filtered };
  }),
}));
