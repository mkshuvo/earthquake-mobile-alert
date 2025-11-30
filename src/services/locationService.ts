import * as Location from 'expo-location';

export const locationService = {
  requestLocationPermission: async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      // Error requesting location permission
      return false;
    }
  },

  getCurrentLocation: async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      // Error getting current location
      throw error;
    }
  },
};

export default locationService;
