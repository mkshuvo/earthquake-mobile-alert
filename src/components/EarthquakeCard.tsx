import moment from 'moment';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { EarthquakeEvent, formatMagnitude } from '../store/earthquakeStore';

const { width } = Dimensions.get('window');

interface EarthquakeCardProps {
  earthquake: EarthquakeEvent | null;
  onClose?: () => void;
}

export const EarthquakeCard: React.FC<EarthquakeCardProps> = ({
  earthquake,
  onClose,
}) => {
  if (!earthquake) {
    return null;
  }

  const getMagnitudeColor = (magnitude: number): string => {
    if (magnitude >= 8.0) return '#8B0000'; // Blood Dark Red
    if (magnitude >= 6.0) return '#F44336'; // Red
    if (magnitude >= 4.0) return '#FF9800'; // Orange
    if (magnitude >= 3.0) return '#2196F3'; // Blue
    return '#4CAF50'; // Green
  };

  const timeAgo = moment(earthquake.timestamp).fromNow();
  const formattedTime = moment(earthquake.timestamp).format('YYYY/MM/DD, HH:mm');

  return (
    <View style={styles.cardContainer}>
      <View
        style={[
          styles.card,
          {
            borderLeftColor: getMagnitudeColor(earthquake.magnitude),
          },
        ]}
      >
        {/* Magnitude Badge */}
        <View
          style={[
            styles.magnitudeBadge,
            { backgroundColor: getMagnitudeColor(earthquake.magnitude) },
          ]}
        >
          {earthquake.magnitude >= 8.0 ? (
            <MaterialCommunityIcons name="alert-octagram" size={20} color="white" />
          ) : (
            <Text style={styles.magnitudeValue}>
              {formatMagnitude(earthquake.magnitude)}
            </Text>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.locationTitle} numberOfLines={1}>
            {earthquake.location.place}
          </Text>

          <Text style={styles.timestamp}>{formattedTime}</Text>

          <Text style={styles.timeAgo}>{timeAgo}</Text>

          {/* Details grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Depth</Text>
              <Text style={styles.detailValue}>{earthquake.depth} km</Text>
            </View>

            {earthquake.tsunami > 0 && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Tsunami</Text>
                <View style={styles.tsunamiWarning}>
                  <MaterialCommunityIcons
                    name="alert"
                    size={16}
                    color="#FF3B30"
                  />
                  <Text style={styles.tsunamiText}>Risk</Text>
                </View>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.detailsButton]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="information" size={18} color="#17a2b8" />
              <Text style={styles.actionButtonText}>Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="share-variant" size={18} color="#17a2b8" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            {onClose && (
              <TouchableOpacity
                style={[styles.actionButton, styles.closeButton]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  magnitudeBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  magnitudeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  tsunamiWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tsunamiText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FF3B30',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  detailsButton: {
    backgroundColor: '#f0f8ff',
  },
  shareButton: {
    backgroundColor: '#f0f8ff',
  },
  closeButton: {
    backgroundColor: '#f5f5f5',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#17a2b8',
  },
});
