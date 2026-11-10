// Karen AI Service powered by Google Gemini (Flash) & Intelligent Fallback
// Provides live conversational intelligence about PSGIM attendance, timetable, professors & bunk math

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, TimetableSlot } from '../types';
import { calculateAttendanceMetrics, getSlotHours } from './attendanceEngine';
import { PsgimStudentInfo } from '../data/psgimMasterStudents';
import { FACULTY_DIRECTORY } from '../data/psgimFacultyData';

const GEMINI_API_KEY_STORAGE = '@karen_gemini_api_key';

// Default free public endpoint or customizable key
const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';

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
      return saved || '';
    } catch {
      return '';
    }
  },

  /**
   * Builds the real-time context prompt with the student's actual attendance figures,
   * timetable, professors, and university regulations.
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

    return `You are Karen, the high-tech AI campus companion and executive academic advisor for PSG Institute of Management (PSGIM) and PSG College of Technology MBA students. You speak in a smart, supportive, quick, and witty style (inspired by Tony Stark's suit AI Karen).

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

CAMPUS SPOTS:
- Lecture Halls: LH-101 (Ground Floor), LH-109, LH-401 (4th Floor), LH-405
- Canteen: Main IM Canteen & Campus Annex (Peak rush at 12:30 PM & 15:30 PM)

BEHAVIOR GUIDELINES:
1. Keep answers concise, helpful, and MBA-focused (2-4 sentences max unless detailed calculation is requested).
2. If asked "Can I bunk [Course]?", check their exact safe bunks and give a direct Yes/No answer with the resulting percentage!
3. If they ask about faculty, provide the professor's name and official @psgim.ac.in email address.
4. Always encourage maintaining above 75% to stay completely safe for exam hall tickets.`;
  },

  /**
   * Fast intelligent fallback when offline or no API key is supplied
   */
  generateLocalHeuristicAnswer(query: string, subjects: Subject[], studentName: string): string {
    const q = query.toLowerCase().trim();

    // 1. Can I bunk / safe bunks query
    if (q.includes('bunk') || q.includes('miss') || q.includes('cut') || q.includes('leave')) {
      const matched = subjects.find((s) => q.includes(s.code.toLowerCase()) || q.includes(s.name.toLowerCase()));
      if (matched) {
        const m = calculateAttendanceMetrics(matched.attended, matched.total, matched.hasMedicalClaim);
        if (m.safeBunks > 0) {
          return `Yes, you can safely take ${m.safeBunks} ${m.safeBunks === 1 ? 'hour' : 'hours'} off in ${matched.name}. Your attendance is currently ${m.percentage}%, so you'll remain above the 75% target threshold.`;
        } else {
          return `No, you cannot bunk ${matched.name}! Your attendance is currently at ${m.percentage}%. You need to attend ${m.recoveryNeeded} more ${m.recoveryNeeded === 1 ? 'hour' : 'hours'} without missing to get safely above 75%.`;
        }
      }

      // Overall bunks
      let totalAttended = 0;
      let totalHeld = 0;
      subjects.forEach((s) => {
        totalAttended += s.attended;
        totalHeld += s.total;
      });
      const overall = calculateAttendanceMetrics(totalAttended, totalHeld);
      return `Across all courses, you have an overall average of ${overall.percentage}%. You have approximately ${overall.safeBunks} safe hours buffer. Check individual subjects before taking any bunk!`;
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
    return `Hello ${studentName || 'there'}! I am Karen. All your attendance metrics and period trackers are live. Ask me anything about your safe bunks, faculty contacts, or timetable!`;
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

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        });

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
