import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, TimetableSlot, AttendanceLog, MedicalClaimRecord, PeriodAttendanceRecord, PeriodReminder, SurplusAttendanceAlert } from '../types';
import { toNewRollNo, toOldRollNo } from '../data/psgimMasterStudents';

const STORAGE_KEYS = {
  SUBJECTS: '@attendance_monitor_subjects',
  TIMETABLE: '@attendance_monitor_timetable',
  LOGS: '@attendance_monitor_logs',
  MEDICAL_CLAIMS: '@attendance_monitor_medical_claims',
  ROLL_NO: '@attendance_monitor_roll_no',
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
      const rollNo = await AsyncStorage.getItem(STORAGE_KEYS.ROLL_NO);
      if (rollNo) return toNewRollNo(rollNo) || rollNo;
      const legacyUser = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (legacyUser) return toNewRollNo(legacyUser) || legacyUser;
      return null;
    } catch {
      return null;
    }
  },

  async setAuthUser(rollNo: string): Promise<void> {
    try {
      const officialRoll = toNewRollNo(rollNo) || rollNo;
      await AsyncStorage.setItem(STORAGE_KEYS.ROLL_NO, officialRoll);
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, officialRoll);
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  async clearAuthUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ROLL_NO);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },

  async migrateStudentData(oldRoll: string, newRoll: string): Promise<void> {
    try {
      if (!oldRoll || !newRoll) return;
      const cleanOld = oldRoll.trim().toUpperCase();
      const cleanNew = newRoll.trim().toUpperCase();
      if (cleanOld === cleanNew) return;

      // 1. Migrate period records
      const oldKey = `${STORAGE_KEYS.PERIOD_RECORDS}${cleanOld}`;
      const newKey = `${STORAGE_KEYS.PERIOD_RECORDS}${cleanNew}`;
      const oldData = await AsyncStorage.getItem(oldKey);
      if (oldData) {
        const parsed = JSON.parse(oldData);
        const migrated: Record<string, PeriodAttendanceRecord> = {};
        for (const [key, val] of Object.entries(parsed)) {
          const migratedKey = key.includes(cleanOld) ? key.replace(cleanOld, cleanNew) : key;
          const record = val as PeriodAttendanceRecord;
          const migratedSlotId = record.slotId && record.slotId.includes(cleanOld)
            ? record.slotId.replace(cleanOld, cleanNew)
            : record.slotId;
          migrated[migratedKey] = {
            ...record,
            slotId: migratedSlotId,
          };
        }
        await AsyncStorage.setItem(newKey, JSON.stringify(migrated));
      }

      // 2. Migrate period reminders
      const oldRemindersKey = `${STORAGE_KEYS.PERIOD_REMINDERS}${cleanOld}`;
      const newRemindersKey = `${STORAGE_KEYS.PERIOD_REMINDERS}${cleanNew}`;
      const oldReminders = await AsyncStorage.getItem(oldRemindersKey);
      if (oldReminders) {
        const parsed = JSON.parse(oldReminders) as PeriodReminder[];
        const migrated = parsed.map((r) => ({
          ...r,
          slotId: r.slotId && r.slotId.includes(cleanOld) ? r.slotId.replace(cleanOld, cleanNew) : r.slotId,
        }));
        await AsyncStorage.setItem(newRemindersKey, JSON.stringify(migrated));
      }

      // 3. Migrate surplus alerts
      const oldAlertsKey = `${STORAGE_KEYS.SURPLUS_ALERTS}${cleanOld}`;
      const newAlertsKey = `${STORAGE_KEYS.SURPLUS_ALERTS}${cleanNew}`;
      const oldAlerts = await AsyncStorage.getItem(oldAlertsKey);
      if (oldAlerts) {
        await AsyncStorage.setItem(newAlertsKey, oldAlerts);
      }
    } catch (e) {
      console.warn('Error migrating student data:', e);
    }
  },

  async getPeriodRecords(rollNo: string): Promise<Record<string, PeriodAttendanceRecord>> {
    try {
      if (!rollNo) return {};
      const cleanNew = (toNewRollNo(rollNo) || rollNo).toUpperCase();
      const cleanOld = (toOldRollNo(rollNo) || rollNo).toUpperCase();

      const newKey = `${STORAGE_KEYS.PERIOD_RECORDS}${cleanNew}`;
      const data = await AsyncStorage.getItem(newKey);
      if (data) return JSON.parse(data);

      if (cleanOld !== cleanNew) {
        const oldKey = `${STORAGE_KEYS.PERIOD_RECORDS}${cleanOld}`;
        const legacyData = await AsyncStorage.getItem(oldKey);
        if (legacyData) {
          const parsed = JSON.parse(legacyData);
          const migrated: Record<string, PeriodAttendanceRecord> = {};
          for (const [key, val] of Object.entries(parsed)) {
            const migratedKey = key.includes(cleanOld) ? key.replace(cleanOld, cleanNew) : key;
            const record = val as PeriodAttendanceRecord;
            const migratedSlotId = record.slotId && record.slotId.includes(cleanOld)
              ? record.slotId.replace(cleanOld, cleanNew)
              : record.slotId;
            migrated[migratedKey] = {
              ...record,
              slotId: migratedSlotId,
            };
          }
          await AsyncStorage.setItem(newKey, JSON.stringify(migrated));
          return migrated;
        }
      }
      return {};
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
      const canonicalRoll = (toNewRollNo(rollNo) || rollNo).toUpperCase();
      const key = `${STORAGE_KEYS.PERIOD_RECORDS}${canonicalRoll}`;
      await AsyncStorage.setItem(key, JSON.stringify(records));
    } catch (e) {
      console.warn('Error saving period records:', e);
    }
  },

  async getPeriodReminders(rollNo: string): Promise<PeriodReminder[]> {
    try {
      if (!rollNo) return [];
      const cleanNew = (toNewRollNo(rollNo) || rollNo).toUpperCase();
      const cleanOld = (toOldRollNo(rollNo) || rollNo).toUpperCase();

      const newKey = `${STORAGE_KEYS.PERIOD_REMINDERS}${cleanNew}`;
      const data = await AsyncStorage.getItem(newKey);
      if (data) return JSON.parse(data);

      if (cleanOld !== cleanNew) {
        const oldKey = `${STORAGE_KEYS.PERIOD_REMINDERS}${cleanOld}`;
        const oldData = await AsyncStorage.getItem(oldKey);
        if (oldData) {
          const parsed = JSON.parse(oldData) as PeriodReminder[];
          const migrated = parsed.map((r) => ({
            ...r,
            slotId: r.slotId && r.slotId.includes(cleanOld) ? r.slotId.replace(cleanOld, cleanNew) : r.slotId,
          }));
          await AsyncStorage.setItem(newKey, JSON.stringify(migrated));
          return migrated;
        }
      }
      return [];
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
      const canonicalRoll = (toNewRollNo(rollNo) || rollNo).toUpperCase();
      const key = `${STORAGE_KEYS.PERIOD_REMINDERS}${canonicalRoll}`;
      await AsyncStorage.setItem(key, JSON.stringify(reminders));
    } catch (e) {
      console.warn('Error saving period reminders:', e);
    }
  },

  async getSurplusAlerts(rollNo: string): Promise<SurplusAttendanceAlert[]> {
    try {
      if (!rollNo) return [];
      const cleanNew = (toNewRollNo(rollNo) || rollNo).toUpperCase();
      const cleanOld = (toOldRollNo(rollNo) || rollNo).toUpperCase();

      const newKey = `${STORAGE_KEYS.SURPLUS_ALERTS}${cleanNew}`;
      const data = await AsyncStorage.getItem(newKey);
      if (data) return JSON.parse(data);

      if (cleanOld !== cleanNew) {
        const oldKey = `${STORAGE_KEYS.SURPLUS_ALERTS}${cleanOld}`;
        const oldData = await AsyncStorage.getItem(oldKey);
        if (oldData) {
          await AsyncStorage.setItem(newKey, oldData);
          return JSON.parse(oldData);
        }
      }
      return [];
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
      const canonicalRoll = (toNewRollNo(rollNo) || rollNo).toUpperCase();
      const key = `${STORAGE_KEYS.SURPLUS_ALERTS}${canonicalRoll}`;
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

