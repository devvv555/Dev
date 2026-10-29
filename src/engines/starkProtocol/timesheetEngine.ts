import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeofenceEngine, Coordinates } from './geofenceEngine';

export interface TimesheetPunch {
  id: string;
  rollNo: string;
  studentName?: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'PERIOD_CHECKIN';
  timestamp: string; // ISO string
  periodNumber?: number;
  subjectCode?: string;
  subjectName?: string;
  coordinates?: Coordinates;
  verifiedWithinCampus: boolean;
  photoProofUri?: string; // Optional selfie proof hash/path
  syncedToCloud: boolean;
}

export interface DayTimesheetSummary {
  date: string;
  firstPunchIn?: string;
  lastPunchOut?: string;
  totalLoggedHours: number;
  totalPeriodsAttended: number;
  punches: TimesheetPunch[];
}

const STORAGE_KEY_PUNCHES = '@stark_timesheet_punches_';

export const TimesheetEngine = {
  /**
   * Records a verified attendance punch (Jibble clock-in/period punch)
   */
  async recordPunch(
    rollNo: string,
    type: 'CLOCK_IN' | 'CLOCK_OUT' | 'PERIOD_CHECKIN',
    options?: {
      studentName?: string;
      periodNumber?: number;
      subjectCode?: string;
      subjectName?: string;
      coordinates?: Coordinates;
      photoProofUri?: string;
    }
  ): Promise<{ punch: TimesheetPunch; verified: boolean; message: string }> {
    let verifiedWithinCampus = true;

    // If coordinates are provided, check against PSGIM Geofence
    if (options?.coordinates) {
      const geoCheck = GeofenceEngine.verifyLocation(options.coordinates, 'MAIN_CAMPUS');
      verifiedWithinCampus = geoCheck.isWithinCampus;
    }

    const punch: TimesheetPunch = {
      id: `punch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      rollNo: rollNo.toUpperCase(),
      studentName: options?.studentName,
      type,
      timestamp: new Date().toISOString(),
      periodNumber: options?.periodNumber,
      subjectCode: options?.subjectCode,
      subjectName: options?.subjectName,
      coordinates: options?.coordinates,
      verifiedWithinCampus,
      photoProofUri: options?.photoProofUri,
      syncedToCloud: false,
    };

    // Store in local timesheet queue
    const existing = await this.getPunches(rollNo);
    existing.unshift(punch);
    await AsyncStorage.setItem(
      `${STORAGE_KEY_PUNCHES}${rollNo.toUpperCase()}`,
      JSON.stringify(existing.slice(0, 200)) // Keep last 200 punches
    );

    const timeStr = new Date(punch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = verifiedWithinCampus
      ? `[VERIFIED] ${type.replace('_', ' ')} recorded at ${timeStr} inside PSGIM campus.`
      : `[FLAGGED] ${type.replace('_', ' ')} recorded at ${timeStr} (Outside campus boundary).`;

    return { punch, verified: verifiedWithinCampus, message: msg };
  },

  /**
   * Retrieves all logged punches for a student
   */
  async getPunches(rollNo: string): Promise<TimesheetPunch[]> {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEY_PUNCHES}${rollNo.toUpperCase()}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Computes daily timesheet summary (Hours on campus, attended lectures)
   */
  async getDaySummary(rollNo: string, dateIso: string = new Date().toISOString().split('T')[0]): Promise<DayTimesheetSummary> {
    const all = await this.getPunches(rollNo);
    const dayPunches = all.filter((p) => p.timestamp.startsWith(dateIso));

    let firstIn: string | undefined;
    let lastOut: string | undefined;
    let attendedPeriods = 0;

    dayPunches.forEach((p) => {
      if (p.type === 'CLOCK_IN' && !firstIn) firstIn = p.timestamp;
      if (p.type === 'CLOCK_OUT') lastOut = p.timestamp;
      if (p.type === 'PERIOD_CHECKIN') attendedPeriods++;
    });

    let totalLoggedHours = 0;
    if (firstIn && lastOut) {
      const diffMs = new Date(lastOut).getTime() - new Date(firstIn).getTime();
      totalLoggedHours = Math.max(0, +(diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    return {
      date: dateIso,
      firstPunchIn: firstIn,
      lastPunchOut: lastOut,
      totalLoggedHours,
      totalPeriodsAttended: attendedPeriods,
      punches: dayPunches,
    };
  },
};
