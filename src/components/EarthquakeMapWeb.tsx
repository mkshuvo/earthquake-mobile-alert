import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useEarthquakeStore } from '../store/earthquakeStore';

declare const window: any;
declare const document: any;

interface EarthquakeMapWebProps {
  onEarthquakeSelect: (id: string) => void;
}

export const EarthquakeMapWeb: React.FC<EarthquakeMapWebProps> = ({ onEarthquakeSelect }) => {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const userLocationRef = useRef<{lat: number; lng: number} | null>(null);
  const { filteredEarthquakes } = useEarthquakeStore();

  // Get user location on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocationRef.current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('[EarthquakeMapWeb] User location:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('[EarthquakeMapWeb] Failed to get user location:', error.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Dynamically load Leaflet
    const loadMap = async () => {
      try {
        // Load Leaflet CSS
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
        document.head.appendChild(linkElement);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
        script.onload = () => {
          initializeMap();
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
      }
    };

    const initializeMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // Initialize map centered on user location, or first earthquake, or world
      let center: [number, number];
      if (userLocationRef.current) {
        center = [userLocationRef.current.lat, userLocationRef.current.lng];
      } else if (filteredEarthquakes.length > 0) {
        center = [filteredEarthquakes[0].location.latitude, filteredEarthquakes[0].location.longitude];
      } else {
        center = [20, 0];
      }

      const map = L.map(mapRef.current).setView(center, 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add user location marker if available
      if (userLocationRef.current) {
        const userMarker = L.circleMarker(
          [userLocationRef.current.lat, userLocationRef.current.lng],
          {
            radius: 8,
            fillColor: '#007AFF',
            color: 'white',
            weight: 2,
            opacity: 1,
            fillOpacity: 1,
          }
        ).addTo(map);
        userMarker.bindPopup('<div style="font-size: 12px;"><strong>Your Location</strong></div>');
      }

      // Add earthquake markers
      filteredEarthquakes.forEach((earthquake) => {
        const color = getMagnitudeColor(earthquake.magnitude);
        
        // Create circle for ripple effect
        L.circle(
          [earthquake.location.latitude, earthquake.location.longitude],
          {
            color: color,
            fillColor: color,
            fillOpacity: 0.2,
            radius: Math.pow(10, earthquake.magnitude) * 1000,
            weight: 2,
          }
        ).addTo(map);

        // Create marker with magnitude
        const marker = L.circleMarker(
          [earthquake.location.latitude, earthquake.location.longitude],
          {
            radius: 20,
            fillColor: color,
            color: 'white',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9,
          }
        ).addTo(map);

        // Add popup with earthquake details
        const popup = L.popup().setContent(
          `<div style="font-size: 14px; width: 200px;">
            <strong>${earthquake.magnitude.toFixed(1)}M</strong><br/>
            ${earthquake.location.place}<br/>
            Depth: ${earthquake.depth.toFixed(1)} km<br/>
            <button onclick="window.earthquakeSelect('${earthquake.id}')" 
              style="margin-top: 8px; padding: 6px 12px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
              View Details
            </button>
          </div>`
        );

        marker.bindPopup(popup);
        marker.on('click', () => {
          onEarthquakeSelect(earthquake.id);
        });

        // Add magnitude text to marker
        const label = L.divIcon({
          html: `<div style="font-size: 16px; font-weight: bold; color: white;">${earthquake.magnitude.toFixed(1)}</div>`,
          iconSize: [40, 40],
          className: 'earthquake-label',
        });
      });

      mapInstanceRef.current = map;
      
      // Store select function globally for popup button
      (window as any).earthquakeSelect = onEarthquakeSelect;
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [filteredEarthquakes, onEarthquakeSelect]);

  const getMagnitudeColor = (magnitude: number): string => {
    if (magnitude >= 6.0) return '#FF3B30';
    if (magnitude >= 5.0) return '#FF9500';
    if (magnitude >= 4.0) return '#FFCC00';
    return '#FFEB3B';
  };

  return (
    <View style={styles.container}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f0f0f0',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
