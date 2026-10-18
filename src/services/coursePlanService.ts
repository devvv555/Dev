import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoursePlan, StudentCourseCaRecord } from '../types';
import { getCoursePlanForSubject } from '../data/coursePlanData';

const CA_MARKS_KEY_PREFIX = '@psgim_ca_marks_';

export const CoursePlanService = {
  /**
   * Loads saved CA marks for a student and subject
   */
  async getStudentCaRecord(
    rollNo: string,
    subjectCode: string
  ): Promise<StudentCourseCaRecord> {
    const key = `${CA_MARKS_KEY_PREFIX}${rollNo.toUpperCase()}_${subjectCode.toUpperCase()}`;
    try {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading CA record:', e);
    }

    return {
      subjectCode: subjectCode.toUpperCase(),
      marks: {},
      targetGrade: 'A+',
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Saves student CA marks for a subject
   */
  async saveStudentCaRecord(
    rollNo: string,
    record: StudentCourseCaRecord
  ): Promise<void> {
    const key = `${CA_MARKS_KEY_PREFIX}${rollNo.toUpperCase()}_${record.subjectCode.toUpperCase()}`;
    try {
      await AsyncStorage.setItem(key, JSON.stringify(record));
    } catch (e) {
      console.warn('Error saving CA record:', e);
    }
  },

  /**
   * Computes the current total CA marks scored by the student (out of 50)
   */
  calculateTotalCaScore(
    plan: CoursePlan,
    marks: Record<string, number>
  ): {
    obtainedTotal: number;
    maxTotal: number;
    completedCount: number;
    totalCount: number;
    percentage: number;
  } {
    let obtainedTotal = 0;
    let completedCount = 0;

    plan.assessments.forEach((assessment) => {
      const score = marks[assessment.id];
      if (score !== undefined && !isNaN(score)) {
        obtainedTotal += Math.min(score, assessment.marksAllotted);
        completedCount += 1;
      }
    });

    return {
      obtainedTotal,
      maxTotal: plan.caMaxMarks,
      completedCount,
      totalCount: plan.assessments.length,
      percentage: plan.caMaxMarks > 0 ? (obtainedTotal / plan.caMaxMarks) * 100 : 0,
    };
  },

  /**
   * Calculates required Final Exam (FE) score (out of 50) to reach target grade
   * Overall score = CA (out of 50) + FE (out of 50) = 100
   * Target Cutoffs:
   *   'O' : 90
   *   'A+': 80
   *   'A' : 70
   *   'B+': 60
   */
  calculateRequiredFeScore(
    currentCaScore: number,
    targetGrade: 'O' | 'A+' | 'A' | 'B+' = 'A+'
  ): {
    targetScore: number;
    requiredFeScore: number;
    isAchievable: boolean;
    statusText: string;
  } {
    const cutoffs: Record<string, number> = {
      'O': 90,
      'A+': 80,
      'A': 70,
      'B+': 60,
    };

    const target = cutoffs[targetGrade] || 80;
    const needed = target - currentCaScore;

    if (needed <= 0) {
      return {
        targetScore: target,
        requiredFeScore: 0,
        isAchievable: true,
        statusText: `🎉 Goal Secured! Your current CA score of ${currentCaScore}/50 already qualifies you for Grade ${targetGrade} with minimum passing marks on the Final Exam.`,
      };
    }

    if (needed > 50) {
      return {
        targetScore: target,
        requiredFeScore: needed,
        isAchievable: false,
        statusText: `⚠️ Not mathematically possible for Grade ${targetGrade} (requires ${needed.toFixed(1)}/50 in Final Exam). Aim for the next grade category.`,
      };
    }

    return {
      targetScore: target,
      requiredFeScore: Math.ceil(needed),
      isAchievable: true,
      statusText: `🎯 You need ${Math.ceil(needed)} / 50 (${((Math.ceil(needed) / 50) * 100).toFixed(0)}%) in the End-Semester Final Exam to secure an "${targetGrade}" grade.`,
    };
  },
};
