import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Subject, TimetableSlot } from '../types';

// Configure notification behavior for phone notification tray
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  /**
   * Request system notification permissions for device notification tray
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('attendance-channel', {
          name: 'Attendance & Timetable Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 200, 500],
          lightColor: '#0284C7',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      }

      return finalStatus === 'granted';
    } catch (e) {
      console.warn('Notification permission request error:', e);
      return false;
    }
  },

  /**
   * Set up notification action categories for quick actions if needed
   */
  async setupNotificationCategories(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('attendance-channel', {
          name: 'Attendance & Timetable Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 200, 500],
          lightColor: '#0284C7',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      }
    } catch (e) {
      console.warn('Setup notification categories error:', e);
    }
  },

  /**
   * Send a system status bar / notification shade alert to the phone
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
          vibrate: [0, 500, 200, 500],
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null, // trigger immediately
      });
      return id;
    } catch (e) {
      console.warn('Send local notification error:', e);
      return null;
    }
  },

  /**
   * Trigger phone system notification when a class has ended
   */
  async notifyClassEnded(slot: TimetableSlot, subject: Subject): Promise<string | null> {
    const title = `🔔 Class Ended: ${subject.name}`;
    const body = `${slot.startTime} – ${slot.endTime} has concluded. Open app to record your attendance!`;
    return this.sendLocalNotification(title, body, {
      type: 'CLASS_ENDED',
      slotId: slot.id,
      subjectId: subject.id,
    });
  },

  /**
   * Trigger phone system notification for upcoming weekday holiday
   */
  async notifyUpcomingHoliday(holidayTitle: string, day: string, daysRemaining: number): Promise<string | null> {
    const timeText = daysRemaining === 0 ? 'Today' : daysRemaining === 1 ? 'Tomorrow' : `In ${daysRemaining} days (${day})`;
    const title = `🎉 Upcoming Holiday: ${holidayTitle}`;
    const body = `${timeText} is an official holiday. Enjoy your time off!`;
    return this.sendLocalNotification(title, body, {
      type: 'HOLIDAY',
      holidayTitle,
    });
  },

  /**
   * Schedule class alert ahead of time if needed
   */
  async scheduleClassAlert(slot: TimetableSlot, subject: Subject): Promise<string | null> {
    try {
      const title = `📚 Upcoming Class: ${subject.name}`;
      const body = `Class starts at ${slot.startTime} in ${slot.room || 'classroom'}.`;
      return await this.sendLocalNotification(title, body, { slotId: slot.id });
    } catch {
      return null;
    }
  },

  /**
   * Exciting broadcast notification to phone notification tray when attendance is refreshed / extracted
   */
  async notifyAttendanceUpdated(
    updatedByName?: string,
    subjectsCount?: number,
    portalUpdatedDate?: string
  ): Promise<string | null> {
    const who = updatedByName ? `${updatedByName} just extracted fresh attendance!` : 'Fresh attendance uploaded!';
    const asOnInfo = portalUpdatedDate ? ` Portal updated as on ${portalUpdatedDate}.` : '';
    const countInfo = subjectsCount ? ` (${subjectsCount} subjects)` : '';
    const title = `🔥 COLLEGE UPDATED ATTENDANCE!`;
    const body = `⚡ ${who}${asOnInfo}${countInfo} Tap to view your latest official percentages! 📊`;
    return this.sendLocalNotification(title, body, {
      type: 'ATTENDANCE_UPDATED',
      portalUpdatedDate,
      timestamp: Date.now(),
    });
  },
};
