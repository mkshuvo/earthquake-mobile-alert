import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { formatMagnitude, useEarthquakeStore } from '../store/earthquakeStore';

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
    const _navigator = window.navigator;
    if (typeof _navigator !== 'undefined' && 'geolocation' in _navigator) {
      _navigator.geolocation.getCurrentPosition(
        (position: any) => {
          userLocationRef.current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        },
        (error: any) => {
          // Failed to get user location
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
        // Failed to load Leaflet
      }
    };

    const initializeMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // Initialize map centered on user location (PRIORITY), or first earthquake, or world
      let center: [number, number];
      let zoom = 5;

      if (userLocationRef.current) {
        center = [userLocationRef.current.lat, userLocationRef.current.lng];
        zoom = 7; // Closer zoom for user location
      } else if (filteredEarthquakes.length > 0) {
        center = [filteredEarthquakes[0].location.latitude, filteredEarthquakes[0].location.longitude];
      } else {
        center = [20, 0];
      }

      // Create map if it doesn't exist
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);
      } else {
        // Update view if map exists and user location just became available (Sticky Lock)
        if (userLocationRef.current) {
             mapInstanceRef.current.setView([userLocationRef.current.lat, userLocationRef.current.lng], 7);
        }
      }

      const map = mapInstanceRef.current;

      // Clear existing markers (except tiles)
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

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
        if (!earthquake || !earthquake.location) return;

        const magnitude = Number(earthquake.magnitude) || 0;
        const depth = Number(earthquake.depth) || 0;
        const lat = Number(earthquake.location.latitude) || 0;
        const lng = Number(earthquake.location.longitude) || 0;

        const color = getMagnitudeColor(magnitude);
        
        // Create circle for ripple effect
        L.circle(
          [lat, lng],
          {
            color: color,
            fillColor: color,
            fillOpacity: 0.2,
            radius: Math.pow(1.8, magnitude) * 1000, // Reduced from Math.pow(10, magnitude)
            weight: 2,
          }
        ).addTo(map);

        // Create marker with magnitude
        const marker = L.circleMarker(
          [lat, lng],
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
            <strong>${formatMagnitude(magnitude)}M</strong><br/>
            ${earthquake.location.place || 'Unknown Location'}<br/>
            Depth: ${depth.toFixed(1)} km<br/>
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
          html: `<div style="font-size: 16px; font-weight: bold; color: white;">${formatMagnitude(magnitude)}</div>`,
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
    if (magnitude >= 5.0) return '#FFFFFF';
    if (magnitude >= 4.0) return '#FFCC00';
    return '#FFEB3B';
  };

  const handleLocateMe = () => {
    if (userLocationRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [userLocationRef.current.lat, userLocationRef.current.lng], 
        7 // Zoom level
      );
    } else if (!userLocationRef.current) {
      alert("Location not available yet. Please allow location access.");
    }
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
      {/* Locate Me Button Overlay */}
      <div 
        onClick={handleLocateMe}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '4px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(0,0,0,0.2)'
        }}
        title="Locate Me"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM20.94 11C20.48 6.83 17.17 3.52 13 3.06V1H11V3.06C6.83 3.52 3.52 6.83 3.06 11H1V13H3.06C3.52 17.17 6.83 20.48 11 20.94V23H13V20.94C17.17 20.48 20.48 17.17 20.94 13H23V11H20.94ZM12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19Z" fill="#333"/>
        </svg>
      </div>
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
