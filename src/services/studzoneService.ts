import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject } from '../types';

const STUDZONE_CREDS_KEY = '@attendance_monitor_studzone_credentials';
const STUDZONE_BASE_URL = 'https://ecampus.psgtech.ac.in/studzone';

export interface StudzoneAttendanceRecord {
  courseCode: string;
  courseName: string;
  totalClasses: number;
  attendedClasses: number;
  exemptionClasses: number;
  percentage: number;
}

export interface StudzoneCredentials {
  rollNo: string;
  dobPassword: string;
  remember: boolean;
}

export interface StudzoneExtractionResult {
  success: boolean;
  records: StudzoneAttendanceRecord[];
  error?: string;
  fetchedAt?: string;
  studentName?: string;
}

export const StudzoneService = {
  /**
   * Retrieves saved Studzone credentials if remembered by the student
   */
  async getSavedCredentials(): Promise<StudzoneCredentials | null> {
    try {
      const data = await AsyncStorage.getItem(STUDZONE_CREDS_KEY);
      if (!data) return null;
      return JSON.parse(data) as StudzoneCredentials;
    } catch {
      return null;
    }
  },

  /**
   * Saves or clears Studzone credentials based on the remember flag
   */
  async saveCredentials(creds: StudzoneCredentials): Promise<void> {
    try {
      if (creds.remember) {
        await AsyncStorage.setItem(STUDZONE_CREDS_KEY, JSON.stringify(creds));
      } else {
        await AsyncStorage.removeItem(STUDZONE_CREDS_KEY);
      }
    } catch (e) {
      console.warn('Failed saving Studzone credentials:', e);
    }
  },

  /**
   * Clears saved Studzone credentials
   */
  async clearCredentials(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STUDZONE_CREDS_KEY);
    } catch (e) {
      console.warn('Failed clearing Studzone credentials:', e);
    }
  },

  /**
   * Helper to parse cookie string from fetch headers
   */
  _extractCookies(headers: Headers): string {
    const rawCookies: string[] = [];
    headers.forEach((val, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        const cookiePart = val.split(';')[0].trim();
        if (cookiePart) rawCookies.push(cookiePart);
      }
    });
    return rawCookies.join('; ');
  },

  /**
   * Extracts anti-forgery verification token from login HTML
   */
  _extractVerificationToken(html: string): string | null {
    const match = html.match(/name=["']__RequestVerificationToken["']\s+type=["']hidden["']\s+value=["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1];
    }
    const altMatch = html.match(/value=["']([^"']+)["']\s+name=["']__RequestVerificationToken["']/i);
    return altMatch ? altMatch[1] : null;
  },

  /**
   * Verifies student credentials against PSG Studzone portal.
   * Returns { success, rollNo, error }.
   * Only authenticates — does NOT extract attendance data.
   */
  async verifyLogin(
    rollNo: string,
    dobPassword: string
  ): Promise<{ success: boolean; rollNo: string; error?: string; cookies?: string }> {
    const cleanRollNo = rollNo.trim().toUpperCase().replace(/\s+/g, '');
    const cleanPassword = dobPassword.trim().toUpperCase().replace(/\s+/g, '');

    if (!cleanRollNo) {
      return { success: false, rollNo: '', error: 'Please enter your Student Roll Number.' };
    }
    if (!cleanPassword) {
      return {
        success: false,
        rollNo: '',
        error: 'Please enter your Date of Birth password (e.g. 13AUG05).',
      };
    }

    try {
      // Step 1: GET login page for anti-forgery token + cookies
      const loginPageRes = await fetch(STUDZONE_BASE_URL, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!loginPageRes.ok) {
        return {
          success: false,
          rollNo: '',
          error: `Cannot reach Studzone portal (HTTP ${loginPageRes.status}). Check your internet connection.`,
        };
      }

      const loginHtml = await loginPageRes.text();
      const token = this._extractVerificationToken(loginHtml);
      const initialCookies = this._extractCookies(loginPageRes.headers);

      if (!token) {
        return {
          success: false,
          rollNo: '',
          error: 'Studzone portal is temporarily unavailable. Please try again.',
        };
      }

      // Step 2: POST credentials
      const formData = new URLSearchParams();
      formData.append('rollno', cleanRollNo);
      formData.append('password', cleanPassword);
      formData.append('chkterms', 'on');
      formData.append('__RequestVerificationToken', token);

      const postHeaders: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: STUDZONE_BASE_URL,
      };
      if (initialCookies) {
        postHeaders['Cookie'] = initialCookies;
      }

      const loginRes = await fetch(STUDZONE_BASE_URL, {
        method: 'POST',
        headers: postHeaders,
        body: formData.toString(),
        redirect: 'manual',
      });

      const responseText = await loginRes.text();
      const loginCookies = this._extractCookies(loginRes.headers);
      const combinedCookies = [initialCookies, loginCookies].filter(Boolean).join('; ');

      // Detect lockout
      if (
        responseText.toLowerCase().includes('account has been locked') ||
        responseText.toLowerCase().includes('locked after 5')
      ) {
        return {
          success: false,
          rollNo: '',
          error:
            'Your Studzone account is temporarily locked due to too many incorrect attempts. Use "Forgot Password" on the official portal to unlock.',
        };
      }

      // Detect wrong credentials
      const isInvalidCreds =
        responseText.toLowerCase().includes('invalid rollno') ||
        responseText.toLowerCase().includes('invalid password') ||
        responseText.toLowerCase().includes('incorrect password') ||
        (responseText.includes('passwordError') &&
          !responseText.includes('id="passwordError"></span'));

      if (isInvalidCreds) {
        return {
          success: false,
          rollNo: '',
          error:
            'Incorrect Roll Number or DOB Password.\n\n⚠️ Password format: DDMMMYY (e.g. 13AUG05 for 13 Aug 2005). Caution: 5 wrong attempts will lock your account.',
        };
      }

      // If login succeeded, the portal redirects away from the login page.
      // A successful response either has no login form, or contains a welcome/dashboard element.
      const isLoginPageAgain =
        responseText.includes('id="rollno"') || responseText.includes('name="rollno"');

      if (isLoginPageAgain) {
        // Still on the login page — credentials were rejected
        return {
          success: false,
          rollNo: '',
          error:
            'Incorrect credentials. Please re-check your Roll Number and DOB Password format (DDMMMYY).',
        };
      }

      // Login succeeded!
      return {
        success: true,
        rollNo: cleanRollNo,
        cookies: combinedCookies,
      };
    } catch (err: any) {
      return {
        success: false,
        rollNo: '',
        error: err.message?.includes('Network')
          ? 'No internet connection. Please connect to Wi-Fi or mobile data and try again.'
          : err.message || 'An unexpected error occurred. Please try again.',
      };
    }
  },

  /**
   * Connects to Studzone, logs in with Roll Number and DOB Password,
   * and extracts live subject-wise attendance percentages and class counts.
   */
  async loginAndExtractAttendance(
    rollNo: string,
    dobPassword: string
  ): Promise<StudzoneExtractionResult> {
    const cleanRollNo = rollNo.trim().toUpperCase().replace(/\s+/g, '');
    const cleanPassword = dobPassword.trim().toUpperCase().replace(/\s+/g, '');

    if (!cleanRollNo) {
      return { success: false, records: [], error: 'Please enter your Student Roll Number.' };
    }
    if (!cleanPassword) {
      return {
        success: false,
        records: [],
        error: 'Please enter your DOB Password in DDMMMYY format (e.g. 13AUG05 for 13th August 2005).',
      };
    }

    try {
      // Step 1: GET Studzone Login page to retrieve anti-forgery token and initial cookies
      const loginPageRes = await fetch(STUDZONE_BASE_URL, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!loginPageRes.ok) {
        return {
          success: false,
          records: [],
          error: `Unable to connect to PSG Studzone portal (HTTP ${loginPageRes.status}). Please check your internet connection.`,
        };
      }

      const loginHtml = await loginPageRes.text();
      const token = this._extractVerificationToken(loginHtml);
      const initialCookies = this._extractCookies(loginPageRes.headers);

      if (!token) {
        return {
          success: false,
          records: [],
          error: 'Studzone portal security token could not be verified. The portal may be undergoing maintenance.',
        };
      }

      // Step 2: POST credentials to Studzone login
      const formData = new URLSearchParams();
      formData.append('rollno', cleanRollNo);
      formData.append('password', cleanPassword);
      formData.append('chkterms', 'on');
      formData.append('__RequestVerificationToken', token);

      const postHeaders: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: STUDZONE_BASE_URL,
      };
      if (initialCookies) {
        postHeaders['Cookie'] = initialCookies;
      }

      const loginResponse = await fetch(STUDZONE_BASE_URL, {
        method: 'POST',
        headers: postHeaders,
        body: formData.toString(),
        redirect: 'manual',
      });

      const loginResponseText = await loginResponse.text();
      const loginCookies = this._extractCookies(loginResponse.headers);
      const combinedCookies = [initialCookies, loginCookies].filter(Boolean).join('; ');

      // Check for authentication failure signals
      const isPasswordError =
        loginResponseText.includes('passwordError') &&
        !loginResponseText.includes('id="passwordError"></span');
      const isInvalidNotice =
        loginResponseText.toLowerCase().includes('invalid rollno') ||
        loginResponseText.toLowerCase().includes('invalid password') ||
        loginResponseText.toLowerCase().includes('incorrect password');
      const isLockedNotice =
        loginResponseText.toLowerCase().includes('account has been locked') ||
        loginResponseText.toLowerCase().includes('locked after 5');

      if (isLockedNotice) {
        return {
          success: false,
          records: [],
          error:
            'Your Studzone account has been temporarily locked due to consecutive incorrect attempts. Use the Forgot Password option on the official portal.',
        };
      }

      if (isPasswordError || isInvalidNotice) {
        return {
          success: false,
          records: [],
          error:
            'Invalid Roll Number or Password. Password must be your Date of Birth in DDMMMYY format (e.g. 13AUG05). Caution: 5 wrong attempts locks your account.',
        };
      }

      // Step 3: Fetch course names mapping from /Attendance/courseplan (optional enhancement)
      const courseMap: Record<string, string> = {};
      try {
        const coursePlanRes = await fetch(`${STUDZONE_BASE_URL}/Attendance/courseplan`, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
            Cookie: combinedCookies,
          },
        });
        if (coursePlanRes.ok) {
          const coursePlanHtml = await coursePlanRes.text();
          const divRegex = /<div[^>]*class=["'][^"']*col-md-8[^"']*["'][^>]*>[\s\S]*?<h5[^>]*>([\s\S]*?)<\/h5>[\s\S]*?<h6[^>]*>([\s\S]*?)<\/h6>/gi;
          let match;
          while ((match = divRegex.exec(coursePlanHtml)) !== null) {
            const cCode = match[1].replace(/<[^>]+>/g, '').trim().toUpperCase();
            const cName = match[2].replace(/<[^>]+>/g, '').trim();
            if (cCode) courseMap[cCode] = cName;
          }
        }
      } catch (cpErr) {
        console.warn('Course plan fetch skipped:', cpErr);
      }

      // Step 4: Fetch Student Percentage attendance table
      const percentageRes = await fetch(`${STUDZONE_BASE_URL}/Attendance/StudentPercentage`, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          Cookie: combinedCookies,
          Referer: `${STUDZONE_BASE_URL}/Attendance`,
        },
      });

      if (!percentageRes.ok) {
        return {
          success: false,
          records: [],
          error: `Logged into Studzone, but could not load attendance table (HTTP ${percentageRes.status}).`,
        };
      }

      const percentageHtml = await percentageRes.text();

      // Step 5: Parse table rows from attendance table (<table id="example">)
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;

      const records: StudzoneAttendanceRecord[] = [];
      let rowMatch;

      while ((rowMatch = rowRegex.exec(percentageHtml)) !== null) {
        const cells: string[] = [];
        let tdMatch;
        while ((tdMatch = tdRegex.exec(rowMatch[1])) !== null) {
          cells.push(tdMatch[1].replace(/<[^>]+>/g, '').trim());
        }

        // Must have at least 8 columns:
        // [0: course_code, 1: total_classes, 2: exemption, 3: ..., 4: present_classes, ..., 7: percentage]
        if (cells.length >= 8) {
          const rawCode = cells[0].toUpperCase().trim();
          const totalClasses = parseInt(cells[1], 10);
          const exemptionClasses = parseInt(cells[2], 10) || 0;
          const presentClasses = parseInt(cells[4], 10);
          const percentage = parseFloat(cells[7]) || 0;

          if (rawCode && !isNaN(totalClasses) && !isNaN(presentClasses)) {
            records.push({
              courseCode: rawCode,
              courseName: courseMap[rawCode] || '',
              totalClasses,
              attendedClasses: presentClasses,
              exemptionClasses,
              percentage,
            });
          }
        }
      }

      if (records.length === 0) {
        // Check if session expired or no attendance posted yet
        if (percentageHtml.includes('login') || percentageHtml.includes('rollno')) {
          return {
            success: false,
            records: [],
            error:
              'Studzone session was rejected. Please verify your DOB Password format (DDMMMYY e.g. 13AUG05).',
          };
        }
        return {
          success: false,
          records: [],
          error:
            'No attendance records found on Studzone yet. Attendance reports may not be published for this term yet.',
        };
      }

      return {
        success: true,
        records,
        fetchedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('Studzone extraction error:', err);
      return {
        success: false,
        records: [],
        error: err.message || 'An unexpected error occurred while communicating with Studzone.',
      };
    }
  },

  /**
   * Matches extracted Studzone records against app subjects and updates official baselines
   */
  applyToSubjects(
    studzoneRecords: StudzoneAttendanceRecord[],
    currentSubjects: Subject[],
    syncAppCounts: boolean = false
  ): { updatedSubjects: Subject[]; matchedCount: number; unmatchedCodes: string[] } {
    let matchedCount = 0;
    const matchedRecordCodes = new Set<string>();
    const today = new Date().toISOString().split('T')[0];

    const updatedSubjects = currentSubjects.map((sub) => {
      const subCodeClean = sub.code.toUpperCase().replace(/\s+/g, '');
      const subNameClean = sub.name.toUpperCase().replace(/\s+/g, '');

      // Try exact code match, then substring match
      const matchedRecord = studzoneRecords.find((rec) => {
        const recCodeClean = rec.courseCode.toUpperCase().replace(/\s+/g, '');
        if (recCodeClean === subCodeClean) return true;
        if (subCodeClean && recCodeClean.includes(subCodeClean)) return true;
        if (recCodeClean && subCodeClean.includes(recCodeClean)) return true;
        // Match by title initials or name match
        if (rec.courseName && rec.courseName.toUpperCase().replace(/\s+/g, '') === subNameClean) {
          return true;
        }
        return false;
      });

      if (matchedRecord) {
        matchedCount += 1;
        matchedRecordCodes.add(matchedRecord.courseCode);

        const newOfficialAttended = matchedRecord.attendedClasses;
        const newOfficialTotal = matchedRecord.totalClasses;

        return {
          ...sub,
          name: sub.name || matchedRecord.courseName || sub.name,
          officialAttended: newOfficialAttended,
          officialTotal: newOfficialTotal,
          lastOfficialUpdate: today,
          // If the user chooses to sync app numbers to college baseline as well
          attended: syncAppCounts ? newOfficialAttended : sub.attended,
          total: syncAppCounts ? newOfficialTotal : sub.total,
        };
      }

      return sub;
    });

    const unmatchedCodes = studzoneRecords
      .map((r) => r.courseCode)
      .filter((code) => !matchedRecordCodes.has(code));

    return {
      updatedSubjects,
      matchedCount,
      unmatchedCodes,
    };
  },
};
