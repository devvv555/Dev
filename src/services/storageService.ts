import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, TimetableSlot, AttendanceLog, MedicalClaimRecord, PeriodAttendanceRecord } from '../types';

const STORAGE_KEYS = {
  SUBJECTS: '@attendance_monitor_subjects',
  TIMETABLE: '@attendance_monitor_timetable',
  LOGS: '@attendance_monitor_logs',
  MEDICAL_CLAIMS: '@attendance_monitor_medical_claims',
  AUTH_USER: '@attendance_monitor_auth_user',
  PERIOD_RECORDS: '@attendance_monitor_period_records_',
};

// Initial realistic seed data
export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub_1',
    name: 'Operating Systems',
    code: 'CS301',
    color: '#3B82F6', // Blue
    standardTarget: 75,
    medicalTarget: 65,
    hasMedicalClaim: false,
    attended: 28,
    total: 32, // 87.5% - Safe with bunks
    officialAttended: 26,
    officialTotal: 30,
    lastOfficialUpdate: '2026-09-12'
  },
  {
    id: 'sub_2',
    name: 'Database Management Systems',
    code: 'CS302',
    color: '#10B981', // Emerald
    standardTarget: 75,
    medicalTarget: 65,
    hasMedicalClaim: true, // Medical Claim Active!
    attended: 28,
    total: 41, // 68.29% - Safe under Medical (65%), Short under Standard (75%)
    officialAttended: 27,
    officialTotal: 40,
    lastOfficialUpdate: '2026-09-12'
  },
  {
    id: 'sub_3',
    name: 'Computer Networks',
    code: 'CS303',
    color: '#8B5CF6', // Purple
    standardTarget: 75,
    medicalTarget: 65,
    hasMedicalClaim: false,
    attended: 18,
    total: 28, // 64.28% - Shortage! Needs recovery
    officialAttended: 18,
    officialTotal: 28,
    lastOfficialUpdate: '2026-09-12'
  },
  {
    id: 'sub_4',
    name: 'Theory of Computation',
    code: 'CS304',
    color: '#F59E0B', // Amber
    standardTarget: 75,
    medicalTarget: 65,
    hasMedicalClaim: false,
    attended: 24,
    total: 30, // 80.0% - Safe
    officialAttended: 24,
    officialTotal: 30,
    lastOfficialUpdate: '2026-09-12'
  }
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  // Thursday (Current day in prompt)
  { id: 't_thu_1', day: 'Thursday', startTime: '09:00', endTime: '10:00', subjectId: 'sub_1', room: 'LH-101' },
  { id: 't_thu_2', day: 'Thursday', startTime: '10:00', endTime: '11:00', subjectId: 'sub_2', room: 'LH-102' },
  { id: 't_thu_3', day: 'Thursday', startTime: '11:15', endTime: '12:15', subjectId: 'sub_3', room: 'Network Lab' },
  { id: 't_thu_4', day: 'Thursday', startTime: '13:30', endTime: '14:30', subjectId: 'sub_4', room: 'LH-203' },
  // Friday
  { id: 't_fri_1', day: 'Friday', startTime: '09:00', endTime: '10:00', subjectId: 'sub_2', room: 'LH-102' },
  { id: 't_fri_2', day: 'Friday', startTime: '10:00', endTime: '11:00', subjectId: 'sub_4', room: 'LH-203' },
  { id: 't_fri_3', day: 'Friday', startTime: '11:15', endTime: '12:15', subjectId: 'sub_1', room: 'LH-101' },
  // Monday
  { id: 't_mon_1', day: 'Monday', startTime: '09:00', endTime: '10:00', subjectId: 'sub_1', room: 'LH-101' },
  { id: 't_mon_2', day: 'Monday', startTime: '10:00', endTime: '11:00', subjectId: 'sub_2', room: 'LH-102' }
];

export const INITIAL_MEDICAL_CLAIMS: MedicalClaimRecord[] = [
  {
    id: 'med_01',
    subjectId: 'sub_2', // Database Systems
    fromDate: '2026-09-02',
    toDate: '2026-09-06',
    reason: 'Acute Gastroenteritis & Dehydration',
    doctorName: 'Dr. V. K. Sharma, MD',
    hospitalOrClinic: 'City Health Care Clinic',
    certificateNote: 'Advised strict bed rest for 5 days. Submitted to Department Academic Cell.',
    status: 'APPROVED',
    createdAt: '2026-09-07'
  }
];

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
};
