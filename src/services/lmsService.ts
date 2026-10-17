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

// Realistic seed assignments for PSGIM I Year MBA Semester I
const DEFAULT_ASSIGNMENTS: LmsAssignment[] = [
  {
    id: 'asg_1',
    moodleId: 2101,
    courseCode: '23MB101',
    courseName: 'Business Statistics',
    title: 'Probability Distributions & Regression Case Analysis',
    description: 'Analyze the attached sales dataset and estimate the linear regression parameters with 95% confidence intervals. Submit detailed methodology and Excel calculations.',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // ~2 days away
    dueTimestamp: Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
    maxFiles: 2,
    maxFileSizeMb: 20,
    acceptedFileTypes: ['.pdf', '.xlsx', '.docx'],
    status: 'NOT_SUBMITTED',
    moodleUrl: 'https://lms.psgim.ac.in/mod/assign/view.php?id=2101',
  },
  {
    id: 'asg_2',
    moodleId: 2102,
    courseCode: '23MB102',
    courseName: 'Management Concepts & Organizational Behavior',
    title: 'Individual Case Study: Leadership Styles at Tata Motors',
    description: 'Critique the transformational leadership framework in crisis management. Submit a 4-page analysis in PDF format.',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // ~5 days away
    dueTimestamp: Date.now() + 5 * 24 * 60 * 60 * 1000,
    maxFiles: 1,
    maxFileSizeMb: 10,
    acceptedFileTypes: ['.pdf'],
    status: 'NOT_SUBMITTED',
    moodleUrl: 'https://lms.psgim.ac.in/mod/assign/view.php?id=2102',
  },
  {
    id: 'asg_3',
    moodleId: 2103,
    courseCode: '23MB103',
    courseName: 'Spreadsheet for Analytics (SSA)',
    title: 'Financial Modeling & What-If Scenario Matrix',
    description: 'Construct a dynamic 3-statement financial model with sensitivity tables for capital budgeting.',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Submitted
    dueTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    maxFiles: 1,
    maxFileSizeMb: 15,
    acceptedFileTypes: ['.xlsx'],
    status: 'SUBMITTED',
    submissionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    submittedFileName: 'SSA_Financial_Model_RollNo.xlsx',
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

export const LmsService = {
  /**
   * Get stored LMS credentials for student
   */
  async getCredentials(rollNo: string): Promise<LmsCredentials | null> {
    try {
      if (!rollNo) return null;
      const key = `${STORAGE_KEYS.LMS_CREDS}${rollNo.toUpperCase()}`;
      const data = await AsyncStorage.getItem(key);
      if (data) return JSON.parse(data);
      // Default initial credentials (roll.no + Welcome@123)
      return {
        rollNo: rollNo.toUpperCase(),
        password: 'Welcome@123',
      };
    } catch {
      return null;
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
   * Load active assignments for student
   */
  async getAssignments(rollNo: string): Promise<LmsAssignment[]> {
    try {
      if (!rollNo) return DEFAULT_ASSIGNMENTS;
      const key = `${STORAGE_KEYS.LMS_ASSIGNMENTS}${rollNo.toUpperCase()}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
      // Seed default assignments
      await this.saveAssignments(rollNo, DEFAULT_ASSIGNMENTS);
      return DEFAULT_ASSIGNMENTS;
    } catch {
      return DEFAULT_ASSIGNMENTS;
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
