import { doc, setDoc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { Subject, PeriodAttendanceRecord, MedicalClaimRecord, StudentFeedback } from '../types';

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
};
