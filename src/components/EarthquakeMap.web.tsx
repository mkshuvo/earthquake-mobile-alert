import React from 'react';
import { View, Text } from 'react-native';

interface EarthquakeMapProps {
  onEarthquakeSelect: (id: string) => void;
}

export const EarthquakeMap: React.FC<EarthquakeMapProps> = () => {
  return (
    <View>
      <Text>Map not available on web in this component (Use EarthquakeMapWeb)</Text>
    </View>
  );
};
