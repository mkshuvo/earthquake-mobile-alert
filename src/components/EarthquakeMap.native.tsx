import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatMagnitude, useEarthquakeStore } from '../store/earthquakeStore';

declare const navigator: any;
declare module 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

interface EarthquakeMapProps {
  onEarthquakeSelect: (id: string) => void;
}

export const EarthquakeMap: React.FC<EarthquakeMapProps> = ({
  onEarthquakeSelect,
}) => {
  // Only import maps on native platforms
  let MapView: any;
  let Circle: any;
  let Marker: any;
  let PROVIDER_GOOGLE: any;

  if (Platform.OS !== 'web') {
    try {
      MapView = require('react-native-maps').default;
      const maps = require('react-native-maps');
      Circle = maps.Circle;
      Marker = maps.Marker;
      PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
    } catch (error) {
      // Failed to load react-native-maps
    }
  }

  const mapRef = useRef<any>(null);
  const {
    filteredEarthquakes,
    mapRegion,
    setMapRegion,
    userLocation,
    setUserLocation,
    isLoading,
  } = useEarthquakeStore();

  useEffect(() => {
    // Request user location
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: any) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          
          // Center map on user location (Sticky Lock)
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 5, // Zoomed in closer (was 10)
              longitudeDelta: 5,
            }, 1000); // Animation duration
          }
        },
        (error: any) => {
          // Location error
        },
      );
    }
  }, [setUserLocation]);

  const handleCenterMap = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 10,
        longitudeDelta: 10,
      });
    }
  };

  const handleRefresh = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(mapRegion);
    }
  };

  const getMagnitudeColor = (magnitude: number): string => {
    if (magnitude >= 8.0) return '#8B0000'; // Blood Dark Red
    if (magnitude >= 6.0) return '#F44336'; // Red
    if (magnitude >= 4.0) return '#FF9800'; // Orange
    if (magnitude >= 3.0) return '#2196F3'; // Blue
    return '#4CAF50'; // Green
  };

  const getCircleRadius = (magnitude: number): number => {
    return 5000 + magnitude * 2000; // Significantly reduced from 20000 + mag * 15000
  };

  // Render web placeholder
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webPlaceholder}>
        <Text style={styles.webPlaceholderText}>📋 Web version available at http://localhost:48291</Text>
      </View>
    );
  }

  // If MapView not loaded, show fallback
  if (!MapView) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingOverlay}>
          <Text style={styles.webPlaceholderText}>Loading map...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#17a2b8" />
        </View>
      )}

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={mapRegion}
        onRegionChange={setMapRegion}
        showsUserLocation={true}
        followsUserLocation={false}
      >
        {/* Earthquake markers */}
        {filteredEarthquakes.map((earthquake) => {
          if (!earthquake || !earthquake.location) return null;
          const magnitude = Number(earthquake.magnitude) || 0;
          const lat = Number(earthquake.location.latitude) || 0;
          const lng = Number(earthquake.location.longitude) || 0;
          
          return (
            <React.Fragment key={earthquake.id}>
              {/* Circle ripple effect */}
              <Circle
                center={{
                  latitude: lat,
                  longitude: lng,
                }}
                radius={getCircleRadius(magnitude)}
                fillColor={`${getMagnitudeColor(magnitude)}33`}
                strokeColor={getMagnitudeColor(magnitude)}
                strokeWidth={2}
              />

              {/* Magnitude marker */}
              <Marker
                coordinate={{
                  latitude: lat,
                  longitude: lng,
                }}
                onPress={() => onEarthquakeSelect(earthquake.id)}
              >
                <TouchableOpacity
                  style={[
                    styles.markerButton,
                    { backgroundColor: getMagnitudeColor(magnitude) },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                  style={styles.magnitudeText}
                >
                  {formatMagnitude(magnitude)}
                </Text>
                </TouchableOpacity>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="#17a2b8"
          />
        )}
      </MapView>

      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        {/* Center map button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleCenterMap}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#17a2b8" />
        </TouchableOpacity>

        {/* Refresh button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="refresh" size={24} color="#17a2b8" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
    width: width,
    height: height * 0.5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  controlsContainer: {
    position: 'absolute',
    right: 16,
    top: 100,
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  magnitudeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  webPlaceholderText: {
    fontSize: 16,
    color: '#666',
  },
});
