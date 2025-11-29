import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEarthquakeStore } from '../store/earthquakeStore';

const { width } = Dimensions.get('window');

interface HeaderProps {
  onFiltersOpen?: () => void;
  onLegendOpen?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onFiltersOpen,
  onLegendOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { setFilters, filterEarthquakes } = useEarthquakeStore();

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setFilters({ location: text });
    filterEarthquakes();
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by city, state or country"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          editable={true}
        />
      </View>

      {/* Action Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.buttonScroll}
        contentContainerStyle={styles.buttonContainer}
      >
        {/* I felt shaking button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.feltShakingButton]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="vibrate" size={16} color="white" />
          <Text style={styles.feltShakingText}>I felt shaking</Text>
        </TouchableOpacity>

        {/* Filters button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={onFiltersOpen}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="tune" size={16} color="#666" />
          <Text style={styles.secondaryButtonText}>Filters</Text>
        </TouchableOpacity>

        {/* Legend button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={onLegendOpen}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="information" size={16} color="#666" />
          <Text style={styles.secondaryButtonText}>Legend</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  buttonScroll: {
    marginHorizontal: -12,
    paddingHorizontal: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    height: 36,
  },
  feltShakingButton: {
    backgroundColor: '#17a2b8',
  },
  feltShakingText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
});
