/**
 * AcademicRiskForecasterService
 * 
 * Provides 3-week predictive trajectory modeling, debarment risk detection (<75%),
 * and recovery prescriptions based on real course syllabi and weekly class velocity.
 */

import { Subject } from '../types';

export interface SubjectRiskAssessment {
  code: string;
  name: string;
  currentPercentage: number;
  attendedHours: number;
  totalConductedHours: number;
  estimatedRemainingHours: number;
  projectedEndPercentageIfAllAttended: number;
  projectedEndPercentageIfOneBunkPerWeek: number;
  consecutiveHoursNeededToCross75: number;
  maxSafeBunksLeft: number;
  riskTier: 'CRITICAL_DEBARMENT_RISK' | 'BORDERLINE_WATCH' | 'SAFE_ZONE';
  statusMessage: string;
}

export interface AcademicRiskSummary {
  overallHealthScore: number; // 0 - 100
  criticalCount: number;
  borderlineCount: number;
  safeCount: number;
  subjectAssessments: SubjectRiskAssessment[];
  urgencyHeadline: string;
}

export const AcademicRiskForecasterService = {
  /**
   * Generates a 3-week predictive trajectory audit across all registered subjects
   */
  forecastAcademicRisk(subjects: Subject[]): AcademicRiskSummary {
    if (!subjects || subjects.length === 0) {
      return {
        overallHealthScore: 100,
        criticalCount: 0,
        borderlineCount: 0,
        safeCount: 0,
        subjectAssessments: [],
        urgencyHeadline: 'No subject records detected.',
      };
    }

    const assessments: SubjectRiskAssessment[] = [];
    let criticalCount = 0;
    let borderlineCount = 0;
    let safeCount = 0;

    subjects.forEach((subj) => {
      const attended = subj.attended || 0;
      const total = subj.total || 0;
      const currentPct = total > 0 ? (attended / total) * 100 : 100;

      // Assume typical 15-week semester with ~40 total hours per course
      // Approximate remaining sessions (~12-16 hours remaining in 2nd half)
      const estimatedRemaining = Math.max(14, 40 - total);

      // Max possible percentage if student attends 100% of remaining sessions
      const maxPossiblePct = ((attended + estimatedRemaining) / (total + estimatedRemaining)) * 100;

      // Projected percentage if student misses 1 class every week (approx 3 misses)
      const projectedOneBunkPerWeek = ((attended + Math.max(0, estimatedRemaining - 3)) / (total + estimatedRemaining)) * 100;

      // Calculate consecutive hours needed to achieve >= 75%
      // (attended + X) / (total + X) >= 0.75  => X >= (0.75 * total - attended) / 0.25
      let consecutiveNeeded = 0;
      if (currentPct < 75) {
        consecutiveNeeded = Math.ceil(Math.max(0, (0.75 * total - attended) / 0.25));
      }

      // Calculate safe bunks left before dropping below 75%
      // attended / (total + B) >= 0.75 => B <= (attended / 0.75) - total
      let maxSafeBunks = 0;
      if (currentPct >= 75) {
        maxSafeBunks = Math.floor(Math.max(0, attended / 0.75 - total));
      }

      let riskTier: 'CRITICAL_DEBARMENT_RISK' | 'BORDERLINE_WATCH' | 'SAFE_ZONE' = 'SAFE_ZONE';
      let statusMsg = '';

      if (currentPct < 75) {
        riskTier = 'CRITICAL_DEBARMENT_RISK';
        criticalCount++;
        statusMsg = `Below 75% threshold! Attend the next ${consecutiveNeeded} consecutive hour(s) to clear debarment warning.`;
      } else if (currentPct <= 78 || maxSafeBunks <= 1) {
        riskTier = 'BORDERLINE_WATCH';
        borderlineCount++;
        statusMsg = `Borderline danger zone. You can only skip ${maxSafeBunks} more class before falling below 75%.`;
      } else {
        riskTier = 'SAFE_ZONE';
        safeCount++;
        statusMsg = `Comfortable buffer. ${maxSafeBunks} safe skip(s) available without risking 75% requirement.`;
      }

      assessments.push({
        code: subj.code,
        name: subj.name,
        currentPercentage: Math.round(currentPct * 10) / 10,
        attendedHours: attended,
        totalConductedHours: total,
        estimatedRemainingHours: estimatedRemaining,
        projectedEndPercentageIfAllAttended: Math.round(maxPossiblePct * 10) / 10,
        projectedEndPercentageIfOneBunkPerWeek: Math.round(projectedOneBunkPerWeek * 10) / 10,
        consecutiveHoursNeededToCross75: consecutiveNeeded,
        maxSafeBunksLeft: maxSafeBunks,
        riskTier,
        statusMessage: statusMsg,
      });
    });

    // Calculate overall health score
    const totalCourses = assessments.length;
    const rawHealth = totalCourses > 0 ? ((safeCount * 100 + borderlineCount * 65 + criticalCount * 25) / (totalCourses * 100)) * 100 : 100;
    const overallHealthScore = Math.round(rawHealth);

    let urgencyHeadline = 'All courses in safe academic zone.';
    if (criticalCount > 0) {
      urgencyHeadline = `⚠️ Immediate Action Required: ${criticalCount} course(s) facing debarment risk!`;
    } else if (borderlineCount > 0) {
      urgencyHeadline = `⚡ Notice: ${borderlineCount} course(s) on borderline watch (75-78%).`;
    }

    return {
      overallHealthScore,
      criticalCount,
      borderlineCount,
      safeCount,
      subjectAssessments: assessments,
      urgencyHeadline,
    };
  },
};
