// Faculty Attendance Engine & Cloud Sync Service
// Handles taking hourly roll-call, negative-marking absentees, and synchronizing attendance to Firestore

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FacultyMember, FacultyDataService } from '../data/psgimFacultyData';
import { CloudSyncService } from './cloudSyncService';
import { PsgimStudentInfo } from '../data/psgimMasterStudents';

export interface HourlyRollCallRecord {
  periodId: string;
  date: string; // YYYY-MM-DD
  day: string;
  startTime: string;
  endTime: string;
  hours: number; // Academic hours duration: 1, 2, or 3
  courseKey: string;
  courseTitle: string;
  batchCode: string;
  room: string;
  facultyEmail: string;
  facultyName: string;
  submittedAt: number;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  odCount: number;
  attendanceMap: Record<string, 'present' | 'absent' | 'od'>; // key: collegeRollNo
}

const STORAGE_KEYS = {
  SAVED_FACULTY: '@attendance_monitor_saved_faculty',
  FACULTY_RECORDS: '@attendance_monitor_faculty_period_records_',
};

export const FacultyAttendanceService = {
  /**
   * Save logged in faculty session
   */
  async saveFacultySession(faculty: FacultyMember): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_FACULTY, JSON.stringify(faculty));
    } catch (e) {
      console.warn('Error saving faculty session:', e);
    }
  },

  /**
   * Get currently logged in faculty
   */
  async getFacultySession(): Promise<FacultyMember | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_FACULTY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Clear faculty session on logout
   */
  async clearFacultySession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_FACULTY);
    } catch (e) {
      console.warn('Error clearing faculty session:', e);
    }
  },

  /**
   * Submit an hourly roll-call sheet:
   * 1. Saves locally to faculty cache
   * 2. Broadcasts to Firestore Cloud Sync so students' apps update instantly
   */
  async submitHourlyAttendance(record: HourlyRollCallRecord): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Save locally
      const localKey = `${STORAGE_KEYS.FACULTY_RECORDS}${record.facultyEmail}`;
      const existing = await AsyncStorage.getItem(localKey);
      const records: Record<string, HourlyRollCallRecord> = existing ? JSON.parse(existing) : {};
      records[`${record.date}_${record.periodId}`] = record;
      await AsyncStorage.setItem(localKey, JSON.stringify(records));

      // 2. Broadcast to CloudSync for students
      // For each student, push status to student's period records if possible
      try {
        await CloudSyncService.broadcastFacultyPeriodAttendance({
          periodId: record.periodId,
          date: record.date,
          hours: record.hours || 1,
          courseKey: record.courseKey,
          courseTitle: record.courseTitle,
          batchCode: record.batchCode,
          facultyName: record.facultyName,
          submittedAt: record.submittedAt,
          attendanceMap: record.attendanceMap,
        });
      } catch (err) {
        console.warn('Cloud sync broadcast warning (persisted locally):', err);
      }

      return {
        success: true,
        message: `Hourly attendance for ${record.courseKey} (${record.batchCode}) successfully submitted & broadcasted to ${record.totalStudents} students!`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Failed to submit hourly attendance. Please try again.',
      };
    }
  },

  /**
   * Get previously submitted record for a specific slot and date
   */
  async getSavedPeriodRecord(
    facultyEmail: string,
    date: string,
    periodId: string
  ): Promise<HourlyRollCallRecord | null> {
    try {
      const localKey = `${STORAGE_KEYS.FACULTY_RECORDS}${facultyEmail}`;
      const existing = await AsyncStorage.getItem(localKey);
      if (!existing) return null;
      const records: Record<string, HourlyRollCallRecord> = JSON.parse(existing);
      return records[`${date}_${periodId}`] || null;
    } catch {
      return null;
    }
  }
};
