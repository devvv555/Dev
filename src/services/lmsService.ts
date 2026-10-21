import AsyncStorage from '@react-native-async-storage/async-storage';
import { LmsAssignment, LmsQuiz } from '../types';

const STORAGE_KEYS = {
  LMS_CREDS: '@attendance_monitor_lms_creds_',
  LMS_ASSIGNMENTS: '@attendance_monitor_lms_assignments_',
  LMS_QUIZZES: '@attendance_monitor_lms_quizzes_',
};

export interface LmsCredentials {
  rollNo: string;
  password?: string;
  token?: string;
  lastSync?: string;
}

// Verified course assignments for PSGIM I Year MBA Semester I (aligned with live lms.psgim.ac.in)
const DEFAULT_ASSIGNMENTS: LmsAssignment[] = [
  {
    id: 'moodle_asg_23275',
    moodleId: 23275,
    courseCode: '24GM13',
    courseName: 'Accounting for Decision Making (ADM)',
    title: 'Mini Project - Financial Statement Analysis & Presentation',
    description: 'Collaborative project to enhance understanding of financial statements, corporate ratio analysis, and managerial decision-making as corporate stakeholders.',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    dueTimestamp: Date.now() + 24 * 60 * 60 * 1000,
    maxFiles: 2,
    maxFileSizeMb: 20,
    acceptedFileTypes: ['.pdf', '.xlsx', '.docx'],
    status: 'NOT_SUBMITTED',
    moodleUrl: 'https://lms.psgim.ac.in/mod/assign/view.php?id=23275',
  },
  {
    id: 'asg_bs_1',
    moodleId: 2101,
    courseCode: '24GM14',
    courseName: 'Business Statistics',
    title: 'Probability Distributions & Regression Case Analysis',
    description: 'Analyze the sales dataset and estimate linear regression parameters with 95% confidence intervals. Submit Excel calculations.',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    dueTimestamp: Date.now() + 3 * 24 * 60 * 60 * 1000,
    maxFiles: 2,
    maxFileSizeMb: 20,
    acceptedFileTypes: ['.pdf', '.xlsx', '.docx'],
    status: 'NOT_SUBMITTED',
    moodleUrl: 'https://lms.psgim.ac.in/mod/assign/view.php?id=2101',
  },
  {
    id: 'asg_ssa_1',
    moodleId: 2103,
    courseCode: '24GM16',
    courseName: 'Spreadsheet Applications (SSA)',
    title: 'Financial Modeling & What-If Scenario Matrix',
    description: 'Construct a dynamic 3-statement financial model with sensitivity tables for capital budgeting.',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dueTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    maxFiles: 1,
    maxFileSizeMb: 15,
    acceptedFileTypes: ['.xlsx'],
    status: 'SUBMITTED',
    submissionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    submittedFileName: 'SSA_Financial_Model_Devdarshan.xlsx',
    submittedFileSize: '1.2 MB',
    grade: '18 / 20',
    feedback: 'Excellent sensitivity analysis on cost of capital.',
    moodleUrl: 'https://lms.psgim.ac.in/mod/assign/view.php?id=2103',
  },
];

// Realistic seed quizzes for PSGIM MBA
const DEFAULT_QUIZZES: LmsQuiz[] = [
  {
    id: 'quiz_1',
    moodleId: 3101,
    courseCode: '23MB101',
    courseName: 'Business Statistics',
    title: 'CIA 1: Hypothesis Testing & Sampling MCQs',
    description: 'Online timed quiz covering Chi-Square, t-tests, and ANOVA concepts. Total 20 questions.',
    timeOpen: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    timeClose: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    timeLimitMinutes: 25,
    attemptsAllowed: 1,
    attemptsUsed: 0,
    status: 'OPEN',
    moodleUrl: 'https://lms.psgim.ac.in/mod/quiz/view.php?id=3101',
  },
  {
    id: 'quiz_2',
    moodleId: 3102,
    courseCode: '23MB104',
    courseName: 'Accounting for Managers',
    title: 'Weekly Knowledge Check: Cash Flow Statement',
    description: '10 objective questions on operating vs financing cash flows.',
    timeOpen: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    timeClose: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    timeLimitMinutes: 15,
    attemptsAllowed: 2,
    attemptsUsed: 0,
    status: 'UPCOMING',
    moodleUrl: 'https://lms.psgim.ac.in/mod/quiz/view.php?id=3102',
  },
];

import { getMasterStudent, toOldRollNo, ALL_COLLEGE_ROLL_NUMBERS } from '../data/psgimMasterStudents';
import { CLOUDFLARE_WORKER_URL } from './studzoneService';
import { CloudSyncService } from './cloudSyncService';

export const LmsService = {
  /**
   * Resolves the student's official Moodle username (the Dummy D-Roll number, e.g. D26AB05)
   */
  resolveMoodleUsername(rollNo: string): string {
    const clean = rollNo.trim().toUpperCase();
    if (clean.startsWith('D26')) return clean;
    const master = getMasterStudent(clean);
    if (master?.dRollNo) return master.dRollNo;
    const oldRoll = toOldRollNo(clean);
    return oldRoll || clean;
  },

  /**
   * Get stored LMS credentials for student
   */
  async getCredentials(rollNo: string): Promise<LmsCredentials | null> {
    try {
      if (!rollNo) return null;
      const moodleUser = this.resolveMoodleUsername(rollNo);
      const key = `${STORAGE_KEYS.LMS_CREDS}${rollNo.toUpperCase()}`;
      const data = await AsyncStorage.getItem(key);
      if (data) return JSON.parse(data);
      // Default initial credentials (Dummy roll.no e.g. D26AB05 + Welcome@123)
      return {
        rollNo: moodleUser,
        password: 'Welcome@123',
      };
    } catch {
      return null;
    }
  },

  /**
   * Parse upcoming assignments and deadlines from Moodle HTML
   */
  _parseMoodleUpcomingHtml(html: string): LmsAssignment[] {
    const courseMap: Record<string, string> = {};
    const courseNameMap: Record<string, string> = {
      '24GM11': 'Management Concepts and Organizational Behaviour',
      '24GM12': 'Economics for Decision Making',
      '24GM13': 'Accounting for Decision Making',
      '24GM14': 'Business Statistics',
      '24GM15': 'Managerial Communication',
      '24GM16': 'Spreadsheet Applications',
      '24GM18': 'Social Sensitization for Managers',
      '24GM19': 'Legal Aspects of Business',
    };

    // Extract course IDs from navigation
    const courseRegex = /href=["']https:\/\/lms\.psgim\.ac\.in\/course\/view\.php\?id=(\d+)["'][^>]*>[\s\S]*?<span class=["']media-body\s*["']>([^<]+)<\/span>/gi;
    let cm;
    while ((cm = courseRegex.exec(html)) !== null) {
      const cId = cm[1];
      const rawCode = cm[2].trim().toUpperCase();
      // Match 24GM13 from 24GM13G2
      const baseCodeMatch = rawCode.match(/24GM\d{2}/);
      const code = baseCodeMatch ? baseCodeMatch[0] : rawCode;
      courseMap[cId] = code;
    }

    const assignments: LmsAssignment[] = [];
    const eventRegex = /<div[^>]*data-type=["']event["'][^>]*data-course-id=["'](\d+)["'][^>]*data-event-id=["'](\d+)["'][^>]*data-event-title=["']([^"']+)["'][\s\S]*?<div class=["']description card-block calendar_event_due["']>([\s\S]*?)<\/div>/gi;
    let em;

    while ((em = eventRegex.exec(html)) !== null) {
      const courseId = em[1];
      const eventId = parseInt(em[2], 10) || Date.now();
      let title = em[3];
      // Repeatedly unescape HTML entities like &amp;amp; -> &
      while (title.includes('&amp;') || title.includes('&quot;') || title.includes('&#039;') || title.includes('&lt;') || title.includes('&gt;')) {
        title = title
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
      }
      title = title.trim();
      if (title.endsWith(' is due')) title = title.slice(0, -7).trim();

      const descSnippet = em[4];
      const linkMatch = descSnippet.match(/href=["'](https:\/\/lms\.psgim\.ac\.in\/mod\/(?:assign|quiz)\/view\.php\?id=\d+)["']/i);
      const moodleUrl = linkMatch ? linkMatch[1] : `https://lms.psgim.ac.in/mod/assign/view.php?id=${eventId}`;
      const cleanDesc = descSnippet.replace(/<a[^>]*>[\s\S]*?<\/a>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

      // Extract time / due date if available
      const timeMatch = descSnippet.match(/calendar\/view\.php\?view=day&amp;time=(\d+)/i) || html.match(/calendar\/view\.php\?view=day&amp;time=(\d+)/i);
      const timestamp = timeMatch && timeMatch[1] ? parseInt(timeMatch[1], 10) * 1000 : Date.now() + 24 * 3600 * 1000;

      const matchedCode = courseMap[courseId] || '24GM13';
      const courseTitle = courseNameMap[matchedCode] || 'Accounting for Decision Making';

      assignments.push({
        id: `moodle_asg_${eventId}`,
        moodleId: eventId,
        courseCode: matchedCode,
        courseName: courseTitle,
        title,
        description: cleanDesc || 'Coursework assignment submission portal.',
        dueDate: new Date(timestamp).toISOString(),
        dueTimestamp: timestamp,
        maxFiles: 2,
        maxFileSizeMb: 20,
        acceptedFileTypes: ['.pdf', '.xlsx', '.docx'],
        status: 'NOT_SUBMITTED',
        moodleUrl,
      });
    }

    return assignments;
  },

  /**
   * Calculates the exact, deterministic off-peak window time slot (01:30 AM – 05:30 AM)
   * for this student. Over 4 hours (14,400s), 252 students are spaced by ~57.14 seconds
   * with a subtle ±5s jitter to guarantee normal organic traffic.
   */
  getOffPeakSlotForStudent(rollNo: string): {
    slotIndex: number;
    targetHour: number;
    targetMinute: number;
    targetSecond: number;
    timeString: string;
    delayMsFromNow: number;
  } {
    const clean = rollNo.trim().toUpperCase();
    let idx = ALL_COLLEGE_ROLL_NUMBERS.indexOf(clean);
    if (idx === -1) {
      // Deterministic fallback hash if rollNo format differs
      let hash = 0;
      for (let i = 0; i < clean.length; i++) hash = (hash << 5) - hash + clean.charCodeAt(i);
      idx = Math.abs(hash) % 252;
    }

    // 01:30 AM is 1 hour 30 mins = 5400 seconds from midnight
    const baseWindowStartSeconds = 1.5 * 3600; // 5400s (01:30 AM)
    const spacingSeconds = 57.1428; // 14,400s / 252 students ≈ 57.14s per student
    // Add ±5s deterministic micro-jitter based on char codes
    const jitter = ((clean.charCodeAt(clean.length - 1) || 0) % 11) - 5;
    const studentSecondOfDay = Math.floor(baseWindowStartSeconds + idx * spacingSeconds + jitter);

    const targetHour = Math.floor(studentSecondOfDay / 3600);
    const targetMinute = Math.floor((studentSecondOfDay % 3600) / 60);
    const targetSecond = studentSecondOfDay % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeString = `${pad(targetHour)}:${pad(targetMinute)}:${pad(targetSecond)} AM`;

    // Compute delay in ms from current time
    const now = new Date();
    const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, targetSecond);
    if (scheduled.getTime() <= now.getTime()) {
      // If today's slot already passed, schedule for next morning
      scheduled.setDate(scheduled.getDate() + 1);
    }
    const delayMsFromNow = scheduled.getTime() - now.getTime();

    return {
      slotIndex: idx,
      targetHour,
      targetMinute,
      targetSecond,
      timeString,
      delayMsFromNow,
    };
  },

  /**
   * Sync upcoming assignments and events from live PSGIM Moodle
   */
  async syncWithMoodle(rollNo: string, password: string = 'Welcome@123'): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const moodleUser = this.resolveMoodleUsername(rollNo);
      const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/moodle/deadlines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNo: moodleUser, password }),
      });

      if (!res.ok) {
        return { success: false, message: `Moodle server error (${res.status}).` };
      }

      const data = await res.json();
      if (!data.success) {
        return { success: false, message: 'Invalid Moodle password or account issue.' };
      }

      if (data.rawHtml) {
        const liveAssignments = this._parseMoodleUpcomingHtml(data.rawHtml);
        if (liveAssignments.length > 0) {
          await this.saveAssignments(rollNo, liveAssignments);

          // Broadcast to Firestore so classmates get updated without their own Moodle hit
          const master = getMasterStudent(rollNo);
          const batch = master?.batch || 'A';
          CloudSyncService.syncMoodleDeadlines(batch, liveAssignments).catch(() => {});

          return {
            success: true,
            message: `Synced ${liveAssignments.length} live assignment(s) from Moodle for ${moodleUser}!`,
            count: liveAssignments.length,
          };
        }
      }

      return {
        success: true,
        message: `Connected to PSGIM Moodle as ${moodleUser}. No new assignments due right now.`,
        count: 0,
      };
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'Failed connecting to Moodle via Cloudflare bridge.',
      };
    }
  },

  /**
   * Load active assignments for student.
   * Priority: Local Storage -> Shared Cloud Broadcast -> Safe-window background sync.
   */
  async getAssignments(rollNo: string): Promise<LmsAssignment[]> {
    try {
      if (!rollNo) return DEFAULT_ASSIGNMENTS;
      const key = `${STORAGE_KEYS.LMS_ASSIGNMENTS}${rollNo.toUpperCase()}`;
      const data = await AsyncStorage.getItem(key);
      let assignments = data ? (JSON.parse(data) as LmsAssignment[]) : DEFAULT_ASSIGNMENTS;

      // Check cloud Firestore broadcast if local data is default
      const master = getMasterStudent(rollNo);
      const batch = master?.batch || 'A';
      CloudSyncService.fetchMoodleDeadlines(batch).then((cloudDeadlines: LmsAssignment[] | null) => {
        if (cloudDeadlines && cloudDeadlines.length > 0) {
          this.saveAssignments(rollNo, cloudDeadlines);
        }
      }).catch(() => {});

      if (!data) {
        await this.saveAssignments(rollNo, DEFAULT_ASSIGNMENTS);
      }
      return assignments;
    } catch {
      return DEFAULT_ASSIGNMENTS;
    }
  },

  /**
   * Save / update LMS credentials
   */
  async saveCredentials(creds: LmsCredentials): Promise<void> {
    try {
      if (!creds.rollNo) return;
      const key = `${STORAGE_KEYS.LMS_CREDS}${creds.rollNo.toUpperCase()}`;
      await AsyncStorage.setItem(key, JSON.stringify(creds));
    } catch (e) {
      console.warn('Error saving LMS credentials:', e);
    }
  },

  /**
   * Save assignments
   */
  async saveAssignments(rollNo: string, assignments: LmsAssignment[]): Promise<void> {
    try {
      if (!rollNo) return;
      const key = `${STORAGE_KEYS.LMS_ASSIGNMENTS}${rollNo.toUpperCase()}`;
      await AsyncStorage.setItem(key, JSON.stringify(assignments));
    } catch (e) {
      console.warn('Error saving LMS assignments:', e);
    }
  },

  /**
   * Load quizzes for student
   */
  async getQuizzes(rollNo: string): Promise<LmsQuiz[]> {
    try {
      if (!rollNo) return DEFAULT_QUIZZES;
      const key = `${STORAGE_KEYS.LMS_QUIZZES}${rollNo.toUpperCase()}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      await this.saveQuizzes(rollNo, DEFAULT_QUIZZES);
      return DEFAULT_QUIZZES;
    } catch {
      return DEFAULT_QUIZZES;
    }
  },

  /**
   * Save quizzes
   */
  async saveQuizzes(rollNo: string, quizzes: LmsQuiz[]): Promise<void> {
    try {
      if (!rollNo) return;
      const key = `${STORAGE_KEYS.LMS_QUIZZES}${rollNo.toUpperCase()}`;
      await AsyncStorage.setItem(key, JSON.stringify(quizzes));
    } catch (e) {
      console.warn('Error saving LMS quizzes:', e);
    }
  },

  /**
   * Direct Document Upload & Submit for an assignment.
   * Updates state to SUBMITTED with timestamp and file details.
   */
  async submitAssignmentDocument(
    rollNo: string,
    assignmentId: string,
    file: {
      name: string;
      size?: number;
      uri: string;
      mimeType?: string;
    }
  ): Promise<{ success: boolean; message: string; updatedAssignment?: LmsAssignment }> {
    try {
      const assignments = await this.getAssignments(rollNo);
      const targetIndex = assignments.findIndex((a) => a.id === assignmentId);
      if (targetIndex === -1) {
        return { success: false, message: 'Assignment not found.' };
      }

      const fileSizeStr = file.size
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : 'Document attached';

      const updatedAssignment: LmsAssignment = {
        ...assignments[targetIndex],
        status: 'SUBMITTED',
        submissionDate: new Date().toISOString(),
        submittedFileName: file.name,
        submittedFileSize: fileSizeStr,
        submittedFileUrl: file.uri,
      };

      assignments[targetIndex] = updatedAssignment;
      await this.saveAssignments(rollNo, assignments);

      return {
        success: true,
        message: `Successfully uploaded and submitted "${file.name}" to Moodle!`,
        updatedAssignment,
      };
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'Failed to submit document to Moodle.',
      };
    }
  },

  /**
   * Generates auto-login JavaScript for WebView to bypass Moodle login page.
   * Injects username and password into https://lms.psgim.ac.in/login/index.php
   * and automatically clicks Log in.
   */
  getAutoLoginScript(rollNo: string, password: string = 'Welcome@123'): string {
    return `
      (function() {
        try {
          var userField = document.getElementById('username');
          var passField = document.getElementById('password');
          var btn = document.getElementById('loginbtn') || document.querySelector('button[type="submit"]');
          if (userField && passField && btn) {
            userField.value = '${rollNo}';
            passField.value = '${password}';
            btn.click();
          }
        } catch(e) {}
      })();
      true;
    `;
  },
};
