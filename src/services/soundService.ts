import { Audio } from 'expo-av';

class SoundService {
  private sound: Audio.Sound | null = null;
  // Using a remote URL for now to avoid missing asset build errors.
  // TODO: Download a proper siren.mp3 to assets/sounds/ and use require('../../assets/sounds/siren.mp3')
  private static readonly ALERT_SOUND_URI = 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';

  async loadSound() {
    try {
      // Configure audio mode to play even if silent mode is on (iOS)
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: SoundService.ALERT_SOUND_URI },
        { shouldPlay: false, isLooping: true }
      );
      this.sound = sound;
    } catch (error) {
      // Failed to load sound
    }
  }

  async playAlert() {
    try {
      if (!this.sound) {
        await this.loadSound();
      }
      if (this.sound) {
        await this.sound.setIsLoopingAsync(true);
        await this.sound.playAsync();
      }
    } catch (e) {
      // Play error
    }
  }

  async stopAlert() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
      } catch (e) {
        // Stop error
      }
    }
  }

  async unload() {
    if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
    }
  }
}

export const soundService = new SoundService();
