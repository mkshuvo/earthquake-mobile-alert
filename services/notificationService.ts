import { Alert } from 'react-native';
import { EarthquakeEvent, NotificationSettings } from '../types/earthquake';
// MQTT client for push notifications
import mqtt from 'mqtt';
import { useEarthquakeStore } from '../store/earthquakeStore';

class NotificationService {
  private mqttClient: any = null;
  private isConnected: boolean = false;

  constructor() {
    // Initialize MQTT client
    this.initializeMQTT();
  }

  private initializeMQTT(): void {
    try {
      // MQTT client will be initialized when connecting
      console.log('MQTT client initialized');
    } catch (error) {
      console.error('Error initializing MQTT client:', error);
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    // Request permissions for push notifications
    // In a production app, you would integrate with:
    // - react-native-push-notification for local notifications
    return true;
  }

  async connectToMQTT(brokerUrl: string, clientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.mqttClient = mqtt.connect(brokerUrl, {
          clientId: clientId,
          clean: true,
          connectTimeout: 4000,
          username: 'earthquake_user',
          password: 'earthquake_pass',
          reconnectPeriod: 1000,
        });

        this.mqttClient.on('connect', () => {
          console.log('Connected to MQTT broker');
          this.isConnected = true;
          resolve();
        });

        this.mqttClient.on('error', (error: any) => {
          console.error('MQTT connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        this.mqttClient.on('message', (topic: string, message: any) => {
          this.handleMQTTMessage(topic, message);
        });

        // Subscribe to earthquake notification topics
        this.mqttClient.on('connect', () => {
          this.mqttClient.subscribe('earthquake/alert/critical', (err: any) => {
            if (err) console.error('Subscription error:', err);
          });
          this.mqttClient.subscribe('earthquake/alert/high', (err: any) => {
            if (err) console.error('Subscription error:', err);
          });
          this.mqttClient.subscribe('earthquake/alert/medium', (err: any) => {
            if (err) console.error('Subscription error:', err);
          });
        });
      } catch (error) {
        reject(error);
      }
    });
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
    const message = `${earthquake.location.place}\nDepth: ${earthquake.depth}km${earthquake.distance ? `\nDistance: ${Math.round(earthquake.distance)}km` : ''
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

  private handleMQTTMessage(topic: string, message: any): void {
    try {
      const earthquakeData = JSON.parse(message.toString());
      const { title, body, data } = earthquakeData;

      // Update store with new earthquake data
      if (data) {
        console.log('Updating store with MQTT earthquake data:', data.id);
        useEarthquakeStore.getState().addEarthquake(data);
      }

      // Show notification based on topic priority
      const priority = topic.split('/').pop() || 'medium'; // Extract priority from topic

      // For critical and high priority, show immediate alert
      if (priority === 'critical' || priority === 'high') {
        Alert.alert(
          title,
          body,
          [
            {
              text: 'Dismiss',
              style: 'cancel',
            },
            {
              text: 'View Details',
              onPress: () => this.openEarthquakeDetails(data),
            },
          ],
          { cancelable: true }
        );
      } else {
        // For medium and low priority, show as banner notification
        console.log(`Earthquake notification: ${title} - ${body}`);
      }

      // Trigger haptic feedback based on priority
      this.triggerVibration(priority as 'low' | 'medium' | 'high' | 'critical');

    } catch (error) {
      console.error('Error handling MQTT message:', error);
    }
  }

  async scheduleLocationBasedCheck(): Promise<void> {
    // This would set up a background task to periodically check for new earthquakes
    // based on the user's current location
    console.log('Background earthquake monitoring started');
  }
}

export default new NotificationService();
