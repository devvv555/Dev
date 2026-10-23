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
  attendanceFrom?: string;
  attendanceTo?: string;
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
  faculty?: string;
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
  cloudSyncedAt?: string;
  lockedUntilPortalUpdate?: boolean;
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
  dueTiming: 'PREV_NIGHT_8PM' | 'NEXT_CLASS' | 'TONIGHT_8PM' | 'TOMORROW_8AM' | 'CUSTOM';
  customTime?: string;
  scheduledTimeText?: string;
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

export type LmsSubmissionStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'GRADED';

export interface LmsAssignment {
  id: string;
  moodleId: number;
  courseCode: string;
  courseName: string;
  subjectId?: string;
  title: string;
  description: string;
  dueDate: string; // ISO string
  dueTimestamp: number;
  allowSubmissionsFromDate?: string;
  cutoffDate?: string;
  maxFiles: number;
  maxFileSizeMb: number;
  acceptedFileTypes: string[]; // e.g. ['.pdf', '.doc', '.docx']
  status: LmsSubmissionStatus;
  submissionDate?: string;
  submittedFileName?: string;
  submittedFileSize?: string;
  submittedFileUrl?: string;
  grade?: string;
  feedback?: string;
  moodleUrl: string; // Direct link to assignment
}

export interface LmsQuiz {
  id: string;
  moodleId: number;
  courseCode: string;
  courseName: string;
  subjectId?: string;
  title: string;
  description: string;
  timeOpen: string; // ISO string
  timeClose: string; // ISO string
  timeLimitMinutes: number;
  attemptsAllowed: number;
  attemptsUsed: number;
  highestGrade?: string;
  status: 'OPEN' | 'UPCOMING' | 'CLOSED';
  moodleUrl: string; // Direct link to quiz attempt
}

export interface PsgimAnnouncement {
  id: number;
  title: string;
  category: string;
  priority: 'normal' | 'important' | 'urgent';
  status: string;
  is_pinned: number;
  publish_at: string;
  created_at: string;
  created_by: string;
  summary?: string;
  content?: string;
  attachmentUrl?: string;
  venue?: string;
  eventDate?: string;
  eventTime?: string;
  isRead?: boolean;
}

export interface PsgimConnectCredentials {
  registerNo: string;
  password?: string;
  lastSyncedAt?: string;
}

// ── Course Plan & Continuous Assessment (CA) Types ──
export interface CourseAssessmentComponent {
  id: string;
  title: string;
  type: 'GROUP_ACTIVITY' | 'EXAM' | 'INDIVIDUAL_LAB' | 'CASE_ANALYSIS';
  scheduledDate: string;
  sessionsCovered: string;
  marksAllotted: number;
  obtainedMarks?: number;
  description?: string;
  coTarget?: string;
  completed?: boolean;
}

export interface CourseSession {
  sessionNumber: number;
  unit: string;
  topic: string;
  date?: string;
  isExam?: boolean;
  requiresLaptop?: boolean;
  software?: string;
}

export interface CoursePlan {
  subjectCode: string;
  subjectTitle: string;
  semester: string;
  batch: string;
  mode: string;
  faculty: string[];
  courseObjective: string;
  caMaxMarks: number; // 50
  feMaxMarks: number; // 50
  assessments: CourseAssessmentComponent[];
  sessions: CourseSession[];
  classroomRules: string[];
  recommendedBooks: string[];
  additionalInfo?: {
    miniProject?: string[];
    practicalTest?: string[];
    caseAnalysis?: string[];
  };
}

export interface StudentCourseCaRecord {
  subjectCode: string;
  marks: Record<string, number>; // assessmentId -> marks
  targetGrade: 'O' | 'A+' | 'A' | 'B+';
  updatedAt: string;
}

// ── Emergency Digital Student ID Types ──
export interface DigitalStudentId {
  rollNo: string;
  name: string;
  program: string;
  batch: string;
  section: string;
  semester: number;
  dob?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  avatarLetter: string;
  validUntil: string;
  isPendingApproval: boolean;
}

// ── Attendance Dispute & Summary Report Types ──
export interface AttendanceDisputeItem {
  subjectCode: string;
  subjectName: string;
  portalTotal: number;
  portalAttended: number;
  portalPercentage: number;
  appTotal: number;
  appAttended: number;
  appPercentage: number;
  deltaAttended: number; // appAttended - portalAttended
  hasDiscrepancy: boolean;
}

export interface AttendanceDisputeReport {
  generatedAt: string;
  rollNo: string;
  studentName: string;
  section: string;
  portalFromDate: string;
  portalToDate: string;
  items: AttendanceDisputeItem[];
  totalDiscrepancyHours: number;
  medicalLeavesCount: number;
  summaryText: string;
}
