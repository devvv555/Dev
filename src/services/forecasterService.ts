import { Subject, TimetableSlot } from '../types';
import { ACADEMIC_CALENDAR } from '../data/academicCalendarData';
import { getSlotHours } from './attendanceEngine';

export interface WhatIfSubjectProjection {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  currentAttended: number;
  currentTotal: number;
  currentPercentage: number;
  remainingScheduledHours: number;
  simulatedBunks: number;       // How many future/current hours to bunk
  simulatedExtraAttended: number; // How many future classes attended
  projectedAttended: number;
  projectedTotal: number;
  projectedPercentage: number;
  eligibilityStatus: 'SAFE' | 'CONDONATION' | 'DETENTION'; // >=75% Safe, 65-74.9% Condonation, <65% Detention
  maxPossiblePercentage: number; // If attends 100% of remaining
  safeBunkAllowanceRemaining: number; // Maximum future hours student can safely miss and still finish >= 75%
}

export interface WhatIfOverallProjection {
  currentOverallPercentage: number;
  projectedOverallPercentage: number;
  overallStatus: 'SAFE' | 'CONDONATION' | 'DETENTION';
  totalProjectedAttended: number;
  totalProjectedHeld: number;
  subjects: WhatIfSubjectProjection[];
}

/**
 * Calculates remaining academic class hours for each subject between fromDate and the semester end date (Nov 27, 2026).
 * Accounts for working days (Mon-Sat, skipping Sundays and official HOLIDAY entries in ACADEMIC_CALENDAR).
 */
export function calculateRemainingSubjectHours(
  timetable: TimetableSlot[],
  subjects: Subject[],
  fromDateStr: string = '2026-10-31',
  semesterEndStr: string = '2026-11-27'
): Record<string, number> {
  const remainingHoursMap: Record<string, number> = {};
  subjects.forEach((s) => {
    remainingHoursMap[s.id] = 0;
  });

  // Build a set of holiday date strings
  const holidayDates = new Set(
    ACADEMIC_CALENDAR.filter((item) => item.type === 'HOLIDAY').map((item) => item.date)
  );

  const start = new Date(fromDateStr + 'T00:00:00');
  const end = new Date(semesterEndStr + 'T23:59:59');

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const dayOfWeek = current.getDay();

    // Skip Sundays and holidays
    if (dayOfWeek !== 0 && !holidayDates.has(dateStr)) {
      const dayName = dayNames[dayOfWeek];
      const slotsForDay = timetable.filter((slot) => slot.day.toLowerCase() === dayName);

      slotsForDay.forEach((slot) => {
        const hours = getSlotHours(slot);
        if (remainingHoursMap[slot.subjectId] !== undefined) {
          remainingHoursMap[slot.subjectId] += hours;
        }
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return remainingHoursMap;
}

/**
 * Simulates future attendance and exam eligibility for each subject based on user bunk/attend sliders.
 */
export function simulateAttendanceProjections(
  subjects: Subject[],
  timetable: TimetableSlot[],
  bunkAdjustments: Record<string, number> = {}, // subjectId -> extra bunks chosen by user
  fromDateStr: string = '2026-10-31',
  semesterEndStr: string = '2026-11-27'
): WhatIfOverallProjection {
  const remainingHours = calculateRemainingSubjectHours(timetable, subjects, fromDateStr, semesterEndStr);

  let sumCurrentAttended = 0;
  let sumCurrentTotal = 0;
  let sumProjAttended = 0;
  let sumProjTotal = 0;

  const subjectProjections: WhatIfSubjectProjection[] = subjects
    .filter((s) => !s.noAttendance && s.code !== 'SPORTS')
    .map((sub) => {
      const curAttended = sub.attended || 0;
      const curTotal = sub.total || 0;
      const curPct = curTotal > 0 ? Number(((curAttended / curTotal) * 100).toFixed(2)) : 100;

      const remHours = remainingHours[sub.id] || 0;
      const bunksChosen = Math.max(0, bunkAdjustments[sub.id] || 0);

      // Remaining hours that will be attended: remHours - bunksChosen (cannot be negative)
      const futureAttended = Math.max(0, remHours - bunksChosen);
      const projAttended = curAttended + futureAttended;
      const projTotal = curTotal + remHours;

      const projPct = projTotal > 0 ? Number(((projAttended / projTotal) * 100).toFixed(2)) : 100;

      // Max possible percentage (if student attends 100% of remaining classes)
      const maxPossibleAttended = curAttended + remHours;
      const maxPossiblePct = projTotal > 0 ? Number(((maxPossibleAttended / projTotal) * 100).toFixed(2)) : 100;

      // Safe bunk allowance remaining until end of sem to keep attendance >= 75%:
      // (curAttended + remHours - bunks) / projTotal >= 0.75
      // bunks <= curAttended + remHours - 0.75 * projTotal
      const safeAllowance = Math.max(
        0,
        Math.floor(curAttended + remHours - 0.75 * projTotal)
      );

      let eligibilityStatus: 'SAFE' | 'CONDONATION' | 'DETENTION' = 'SAFE';
      if (projPct >= 75) {
        eligibilityStatus = 'SAFE';
      } else if (projPct >= 65) {
        eligibilityStatus = 'CONDONATION';
      } else {
        eligibilityStatus = 'DETENTION';
      }

      sumCurrentAttended += curAttended;
      sumCurrentTotal += curTotal;
      sumProjAttended += projAttended;
      sumProjTotal += projTotal;

      return {
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code,
        currentAttended: curAttended,
        currentTotal: curTotal,
        currentPercentage: curPct,
        remainingScheduledHours: remHours,
        simulatedBunks: bunksChosen,
        simulatedExtraAttended: futureAttended,
        projectedAttended: projAttended,
        projectedTotal: projTotal,
        projectedPercentage: projPct,
        eligibilityStatus,
        maxPossiblePercentage: maxPossiblePct,
        safeBunkAllowanceRemaining: safeAllowance,
      };
    });

  const curOverallPct = sumCurrentTotal > 0 ? Number(((sumCurrentAttended / sumCurrentTotal) * 100).toFixed(2)) : 100;
  const projOverallPct = sumProjTotal > 0 ? Number(((sumProjAttended / sumProjTotal) * 100).toFixed(2)) : 100;

  let overallStatus: 'SAFE' | 'CONDONATION' | 'DETENTION' = 'SAFE';
  if (projOverallPct >= 75) {
    overallStatus = 'SAFE';
  } else if (projOverallPct >= 65) {
    overallStatus = 'CONDONATION';
  } else {
    overallStatus = 'DETENTION';
  }

  return {
    currentOverallPercentage: curOverallPct,
    projectedOverallPercentage: projOverallPct,
    overallStatus,
    totalProjectedAttended: sumProjAttended,
    totalProjectedHeld: sumProjTotal,
    subjects: subjectProjections,
  };
}
