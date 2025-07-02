import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEarthquakeStore } from '@/store/earthquakeStore';
import earthquakeService from '@/services/earthquakeService';
import locationService from '@/services/locationService';
import notificationService from '@/services/notificationService';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const {
    earthquakes,
    userLocation,
    isLoading,
    error,
    lastUpdate,
    connectionStatus,
    setEarthquakes,
    setUserLocation,
    setLoading,
    setError,
    setConnectionStatus,
  } = useEarthquakeStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setLoading(true);
    setConnectionStatus('connecting');

    try {
      // Request permissions
      await requestPermissions();
      
      // Get user location
      await getCurrentLocation();
      
      // Load initial earthquake data
      await loadEarthquakeData();
      
      // Start background monitoring
      await notificationService.scheduleLocationBasedCheck();
      
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize app');
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    const locationPermission = await locationService.requestLocationPermission();
    if (!locationPermission) {
      Alert.alert(
        'Location Permission Required',
        'This app needs location access to provide nearby earthquake alerts.',
        [{ text: 'OK' }]
      );
    }

    await notificationService.requestNotificationPermission();
  };

  const getCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.warn('Could not get location:', error);
      // App can still work without location, just with less precise alerts
    }
  };

  const loadEarthquakeData = async () => {
    try {
      const data = await earthquakeService.getRecentEarthquakes(50);
      
      // Calculate distances if user location is available
      if (userLocation) {
        const dataWithDistances = data.map(earthquake => ({
          ...earthquake,
          distance: earthquakeService.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            earthquake.location.latitude,
            earthquake.location.longitude
          ),
        }));
        setEarthquakes(dataWithDistances);
      } else {
        setEarthquakes(data);
      }
      
      setError(null);
    } catch (error) {
      console.error('Failed to load earthquake data:', error);
      setError('Failed to load earthquake data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEarthquakeData();
    setRefreshing(false);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10B981'; // green
      case 'connecting': return '#F59E0B'; // yellow
      case 'disconnected': return '#EF4444'; // red
      default: return '#6B7280'; // gray
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 7.0) return '#DC2626'; // red
    if (magnitude >= 5.5) return '#EA580C'; // orange
    if (magnitude >= 4.0) return '#D97706'; // amber
    return '#059669'; // green
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          🌍 Earthquake Monitor
        </ThemedText>
        <ThemedView style={styles.statusContainer}>
          <ThemedView style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <ThemedText style={styles.statusText}>
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error && (
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>⚠️ {error}</ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">Total Events</ThemedText>
            <ThemedText type="title">{earthquakes.length}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="defaultSemiBold">Last Update</ThemedText>
            <ThemedText>{lastUpdate ? formatTime(lastUpdate) : 'Never'}</ThemedText>
          </ThemedView>
        </ThemedView>

        {userLocation && (
          <ThemedView style={styles.locationContainer}>
            <ThemedText type="defaultSemiBold">📍 Your Location</ThemedText>
            <ThemedText>
              {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.earthquakeList}>
          <ThemedText type="subtitle" style={styles.listTitle}>
            Recent Earthquakes
          </ThemedText>
          
          {earthquakes.slice(0, 10).map((earthquake) => (
            <ThemedView key={earthquake.id} style={styles.earthquakeItem}>
              <ThemedView style={styles.earthquakeHeader}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[
                    styles.magnitude,
                    { color: getMagnitudeColor(earthquake.magnitude) }
                  ]}
                >
                  M{earthquake.magnitude.toFixed(1)}
                </ThemedText>
                <ThemedText style={styles.time}>
                  {formatTime(earthquake.timestamp)}
                </ThemedText>
              </ThemedView>
              
              <ThemedText style={styles.location}>
                {earthquake.location.place}
              </ThemedText>
              
              <ThemedView style={styles.earthquakeDetails}>
                <ThemedText style={styles.detail}>
                  Depth: {earthquake.depth.toFixed(0)}km
                </ThemedText>
                {earthquake.distance && (
                  <ThemedText style={styles.detail}>
                    Distance: {earthquake.distance.toFixed(0)}km
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>

        {isLoading && (
          <ThemedView style={styles.loadingContainer}>
            <ThemedText>Loading earthquake data...</ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    color: '#60A5FA',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#7F1D1D',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#374151',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  locationContainer: {
    backgroundColor: '#065F46',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  earthquakeList: {
    flex: 1,
  },
  listTitle: {
    marginBottom: 12,
    color: '#E5E7EB',
  },
  earthquakeItem: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  earthquakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  magnitude: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  location: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 8,
  },
  earthquakeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
