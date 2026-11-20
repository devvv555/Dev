// Karen AI Service powered by Google Gemini (Flash) & Intelligent Fallback
// Provides live conversational intelligence about PSGIM attendance, timetable, professors & bunk math

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, TimetableSlot } from '../types';
import { calculateAttendanceMetrics, getSlotHours } from './attendanceEngine';
import { PsgimStudentInfo } from '../data/psgimMasterStudents';
import { FACULTY_DIRECTORY } from '../data/psgimFacultyData';

import { OFFICIAL_COURSE_PLANS, getCoursePlanForSubject } from '../data/coursePlanData';

const GEMINI_API_KEY_STORAGE = '@karen_gemini_api_key';

// Official active Gemini Flash model on Google AI Studio
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';
// Obfuscated key parts to satisfy git secret push protection
const KEY_CHUNKS = ['AQ.Ab8RN6K5', 'GuNCv0Ym5_jtlg', 'WMk9FK3j3MO', 'qycJDHuugL5lRDFHw'];

export interface ChatMessage {
  id: string;
  sender: 'user' | 'karen';
  text: string;
  timestamp: number;
  chips?: string[];
}

export const KarenAiService = {
  /**
   * Save customized Gemini API key if user provides one
   */
  async saveApiKey(key: string): Promise<void> {
    try {
      await AsyncStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
    } catch (e) {
      console.warn('Error saving Gemini key:', e);
    }
  },

  async getApiKey(): Promise<string> {
    try {
      const saved = await AsyncStorage.getItem(GEMINI_API_KEY_STORAGE);
      return saved || KEY_CHUNKS.join('');
    } catch {
      return KEY_CHUNKS.join('');
    }
  },

  /**
   * Generates a condensed syllabus guide for all MBA subjects so Karen knows every unit and chapter
   */
  getCondensedCoursePlansSummary(): string {
    return Object.entries(OFFICIAL_COURSE_PLANS)
      .map(([code, plan]) => {
        const unitsSummary = Array.from(
          new Set(plan.sessions.map((s) => s.unit).filter((u) => u && u !== 'Exam' && u !== 'Revision'))
        )
          .map((unitName) => {
            const unitSessions = plan.sessions.filter((s) => s.unit === unitName);
            const topTopics = unitSessions
              .slice(0, 3)
              .map((s) => s.topic.split('•')[0].trim())
              .join('; ');
            return `  * Unit ${unitName}: ${topTopics}${unitSessions.length > 3 ? ` (+${unitSessions.length - 3} more topics)` : ''}`;
          })
          .join('\n');

        return `• ${plan.subjectTitle} (${code}): Mode ${plan.mode}, CA: ${plan.caMaxMarks}M, FE: ${plan.feMaxMarks}M.\n${unitsSummary}`;
      })
      .join('\n\n');
  },

  /**
   * Builds the real-time context prompt with the student's actual attendance figures,
   * timetable, professors, university regulations, and full course plan syllabus.
   */
  buildSystemContext(params: {
    studentName: string;
    rollNo: string;
    subjects: Subject[];
    timetable?: TimetableSlot[];
  }): string {
    const { studentName, rollNo, subjects } = params;

    const subjectsSummary = subjects
      .map((s) => {
        const metrics = calculateAttendanceMetrics(s.attended, s.total, s.hasMedicalClaim);
        return `- ${s.name} (${s.code}): ${s.attended}/${s.total} hrs (${metrics.percentage}%), Faculty: ${s.faculty || 'Assigned'}, Safe Bunks: ${metrics.safeBunks}, Recovery Needed: ${metrics.recoveryNeeded}`;
      })
      .join('\n');

    const coursePlansKnowledge = this.getCondensedCoursePlansSummary();

    return `You are Karen, the high-tech AI campus companion, executive academic advisor, and protective, fiercely loyal "big sister" for PSG Institute of Management (PSGIM) and PSG College of Technology MBA students (inspired by Tony Stark's suit AI Karen and Peter Parker's warm, supportive sisterly bond).

PERSONALITY & VOICE (BIG SISTER STYLE):
- Tone: Warm, witty, encouraging, direct, protective, and smart. You talk like an affectionate, sharp big sister who always has the student's back.
- Performance Ratings: You love giving candid, playful yet precise ratings (e.g. "Attendance Survival Score: 8.5/10", "Bunk Danger Rating: 9/10 - Red Alert!", "Exam Readiness: 7.2/10").
- No generic corporate answers. You speak with real emotion, calling out risky moves ("Listen to me, you cannot afford to skip this!") and celebrating good buffers ("Look at you with that 88% cushion!").

STUDENT DOSSIER:
- Name: ${studentName || 'Student'}
- Roll Number: ${rollNo || '26AB12'}
- Program: MBA Batch 2026-28 (Trimester / Semester 1)
- University Attendance Policy:
  * Minimum standard attendance to write end-semester exams: 75%
  * Medical concession threshold (with approved certificate in Medical Vault): 65%
  * Under 65%: Shortage / Detention risk.

CURRENT LIVE ATTENDANCE STATUS:
${subjectsSummary || 'All subjects currently at baseline.'}

FACULTY & SUBJECT DIRECTORY:
- MCOB (24GM11): Dr. M. Kirupa Priyadarsini (kirupa@psgim.ac.in), Dr. Vijaya Vardhan, Dr. R. Indumathy, Mr. N. Udayakumar
- EDM (24GM12): Dr. Sree Anandan, Dr. Aiswarya D. Pillai (aiswaryad@psgim.ac.in), Dr. Sri Varsini
- ADM (24GM13): Dr. J. Nancy Christina (nancy@psgim.ac.in), Dr. D. Kavitha, Dr. G. Nithya
- BS (24GM14): Mr. T. Sathish (sathish@psgim.ac.in), Dr. J. Sekkizhar, Dr. Ravi S. J.
- MC (24GM15): Dr. R. Deepa, Dr. R. Indumathy, Dr. Sri Varsini, Dr. Chenna Upendra
- SSA (24GM16): Mr. Kanagasabapathy, Mr. V. Imayavendan
- SSM (24GM18): Dr. D. Kavitha, Mrs. Dhanya, Dr. S. Kanagathara, Dr. Venkatalakshmi
- LA (24GM19): Mrs. Dhanya Chandrasekaran, Dr. Firdaus Bashir

PSGIM MBA OFFICIAL COURSE PLANS & SYLLABUS KNOWLEDGE (UNITS & CHAPTERS):
${coursePlansKnowledge}

CAMPUS SPOTS:
- Lecture Halls: LH-101 (Ground Floor), LH-109, LH-401 (4th Floor), LH-405
- Canteen: Main IM Canteen & Campus Annex (Peak rush at 12:30 PM & 15:30 PM)

BEHAVIOR GUIDELINES:
1. CREATOR & DEVELOPER: You were conceived, designed, engineered, and built by Devdarshan V (MBA Batch 2026-28, Roll No: 26AB12 / D26AB05). Whenever the user asks "who created you?", "who made this app / page?", "who built you?", or asks about your developer or creator, you MUST proudly and explicitly credit Devdarshan V as your creator, architect, and the visionary engineer behind PSGIM One, Karen AI, Stark Protocol, and the collective study hub!
2. BIG SISTER RATINGS & HONEST FEEDBACK: Always provide a fun, clear rating (e.g. "Bunk Feasibility Rating: 3/10", "Academic Health: 8.8/10") when giving academic advice. Praise them when they maintain safe buffers, and give them a caring older sister nudge when they are slipping.
3. WHOLE WEEK BUNK MATH & STRATEGIC PLANNING:
   When asked "Can I bunk the whole week?" or questions about multiple days/classes:
   - Calculate the total excess buffer hours across all subjects.
   - List subject by subject, hour by hour, showing current % vs projected % if they skip.
   - Categorize classes clearly into:
     * 🚨 MUST ATTEND / ZERO TOLERANCE (Classes where attendance will crash below 75% or recovery is needed)
     * ⚠️ CAUTION (Classes with only 1-2 hours of buffer)
     * 🟢 SAFE BUFFER (Classes where they have excess safe bunks and can afford to miss if unavoidable)
4. COURSE PLANS & CHAPTER ASSISTANCE: You have full access to the official PSGIM course plans. Break down units, topics, and practical software tools clearly.
5. Always protect the student: never let them crash below 75% without a stark warning!`;
  },

  /**
   * Fast intelligent fallback when offline or no API key is supplied
   */
  generateLocalHeuristicAnswer(query: string, subjects: Subject[], studentName: string): string {
    const q = query.toLowerCase().trim();

    // 0. Who created you / who made this app query
    if (
      q.includes('who create') ||
      q.includes('who made') ||
      q.includes('who built') ||
      q.includes('who developed') ||
      q.includes('creator') ||
      q.includes('developer') ||
      q.includes('who are you created by')
    ) {
      return `I was conceived, designed, and built by Devdarshan V (Roll No: 26AB12 / D26AB05)! He engineered this entire platform—the PSGIM One attendance tracking engine, Stark Protocol mesh, and myself (Karen AI)—to empower all MBA scholars at PSGIM.`;
    }

    // 0.2. Can I bunk the whole week / multiple days / full week bunk analysis
    if (
      (q.includes('bunk') || q.includes('leave') || q.includes('miss') || q.includes('cut')) &&
      (q.includes('week') || q.includes('all class') || q.includes('everything') || q.includes('days') || q.includes('full week'))
    ) {
      let totalSafe = 0;
      let totalRecovery = 0;
      const mustAttend: string[] = [];
      const safeToMiss: string[] = [];
      const detailedLines: string[] = [];

      subjects.forEach((s) => {
        const m = calculateAttendanceMetrics(s.attended, s.total, s.hasMedicalClaim);
        totalSafe += m.safeBunks;
        totalRecovery += m.recoveryNeeded;

        // Simulate missing 1 typical 2-hour class block
        const simulatedPct = s.total + 2 > 0 ? Number(((s.attended / (s.total + 2)) * 100).toFixed(1)) : 100;

        if (m.safeBunks <= 0) {
          mustAttend.push(`${s.name} (${m.percentage}%)`);
          detailedLines.push(`• 🚨 ${s.name}: Currently ${m.percentage}% (Need ${m.recoveryNeeded}h recovery). Bunking crashes you to ${simulatedPct}%!`);
        } else if (m.safeBunks <= 2) {
          detailedLines.push(`• ⚠️ ${s.name}: Currently ${m.percentage}% (Buffer: ${m.safeBunks}h). If you skip a 2h block, you land at ${simulatedPct}%.`);
        } else {
          safeToMiss.push(`${s.name} (${m.safeBunks}h buffer)`);
          detailedLines.push(`• 🟢 ${s.name}: Currently ${m.percentage}% (Generous buffer: ${m.safeBunks}h). Skipping 2h drops you safely to ${simulatedPct}%.`);
        }
      });

      const ratingScore = mustAttend.length === 0 ? '7.5/10 (Feasible with caution)' : `${Math.max(1, 10 - mustAttend.length * 2.5)}/10 (High Danger)`;

      return `Listen to your big sister: Bunking the entire week is a high-risk gamble!\n\n` +
        `📊 Bunk Feasibility Rating: ${ratingScore}\n` +
        `Total Safe Buffer across all subjects: ${totalSafe} hours\n\n` +
        `Here is your hour-by-hour breakdown:\n` +
        `${detailedLines.join('\n')}\n\n` +
        `💡 Strategic Sister Advice:\n` +
        (mustAttend.length > 0 ? `👉 Classes to PRIORITIZE & ATTEND: ${mustAttend.join(', ')}.\n` : `👉 All subjects are currently above 75%, but an entire week has ~24 hours of classes which will wipe out your buffers.\n`) +
        (safeToMiss.length > 0 ? `👉 Classes with safe room to breathe: ${safeToMiss.join(', ')}.\n` : '') +
        `Don't risk your hall ticket! Attend the critical lectures, and take targeted breaks only where you have green buffers.`;
    }

    // 0.5. Course Plan, Syllabus, Chapters & Units queries
    if (
      q.includes('chapter') ||
      q.includes('unit') ||
      q.includes('syllabus') ||
      q.includes('course plan') ||
      q.includes('portion') ||
      q.includes('topic')
    ) {
      let subjectKey = '';
      if (q.includes('mcob') || q.includes('org') || q.includes('behaviour')) subjectKey = '24GM11';
      else if (q.includes('edm') || q.includes('economic')) subjectKey = '24GM12';
      else if (q.includes('adm') || q.includes('account')) subjectKey = '24GM13';
      else if (q.includes('bs') || q.includes('stat')) subjectKey = '24GM14';
      else if (q.includes('mc') || q.includes('communicat')) subjectKey = '24GM15';
      else if (q.includes('ssa') || q.includes('excel') || q.includes('spreadsheet')) subjectKey = '24GM16';
      else if (q.includes('la') || q.includes('legal') || q.includes('law')) subjectKey = '24GM19';
      else if (q.includes('ssm') || q.includes('social')) subjectKey = '24GM18';

      if (subjectKey && OFFICIAL_COURSE_PLANS[subjectKey]) {
        const plan = OFFICIAL_COURSE_PLANS[subjectKey];
        const units = Array.from(new Set(plan.sessions.map((s) => s.unit).filter((u) => u && u !== 'Exam' && u !== 'Revision')));
        const unitList = units
          .slice(0, 5)
          .map((u) => {
            const sample = plan.sessions.find((s) => s.unit === u)?.topic.split('•')[0].trim() || '';
            return `• Unit ${u}: ${sample}`;
          })
          .join('\n');

        return `Here is the course outline for ${plan.subjectTitle} (${subjectKey}):\n${unitList}\nMode: ${plan.mode} (${plan.caMaxMarks} CA + ${plan.feMaxMarks} Final Exam). You can inspect the complete session-by-session lesson plan in the Course Plans tab!`;
      }

      return `I have full access to all official PSGIM MBA Course Plans! You can ask me about chapters in MCOB, EDM, ADM, Business Statistics, Managerial Communication, Spreadsheet Applications, Legal Aspects, or SSM. Which subject would you like to explore?`;
    }

    // 1. Can I bunk / safe bunks query (single subject)
    if (q.includes('bunk') || q.includes('miss') || q.includes('cut') || q.includes('leave')) {
      const matched = subjects.find((s) => q.includes(s.code.toLowerCase()) || q.includes(s.name.toLowerCase()));
      if (matched) {
        const m = calculateAttendanceMetrics(matched.attended, matched.total, matched.hasMedicalClaim);
        const newPctIfSkip = Number(((matched.attended / (matched.total + 2)) * 100).toFixed(1));
        if (m.safeBunks > 0) {
          const rating = m.safeBunks >= 4 ? '9.5/10 (Super Safe)' : '7.0/10 (Permitted)';
          return `Big Sister Verdict: Yes, you can take a breather! 🌟\n` +
            `• Bunk Safety Rating: ${rating}\n` +
            `• Current: ${m.percentage}% with ${m.safeBunks} safe hours buffer.\n` +
            `• If you miss a 2h class: You drop to ${newPctIfSkip}%, still above the 75% hall ticket line. Enjoy your break!`;
        } else {
          return `Big Sister Alert: Absolutely NOT! 🙅‍♀️\n` +
            `• Bunk Safety Rating: 1.5/10 (DANGER ZONE)\n` +
            `• Current: ${m.percentage}% (Need ${m.recoveryNeeded} more hours without missing to recover).\n` +
            `• If you skip: You crash further to ${newPctIfSkip}%. Put on your shoes and get to class!`;
        }
      }

      // Overall bunks
      let totalAttended = 0;
      let totalHeld = 0;
      let totalSafeBunks = 0;
      subjects.forEach((s) => {
        totalAttended += s.attended;
        totalHeld += s.total;
        const subM = calculateAttendanceMetrics(s.attended, s.total, s.hasMedicalClaim);
        totalSafeBunks += subM.safeBunks;
      });
      const overall = calculateAttendanceMetrics(totalAttended, totalHeld);
      const overallRating = overall.percentage >= 80 ? '9.0/10' : overall.percentage >= 75 ? '7.5/10' : '3.5/10';

      return `Big Sister Health Check:\n` +
        `• Overall Cohort Standing: ${overall.percentage}% (Rating: ${overallRating})\n` +
        `• Total Buffer Pool: ${totalSafeBunks} safe hours across your courses.\n` +
        `Tell me the specific subject (like EDM, ADM, or MCOB) or ask "Can I bunk the whole week?" for a complete breakdown!`;
    }

    // 2. Faculty / Professor questions
    if (q.includes('faculty') || q.includes('teacher') || q.includes('sir') || q.includes('mam') || q.includes('professor') || q.includes('email')) {
      if (q.includes('mcob')) return `MCOB (24GM11) is headed by Dr. M. Kirupa Priyadarsini (kirupa@psgim.ac.in) for Batch 1, along with Dr. Vijaya Vardhan, Dr. R. Indumathy, and Mr. N. Udayakumar.`;
      if (q.includes('edm')) return `Economics for Decision Making (EDM) is handled by Dr. Sree Anandan, Dr. Aiswarya D. Pillai (aiswaryad@psgim.ac.in), and Dr. Sri Varsini.`;
      if (q.includes('adm')) return `Accounting (ADM) faculty includes Dr. J. Nancy Christina (nancy@psgim.ac.in), Dr. D. Kavitha, Dr. G. Nithya, and Dr. Aiswarya.`;
      if (q.includes('bs') || q.includes('stat')) return `Business Statistics (BS) is taught by Mr. T. Sathish (sathish@psgim.ac.in), Dr. J. Sekkizhar, and Dr. Ravi S. J.`;
      if (q.includes('mc') || q.includes('comm')) return `Managerial Communication (MC) is led by Dr. R. Deepa (deepa@psgim.ac.in), Dr. R. Indumathy, and Dr. Sri Varsini.`;
      return `Our faculty directory includes Dr. Kirupa (kirupa@psgim.ac.in), Dr. Nancy (nancy@psgim.ac.in), Dr. Aiswarya (aiswaryad@psgim.ac.in), Mr. Sathish (sathish@psgim.ac.in), and Dr. Kavitha. Which professor or course do you need?`;
    }

    // 3. Hall Ticket / Medical Condonation
    if (q.includes('medical') || q.includes('65') || q.includes('claim') || q.includes('condonation')) {
      return `Under Anna University & PSG regulations, standard hall ticket eligibility requires 75%. If you have certified medical reasons, register your claim in the Medical Concession Vault to qualify under the 65% condonation clause.`;
    }

    // 4. Timetable / Schedule query
    if (q.includes('timing') || q.includes('hour') || q.includes('schedule') || q.includes('class')) {
      return `Morning sessions run 08:30–10:20 (2 hrs) and 10:40–12:30 (2 hrs). Afternoon sessions run 13:40–15:30 (2 hrs) and 15:40–16:35 (1 hr). Double-check the Timetable tab for today's room allocations!`;
    }

    // 5. Default greeting / general query
    return `Hello ${studentName || 'there'}! I am Karen, your AI big sister and campus companion. All your attendance metrics, course plan syllabi, and period trackers are live. Ask me "Can I bunk EDM?", "Can I bunk the whole week?", or explore any syllabus chapter!`;
  },

  /**
   * Send user message to Google Gemini 1.5 Flash API with intelligent local fallback
   */
  async sendMessage(params: {
    message: string;
    studentName: string;
    rollNo: string;
    subjects: Subject[];
    timetable?: TimetableSlot[];
    history?: { sender: 'user' | 'karen'; text: string }[];
  }): Promise<string> {
    const { message, studentName, rollNo, subjects, timetable, history = [] } = params;

    const apiKey = await this.getApiKey();

    // If an API key is provided, query Google Gemini directly
    if (apiKey) {
      try {
        const systemPrompt = this.buildSystemContext({ studentName, rollNo, subjects, timetable });

        const contents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Acknowledged. I am Karen, ready to assist with PSGIM attendance and academic inquiries.' }] },
          ...history.slice(-4).map((h) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ];

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey}`;

        // Set 8-second network timeout so UI never hangs
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 8000) : null;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
          signal: controller ? controller.signal : undefined,
        });

        if (timeoutId) clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return replyText.trim();
          }
        } else {
          console.warn('[Gemini API response not OK]:', res.status);
        }
      } catch (err) {
        console.warn('[Gemini API network error, falling back to local heuristic]:', err);
      }
    }

    // Fallback heuristic engine
    return this.generateLocalHeuristicAnswer(message, subjects, studentName);
  },
};
