import { Alert, Platform } from 'react-native';
import { EarthquakeEvent, NotificationSettings } from '../types/earthquake';

class NotificationService {
  async requestNotificationPermission(): Promise<boolean> {
    // For now, we'll use basic Alert notifications
    // In a production app, you would integrate with:
    // - @react-native-firebase/messaging for push notifications
    // - react-native-push-notification for local notifications
    return true;
  }

  async showEarthquakeAlert(earthquake: EarthquakeEvent, settings: NotificationSettings): Promise<void> {
    if (!settings.enabled) return;

    // Check if it's during quiet hours
    if (this.isQuietHours(settings)) {
      console.log('Skipping notification due to quiet hours');
      return;
    }

    // Check magnitude threshold
    if (earthquake.magnitude < settings.minimumMagnitude) {
      console.log(`Skipping notification: magnitude ${earthquake.magnitude} below threshold ${settings.minimumMagnitude}`);
      return;
    }

    // Check distance if location is available
    if (earthquake.distance && earthquake.distance > settings.maxDistance) {
      console.log(`Skipping notification: distance ${earthquake.distance}km exceeds limit ${settings.maxDistance}km`);
      return;
    }

    const priority = this.getPriorityLevel(earthquake.magnitude);
    const title = `🌍 Earthquake Alert - M${earthquake.magnitude}`;
    const message = `${earthquake.location.place}\nDepth: ${earthquake.depth}km${
      earthquake.distance ? `\nDistance: ${Math.round(earthquake.distance)}km` : ''
    }`;

    // Show immediate alert for high priority earthquakes
    if (priority === 'high' || priority === 'critical') {
      Alert.alert(
        title,
        message,
        [
          {
            text: 'Dismiss',
            style: 'cancel',
          },
          {
            text: 'View Details',
            onPress: () => this.openEarthquakeDetails(earthquake),
          },
        ],
        { cancelable: true }
      );
    } else {
      // For lower priority, just log (in production, show as banner notification)
      console.log(`Earthquake notification: ${title} - ${message}`);
    }

    // Trigger haptic feedback
    if (settings.enableVibration) {
      this.triggerVibration(priority);
    }
  }

  private isQuietHours(settings: NotificationSettings): boolean {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const startHour = settings.quietHours.startHour;
    const endHour = settings.quietHours.endHour;

    if (startHour < endHour) {
      // Same day (e.g., 22:00 to 07:00 next day)
      return currentHour >= startHour || currentHour < endHour;
    } else {
      // Crosses midnight (e.g., 10:00 to 18:00)
      return currentHour >= startHour && currentHour < endHour;
    }
  }

  private getPriorityLevel(magnitude: number): 'low' | 'medium' | 'high' | 'critical' {
    if (magnitude >= 7.0) return 'critical';
    if (magnitude >= 5.5) return 'high';
    if (magnitude >= 4.0) return 'medium';
    return 'low';
  }

  private triggerVibration(priority: 'low' | 'medium' | 'high' | 'critical'): void {
    // Note: For production, use react-native-haptic-feedback
    // For now, we'll just log the intended vibration pattern
    let pattern: string;
    switch (priority) {
      case 'critical':
        pattern = 'Strong continuous vibration';
        break;
      case 'high':
        pattern = 'Strong pulse vibration';
        break;
      case 'medium':
        pattern = 'Medium vibration';
        break;
      default:
        pattern = 'Light vibration';
    }
    console.log(`Vibration pattern: ${pattern}`);
  }

  private openEarthquakeDetails(earthquake: EarthquakeEvent): void {
    // Navigate to earthquake details screen
    // For now, just log the action
    console.log(`Opening details for earthquake: ${earthquake.id}`);
  }

  async scheduleLocationBasedCheck(): Promise<void> {
    // This would set up a background task to periodically check for new earthquakes
    // based on the user's current location
    console.log('Background earthquake monitoring started');
  }
}

export default new NotificationService();
