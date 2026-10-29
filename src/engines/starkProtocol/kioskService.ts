import { TimesheetEngine, TimesheetPunch } from './timesheetEngine';
import { GeofenceEngine } from './geofenceEngine';
import { getMasterStudent } from '../../data/psgimMasterStudents';

export interface KioskSession {
  isActive: boolean;
  kioskName: string;
  classBatch: 'A' | 'B' | 'C' | 'D';
  currentPeriodNumber: number;
  subjectCode: string;
  subjectName: string;
  startedAt: string;
  punchedStudents: Array<{
    rollNo: string;
    studentName: string;
    punchedAt: string;
    verifiedWithinCampus: boolean;
  }>;
}

let activeSession: KioskSession | null = null;

export const KioskService = {
  /**
   * Starts a classroom kiosk check-in terminal on a designated device (iPad, phone, or laptop)
   */
  startKiosk(
    kioskName: string,
    batch: 'A' | 'B' | 'C' | 'D',
    periodNumber: number,
    subjectCode: string,
    subjectName: string
  ): KioskSession {
    activeSession = {
      isActive: true,
      kioskName,
      classBatch: batch,
      currentPeriodNumber: periodNumber,
      subjectCode,
      subjectName,
      startedAt: new Date().toISOString(),
      punchedStudents: [],
    };
    return activeSession;
  },

  /**
   * Returns current active kiosk session details
   */
  getActiveSession(): KioskSession | null {
    return activeSession;
  },

  /**
   * Quick-punch for a student walking up to the classroom kiosk
   */
  async punchStudentAtKiosk(rollNo: string): Promise<{
    success: boolean;
    studentName: string;
    message: string;
  }> {
    if (!activeSession || !activeSession.isActive) {
      return { success: false, studentName: '', message: 'Kiosk terminal is not active.' };
    }

    const cleanRoll = rollNo.trim().toUpperCase();
    const student = getMasterStudent(cleanRoll);
    const studentName = student?.name || cleanRoll;

    // Check for duplicate punch in current session
    const alreadyPunched = activeSession.punchedStudents.some((p) => p.rollNo === cleanRoll);
    if (alreadyPunched) {
      return {
        success: false,
        studentName,
        message: `${studentName} already checked in for Period ${activeSession.currentPeriodNumber}.`,
      };
    }

    // Record verified punch
    const { punch, verified } = await TimesheetEngine.recordPunch(cleanRoll, 'PERIOD_CHECKIN', {
      studentName,
      periodNumber: activeSession.currentPeriodNumber,
      subjectCode: activeSession.subjectCode,
      subjectName: activeSession.subjectName,
    });

    activeSession.punchedStudents.push({
      rollNo: cleanRoll,
      studentName,
      punchedAt: punch.timestamp,
      verifiedWithinCampus: verified,
    });

    return {
      success: true,
      studentName,
      message: `Checked in: ${studentName} (Batch ${student?.batch || activeSession.classBatch})`,
    };
  },

  /**
   * Ends current kiosk session and exports attendance roster
   */
  endKiosk(): { session: KioskSession | null; totalPunched: number } {
    if (!activeSession) return { session: null, totalPunched: 0 };
    const finished = { ...activeSession, isActive: false };
    const totalPunched = finished.punchedStudents.length;
    activeSession = null;
    return { session: finished, totalPunched };
  },
};
