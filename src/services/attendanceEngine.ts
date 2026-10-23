import { AttendanceMetrics, AttendanceStatusCategory, Subject, TimetableSlot } from '../types';

/**
 * Calculates academic hours duration for a timetable slot based on startTime and endTime.
 * E.g.
 * - 08:30 to 10:20 (110 mins) -> 2 hours
 * - 10:40 to 12:30 (110 mins) -> 2 hours
 * - 13:40 to 15:30 (110 mins) -> 2 hours
 * - 13:40 to 14:35 (55 mins)  -> 1 hour
 * - 15:40 to 16:35 (55 mins)  -> 1 hour
 * - 09:00 to 10:00 (60 mins)  -> 1 hour
 * - 14:35 to 16:35 (120 mins) -> 2 hours
 */
export function getSlotHours(slot?: { startTime?: string; endTime?: string } | null): number {
  if (!slot?.startTime || !slot?.endTime) return 1;
  const [sh, sm] = slot.startTime.split(':').map(Number);
  const [eh, em] = slot.endTime.split(':').map(Number);
  const startMins = (sh || 0) * 60 + (sm || 0);
  const endMins = (eh || 0) * 60 + (em || 0);
  const diffMinutes = endMins - startMins;
  if (diffMinutes <= 0) return 1;
  return Math.max(1, Math.round(diffMinutes / 60));
}

/**
 * Calculates attendance metrics with dynamic medical claim concession.
 * Standard threshold is typically 75%, medical concession is 65%.
 * Attendance is calculated based on hours attended vs total hours held.
 */
export function calculateAttendanceMetrics(
  attended: number, // hours attended
  total: number,    // total hours held
  hasMedicalClaim: boolean = false,
  standardTarget: number = 75,
  medicalTarget: number = 65
): AttendanceMetrics {
  const percentage = total === 0 ? 100 : Number(((attended / total) * 100).toFixed(2));
  const effectiveTarget = hasMedicalClaim ? medicalTarget : standardTarget;

  // Safe bunk hours calculation:
  // Math.floor((100 * A - Target * N) / Target)
  const calcSafeBunks = (targetPct: number): number => {
    if (total === 0) return 0;
    const numerator = 100 * attended - targetPct * total;
    if (numerator < 0) return 0;
    return Math.floor(numerator / targetPct);
  };

  // Recovery hours calculation:
  // Math.ceil((Target * N - 100 * A) / (100 - Target))
  const calcRecoveryNeeded = (targetPct: number): number => {
    if (total === 0 || targetPct >= 100) return 0;
    const numerator = targetPct * total - 100 * attended;
    if (numerator <= 0) return 0;
    return Math.ceil(numerator / (100 - targetPct));
  };

  const safeBunksAt75 = calcSafeBunks(standardTarget);
  const safeBunksAt65 = calcSafeBunks(medicalTarget);
  const recoveryNeededAt75 = calcRecoveryNeeded(standardTarget);
  const recoveryNeededAt65 = calcRecoveryNeeded(medicalTarget);

  const safeBunks = hasMedicalClaim ? safeBunksAt65 : safeBunksAt75;
  const recoveryNeeded = hasMedicalClaim ? recoveryNeededAt65 : recoveryNeededAt75;

  let status: AttendanceStatusCategory;
  let summaryMessage = '';

  if (percentage >= standardTarget) {
    status = 'SAFE_STANDARD';
    summaryMessage = safeBunksAt75 > 0 
      ? `On track! You can safely miss ${safeBunksAt75} more ${safeBunksAt75 === 1 ? 'hour' : 'hours'}.`
      : `You are right at the ${standardTarget}% boundary. Do not miss any hours.`;
  } else {
    status = 'SHORTAGE';
    summaryMessage = `⚠️ Attendance shortage (${percentage}%). Need ${recoveryNeededAt75} consecutive ${recoveryNeededAt75 === 1 ? 'hour' : 'hours'} to hit 75%.`;
  }


  return {
    percentage,
    effectiveTarget,
    isMedicalClaimActive: hasMedicalClaim,
    status,
    safeBunks,
    recoveryNeeded,
    safeBunksAt65,
    safeBunksAt75,
    recoveryNeededAt65,
    recoveryNeededAt75,
    summaryMessage,
  };
}

/**
 * Calculates overall attendance across all subjects
 */
export function calculateOverallMetrics(subjects: Subject[]): AttendanceMetrics & { totalAttended: number; totalHeld: number } {
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const totalHeld = subjects.reduce((sum, s) => sum + s.total, 0);
  const hasAnyMedical = subjects.some(s => s.hasMedicalClaim);

  const metrics = calculateAttendanceMetrics(totalAttended, totalHeld, hasAnyMedical);
  return {
    ...metrics,
    totalAttended,
    totalHeld
  };
}

const DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Finds the very next scheduled slot for a given subject in the timetable starting from fromDate.
 * Returns the matching TimetableSlot and the computed Date of that class.
 */
export function findNextSlotForSubject(
  subjectId: string,
  timetable: TimetableSlot[],
  fromDate: Date = new Date()
): { slot: TimetableSlot; classDate: Date } | null {
  if (!timetable || timetable.length === 0) return null;

  const currentMinutes = fromDate.getHours() * 60 + fromDate.getMinutes();

  // Search over the next 7 days (day offset 0 to 6)
  for (let offset = 0; offset < 7; offset++) {
    const candidateDate = new Date(fromDate);
    candidateDate.setDate(fromDate.getDate() + offset);
    const dayName = DAY_ORDER[candidateDate.getDay()];

    const slotsOnDay = timetable
      .filter(
        (s) =>
          s.subjectId === subjectId &&
          s.day.toLowerCase() === dayName.toLowerCase()
      )
      .sort((a, b) => {
        const [ah, am] = a.startTime.split(':').map(Number);
        const [bh, bm] = b.startTime.split(':').map(Number);
        return (ah * 60 + am) - (bh * 60 + bm);
      });

    for (const slot of slotsOnDay) {
      const [sh, sm] = slot.startTime.split(':').map(Number);
      const slotStartMinutes = sh * 60 + sm;

      // If checking today, the slot must be in the future
      if (offset === 0 && slotStartMinutes <= currentMinutes) {
        continue;
      }

      // Found the next slot!
      const classDate = new Date(candidateDate);
      classDate.setHours(sh, sm, 0, 0);
      return { slot, classDate };
    }
  }

  // Fallback to any slot for this subject
  const anySlot = timetable.find((s) => s.subjectId === subjectId);
  if (!anySlot) return null;

  const fallbackDate = new Date(fromDate);
  fallbackDate.setDate(fromDate.getDate() + 1);
  const [fsh, fsm] = anySlot.startTime.split(':').map(Number);
  fallbackDate.setHours(fsh || 9, fsm || 0, 0, 0);
  return { slot: anySlot, classDate: fallbackDate };
}


/**
 * Normalizes a date string (YYYY-MM-DD or DD-MM-YYYY) into a comparable timestamp / Date
 */
export function normalizeDateToTimestamp(dateStr?: string): number | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  // Format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [y, m, d] = clean.split('-').map(Number);
    return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
  }
  // Format: DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split('-').map(Number);
    return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
  }
  // Try standard parse
  const parsed = Date.parse(clean);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Checks if a live attendance period has completed its timer and is locked
 * until the college updates the portal attendance.
 */
export function isPeriodLocked(params: {
  slot: { startTime: string; endTime: string; day?: string };
  recordDate: string; // YYYY-MM-DD
  subject?: Subject;
  now?: Date;
}): { isLocked: boolean; reason?: string } {
  const { slot, recordDate, subject, now = new Date() } = params;
  if (!slot || !slot.endTime || !recordDate) {
    return { isLocked: false };
  }

  const todayStr = now.toISOString().split('T')[0];
  const [eh, em] = slot.endTime.split(':').map(Number);
  const endMinutes = (eh || 0) * 60 + (em || 0);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // If the record is for today, timer must have finished (currentMinutes >= endMinutes)
  // If the record is from a past date, the timer is definitely finished
  const isPastDay = recordDate < todayStr;
  const isToday = recordDate === todayStr;
  const isFutureDay = recordDate > todayStr;

  if (isFutureDay) {
    return { isLocked: false };
  }

  const timerCompleted = isPastDay || (isToday && currentMinutes >= endMinutes);
  if (!timerCompleted) {
    return { isLocked: false };
  }

  // Timer has completed. Has the college updated the portal for this or subsequent dates?
  const portalUpdateTime = normalizeDateToTimestamp(subject?.lastOfficialUpdate);
  const recordDateTime = normalizeDateToTimestamp(recordDate);

  // If college portal update date is strictly on or after this record's date, it is unlocked/reconciled
  if (portalUpdateTime && recordDateTime && portalUpdateTime >= recordDateTime) {
    return {
      isLocked: false,
      reason: 'College portal has updated attendance for this date.',
    };
  }

  return {
    isLocked: true,
    reason: 'Class timer has ended and attendance has been uploaded to the cloud. Locked until college updates portal attendance.',
  };
}
