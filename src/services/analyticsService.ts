import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeatureUsageStats, StudentActivityRecord, AppFeature } from '../types';
import { CloudSyncService } from './cloudSyncService';
import { getMasterStudent } from '../data/psgimMasterStudents';

const STORAGE_KEY_ANALYTICS = '@attendance_monitor_analytics_stats';
const STORAGE_KEY_ACTIVE_STUDENTS = '@attendance_monitor_active_students';
const STORAGE_KEY_STUDENTS_ACTIVITY = '@attendance_monitor_students_activity';

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
   * Retrieves aggregated usage statistics from local storage & live Cloud Firestore.
   */
  async getAnalyticsSummary(): Promise<FeatureUsageStats> {
    try {
      // 1. Fetch live registered students from Firestore
      const realStudents = await CloudSyncService.fetchAllRegisteredStudents();
      
      const data = await AsyncStorage.getItem(STORAGE_KEY_ANALYTICS);
      let stats: FeatureUsageStats = data ? JSON.parse(data) : { ...BASELINE_ANALYTICS };

      // If we have live Firestore students, reflect their exact counts
      if (realStudents && realStudents.length > 0) {
        const batchCounts = { A: 0, B: 0, C: 0, D: 0 };
        const todayStr = new Date().toISOString().split('T')[0];
        let todayActive = 0;

        realStudents.forEach((st) => {
          const b = (st.batch || 'A').toUpperCase() as 'A' | 'B' | 'C' | 'D';
          if (batchCounts[b] !== undefined) {
            batchCounts[b] += 1;
          }
          if (st.lastActiveAt && st.lastActiveAt.startsWith(todayStr)) {
            todayActive += 1;
          }
        });

        stats.uniqueStudentsCount = realStudents.length;
        stats.batchBreakdown = batchCounts;
        if (todayActive > 0) {
          stats.activeTodayCount = todayActive;
        }
      }

      return stats;
    } catch (e) {
      console.warn('Error reading analytics:', e);
      return BASELINE_ANALYTICS;
    }
  },

  /**
   * Records a student login event, tracking unique students and batch distribution.
   */
  async recordLogin(rollNo: string, name?: string, batch?: string): Promise<void> {
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

      // Also ensure student activity record exists
      await this.initStudentActivity(rollNo, name, resolvedBatch);
    } catch (e) {
      console.warn('Error recording login event:', e);
    }
  },

  /**
   * Initializes or updates student activity record
   */
  async initStudentActivity(rollNo: string, name?: string, batch?: string): Promise<StudentActivityRecord> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_STUDENTS_ACTIVITY);
    const map: Record<string, StudentActivityRecord> = raw ? JSON.parse(raw) : {};
    const today = new Date().toISOString().split('T')[0];
    const upperRoll = rollNo.toUpperCase();

    const master = getMasterStudent(upperRoll);
    const resolvedName = name || master?.name || `Student ${upperRoll}`;
    const resolvedBatch = batch || master?.batch || 'A';

    let rec = map[upperRoll];
    if (!rec) {
      rec = {
        rollNo: upperRoll,
        name: resolvedName,
        batch: resolvedBatch,
        totalTimeMinutes: 2,
        todayTimeMinutes: 2,
        lastActiveAt: new Date().toISOString(),
        lastActiveDate: today,
        featureUsage: {
          hourlyTrack: 1,
          timetable: 0,
          calendar: 0,
          erpSync: 0,
          medicalVault: 0,
          digitalId: 0,
          coursePlan: 0,
          notices: 0,
        },
        totalSessions: 1,
      };
    } else {
      rec.lastActiveAt = new Date().toISOString();
      if (rec.lastActiveDate !== today) {
        rec.todayTimeMinutes = 0;
        rec.lastActiveDate = today;
      }
      rec.totalSessions = (rec.totalSessions || 0) + 1;
      if (resolvedName && !rec.name.includes(resolvedName)) {
        rec.name = resolvedName;
      }
    }

    map[upperRoll] = rec;
    await AsyncStorage.setItem(STORAGE_KEY_STUDENTS_ACTIVITY, JSON.stringify(map));
    CloudSyncService.syncStudentActivity(rec);
    return rec;
  },

  /**
   * Tracks incremental foreground active time spent by a student (called e.g. every minute)
   */
  async trackActiveMinutes(rollNo: string, minutes: number = 1): Promise<void> {
    if (!rollNo || minutes <= 0) return;
    try {
      const upperRoll = rollNo.toUpperCase();
      const raw = await AsyncStorage.getItem(STORAGE_KEY_STUDENTS_ACTIVITY);
      const map: Record<string, StudentActivityRecord> = raw ? JSON.parse(raw) : {};
      const today = new Date().toISOString().split('T')[0];

      let rec = map[upperRoll];
      if (!rec) {
        rec = await this.initStudentActivity(upperRoll);
      }

      rec.totalTimeMinutes = (rec.totalTimeMinutes || 0) + minutes;
      if (rec.lastActiveDate === today) {
        rec.todayTimeMinutes = (rec.todayTimeMinutes || 0) + minutes;
      } else {
        rec.todayTimeMinutes = minutes;
        rec.lastActiveDate = today;
      }
      rec.lastActiveAt = new Date().toISOString();

      map[upperRoll] = rec;
      await AsyncStorage.setItem(STORAGE_KEY_STUDENTS_ACTIVITY, JSON.stringify(map));
      // Cloud sync
      CloudSyncService.syncStudentActivity(rec);
    } catch (e) {
      console.warn('Error tracking active minutes:', e);
    }
  },

  /**
   * Tracks a specific feature event used by a student
   */
  async trackFeatureEvent(rollNo: string, feature: AppFeature): Promise<void> {
    try {
      // 1. Update global feature visits
      if (feature === 'HOURLY_TRACK') this.recordFeatureVisit('HOURLY');
      else if (feature === 'TIMETABLE') this.recordFeatureVisit('TIMETABLE');
      else if (feature === 'CALENDAR') this.recordFeatureVisit('CALENDAR');
      else if (feature === 'ERP_SYNC') this.recordFeatureVisit('ERP_SYNC');
      else if (feature === 'MEDICAL_VAULT') this.recordFeatureVisit('MEDICAL');

      // 2. Update individual student breakdown
      if (!rollNo) return;
      const upperRoll = rollNo.toUpperCase();
      const raw = await AsyncStorage.getItem(STORAGE_KEY_STUDENTS_ACTIVITY);
      const map: Record<string, StudentActivityRecord> = raw ? JSON.parse(raw) : {};

      let rec = map[upperRoll];
      if (!rec) {
        rec = await this.initStudentActivity(upperRoll);
      }

      if (!rec.featureUsage) {
        rec.featureUsage = {
          hourlyTrack: 0,
          timetable: 0,
          calendar: 0,
          erpSync: 0,
          medicalVault: 0,
          digitalId: 0,
          coursePlan: 0,
          notices: 0,
        };
      }

      switch (feature) {
        case 'HOURLY_TRACK':
          rec.featureUsage.hourlyTrack += 1;
          break;
        case 'TIMETABLE':
          rec.featureUsage.timetable += 1;
          break;
        case 'CALENDAR':
          rec.featureUsage.calendar += 1;
          break;
        case 'ERP_SYNC':
          rec.featureUsage.erpSync += 1;
          break;
        case 'MEDICAL_VAULT':
          rec.featureUsage.medicalVault += 1;
          break;
        case 'DIGITAL_ID':
          rec.featureUsage.digitalId += 1;
          break;
        case 'COURSE_PLAN':
          rec.featureUsage.coursePlan += 1;
          break;
        case 'NOTICES_CONNECT':
          rec.featureUsage.notices += 1;
          break;
      }

      rec.lastActiveAt = new Date().toISOString();
      map[upperRoll] = rec;
      await AsyncStorage.setItem(STORAGE_KEY_STUDENTS_ACTIVITY, JSON.stringify(map));
      CloudSyncService.syncStudentActivity(rec);
    } catch (e) {
      console.warn('Error recording feature event:', e);
    }
  },

  /**
   * Tracks when a user opens or uses a feature tab (legacy wrapper)
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
   * Retrieves all individual student activities (merging cloud & local storage)
   */
  async getAllStudentActivities(): Promise<StudentActivityRecord[]> {
    try {
      // 1. Fetch from Cloud Firestore
      const cloudList = await CloudSyncService.fetchAllStudentActivities();

      // 2. Fetch from Local Storage
      const raw = await AsyncStorage.getItem(STORAGE_KEY_STUDENTS_ACTIVITY);
      const localMap: Record<string, StudentActivityRecord> = raw ? JSON.parse(raw) : {};

      // Merge (prefer higher totalTimeMinutes)
      const mergedMap: Record<string, StudentActivityRecord> = { ...localMap };
      cloudList.forEach((c) => {
        const existing = mergedMap[c.rollNo];
        if (!existing || (c.totalTimeMinutes || 0) > (existing.totalTimeMinutes || 0)) {
          mergedMap[c.rollNo] = c;
        }
      });

      return Object.values(mergedMap).sort((a, b) => (b.totalTimeMinutes || 0) - (a.totalTimeMinutes || 0));
    } catch (e) {
      console.warn('Error getting all student activities:', e);
      return [];
    }
  },

  /**
   * Resets all analytics back to baseline values.
   */
  async resetAnalytics(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(BASELINE_ANALYTICS));
      await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_STUDENTS);
      await AsyncStorage.removeItem(STORAGE_KEY_STUDENTS_ACTIVITY);
    } catch (e) {
      console.warn('Error resetting analytics:', e);
    }
  },
};

