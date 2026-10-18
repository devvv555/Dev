import { Subject, MedicalClaimRecord, AttendanceDisputeReport, AttendanceDisputeItem } from '../types';
import { getMasterStudent } from '../data/psgimMasterStudents';
import { PsgimService } from '../services/psgimService';

export const DisputeReportService = {
  /**
   * Generates a structured Attendance Dispute & Proof Report comparing
   * official Studzone portal records against hourly app-logged records.
   */
  generateReport(
    studentRollNo: string,
    subjects: Subject[],
    medicalClaims: MedicalClaimRecord[] = [],
    portalFromDate: string = '17-08-2026',
    portalToDate: string = '10-10-2026'
  ): AttendanceDisputeReport {
    const cleanRoll = studentRollNo.toUpperCase().trim();
    const student = getMasterStudent(cleanRoll);
    const studentName = student ? student.name : cleanRoll;
    const profile = PsgimService.getStudentProfile(cleanRoll);
    const section = profile?.section || 'Section B';

    let totalDiscrepancyHours = 0;
    const items: AttendanceDisputeItem[] = subjects.map((sub) => {
      const portalTotal = sub.officialTotal;
      const portalAttended = sub.officialAttended;
      const portalPercentage = portalTotal > 0 ? (portalAttended / portalTotal) * 100 : 100;

      const appTotal = sub.total;
      const appAttended = sub.attended;
      const appPercentage = appTotal > 0 ? (appAttended / appTotal) * 100 : 100;

      // Delta: how many attended hours in app exceed or differ from portal
      const deltaAttended = appAttended - portalAttended;
      const hasDiscrepancy = deltaAttended !== 0 || appTotal !== portalTotal;

      if (deltaAttended > 0) {
        totalDiscrepancyHours += deltaAttended;
      }

      return {
        subjectCode: sub.code,
        subjectName: sub.name,
        portalTotal,
        portalAttended,
        portalPercentage,
        appTotal,
        appAttended,
        appPercentage,
        deltaAttended,
        hasDiscrepancy,
      };
    });

    const activeMedCount = medicalClaims.filter((c) => c.status === 'APPROVED' || c.status === 'SUBMITTED').length;

    // Build plain text summary for copying/emailing to Advisor/HOD
    let summaryText = `*PSG INSTITUTE OF MANAGEMENT — ATTENDANCE DISCREPANCY DOSSIER*\n`;
    summaryText += `👤 Student: ${studentName} (${cleanRoll})\n`;
    summaryText += `🏫 Class: I MBA (2026–28) • ${section}\n`;
    summaryText += `📅 Official Portal Period: ${portalFromDate} to ${portalToDate}\n`;
    summaryText += `🕒 Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n`;

    summaryText += `*SUBJECT-WISE COMPARISON:*\n`;
    items.forEach((item) => {
      summaryText += `• *${item.subjectCode}* (${item.subjectName}):\n`;
      summaryText += `   Portal Baseline: ${item.portalAttended}/${item.portalTotal} hrs (${item.portalPercentage.toFixed(1)}%)\n`;
      summaryText += `   Hourly Logged:   ${item.appAttended}/${item.appTotal} hrs (${item.appPercentage.toFixed(1)}%)\n`;
      if (item.deltaAttended > 0) {
        summaryText += `   ⚠️ Discrepancy: +${item.deltaAttended} hrs marked present in class but missing on portal.\n`;
      } else if (item.deltaAttended < 0) {
        summaryText += `   ℹ️ Portal Surplus: Portal shows ${Math.abs(item.deltaAttended)} more hrs.\n`;
      } else {
        summaryText += `   ✓ Records Match (100% Reconciled)\n`;
      }
    });

    if (activeMedCount > 0) {
      summaryText += `\n*ATTACHED MEDICAL / OD CLAIMS (${activeMedCount}):*\n`;
      medicalClaims.forEach((med, i) => {
        summaryText += `${i + 1}. ${med.reason} (${med.fromDate} to ${med.toDate}) — Status: ${med.status}\n`;
      });
    }

    summaryText += `\n*REQUEST:* Respected Faculty Advisor / HOD, kindly review the missing class period logs indicated above against the department attendance register.\n`;
    summaryText += `— Submitted via PSGIM One`;

    return {
      generatedAt: new Date().toISOString(),
      rollNo: cleanRoll,
      studentName,
      section,
      portalFromDate,
      portalToDate,
      items,
      totalDiscrepancyHours,
      medicalLeavesCount: activeMedCount,
      summaryText,
    };
  },
};
