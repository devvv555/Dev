import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Subject, TimetableSlot } from '../types';

// Configure notification behavior for phone notification tray (mobile only)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

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
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }

      if (Platform.OS !== 'web') {
        await Notifications.setNotificationCategoryAsync('ATTENDANCE_LOCKSCREEN_ACTIONS', [
          {
            identifier: 'present',
            buttonTitle: '✅ Mark Present',
            options: { opensAppToForeground: false },
          },
          {
            identifier: 'absent',
            buttonTitle: '❌ Mark Absent',
            options: { opensAppToForeground: false },
          },
        ]);
      }
    } catch (e) {
      console.warn('Setup notification categories error:', e);
    }
  },

  /**
   * Listen to notification button actions (e.g. Present / Absent from lock screen)
   */
  addNotificationResponseListener(callback: (actionId: string, data: any) => void): { remove: () => void } | null {
    if (Platform.OS === 'web') return null;
    try {
      const sub = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
        const actionId = response.actionIdentifier;
        const data = response.notification.request.content.data;
        callback(actionId, data);
      });
      return sub;
    } catch {
      return null;
    }
  },

  /**
   * Send a system status bar / notification shade alert to the phone
   */
  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    actions?: Array<{ action: string; title: string }>
  ): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Try ServiceWorkerRegistration showNotification for rich lock-screen action buttons
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && Notification.permission === 'granted') {
          try {
            const reg = await navigator.serviceWorker.ready;
            if (reg && reg.showNotification) {
              const options: any = {
                body,
                icon: '/assets/icon.png',
                badge: '/assets/favicon.png',
                data: data || {},
                vibrate: [200, 100, 200],
                requireInteraction: true,
              };
              if (actions && actions.length > 0) {
                options.actions = actions;
              }
              await reg.showNotification(title, options);
              return 'sw-notif';
            }
          } catch {}
        }

        // Fallback to basic window Notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(title, { body });
            return 'web-notif';
          } catch {}
        }
        return null;
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
          vibrate: [0, 500, 200, 500],
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: actions && actions.length > 0 ? 'ATTENDANCE_LOCKSCREEN_ACTIONS' : undefined,
        },
        trigger: null, // trigger immediately
      });
      return id;
    } catch (e) {
      if (Platform.OS !== 'web') {
        console.warn('Send local notification error:', e);
      }
      return null;
    }
  },

  /**
   * Trigger phone system notification when a class has ended with interactive lock screen action buttons
   */
  async notifyClassEnded(slot: TimetableSlot, subject: Subject, status?: string): Promise<string | null> {
    const title = `🔔 Class Ended: ${subject.name}`;
    const body = status
      ? `${slot.startTime} – ${slot.endTime} concluded (Recorded: ${status.toUpperCase()}). Tap below to change:`
      : `${slot.startTime} – ${slot.endTime} concluded. Record attendance directly below:`;
    
    const actions = [
      { action: 'present', title: '✅ Mark Present' },
      { action: 'absent', title: '❌ Mark Absent' },
    ];

    return this.sendLocalNotification(
      title,
      body,
      {
        type: 'CLASS_ENDED',
        slotId: slot.id,
        subjectId: subject.id,
        status,
      },
      actions
    );
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

  /**
   * Schedule or send period task reminder
   */
  async notifyPeriodReminder(subjectName: string, note: string, dueTimingDesc: string): Promise<string | null> {
    const title = `⏰ Reminder for ${subjectName}`;
    const body = `📌 ${note} (${dueTimingDesc})`;
    return this.sendLocalNotification(title, body, {
      type: 'PERIOD_REMINDER',
      subjectName,
      note,
    });
  },

  /**
   * Positive Difference (official < period): 1 notification alerting of discrepancy
   * Teacher may have marked student absent or portal didn't record attendance.
   */
  async notifyAttendanceDiscrepancy(
    subjectName: string,
    officialAttended: number,
    periodAttended: number
  ): Promise<string | null> {
    const diff = periodAttended - officialAttended;
    const title = `⚠️ Attendance Discrepancy: ${subjectName}`;
    const body = `Portal marked ${officialAttended} hrs vs your logged ${periodAttended} hrs (${diff} hrs lower). Teacher may have marked you absent!`;
    return this.sendLocalNotification(title, body, {
      type: 'ATTENDANCE_DISCREPANCY',
      subjectName,
      officialAttended,
      periodAttended,
      difference: diff,
    });
  },

  /**
   * Negative Difference (official > period): First notification fired on attendance update
   * College portal has more attended hours (extra credit, OD, or medical granted).
   */
  async notifyExtraAttendance(
    subjectName: string,
    officialAttended: number,
    periodAttended: number
  ): Promise<string | null> {
    const surplus = officialAttended - periodAttended;
    const title = `🎉 Extra Attendance Credited: ${subjectName}`;
    const body = `Portal shows ${officialAttended} hrs vs your logged ${periodAttended} hrs (+${surplus} hrs extra credited by college)!`;
    return this.sendLocalNotification(title, body, {
      type: 'EXTRA_ATTENDANCE_UPDATE',
      subjectName,
      officialAttended,
      periodAttended,
      surplus,
    });
  },

  /**
   * Negative Difference (official > period): Second notification fired when next class is coming
   */
  async notifyUpcomingClassWithSurplus(
    subjectName: string,
    slot: TimetableSlot,
    officialAttended: number,
    periodAttended: number
  ): Promise<string | null> {
    const surplus = officialAttended - periodAttended;
    const title = `🔔 Upcoming Class: ${subjectName}`;
    const roomInfo = slot.room ? ` in ${slot.room}` : '';
    const body = `Class starts at ${slot.startTime} (${slot.day})${roomInfo}. Note: Portal has +${surplus} extra attended hrs. Make sure to log this period!`;
    return this.sendLocalNotification(title, body, {
      type: 'UPCOMING_CLASS_SURPLUS',
      subjectName,
      slotId: slot.id,
      officialAttended,
      periodAttended,
      surplus,
    });
  },

  /**
   * Schedule upcoming class notification for negative difference (official > period) ahead of time
   */
  async scheduleUpcomingClassSurplusAlert(
    subjectName: string,
    slot: TimetableSlot,
    classDate: Date,
    officialAttended: number,
    periodAttended: number
  ): Promise<string | null> {
    try {
      const surplus = officialAttended - periodAttended;
      const title = `🔔 Upcoming Class: ${subjectName}`;
      const roomInfo = slot.room ? ` in ${slot.room}` : '';
      const body = `Class starts at ${slot.startTime} (${slot.day})${roomInfo}. Note: Portal has +${surplus} extra attended hrs. Make sure to log this period!`;

      // Trigger 15 minutes before classDate, or immediately if starting within 15 minutes
      const triggerMs = classDate.getTime() - 15 * 60 * 1000;
      const diffSeconds = Math.max(1, Math.round((triggerMs - Date.now()) / 1000));

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'UPCOMING_CLASS_SURPLUS',
            subjectName,
            slotId: slot.id,
            officialAttended,
            periodAttended,
            surplus,
          },
          sound: 'default',
          vibrate: [0, 500, 200, 500],
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: diffSeconds,
          repeats: false,
        },
      });
      return id;
    } catch (e) {
      console.warn('Error scheduling upcoming class surplus alert:', e);
      return null;
    }
  },

  /**
   * Notify when a faculty/teacher posts an assignment, deadline change, or update on Moodle
   * Sends directly to the phone's native system notification tray with high priority and vibration.
   */
  async notifyMoodleCourseUpdate(
    courseName: string,
    updateTitle: string,
    details: string
  ): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `📚 Moodle Update: ${courseName}`,
          body: `${updateTitle}: ${details}`,
          data: {
            type: 'MOODLE_UPDATE',
            courseName,
            updateTitle,
          },
          sound: 'default',
          vibrate: [0, 600, 250, 600],
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null, // deliver immediately to phone notification bar
      });
      return id;
    } catch (e) {
      console.warn('Error firing Moodle phone notification:', e);
      return null;
    }
  },

  /**
   * Notify when a new official circular / announcement is published on PSGIM Connect
   */
  async notifyNewAnnouncement(title: string, author: string): Promise<string | null> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `📢 New Circular: ${title}`,
          body: `Published by ${author}. Tap to view circular and details.`,
          data: {
            type: 'PSGIM_ANNOUNCEMENT',
            title,
            author,
          },
          sound: 'default',
          vibrate: [0, 400, 200, 400],
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // send immediately
      });
      return id;
    } catch (e) {
      console.warn('Error firing announcement notification:', e);
      return null;
    }
  },
};

