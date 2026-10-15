export type DayOfWeek = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  standardTarget: number; // default 75%
  medicalTarget: number;   // default 65%
  hasMedicalClaim: boolean;
  attended: number;
  total: number;
  officialAttended: number;
  officialTotal: number;
  lastOfficialUpdate?: string;
  batch?: string;
  faculty?: string;
  room?: string;
}

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  subjectId: string;
  room?: string;
}

export type AttendanceStatus = 'attended' | 'bunked' | 'cancelled';

export interface AttendanceLog {
  id: string;
  date: string; // "YYYY-MM-DD"
  slotId?: string;
  subjectId: string;
  status: AttendanceStatus;
  timestamp: number;
}

export interface PeriodAttendanceRecord {
  periodKey: string; // e.g. "2026-09-18_slot_D26AA01_Thursday_0"
  date: string; // "YYYY-MM-DD"
  slotId: string;
  subjectId: string;
  status: AttendanceStatus;
  hours?: number; // Academic hours for this slot (e.g. 1 or 2)
  recordedAt: number;
}


export type MedicalClaimStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED';

export interface MedicalClaimRecord {
  id: string;
  subjectId: string | 'ALL';
  fromDate: string;
  toDate: string;
  reason: string;
  doctorName: string;
  hospitalOrClinic?: string;
  certificateNote?: string;
  status: MedicalClaimStatus;
  createdAt: string;
}

export type AttendanceStatusCategory = 
  | 'SAFE_STANDARD'  // >= 75%
  | 'SAFE_MEDICAL'   // >= 65% and < 75% (Safe due to medical concession)
  | 'SHORTAGE';      // < 65% (or < 75% if no medical claim)

export interface AttendanceMetrics {
  percentage: number;
  effectiveTarget: number;
  isMedicalClaimActive: boolean;
  status: AttendanceStatusCategory;
  safeBunks: number;
  recoveryNeeded: number;
  safeBunksAt65: number;
  safeBunksAt75: number;
  recoveryNeededAt65: number;
  recoveryNeededAt75: number;
  summaryMessage: string;
}

export type FeedbackCategory = 'BUG' | 'FEATURE' | 'SCHEDULE' | 'GENERAL';

export interface StudentFeedback {
  id: string;
  studentName: string;
  studentRollNo: string;
  studentDob?: string;
  batch: string;
  isAnonymous: boolean;
  category: FeedbackCategory;
  rating: number; // 1 to 5
  message: string;
  createdAt: string; // ISO string
  status: 'NEW' | 'REVIEWED' | 'RESOLVED';
}

export interface FeatureUsageStats {
  hourlyTrackerViews: number;
  timetableViews: number;
  calendarViews: number;
  medicalVaultViews: number;
  erpSyncViews: number;
  totalLogins: number;
  uniqueStudentsCount: number;
  activeTodayCount: number;
  batchBreakdown: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
}

export interface PeriodReminder {
  id: string;
  slotId: string;
  subjectId: string;
  subjectName: string;
  rollNo: string;
  note: string;
  dueTiming: 'NEXT_CLASS' | 'TONIGHT_8PM' | 'TOMORROW_8AM';
  createdAt: number;
  completed: boolean;
}

export interface SurplusAttendanceAlert {
  id: string;
  subjectId: string;
  subjectName: string;
  rollNo: string;
  officialAttended: number;
  periodAttended: number;
  difference: number; // officialAttended - periodAttended
  notifiedOnUpdate: boolean;
  notifiedBeforeClass: boolean;
  nextSlotId?: string;
  nextSlotDay?: string;
  nextSlotStartTime?: string;
  nextSlotEndTime?: string;
  nextClassDateIso?: string;
  updatedAt: string;
}


