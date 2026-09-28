import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeatureUsageStats } from '../types';

const STORAGE_KEY_ANALYTICS = '@attendance_monitor_analytics_stats';
const STORAGE_KEY_ACTIVE_STUDENTS = '@attendance_monitor_active_students';

const BASELINE_ANALYTICS: FeatureUsageStats = {
  hourlyTrackerViews: 412,
  timetableViews: 184,
  calendarViews: 268,
  medicalVaultViews: 95,
  erpSyncViews: 64,
  totalLogins: 530,
  uniqueStudentsCount: 68,
  activeTodayCount: 29,
  batchBreakdown: {
    A: 19,
    B: 24,
    C: 13,
    D: 12,
  },
};

export const AnalyticsService = {
  /**
   * Retrieves aggregated usage statistics from local storage.
   * Initializes with baseline analytics if no data is present.
   */
  async getAnalyticsSummary(): Promise<FeatureUsageStats> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_ANALYTICS);
      if (!data) {
        await AsyncStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(BASELINE_ANALYTICS));
        return BASELINE_ANALYTICS;
      }
      return JSON.parse(data) as FeatureUsageStats;
    } catch (e) {
      console.warn('Error reading analytics:', e);
      return BASELINE_ANALYTICS;
    }
  },

  /**
   * Records a student login event, tracking unique students and batch distribution.
   */
  async recordLogin(rollNo: string, _name: string, batch?: string): Promise<void> {
    try {
      const stats = await this.getAnalyticsSummary();
      const rawStudents = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_STUDENTS);
      const activeStudents: Record<string, { lastSeen: string; batch: string }> = rawStudents
        ? JSON.parse(rawStudents)
        : {};

      const todayStr = new Date().toISOString().split('T')[0];
      const isNewStudent = !activeStudents[rollNo];
      const resolvedBatch = (batch || rollNo.charAt(3) || 'A').toUpperCase() as 'A' | 'B' | 'C' | 'D';

      activeStudents[rollNo] = {
        lastSeen: todayStr,
        batch: resolvedBatch,
      };

      await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_STUDENTS, JSON.stringify(activeStudents));

      // Calculate active today
      const activeToday = Object.values(activeStudents).filter((s) => s.lastSeen === todayStr).length;

      stats.totalLogins += 1;
      stats.uniqueStudentsCount = Object.keys(activeStudents).length;
      stats.activeTodayCount = Math.max(stats.activeTodayCount, activeToday);

      if (isNewStudent && stats.batchBreakdown[resolvedBatch] !== undefined) {
        stats.batchBreakdown[resolvedBatch] += 1;
      }

      await AsyncStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(stats));
    } catch (e) {
      console.warn('Error recording login event:', e);
    }
  },

  /**
   * Tracks when a user opens or uses a feature tab.
   */
  async recordFeatureVisit(feature: 'HOURLY' | 'TIMETABLE' | 'CALENDAR' | 'MEDICAL' | 'ERP_SYNC'): Promise<void> {
    try {
      const stats = await this.getAnalyticsSummary();

      switch (feature) {
        case 'HOURLY':
          stats.hourlyTrackerViews += 1;
          break;
        case 'TIMETABLE':
          stats.timetableViews += 1;
          break;
        case 'CALENDAR':
          stats.calendarViews += 1;
          break;
        case 'MEDICAL':
          stats.medicalVaultViews += 1;
          break;
        case 'ERP_SYNC':
          stats.erpSyncViews += 1;
          break;
      }

      await AsyncStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(stats));
    } catch (e) {
      console.warn('Error recording feature visit:', e);
    }
  },

  /**
   * Resets all analytics back to baseline values.
   */
  async resetAnalytics(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(BASELINE_ANALYTICS));
      await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_STUDENTS);
    } catch (e) {
      console.warn('Error resetting analytics:', e);
    }
  },
};
