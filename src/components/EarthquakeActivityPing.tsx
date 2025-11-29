import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface EarthquakeActivityPingProps {
  magnitude: number;
  latitude: number;
  longitude: number;
}

export const EarthquakeActivityPing: React.FC<EarthquakeActivityPingProps> = ({
  magnitude,
  latitude,
  longitude,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create pulsing animation for activity indicator
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
      { iterations: -1 }
    ).start();
  }, [scaleAnim, opacityAnim]);

  const getMagnitudeColor = (mag: number): string => {
    if (mag >= 6.0) return '#FF3B30';
    if (mag >= 5.0) return '#FF9500';
    if (mag >= 4.0) return '#FFCC00';
    return '#FFEB3B';
  };

  const color = getMagnitudeColor(magnitude);

  return (
    <View style={styles.container}>
      {/* Animated ripple circles */}
      <Animated.View
        style={[
          styles.ripple,
          {
            backgroundColor: color,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ripple,
          {
            backgroundColor: color,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      {/* Center dot */}
      <View style={[styles.center, { backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  center: {
    width: 20,
    height: 20,
    borderRadius: 10,
    zIndex: 10,
  },
});
