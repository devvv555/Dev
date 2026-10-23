import { doc, setDoc, getDoc, collection, getDocs, query, orderBy, limit, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { Subject, PeriodAttendanceRecord, MedicalClaimRecord, StudentFeedback, StudentActivityRecord } from '../types';

export const CloudSyncService = {
  /**
   * Syncs student profile and last login to Firestore
   */
  async syncStudentProfile(rollNo: string, name: string, batch: string): Promise<void> {
    if (!rollNo) return;
    try {
      const studentRef = doc(db, 'students', rollNo);
      await setDoc(
        studentRef,
        {
          rollNo,
          name,
          batch,
          lastActiveAt: new Date().toISOString(),
          appVersion: '1.0.0',
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('[CloudSync] syncStudentProfile failed (offline or permissions):', e);
    }
  },

  /**
   * Syncs current subjects & attendance totals for a student
   */
  async syncSubjects(rollNo: string, subjects: Subject[]): Promise<void> {
    if (!rollNo || !subjects) return;
    try {
      const attendanceRef = doc(db, 'attendance', rollNo);
      await setDoc(
        attendanceRef,
        {
          rollNo,
          subjects,
          syncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('[CloudSync] syncSubjects failed:', e);
    }
  },

  /**
   * Syncs a single period attendance marking (Present / Bunk / Cancelled)
   */
  async syncPeriodRecord(rollNo: string, record: PeriodAttendanceRecord): Promise<void> {
    if (!rollNo || !record) return;
    try {
      const periodDocRef = doc(db, 'students', rollNo, 'periods', record.periodKey);
      await setDoc(
        periodDocRef,
        {
          ...record,
          syncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('[CloudSync] syncPeriodRecord failed:', e);
    }
  },

  /**
   * Syncs a registered medical claim certificate to Firestore
   */
  async syncMedicalClaim(rollNo: string, claim: MedicalClaimRecord): Promise<void> {
    if (!claim) return;
    try {
      const claimRef = doc(db, 'medical_claims', claim.id);
      await setDoc(
        claimRef,
        {
          ...claim,
          rollNo: rollNo || 'UNKNOWN',
          syncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('[CloudSync] syncMedicalClaim failed:', e);
    }
  },

  /**
   * Syncs student feedback into cloud database for Admin Dashboard
   */
  async syncFeedback(feedback: StudentFeedback): Promise<void> {
    if (!feedback) return;
    try {
      const feedbackRef = doc(db, 'feedback', feedback.id);
      await setDoc(feedbackRef, {
        ...feedback,
        syncedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[CloudSync] syncFeedback failed:', e);
    }
  },

  /**
   * Fetches latest student feedback items for Admin Dashboard
   */
  async fetchCloudFeedback(): Promise<StudentFeedback[]> {
    try {
      const feedbackCol = collection(db, 'feedback');
      const q = query(feedbackCol, orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const list: StudentFeedback[] = [];
      snap.forEach((d) => {
        list.push(d.data() as StudentFeedback);
      });
      return list;
    } catch (e) {
      console.warn('[CloudSync] fetchCloudFeedback failed:', e);
      return [];
    }
  },

  /**
   * Fetches cloud attendance record for a student if available
   */
  async fetchCloudSubjects(rollNo: string): Promise<Subject[] | null> {
    if (!rollNo) return null;
    try {
      const attendanceRef = doc(db, 'attendance', rollNo);
      const snap = await getDoc(attendanceRef);
      if (snap.exists()) {
        const data = snap.data();
        return (data.subjects as Subject[]) || null;
      }
      return null;
    } catch (e) {
      console.warn('[CloudSync] fetchCloudSubjects failed:', e);
      return null;
    }
  },

  /**
   * Fetches cloud period records (marked by teacher or synced) for a student
   */
  async fetchCloudPeriodRecords(rollNo: string): Promise<Record<string, PeriodAttendanceRecord>> {
    if (!rollNo) return {};
    try {
      const periodsCol = collection(db, 'students', rollNo, 'periods');
      const snap = await getDocs(periodsCol);
      const records: Record<string, PeriodAttendanceRecord> = {};
      snap.forEach((d) => {
        const data = d.data() as PeriodAttendanceRecord;
        if (data && data.periodKey) {
          records[data.periodKey] = data;
        }
      });
      return records;
    } catch (e) {
      console.warn('[CloudSync] fetchCloudPeriodRecords failed:', e);
      return {};
    }
  },

  /**
   * Broadcasts a global attendance update to the college/batch.
   * When any student extracts attendance from Studzone, this doc updates,
   * triggering real-time broadcast notifications to everyone in the app.
   */
  async broadcastGlobalAttendanceUpdate(
    rollNo: string,
    studentName: string,
    subjectsCount: number,
    portalUpdatedDate?: string,
    attendanceFrom?: string,
    attendanceTo?: string
  ): Promise<void> {
    try {
      const globalRef = doc(db, 'system_updates', 'latest_attendance_sync');
      await setDoc(
        globalRef,
        {
          updatedByRollNo: rollNo,
          updatedByName: studentName || rollNo,
          subjectsCount,
          portalUpdatedDate: portalUpdatedDate || null,
          attendanceFrom: attendanceFrom || null,
          attendanceTo: attendanceTo || null,
          updatedAt: new Date().toISOString(),
          timestamp: Date.now(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('[CloudSync] broadcastGlobalAttendanceUpdate failed:', e);
    }
  },

  /**
   * Fetches the latest global attendance update metadata
   */
  async getLatestGlobalAttendanceUpdate(): Promise<{
    updatedByRollNo: string;
    updatedByName: string;
    subjectsCount: number;
    portalUpdatedDate?: string;
    attendanceFrom?: string;
    attendanceTo?: string;
    updatedAt: string;
    timestamp: number;
  } | null> {
    try {
      const globalRef = doc(db, 'system_updates', 'latest_attendance_sync');
      const snap = await getDoc(globalRef);
      if (snap.exists()) {
        return snap.data() as any;
      }
      return null;
    } catch (e) {
      console.warn('[CloudSync] getLatestGlobalAttendanceUpdate failed:', e);
      return null;
    }
  },

  /**
   * Subscribes to real-time global attendance updates across all students.
   * Runs callback whenever someone extracts and updates attendance.
   */
  listenToGlobalAttendanceUpdates(
    callback: (update: {
      updatedByRollNo: string;
      updatedByName: string;
      subjectsCount: number;
      portalUpdatedDate?: string;
      attendanceFrom?: string;
      attendanceTo?: string;
      updatedAt: string;
      timestamp: number;
    }) => void
  ): Unsubscribe {
    try {
      const globalRef = doc(db, 'system_updates', 'latest_attendance_sync');
      return onSnapshot(
        globalRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data && data.timestamp) {
              callback(data as any);
            }
          }
        },
        (error) => {
          console.warn('[CloudSync] listenToGlobalAttendanceUpdates error:', error);
        }
      );
    } catch (e) {
      console.warn('[CloudSync] listenToGlobalAttendanceUpdates setup failed:', e);
      return () => {};
    }
  },

  /**
   * Broadcasts the latest Moodle course assignments for a batch into Firestore
   */
  async syncMoodleDeadlines(batch: string, assignments: any[]): Promise<void> {
    if (!assignments || assignments.length === 0) return;
    try {
      const moodleDocRef = doc(db, 'moodle_deadlines', `batch_${batch.toUpperCase()}`);
      await setDoc(moodleDocRef, {
        batch: batch.toUpperCase(),
        assignments,
        updatedAt: new Date().toISOString(),
        timestamp: Date.now(),
      }, { merge: true });
    } catch (e) {
      console.warn('[CloudSync] syncMoodleDeadlines warning:', e);
    }
  },

  /**
   * Fetches the latest broadcast Moodle deadlines for a batch from Firestore
   */
  async fetchMoodleDeadlines(batch: string): Promise<any[] | null> {
    try {
      const moodleDocRef = doc(db, 'moodle_deadlines', `batch_${batch.toUpperCase()}`);
      const snap = await getDoc(moodleDocRef);
      if (snap.exists()) {
        const data = snap.data();
        return (data.assignments as any[]) || null;
      }
      return null;
    } catch (e) {
      console.warn('[CloudSync] fetchMoodleDeadlines warning:', e);
      return null;
    }
  },

  /**
   * Syncs active time and feature telemetry for an individual student to Firestore
   */
  async syncStudentActivity(activity: StudentActivityRecord): Promise<void> {
    if (!activity || !activity.rollNo) return;
    try {
      const activityDocRef = doc(db, 'students_activity', activity.rollNo.toUpperCase());
      await setDoc(activityDocRef, {
        ...activity,
        syncedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('[CloudSync] syncStudentActivity warning:', e);
    }
  },

  /**
   * Fetches telemetry & time-spent records for all students for the Admin Dashboard
   */
  async fetchAllStudentActivities(): Promise<StudentActivityRecord[]> {
    try {
      const activityCol = collection(db, 'students_activity');
      const snap = await getDocs(activityCol);
      const list: StudentActivityRecord[] = [];
      snap.forEach((d) => {
        const rec = d.data() as StudentActivityRecord;
        if (rec && rec.rollNo) {
          list.push(rec);
        }
      });
      return list;
    } catch (e) {
      console.warn('[CloudSync] fetchAllStudentActivities warning:', e);
      return [];
    }
  },
};


