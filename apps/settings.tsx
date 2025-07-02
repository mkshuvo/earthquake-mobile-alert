import React from 'react';
import { StyleSheet, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEarthquakeStore } from '@/store/earthquakeStore';

export default function SettingsScreen() {
  const { notificationSettings, updateNotificationSettings } = useEarthquakeStore();

  const handleToggleNotifications = (value: boolean) => {
    updateNotificationSettings({ enabled: value });
    if (value) {
      Alert.alert(
        'Notifications Enabled',
        'You will receive alerts for earthquakes based on your settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleToggleSound = (value: boolean) => {
    updateNotificationSettings({ enableSound: value });
  };

  const handleToggleVibration = (value: boolean) => {
    updateNotificationSettings({ enableVibration: value });
  };

  const handleToggleQuietHours = (value: boolean) => {
    updateNotificationSettings({
      quietHours: { ...notificationSettings.quietHours, enabled: value }
    });
  };

  const handleMagnitudeChange = (magnitude: number) => {
    updateNotificationSettings({ minimumMagnitude: magnitude });
  };

  const handleDistanceChange = (distance: number) => {
    updateNotificationSettings({ maxDistance: distance });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          ⚙️ Settings
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content}>
        {/* Notifications Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🔔 Notifications
          </ThemedText>
          
          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingText}>
              <ThemedText type="defaultSemiBold">Enable Notifications</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Receive earthquake alerts on your device
              </ThemedText>
            </ThemedView>
            <Switch
              value={notificationSettings.enabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor={notificationSettings.enabled ? '#ffffff' : '#9CA3AF'}
            />
          </ThemedView>

          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingText}>
              <ThemedText type="defaultSemiBold">Sound Alerts</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Play sound for earthquake notifications
              </ThemedText>
            </ThemedView>
            <Switch
              value={notificationSettings.enableSound}
              onValueChange={handleToggleSound}
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor={notificationSettings.enableSound ? '#ffffff' : '#9CA3AF'}
              disabled={!notificationSettings.enabled}
            />
          </ThemedView>

          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingText}>
              <ThemedText type="defaultSemiBold">Vibration</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Vibrate device for earthquake notifications
              </ThemedText>
            </ThemedView>
            <Switch
              value={notificationSettings.enableVibration}
              onValueChange={handleToggleVibration}
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor={notificationSettings.enableVibration ? '#ffffff' : '#9CA3AF'}
              disabled={!notificationSettings.enabled}
            />
          </ThemedView>

          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingText}>
              <ThemedText type="defaultSemiBold">Quiet Hours</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Disable notifications during quiet hours (10 PM - 7 AM)
              </ThemedText>
            </ThemedView>
            <Switch
              value={notificationSettings.quietHours.enabled}
              onValueChange={handleToggleQuietHours}
              trackColor={{ false: '#374151', true: '#10B981' }}
              thumbColor={notificationSettings.quietHours.enabled ? '#ffffff' : '#9CA3AF'}
              disabled={!notificationSettings.enabled}
            />
          </ThemedView>
        </ThemedView>

        {/* Alert Criteria Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📊 Alert Criteria
          </ThemedText>
          
          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingText}>
              <ThemedText type="defaultSemiBold">
                Minimum Magnitude: {notificationSettings.minimumMagnitude.toFixed(1)}
              </ThemedText>
              <ThemedText style={styles.settingDescription}>
                Only alert for earthquakes above this magnitude
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.magnitudeButtons}>
            {[3.0, 4.0, 5.0, 6.0].map((mag) => (
              <TouchableOpacity
                key={mag}
                style={[
                  styles.magnitudeButton,
                  notificationSettings.minimumMagnitude === mag && styles.selectedButton
                ]}
                onPress={() => handleMagnitudeChange(mag)}
              >
                <ThemedText style={[
                  styles.magnitudeButtonText,
                  notificationSettings.minimumMagnitude === mag && styles.selectedButtonText
                ]}>
                  {mag.toFixed(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>

          <ThemedView style={styles.settingItem}>
            <ThemedView style={styles.settingText}>
              <ThemedText type="defaultSemiBold">
                Maximum Distance: {notificationSettings.maxDistance}km
              </ThemedText>
              <ThemedText style={styles.settingDescription}>
                Only alert for earthquakes within this distance
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.magnitudeButtons}>
            {[100, 250, 500, 1000].map((dist) => (
              <TouchableOpacity
                key={dist}
                style={[
                  styles.magnitudeButton,
                  notificationSettings.maxDistance === dist && styles.selectedButton
                ]}
                onPress={() => handleDistanceChange(dist)}
              >
                <ThemedText style={[
                  styles.magnitudeButtonText,
                  notificationSettings.maxDistance === dist && styles.selectedButtonText
                ]}>
                  {dist}km
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* App Info Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ℹ️ About
          </ThemedText>
          
          <ThemedView style={styles.infoItem}>
            <ThemedText type="defaultSemiBold">Version</ThemedText>
            <ThemedText>1.0.0</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoItem}>
            <ThemedText type="defaultSemiBold">Data Source</ThemedText>
            <ThemedText>USGS Earthquake Hazards Program</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoItem}>
            <ThemedText type="defaultSemiBold">Update Frequency</ThemedText>
            <ThemedText>Every 30 seconds</ThemedText>
          </ThemedView>
        </ThemedView>
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
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#E5E7EB',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  magnitudeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  magnitudeButton: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#10B981',
  },
  magnitudeButtonText: {
    color: '#E5E7EB',
    fontWeight: 'bold',
  },
  selectedButtonText: {
    color: '#ffffff',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
});
