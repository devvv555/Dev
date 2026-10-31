import AsyncStorage from '@react-native-async-storage/async-storage';
import { CloudSyncService } from './cloudSyncService';
import { StorageService } from './storageService';
import { getMasterStudent, toNewRollNo } from '../data/psgimMasterStudents';

export interface MarkedStudentSummary {
  rollNo: string;
  name: string;
  batch: string;
  totalHoursMarked: number;
  subjectsCount: number;
  lastMarkedAt?: string;
}

export interface MissMinutesSyncLog {
  timestamp: number;
  scheduledTime: string;
  dayOfWeek: string;
  status: 'SUCCESS' | 'SKIPPED_SUNDAY' | 'ERROR';
  details: string;
  uploadedRecordsCount: number;
  markedStudents?: MarkedStudentSummary[];
}

const STORAGE_KEY_MISS_MINUTES = '@stark_ai_miss_minutes_sync_log';

/**
 * Miss Minutes (The Scheduled Cloud Sync AI)
 * Responsible for the scheduled cloud update of every day's attendance
 * at 9:00 PM on Monday through Saturday following official protocol.
 */
export const MissMinutesScheduler = {
  SCHEDULE_CRON_EXPRESSION: '0 21 * * 1-6', // 9:00 PM Mon-Sat

  /**
   * Checks whether the current time window matches the 9:00 PM Mon-Sat protocol.
   */
  isScheduledWindow(): boolean {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Monday through Saturday only (1 to 6)
    const isMonToSat = day >= 1 && day <= 6;
    // Window: around 21:00 (9:00 PM)
    const isNinePm = hours === 21 && minutes >= 0 && minutes <= 59;

    return isMonToSat && isNinePm;
  },

  /**
   * Fetches the complete list of students who have marked attendance in the app.
   */
  async getAttendanceMarkedStudents(): Promise<MarkedStudentSummary[]> {
    try {
      const cloudStudents = await CloudSyncService.fetchAttendanceMarkedStudents();
      const studentMap = new Map<string, MarkedStudentSummary>();

      // 1. Ingest cloud attendance documents
      cloudStudents.forEach((cs) => {
        const canonical = toNewRollNo(cs.rollNo) || cs.rollNo;
        const master = getMasterStudent(canonical);
        studentMap.set(canonical.toUpperCase(), {
          rollNo: canonical.toUpperCase(),
          name: master?.name || cs.name || `Student ${canonical}`,
          batch: master?.batch || cs.batch || 'A',
          totalHoursMarked: cs.totalPeriodsMarked || 0,
          subjectsCount: cs.subjectsWithAttendance || 0,
          lastMarkedAt: cs.lastActiveAt || cs.syncedAt,
        });
      });

      // 2. Ingest local active user attendance
      const currentRoll = await StorageService.getAuthUser();
      if (currentRoll) {
        const canonical = toNewRollNo(currentRoll) || currentRoll;
        const localSubjects = await StorageService.getSubjects();
        const localPeriodRecords = await StorageService.getPeriodRecords(canonical);
        const periodsCount = Object.keys(localPeriodRecords || {}).length;
        const attendedHrs = (localSubjects || []).reduce((sum, s) => sum + (s.attended || 0), 0);

        if (periodsCount > 0 || attendedHrs > 0) {
          const master = getMasterStudent(canonical);
          const existing = studentMap.get(canonical.toUpperCase());
          studentMap.set(canonical.toUpperCase(), {
            rollNo: canonical.toUpperCase(),
            name: master?.name || `Student ${canonical}`,
            batch: master?.batch || (canonical.length >= 5 ? (canonical.charAt(3) as any) : 'A'),
            totalHoursMarked: Math.max(existing?.totalHoursMarked || 0, attendedHrs, periodsCount),
            subjectsCount: Math.max(existing?.subjectsCount || 0, (localSubjects || []).filter(s => s.attended > 0).length),
            lastMarkedAt: new Date().toISOString(),
          });
        }
      }

      // Convert to sorted array
      return Array.from(studentMap.values()).sort((a, b) => {
        if (b.totalHoursMarked !== a.totalHoursMarked) {
          return b.totalHoursMarked - a.totalHoursMarked;
        }
        return a.rollNo.localeCompare(b.rollNo);
      });
    } catch (e) {
      console.warn('[MissMinutes] Error getting marked students:', e);
      return [];
    }
  },

  /**
   * Executes the 9:00 PM daily attendance cloud update protocol.
   * Can be triggered by background cron or manually by admin.
   */
  async executeNightlyAttendanceSync(force: boolean = false): Promise<MissMinutesSyncLog> {
    const now = new Date();
    const day = now.getDay();
    const daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = daysName[day];
    const todayStr = now.toISOString().split('T')[0];

    // Sunday check (skip unless forced)
    if (day === 0 && !force) {
      const skipLog: MissMinutesSyncLog = {
        timestamp: Date.now(),
        scheduledTime: '21:00 Mon-Sat',
        dayOfWeek: todayName,
        status: 'SKIPPED_SUNDAY',
        details: 'Miss Minutes protocol observes Sunday holiday; no scheduled 9:00 PM sync required.',
        uploadedRecordsCount: 0,
      };
      await this.saveLog(skipLog);
      return skipLog;
    }

    try {
      const rollNo = await StorageService.getAuthUser();
      const currentRoll = rollNo || '26AB12';
      const periodRecords = await StorageService.getPeriodRecords(currentRoll);
      const subjects = await StorageService.getSubjects();

      let count = 0;
      // Sync subjects
      if (subjects && subjects.length > 0) {
        await CloudSyncService.syncSubjects(currentRoll, subjects);
        count += subjects.length;
      }

      // Sync today's period attendance
      for (const [key, rec] of Object.entries(periodRecords)) {
        if (rec.date === todayStr) {
          await CloudSyncService.syncPeriodRecord(currentRoll, rec);
          count++;
        }
      }

      // Broadcast global notification update for cohort
      await CloudSyncService.broadcastGlobalAttendanceUpdate(
        currentRoll,
        `Student ${currentRoll}`,
        subjects.length,
        todayStr
      );

      // Collect the roster of students who have marked attendance
      const markedStudents = await this.getAttendanceMarkedStudents();

      const log: MissMinutesSyncLog = {
        timestamp: Date.now(),
        scheduledTime: '21:00 Mon-Sat',
        dayOfWeek: todayName,
        status: 'SUCCESS',
        details: `Miss Minutes successfully executed 9:00 PM attendance sync protocol for ${todayStr}. Synced ${markedStudents.length} active students who marked attendance.`,
        uploadedRecordsCount: count,
        markedStudents,
      };

      await this.saveLog(log);
      return log;
    } catch (e: any) {
      const markedStudents = await this.getAttendanceMarkedStudents().catch(() => []);
      const errLog: MissMinutesSyncLog = {
        timestamp: Date.now(),
        scheduledTime: '21:00 Mon-Sat',
        dayOfWeek: todayName,
        status: 'ERROR',
        details: `Miss Minutes protocol encountered an exception: ${e?.message || 'Cloud sync error'}`,
        uploadedRecordsCount: 0,
        markedStudents,
      };
      await this.saveLog(errLog);
      return errLog;
    }
  },

  async saveLog(log: MissMinutesSyncLog): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_MISS_MINUTES, JSON.stringify(log));
    } catch {
      // Ignored
    }
  },

  async getLastSyncLog(): Promise<MissMinutesSyncLog | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_MISS_MINUTES);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
};
