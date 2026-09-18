import { AttendanceMetrics, AttendanceStatusCategory, Subject } from '../types';

/**
 * Calculates attendance metrics with dynamic medical claim concession.
 * Standard threshold is typically 75%, medical concession is 65%.
 */
export function calculateAttendanceMetrics(
  attended: number,
  total: number,
  hasMedicalClaim: boolean = false,
  standardTarget: number = 75,
  medicalTarget: number = 65
): AttendanceMetrics {
  const percentage = total === 0 ? 100 : Number(((attended / total) * 100).toFixed(2));
  const effectiveTarget = hasMedicalClaim ? medicalTarget : standardTarget;

  // Safe bunks calculation:
  // Math.floor((100 * A - Target * N) / Target)
  const calcSafeBunks = (targetPct: number): number => {
    if (total === 0) return 0;
    const numerator = 100 * attended - targetPct * total;
    if (numerator < 0) return 0;
    return Math.floor(numerator / targetPct);
  };

  // Recovery calculation:
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
      ? `On track! You can safely bunk ${safeBunksAt75} more ${safeBunksAt75 === 1 ? 'class' : 'classes'}.`
      : `You are right at the ${standardTarget}% boundary. Do not miss any classes.`;
  } else if (percentage >= medicalTarget) {
    if (hasMedicalClaim) {
      status = 'SAFE_MEDICAL';
      summaryMessage = `🏥 Safe under Medical Claim (65%). ${safeBunksAt65} bunks left at 65%. (${recoveryNeededAt75} classes to hit standard 75%).`;
    } else {
      status = 'SHORTAGE';
      summaryMessage = `⚠️ Short of 75% target (${percentage}%). Need ${recoveryNeededAt75} consecutive classes to recover. (Claiming medical lowers target to 65%).`;
    }
  } else {
    status = 'SHORTAGE';
    if (hasMedicalClaim) {
      summaryMessage = `🚨 Critical shortage below 65% medical threshold. Need ${recoveryNeededAt65} classes to hit 65%, ${recoveryNeededAt75} for 75%.`;
    } else {
      summaryMessage = `🚨 Attendance shortage (${percentage}%). Need ${recoveryNeededAt75} consecutive classes to hit 75%.`;
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
