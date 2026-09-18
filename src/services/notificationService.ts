import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Subject, TimetableSlot } from '../types';

export const NotificationService = {
  /**
   * Request notification permissions from iOS & Android
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Configure interactive action buttons for end-of-lecture prompts
   */
  async setupNotificationCategories(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.setNotificationCategoryAsync('CLASS_COMPLETION', [
        {
          identifier: 'ACTION_ATTENDED',
          buttonTitle: '✅ Attended',
          options: { opensAppToForeground: false },
        },
        {
          identifier: 'ACTION_BUNKED',
          buttonTitle: '❌ Bunked',
          options: { opensAppToForeground: false, isDestructive: true },
        },
        {
          identifier: 'ACTION_CANCELLED',
          buttonTitle: '⚪ Cancelled / Free',
          options: { opensAppToForeground: false },
        }
      ]);
    } catch (e) {
      console.warn('Could not setup notification categories:', e);
    }
  },

  /**
   * Schedule notification for an upcoming lecture slot
   */
  async scheduleClassAlert(slot: TimetableSlot, subject: Subject): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Class Ended: ${subject.name} (${subject.code})`,
          body: `Time slot ${slot.startTime} - ${slot.endTime} ended. Mark your attendance now!`,
          categoryIdentifier: 'CLASS_COMPLETION',
          data: {
            slotId: slot.id,
            subjectId: subject.id,
            subjectName: subject.name,
          },
          sound: true,
        },
        trigger: {
          seconds: 3600,
        },
      });
      return id;
    } catch {
      return null;
    }
  }
};
