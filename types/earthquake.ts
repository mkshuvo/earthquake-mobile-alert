export interface EarthquakeEvent {
  id: string;
  magnitude: number;
  location: {
    latitude: number;
    longitude: number;
    place: string;
  };
  depth: number;
  timestamp: Date;
  url: string;
  alert: string | null;
  tsunami: number;
  distance?: number; // Distance from user's location
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface NotificationSettings {
  enabled: boolean;
  minimumMagnitude: number;
  maxDistance: number; // in kilometers
  enableSound: boolean;
  enableVibration: boolean;
  quietHours: {
    enabled: boolean;
    startHour: number;
    endHour: number;
  };
}
