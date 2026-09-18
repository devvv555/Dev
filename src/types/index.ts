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
