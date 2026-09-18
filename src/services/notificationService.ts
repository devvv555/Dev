import { Subject, TimetableSlot } from '../types';

// expo-notifications is disabled in Expo Go (SDK 53+) because
// push notification support was removed from Expo Go at SDK 53.
// The import itself causes a crash as a side effect (addPushTokenListener).
// Re-enable when building a standalone/production APK via EAS Build.

export const NotificationService = {
  /** No-op in Expo Go. Will request permissions in production build. */
  async requestPermissions(): Promise<boolean> {
    return false;
  },

  /** No-op in Expo Go. Will set up action buttons in production build. */
  async setupNotificationCategories(): Promise<void> {
    // Will be implemented in production build
  },

  /** No-op in Expo Go. Will schedule class alerts in production build. */
  async scheduleClassAlert(_slot: TimetableSlot, _subject: Subject): Promise<string | null> {
    return null;
  }
};
