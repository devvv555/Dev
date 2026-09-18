const test = require('node:test');
const assert = require('node:assert');

// Port the math functions directly for testing in Node.js
function calculateAttendanceMetrics(attended, total, hasMedicalClaim = false, standardTarget = 75, medicalTarget = 65) {
  const percentage = total === 0 ? 100 : Number(((attended / total) * 100).toFixed(2));
  const effectiveTarget = hasMedicalClaim ? medicalTarget : standardTarget;

  const calcSafeBunks = (targetPct) => {
    if (total === 0) return 0;
    const numerator = 100 * attended - targetPct * total;
    if (numerator < 0) return 0;
    return Math.floor(numerator / targetPct);
  };

  const calcRecoveryNeeded = (targetPct) => {
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

  let status;
  if (percentage >= standardTarget) {
    status = 'SAFE_STANDARD';
  } else if (percentage >= medicalTarget) {
    status = hasMedicalClaim ? 'SAFE_MEDICAL' : 'SHORTAGE';
  } else {
    status = 'SHORTAGE';
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
    recoveryNeededAt75
  };
}

test('Standard 75% boundary conditions', () => {
  // 15 attended out of 20 = 75%
  const res = calculateAttendanceMetrics(15, 20, false);
  assert.strictEqual(res.percentage, 75);
  assert.strictEqual(res.status, 'SAFE_STANDARD');
  assert.strictEqual(res.safeBunks, 0);
  assert.strictEqual(res.recoveryNeeded, 0);
});

test('Safe bunks calculation with high attendance', () => {
  // 30 attended out of 32 = 93.75%
  // (3000 - 75 * 32) / 75 = (3000 - 2400) / 75 = 600 / 75 = 8 safe bunks
  const res = calculateAttendanceMetrics(30, 32, false);
  assert.strictEqual(res.percentage, 93.75);
  assert.strictEqual(res.safeBunks, 8);
  // If we add 8 bunks: 30 / 40 = 75%
  const postBunkRes = calculateAttendanceMetrics(30, 40, false);
  assert.strictEqual(postBunkRes.percentage, 75);
});

test('Recovery calculation when below 75%', () => {
  // 20 attended out of 30 = 66.67%
  // (75 * 30 - 2000) / 25 = 250 / 25 = 10 classes
  const res = calculateAttendanceMetrics(20, 30, false);
  assert.strictEqual(res.status, 'SHORTAGE');
  assert.strictEqual(res.recoveryNeeded, 10);
  // If we attend 10 more classes: 30 / 40 = 75%
  const postRecoveryRes = calculateAttendanceMetrics(30, 40, false);
  assert.strictEqual(postRecoveryRes.percentage, 75);
});

test('Medical Claim Concession (65% Target)', () => {
  // 28 attended out of 41 = 68.29%
  // Without medical: SHORTAGE (needs 11 classes for 75%)
  const withoutMed = calculateAttendanceMetrics(28, 41, false);
  assert.strictEqual(withoutMed.status, 'SHORTAGE');
  assert.strictEqual(withoutMed.recoveryNeeded, 11);

  // With medical claim: SAFE_MEDICAL (effective target 65%)
  const withMed = calculateAttendanceMetrics(28, 41, true);
  assert.strictEqual(withMed.effectiveTarget, 65);
  assert.strictEqual(withMed.status, 'SAFE_MEDICAL');
  // Safe bunks at 65%: (2800 - 65 * 41) / 65 = (2800 - 2665) / 65 = 135 / 65 = 2
  assert.strictEqual(withMed.safeBunks, 2);
  assert.strictEqual(withMed.recoveryNeeded, 0);

  // Check that missing 2 classes still keeps >= 65%:
  // 28 / 43 = 65.12%
  const afterBunks = calculateAttendanceMetrics(28, 43, true);
  assert.ok(afterBunks.percentage >= 65);
});

test('Critical Shortage below 65% with Medical Claim', () => {
  // 30 attended out of 50 = 60%
  const withMed = calculateAttendanceMetrics(30, 50, true);
  assert.strictEqual(withMed.status, 'SHORTAGE');
  // Needs 8 classes to reach 65%
  assert.strictEqual(withMed.recoveryNeeded, 8);
  // If we attend 8 classes: 38 / 58 = 65.52% >= 65%
  const afterRecovery = calculateAttendanceMetrics(38, 58, true);
  assert.ok(afterRecovery.percentage >= 65);
});

test('Edge cases (0 classes conducted)', () => {
  const zero = calculateAttendanceMetrics(0, 0, false);
  assert.strictEqual(zero.percentage, 100);
  assert.strictEqual(zero.safeBunks, 0);
  assert.strictEqual(zero.recoveryNeeded, 0);
});

// Period Attendance Single-Marking Engine
function simulatePeriodAttendance(existingRecords, subjects, slot, date, newStatus) {
  const periodKey = `${date}_${slot.id}`;
  const existing = existingRecords[periodKey];

  if (existing && existing.status === newStatus) {
    return {
      success: false,
      alreadyMarked: true,
      subjects,
      records: existingRecords,
    };
  }

  let deltaAttended = 0;
  let deltaTotal = 0;

  if (!existing) {
    if (newStatus === 'attended') {
      deltaAttended = 1;
      deltaTotal = 1;
    } else if (newStatus === 'bunked') {
      deltaAttended = 0;
      deltaTotal = 1;
    } else if (newStatus === 'cancelled') {
      deltaAttended = 0;
      deltaTotal = 0;
    }
  } else {
    if (existing.status === 'attended') {
      deltaAttended -= 1;
      deltaTotal -= 1;
    } else if (existing.status === 'bunked') {
      deltaTotal -= 1;
    }

    if (newStatus === 'attended') {
      deltaAttended += 1;
      deltaTotal += 1;
    } else if (newStatus === 'bunked') {
      deltaTotal += 1;
    }
  }

  const updatedSubjects = subjects.map((s) => {
    if (s.id === slot.subjectId) {
      return {
        ...s,
        attended: Math.max(0, s.attended + deltaAttended),
        total: Math.max(0, s.total + deltaTotal),
      };
    }
    return s;
  });

  const updatedRecords = {
    ...existingRecords,
    [periodKey]: {
      periodKey,
      date,
      slotId: slot.id,
      subjectId: slot.subjectId,
      status: newStatus,
    },
  };

  return {
    success: true,
    alreadyMarked: false,
    subjects: updatedSubjects,
    records: updatedRecords,
  };
}

test('Prevents double-marking attendance for the same period', () => {
  const initialSubjects = [{ id: 'sub_edm', name: 'EDM', attended: 20, total: 24 }];
  const slot = { id: 'slot_thu_1', subjectId: 'sub_edm', startTime: '08:30', endTime: '10:20' };
  const date = '2026-09-18';
  let records = {};

  // First tap: Mark Attended
  const firstTap = simulatePeriodAttendance(records, initialSubjects, slot, date, 'attended');
  assert.strictEqual(firstTap.success, true);
  assert.strictEqual(firstTap.alreadyMarked, false);
  assert.strictEqual(firstTap.subjects[0].attended, 21);
  assert.strictEqual(firstTap.subjects[0].total, 25);
  records = firstTap.records;

  // Second tap: User tries to tap "I Attended" again on the same period
  const secondTap = simulatePeriodAttendance(records, firstTap.subjects, slot, date, 'attended');
  assert.strictEqual(secondTap.success, false);
  assert.strictEqual(secondTap.alreadyMarked, true);
  // Numbers MUST remain strictly unchanged (21/25)
  assert.strictEqual(secondTap.subjects[0].attended, 21);
  assert.strictEqual(secondTap.subjects[0].total, 25);
});

test('Accurately adjusts attendance when correcting period status', () => {
  const initialSubjects = [{ id: 'sub_la', name: 'LA', attended: 15, total: 18 }];
  const slot = { id: 'slot_thu_2', subjectId: 'sub_la', startTime: '10:40', endTime: '12:30' };
  const date = '2026-09-18';

  // 1. Marked as Attended initially -> 16 / 19
  const step1 = simulatePeriodAttendance({}, initialSubjects, slot, date, 'attended');
  assert.strictEqual(step1.subjects[0].attended, 16);
  assert.strictEqual(step1.subjects[0].total, 19);

  // 2. Student corrects to Bunked -> attended reverts from 16 to 15, total stays 19 (1 bunk added)
  const step2 = simulatePeriodAttendance(step1.records, step1.subjects, slot, date, 'bunked');
  assert.strictEqual(step2.success, true);
  assert.strictEqual(step2.subjects[0].attended, 15);
  assert.strictEqual(step2.subjects[0].total, 19);

  // 3. Class was actually Cancelled -> total reverts from 19 to 18 (cancelled period removed)
  const step3 = simulatePeriodAttendance(step2.records, step2.subjects, slot, date, 'cancelled');
  assert.strictEqual(step3.success, true);
  assert.strictEqual(step3.subjects[0].attended, 15);
  assert.strictEqual(step3.subjects[0].total, 18);
});
