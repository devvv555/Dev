import { Linking, Platform } from 'react-native';
import { Subject, MedicalClaimRecord, AttendanceDisputeReport, AttendanceDisputeItem } from '../types';
import { getMasterStudent } from '../data/psgimMasterStudents';
import { PsgimService } from '../services/psgimService';

export interface AttendanceOverlapItem {
  subjectCode: string;
  subjectName: string;
  appAttended: number;
  appTotal: number;
  collegeAttended: number;
  collegeTotal: number;
  overlapHours: number; // positive = student marked present, missing on college portal; negative = college recorded extra
  hasDiscrepancy: boolean;
}

export interface AttendanceOverlapResult {
  hasOverlap: boolean;
  totalOverlapHours: number;
  items: AttendanceOverlapItem[];
  summaryDetail: string;
}

export const DisputeReportService = {
  /**
   * Evaluates if a student's attendance overlaps / differs from the college's recording.
   * Calculates the exact overlapping hours across each course.
   */
  checkAttendanceOverlap(subjects: Subject[]): AttendanceOverlapResult {
    let totalOverlapHours = 0;
    const items: AttendanceOverlapItem[] = [];

    subjects.forEach((sub) => {
      const delta = sub.attended - sub.officialAttended;
      const totalDelta = sub.total !== sub.officialTotal;
      const hasDiscrepancy = delta !== 0 || totalDelta;

      if (hasDiscrepancy) {
        const absDelta = Math.abs(delta);
        totalOverlapHours += absDelta;
        items.push({
          subjectCode: sub.code,
          subjectName: sub.name,
          appAttended: sub.attended,
          appTotal: sub.total,
          collegeAttended: sub.officialAttended,
          collegeTotal: sub.officialTotal,
          overlapHours: delta,
          hasDiscrepancy: true,
        });
      }
    });

    const summaryParts = items.map((i) => {
      const sign = i.overlapHours > 0 ? `+${i.overlapHours}` : `${i.overlapHours}`;
      return `${i.subjectCode} (${sign} hrs)`;
    });

    return {
      hasOverlap: items.length > 0 && totalOverlapHours > 0,
      totalOverlapHours,
      items,
      summaryDetail: summaryParts.join(', ') || 'No overlapping hours',
    };
  },

  /**
   * Formats a detailed email report containing the exact hours student's attendance overlaps with college's recording.
   */
  generateOverlapEmail(
    studentRollNo: string,
    subjects: Subject[],
    portalFromDate: string = '17-08-2026',
    portalToDate: string = '10-10-2026'
  ): {
    studentEmail: string;
    studentName: string;
    emailSubject: string;
    emailBody: string;
    mailtoUrl: string;
    overlapResult: AttendanceOverlapResult;
  } {
    const cleanRoll = studentRollNo.toUpperCase().trim();
    const student = getMasterStudent(cleanRoll);
    const profile = PsgimService.getStudentProfile(cleanRoll);
    const studentName = student ? student.name : cleanRoll;
    const studentEmail = profile?.email || `${cleanRoll.toLowerCase()}@psgim.ac.in`;
    const overlapResult = this.checkAttendanceOverlap(subjects);

    let emailBody = `ATTENDANCE OVERLAP & DISCREPANCY DOSSIER\n\n`;
    emailBody += `Student: ${studentName} (${cleanRoll})\n`;
    emailBody += `Class: I MBA (2026-28) - ${profile?.section || 'Batch A'}\n`;
    emailBody += `College Portal Period: ${portalFromDate} to ${portalToDate}\n`;
    emailBody += `Generated: ${new Date().toLocaleDateString('en-IN')}\n\n`;
    emailBody += `OVERLAPPING HOURS BREAKDOWN:\n`;
    emailBody += `--------------------------------------------------\n`;

    if (overlapResult.items.length === 0) {
      emailBody += `All attendance records match the college portal. No overlapping hours detected.\n`;
    } else {
      overlapResult.items.forEach((item) => {
        emailBody += `Course: ${item.subjectCode} - ${item.subjectName}\n`;
        emailBody += `  Your Logged Hours:    ${item.appAttended} / ${item.appTotal} hrs\n`;
        emailBody += `  College Portal Hours: ${item.collegeAttended} / ${item.collegeTotal} hrs\n`;
        if (item.overlapHours > 0) {
          emailBody += `  Overlap Discrepancy:  +${item.overlapHours} hrs marked present in class but missing on college portal\n`;
        } else if (item.overlapHours < 0) {
          emailBody += `  College Surplus:      ${Math.abs(item.overlapHours)} hrs extra credited on college portal\n`;
        }
        emailBody += `\n`;
      });
      emailBody += `--------------------------------------------------\n`;
      emailBody += `Total Overlapping Discrepancy: ${overlapResult.totalOverlapHours} hours\n\n`;
      emailBody += `ACTION REQUIRED:\n`;
      emailBody += `Please verify these overlapping hours against your class schedule and contact your course faculty or faculty advisor to rectify the official portal record.\n\n`;
      emailBody += `PSGIM Attendance Monitor - Automated Overlap Verification`;
    }

    const emailSubject = `Attendance Overlap Report - ${cleanRoll} (${studentName}) [${overlapResult.totalOverlapHours} Hours Overlap]`;
    const mailtoUrl = `mailto:${encodeURIComponent(studentEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    return {
      studentEmail,
      studentName,
      emailSubject,
      emailBody,
      mailtoUrl,
      overlapResult,
    };
  },

  /**
   * Opens the device default email client to send the overlap report directly to the student
   */
  async sendOverlapEmail(
    studentRollNo: string,
    subjects: Subject[],
    portalFromDate: string = '17-08-2026',
    portalToDate: string = '10-10-2026'
  ): Promise<boolean> {
    const { mailtoUrl } = this.generateOverlapEmail(studentRollNo, subjects, portalFromDate, portalToDate);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(mailtoUrl, '_blank');
        return true;
      }
      await Linking.openURL(mailtoUrl);
      return true;
    } catch (e) {
      console.warn('Could not open email client:', e);
      return false;
    }
  },

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
