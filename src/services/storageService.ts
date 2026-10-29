import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, TimetableSlot, AttendanceLog, MedicalClaimRecord, PeriodAttendanceRecord, PeriodReminder, SurplusAttendanceAlert } from '../types';

const STORAGE_KEYS = {
  SUBJECTS: '@attendance_monitor_subjects',
  TIMETABLE: '@attendance_monitor_timetable',
  LOGS: '@attendance_monitor_logs',
  MEDICAL_CLAIMS: '@attendance_monitor_medical_claims',
  AUTH_USER: '@attendance_monitor_auth_user',
  PERIOD_RECORDS: '@attendance_monitor_period_records_',
  PERIOD_REMINDERS: '@attendance_monitor_period_reminders_',
  SURPLUS_ALERTS: '@attendance_monitor_surplus_alerts_',
};

export const INITIAL_SUBJECTS: Subject[] = [];
export const INITIAL_TIMETABLE: TimetableSlot[] = [];

export const INITIAL_MEDICAL_CLAIMS: MedicalClaimRecord[] = [];

export const StorageService = {
  async getSubjects(): Promise<Subject[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (data) return JSON.parse(data);
      await this.saveSubjects(INITIAL_SUBJECTS);
      return INITIAL_SUBJECTS;
    } catch {
      return INITIAL_SUBJECTS;
    }
  },

  async saveSubjects(subjects: Subject[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  async getTimetable(): Promise<TimetableSlot[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TIMETABLE);
      if (data) return JSON.parse(data);
      await this.saveTimetable(INITIAL_TIMETABLE);
      return INITIAL_TIMETABLE;
    } catch {
      return INITIAL_TIMETABLE;
    }
  },

  async saveTimetable(slots: TimetableSlot[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(slots));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  async getLogs(): Promise<AttendanceLog[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async addLog(log: AttendanceLog): Promise<void> {
    try {
      const logs = await this.getLogs();
      logs.unshift(log);
      await AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  async getMedicalClaims(): Promise<MedicalClaimRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MEDICAL_CLAIMS);
      if (data) return JSON.parse(data);
      await this.saveMedicalClaims(INITIAL_MEDICAL_CLAIMS);
      return INITIAL_MEDICAL_CLAIMS;
    } catch {
      return INITIAL_MEDICAL_CLAIMS;
    }
  },

  async saveMedicalClaims(claims: MedicalClaimRecord[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEDICAL_CLAIMS, JSON.stringify(claims));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  async getAuthUser(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
    } catch {
      return null;
    }
  },

  async setAuthUser(rollNo: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, rollNo);
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  async clearAuthUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  async getPeriodRecords(rollNo: string): Promise<Record<string, PeriodAttendanceRecord>> {
    try {
      if (!rollNo) return {};
      const key = `${STORAGE_KEYS.PERIOD_RECORDS}${rollNo.toUpperCase()}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.warn('Error reading period records:', e);
      return {};
    }
  },

  async savePeriodRecords(
    rollNo: string,
    records: Record<string, PeriodAttendanceRecord>
  ): Promise<void> {
    try {
      if (!rollNo) return;
      const key = `${STORAGE_KEYS.PERIOD_RECORDS}${rollNo.toUpperCase()}`;
      await AsyncStorage.setItem(key, JSON.stringify(records));
    } catch (e) {
      console.warn('Error saving period records:', e);
    }
  },

  async getPeriodReminders(rollNo: string): Promise<PeriodReminder[]> {
    try {
      if (!rollNo) return [];
      const key = `${STORAGE_KEYS.PERIOD_REMINDERS}${rollNo.toUpperCase()}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Error reading period reminders:', e);
      return [];
    }
  },

  async savePeriodReminders(
    rollNo: string,
    reminders: PeriodReminder[]
  ): Promise<void> {
    try {
      if (!rollNo) return;
      const key = `${STORAGE_KEYS.PERIOD_REMINDERS}${rollNo.toUpperCase()}`;
      await AsyncStorage.setItem(key, JSON.stringify(reminders));
    } catch (e) {
      console.warn('Error saving period reminders:', e);
    }
  },

  async getSurplusAlerts(rollNo: string): Promise<SurplusAttendanceAlert[]> {
    try {
      if (!rollNo) return [];
      const key = `${STORAGE_KEYS.SURPLUS_ALERTS}${rollNo.toUpperCase()}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Error reading surplus alerts:', e);
      return [];
    }
  },

  async saveSurplusAlerts(
    rollNo: string,
    alerts: SurplusAttendanceAlert[]
  ): Promise<void> {
    try {
      if (!rollNo) return;
      const key = `${STORAGE_KEYS.SURPLUS_ALERTS}${rollNo.toUpperCase()}`;
      await AsyncStorage.setItem(key, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Error saving surplus alerts:', e);
    }
  },

  async upsertSurplusAlert(
    rollNo: string,
    alert: SurplusAttendanceAlert
  ): Promise<void> {
    try {
      if (!rollNo) return;
      const current = await this.getSurplusAlerts(rollNo);
      const filtered = current.filter((a) => a.subjectId !== alert.subjectId);
      filtered.push(alert);
      await this.saveSurplusAlerts(rollNo, filtered);
    } catch (e) {
      console.warn('Error upserting surplus alert:', e);
    }
  },

  async markSurplusAlertNotifiedBeforeClass(
    rollNo: string,
    alertId: string
  ): Promise<void> {
    try {
      if (!rollNo) return;
      const current = await this.getSurplusAlerts(rollNo);
      const updated = current.map((a) =>
        a.id === alertId ? { ...a, notifiedBeforeClass: true } : a
      );
      await this.saveSurplusAlerts(rollNo, updated);
    } catch (e) {
      console.warn('Error marking surplus alert notified:', e);
    }
  },
};

