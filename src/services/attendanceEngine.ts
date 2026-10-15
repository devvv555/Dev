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
  } else if (percentage >= medicalTarget) {
    if (hasMedicalClaim) {
      status = 'SAFE_MEDICAL';
      summaryMessage = `🏥 Safe under Medical Claim (65%). ${safeBunksAt65} safe hours left at 65%. (${recoveryNeededAt75} hours to hit standard 75%).`;
    } else {
      status = 'SHORTAGE';
      summaryMessage = `⚠️ Short of 75% target (${percentage}%). Need ${recoveryNeededAt75} consecutive hours to recover. (Claiming medical lowers target to 65%).`;
    }
  } else {
    status = 'SHORTAGE';
    if (hasMedicalClaim) {
      summaryMessage = `🚨 Critical shortage below 65% medical threshold. Need ${recoveryNeededAt65} hours to hit 65%, ${recoveryNeededAt75} for 75%.`;
    } else {
      summaryMessage = `🚨 Attendance shortage (${percentage}%). Need ${recoveryNeededAt75} consecutive hours to hit 75%.`;
    }
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

