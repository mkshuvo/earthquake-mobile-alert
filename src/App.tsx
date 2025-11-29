import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BottomNavigation, TabName } from './components/BottomNavigation';
import { EarthquakeCard } from './components/EarthquakeCard';
import { EarthquakeMap } from './components/EarthquakeMap';
import { EarthquakeMapWeb } from './components/EarthquakeMapWeb';
import { Header } from './components/Header';
import { earthquakeService } from './services/earthquakeService';
import { useEarthquakeStore } from './store/earthquakeStore';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const {
    filteredEarthquakes,
    selectedEarthquake,
    setEarthquakes,
    addEarthquake,
    setSelectedEarthquake,
    setLoading,
    setError,
    isLoading,
    isConnected,
    setConnected,
  } = useEarthquakeStore();

  // Initialize data on app load
  useEffect(() => {
    loadInitialData();
    connectWebSocket();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const earthquakes = await earthquakeService.getEarthquakes({
        limit: 100,
      });
      setEarthquakes(earthquakes);
      setError(null);
    } catch (error) {
      console.error('Failed to load earthquakes:', error);
      setError('Failed to load earthquake data');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    earthquakeService.connectWebSocket({
      onConnect: () => {
        console.log('WebSocket connected');
        setConnected(true);
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      },
      onNewEarthquake: (earthquake) => {
        console.log('New earthquake:', earthquake);
        addEarthquake(earthquake);
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        setError(`Connection error: ${error}`);
      },
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      earthquakeService.disconnectWebSocket();
    };
  }, []);

  const renderEarthquakeList = () => {
    return (
      <FlatList
        data={filteredEarthquakes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EarthquakeCard
            earthquake={item}
            onClose={() => setSelectedEarthquake(null)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading earthquakes...' : 'No earthquakes found'}
            </Text>
          </View>
        }
        scrollEnabled={true}
        nestedScrollEnabled={true}
      />
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'map':
        return null; // Map is handled separately in main render
      case 'recent':
        return renderEarthquakeList();
      case 'safety':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabText}>Safety Tips & Emergency Procedures</Text>
          </View>
        );
      case 'mylog':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabText}>Your Earthquake Reports</Text>
          </View>
        );
      case 'help':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabText}>Help & FAQs</Text>
          </View>
        );
      case 'more':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.tabText}>More Options</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderLocationBanner = () => {
    if (!filteredEarthquakes.length) return null;
    const nearest = filteredEarthquakes[0]; // Sorted by proximity
    return (
      <View style={styles.locationBanner}>
        <View style={styles.bannerContent}>
          <View style={[styles.magnitudeCircle, { backgroundColor: getMagnitudeColor(nearest.magnitude) }]}>
            <Text style={styles.magnitudeText}>{nearest.magnitude.toFixed(1)}</Text>
          </View>
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerLocation}>{nearest.location.place}</Text>
            <Text style={styles.bannerMagnitude}>{nearest.magnitude >= 5.5 ? '🚨 HIGH RISK' : 'Monitor'}</Text>
            <Text style={styles.bannerDistance}>Depth: {nearest.depth.toFixed(1)} km</Text>
          </View>
        </View>
      </View>
    );
  };

  const getMagnitudeColor = (magnitude: number): string => {
    if (magnitude >= 6.0) return '#FF3B30';
    if (magnitude >= 5.0) return '#FF9500';
    if (magnitude >= 4.0) return '#FFCC00';
    return '#FFEB3B';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <Header
        onFiltersOpen={() => setShowFilters(true)}
        onLegendOpen={() => setShowLegend(true)}
      />

      {/* Active Tab Rendering */}
      {activeTab === 'map' ? (
        <View style={styles.content}>
          {/* Map View - Full screen (DEFAULT) */}
          <View style={styles.mapContainerFull}>
            {Platform.OS === 'web' ? (
              <EarthquakeMapWeb
                onEarthquakeSelect={(id) => {
                  const earthquake = filteredEarthquakes.find((e) => e.id === id);
                  if (earthquake) {
                    setSelectedEarthquake(earthquake);
                  }
                }}
              />
            ) : (
              <EarthquakeMap
                onEarthquakeSelect={(id) => {
                  const earthquake = filteredEarthquakes.find((e) => e.id === id);
                  if (earthquake) {
                    setSelectedEarthquake(earthquake);
                  }
                }}
              />
            )}
            
            {/* Earthquake Detail Card Overlay - Only on native */}
            {Platform.OS !== 'web' && filteredEarthquakes.length > 0 && (
              <View style={styles.cardOverlay}>
                <EarthquakeCard
                  earthquake={filteredEarthquakes[0]}
                  onClose={() => setSelectedEarthquake(null)}
                />
              </View>
            )}
          </View>
        </View>
      ) : activeTab === 'recent' ? (
        <View style={styles.content}>
          {/* Show earthquake list for recent tab ONLY */}
          <View style={styles.listContainerFull}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>EARTHQUAKE LIST</Text>
              {isConnected && (
                <View style={styles.connectionStatus}>
                  <View style={styles.connectionDot} />
                  <Text style={styles.connectionText}>Live</Text>
                </View>
              )}
            </View>
            {renderEarthquakeList()}
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          {renderTabContent()}
        </View>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#17a2b8" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  mapContainer: {
    flex: 0.45,
    backgroundColor: '#f0f0f0',
  },
  listContainer: {
    flex: 0.55,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.5,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  connectionText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  locationBanner: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  magnitudeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  magnitudeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  bannerInfo: {
    flex: 1,
  },
  bannerLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bannerMagnitude: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff6b6b',
    marginBottom: 2,
  },
  bannerDistance: {
    fontSize: 11,
    color: '#666',
  },
  listContainerFull: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapContainerFull: {
    flex: 1,
    position: 'relative',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '40%',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  listPanelContainer: {
    flex: 0.35,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default App;
