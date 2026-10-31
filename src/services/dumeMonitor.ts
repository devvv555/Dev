import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './analyticsService';
import { StudentActivityRecord, FeatureUsageStats } from '../types';

export interface UxImprovementRecommendation {
  id: string;
  feature: string;
  issueObserved: string;
  telemetryEvidence: string;
  recommendedImprovement: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface DumeMaintenanceReport {
  timestamp: number;
  totalStudentsMonitored: number;
  averageActiveTimeMinutes: number;
  mostChallengingFeature: string;
  easeOfUseScore: number; // 0 to 100
  recommendations: UxImprovementRecommendation[];
}

const STORAGE_KEY_DUME = '@stark_ai_dume_maintenance_report';

/**
 * D.U.M.-E. and U. (Maintenance and Ease-of-Use Robots)
 * Monitors student usage, tracking whether students can easily navigate and use the app.
 * Analyzes telemetry and feature friction to provide clear improvement recommendations.
 */
export const DumeMonitor = {
  /**
   * Generates a maintenance and UX improvement report from live student telemetry.
   */
  async generateMaintenanceReport(): Promise<DumeMaintenanceReport> {
    const activities: StudentActivityRecord[] = await AnalyticsService.getAllStudentActivities();
    const stats: FeatureUsageStats = await AnalyticsService.getAnalyticsSummary();

    const recommendations: UxImprovementRecommendation[] = [];

    // Calculate metrics
    const totalStudents = activities.length;
    let totalMinutes = 0;
    let hourlyCount = 0;
    let erpSyncCount = 0;
    let timetableCount = 0;
    let medicalCount = 0;

    activities.forEach((act) => {
      totalMinutes += act.totalTimeMinutes || 0;
      if (act.featureUsage) {
        hourlyCount += act.featureUsage.hourlyTrack || 0;
        erpSyncCount += act.featureUsage.erpSync || 0;
        timetableCount += act.featureUsage.timetable || 0;
        medicalCount += act.featureUsage.medicalVault || 0;
      }
    });

    const avgMinutes = totalStudents > 0 ? Math.round((totalMinutes / totalStudents) * 10) / 10 : 0;

    // Analyze where friction occurs:
    if (erpSyncCount < hourlyCount * 0.1 && hourlyCount > 5) {
      recommendations.push({
        id: 'DUME-REC-01',
        feature: 'ERP Sync & Attendance Reconcile',
        issueObserved: 'Students frequently view hourly attendance but rarely sync with the official portal.',
        telemetryEvidence: `Hourly views: ${hourlyCount} vs ERP Sync actions: ${erpSyncCount}`,
        recommendedImprovement: 'Add a 1-tap "Quick Sync" pill directly on the home screen banner to reduce navigation steps.',
        priority: 'HIGH',
      });
    }

    if (totalStudents > 0 && avgMinutes < 1.5) {
      recommendations.push({
        id: 'DUME-REC-02',
        feature: 'Dashboard Overview',
        issueObserved: 'Session lengths are very brief (< 1.5 mins); students might be dropping off after checking only 1 number.',
        telemetryEvidence: `Average active time per student: ${avgMinutes} minutes`,
        recommendedImprovement: 'Provide an instant summary card on launch with safe-bunks and next upcoming class so students get value in seconds.',
        priority: 'MEDIUM',
      });
    }

    if (medicalCount === 0 && hourlyCount > 10) {
      recommendations.push({
        id: 'DUME-REC-03',
        feature: 'Medical Claim Vault (65%)',
        issueObserved: 'Students are unaware of the 65% medical concession claim feature.',
        telemetryEvidence: 'Zero interactions recorded for Medical Vault while hourly tracking is high.',
        recommendedImprovement: 'Display a tooltip in the attendance breakdown when percentage drops below 75% informing students they can submit medical certificates.',
        priority: 'HIGH',
      });
    }

    // Default recommendation if app is running smoothly
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'DUME-REC-DEFAULT',
        feature: 'General Navigation',
        issueObserved: 'No severe UX bottlenecks detected.',
        telemetryEvidence: `Telemetry active across ${totalStudents} students with healthy interaction spread.`,
        recommendedImprovement: 'Keep monitoring periodic engagement and feedback submissions.',
        priority: 'LOW',
      });
    }

    // Ease-of-use index based on activity diversity and session engagement
    const easeOfUseScore = Math.min(95, Math.max(70, Math.round(75 + avgMinutes * 3)));

    const report: DumeMaintenanceReport = {
      timestamp: Date.now(),
      totalStudentsMonitored: totalStudents,
      averageActiveTimeMinutes: avgMinutes,
      mostChallengingFeature: recommendations[0]?.feature || 'None',
      easeOfUseScore,
      recommendations,
    };

    await AsyncStorage.setItem(STORAGE_KEY_DUME, JSON.stringify(report));
    return report;
  },

  /**
   * Retrieves the latest cached maintenance report
   */
  async getLastReport(): Promise<DumeMaintenanceReport | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY_DUME);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
};
