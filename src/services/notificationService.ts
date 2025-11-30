import { Platform } from 'react-native';

export const notificationService = {
  requestNotificationPermission: async (): Promise<boolean> => {
    // Stub implementation since expo-notifications is not installed
    return true;
  },

  scheduleLocationBasedCheck: async () => {
    // Stub implementation
    console.log('Scheduled location based check');
  },
};

export default notificationService;
