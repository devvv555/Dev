import { Subject, TimetableSlot } from '../types';
import { calculateAttendanceMetrics, getSlotHours } from '../services/attendanceEngine';


export type CalendarEventType = 'HOLIDAY' | 'EXAM' | 'EVENT' | 'ACADEMIC';


export interface AcademicCalendarItem {
  id: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  day: string;
  title: string;
  type: CalendarEventType;
  description?: string;
  isLongWeekend?: boolean;
  longWeekendTag?: string; // e.g. "3-Day Weekend", "4-Day Mega Break"
  recommendedSmartLeave?: string; // e.g. "Take Mon off for 4-day trip!"
}

export const ACADEMIC_CALENDAR: AcademicCalendarItem[] = [
  // ── JULY & AUGUST 2026 ──────────────────────────────────────
  {
    id: 'cal_0723',
    date: '2026-07-23',
    endDate: '2026-07-24',
    day: 'Thursday',
    title: 'CRMT - International Conference',
    type: 'EVENT',
  },
  {
    id: 'cal_0803',
    date: '2026-08-03',
    day: 'Monday',
    title: 'I MBA Induction Commences',
    type: 'EVENT',
  },
  {
    id: 'cal_0807',
    date: '2026-08-07',
    endDate: '2026-08-09',
    day: 'Friday',
    title: 'I Year MBA Induction - ALPS Visit',
    type: 'EVENT',
    description: 'Outbound leadership training trip to ALPS (Anaikatti)',
  },
  {
    id: 'cal_0815',
    date: '2026-08-15',
    day: 'Saturday',
    title: 'Independence Day',
    type: 'HOLIDAY',
  },
  {
    id: 'cal_0817',
    date: '2026-08-17',
    day: 'Monday',
    title: 'I Year MBA Regular Classes Commence',
    type: 'ACADEMIC',
    description: 'First official day of classroom lectures',
  },
  {
    id: 'cal_0824',
    date: '2026-08-24',
    endDate: '2026-08-28',
    day: 'Monday',
    title: 'Week of Games',
    type: 'EVENT',
    description: 'Annual intra-college sports week',
  },
  {
    id: 'cal_0826',
    date: '2026-08-26',
    day: 'Wednesday',
    title: 'Holiday - Miladi Nabi / Onam',
    type: 'HOLIDAY',
    description: 'State holiday for Miladi Nabi & Onam',
  },

  // ── SEPTEMBER 2026 ──────────────────────────────────────────
  {
    id: 'cal_0902',
    date: '2026-09-02',
    day: 'Wednesday',
    title: 'Foundation Day',
    type: 'EVENT',
  },
  {
    id: 'cal_0904',
    date: '2026-09-04',
    day: 'Friday',
    title: 'Holiday - Krishna Jayanthi',
    type: 'HOLIDAY',
    isLongWeekend: true,
    longWeekendTag: '🌟 3-Day Weekend',
    description: 'Friday holiday creates an automatic 3-day weekend (Fri–Sun)',
  },
  {
    id: 'cal_0907',
    date: '2026-09-07',
    endDate: '2026-09-11',
    day: 'Monday',
    title: 'WOW / Academic Writing Week',
    type: 'EVENT',
  },
  {
    id: 'cal_0912',
    date: '2026-09-12',
    day: 'Saturday',
    title: 'WOW Finale',
    type: 'EVENT',
  },
  {
    id: 'cal_0914',
    date: '2026-09-14',
    day: 'Monday',
    title: 'Holiday - Vinayagar Chaturthi',
    type: 'HOLIDAY',
    isLongWeekend: true,
    longWeekendTag: '🌟 3-Day Weekend',
    description: 'Monday holiday creates an automatic 3-day weekend (Sat–Mon)',
  },
  {
    id: 'cal_0917',
    date: '2026-09-17',
    day: 'Thursday',
    title: 'Class Committee Meeting - I',
    type: 'ACADEMIC',
  },
  {
    id: 'cal_0921',
    date: '2026-09-21',
    endDate: '2026-09-24',
    day: 'Monday',
    title: 'I MBA Mid Term Examination — Semester 1',
    type: 'EXAM',
    description: 'Internal assessment exams for all Sem 1 subjects. Attendance is mandatory. Covers all topics taught up to this point.',
  },
  {
    id: 'cal_0925',
    date: '2026-09-25',
    endDate: '2026-09-27',
    day: 'Friday',
    title: 'TEAM-ALPS for First Year MBA (Batch 1)',
    type: 'EVENT',
    description: 'Experiential leadership program at ALPS',
  },

  // ── OCTOBER 2026 ────────────────────────────────────────────
  {
    id: 'cal_1002',
    date: '2026-10-02',
    day: 'Friday',
    title: 'Holiday - Gandhi Jayanthi',
    type: 'HOLIDAY',
    isLongWeekend: true,
    longWeekendTag: '🌟 3-Day Weekend',
    description: 'National holiday on Friday • 3-day weekend (Fri–Sun)',
  },
  {
    id: 'cal_1005',
    date: '2026-10-05',
    endDate: '2026-10-08',
    day: 'Monday',
    title: 'Project Interim Review Week',
    type: 'ACADEMIC',
  },
  {
    id: 'cal_1009',
    date: '2026-10-09',
    day: 'Friday',
    title: 'Talent Night',
    type: 'EVENT',
    description: 'Annual cultural talent showcase',
  },
  {
    id: 'cal_1015',
    date: '2026-10-15',
    day: 'Thursday',
    title: 'Class Committee Meeting - II',
    type: 'ACADEMIC',
  },
  {
    id: 'cal_1019',
    date: '2026-10-19',
    endDate: '2026-10-20',
    day: 'Monday',
    title: 'Holiday - Saraswathi Pooja & Vijayadashami',
    type: 'HOLIDAY',
    isLongWeekend: true,
    longWeekendTag: '🔥 4-Day Mega Weekend',
    description: 'Monday & Tuesday official holiday = 4-Day vacation with 0 bunks! (Sat–Tue)',
  },
  {
    id: 'cal_1021',
    date: '2026-10-21',
    endDate: '2026-10-23',
    day: 'Wednesday',
    title: 'I MBA Project Interim Review & Presentation',
    type: 'EXAM',
    description: 'Interim project review and viva presentations for I Year MBA students.',
  },
  {
    id: 'cal_1023',
    date: '2026-10-23',
    endDate: '2026-10-25',
    day: 'Friday',
    title: 'TEAM-ALPS for First Year MBA (Batch 2)',
    type: 'EVENT',
  },
  {
    id: 'cal_1030',
    date: '2026-10-30',
    endDate: '2026-11-01',
    day: 'Friday',
    title: 'TEAM-ALPS for First Year MBA (Batch 3)',
    type: 'EVENT',
  },

  // ── NOVEMBER 2026 ───────────────────────────────────────────
  {
    id: 'cal_1106',
    date: '2026-11-06',
    day: 'Friday',
    title: 'Diwali Celebration in Manavar Illam',
    type: 'EVENT',
  },
  {
    id: 'cal_1108',
    date: '2026-11-08',
    day: 'Sunday',
    title: 'Holiday - Diwali (Deepavali)',
    type: 'HOLIDAY',
  },
  {
    id: 'cal_1112',
    date: '2026-11-12',
    day: 'Thursday',
    title: 'Class Committee Meeting - III',
    type: 'ACADEMIC',
  },
  {
    id: 'cal_1113',
    date: '2026-11-13',
    endDate: '2026-11-15',
    day: 'Friday',
    title: 'TEAM-ALPS for First Year MBA ISW',
    type: 'EVENT',
  },
  {
    id: 'cal_1120',
    date: '2026-11-20',
    day: 'Friday',
    title: 'I MBA — Social Sensitization for Managers (SSM) Viva',
    type: 'EXAM',
    description: 'Mandatory SSM course viva-voce for all I Year MBA students. Prepare your reflection journal and field visit report.',
  },
  {
    id: 'cal_1127',
    date: '2026-11-27',
    day: 'Friday',
    title: 'Last Working Day (Semester 1)',
    type: 'ACADEMIC',
    description: 'Final day for Semester 1 attendance cut-off',
  },
  {
    id: 'cal_1130',
    date: '2026-11-30',
    day: 'Monday',
    title: 'I MBA End Semester Examinations — Semester 1',
    type: 'EXAM',
    description: 'Autonomous End Semester Theory & Lab Exams for all Sem 1 subjects. Minimum 75% attendance required to be eligible.',
  },

  // ── DECEMBER 2026 ───────────────────────────────────────────
  {
    id: 'cal_1207',
    date: '2026-12-07',
    day: 'Monday',
    title: 'Semester II Classes Commence',
    type: 'ACADEMIC',
    description: 'Term 2 / Semester II begins for I Year MBA',
  },
  {
    id: 'cal_1217',
    date: '2026-12-17',
    endDate: '2026-12-19',
    day: 'Thursday',
    title: 'AIMS Convention / Rapport',
    type: 'EVENT',
  },
  {
    id: 'cal_1225',
    date: '2026-12-25',
    day: 'Friday',
    title: 'Holiday - Christmas',
    type: 'HOLIDAY',
    isLongWeekend: true,
    longWeekendTag: '🌟 3-Day Weekend',
    description: 'Friday holiday creates an automatic 3-day weekend (Fri–Sun)',
  },

  // ── JANUARY 2027 ────────────────────────────────────────────
  {
    id: 'cal_0101',
    date: '2027-01-01',
    day: 'Friday',
    title: 'Holiday - New Year 2027',
    type: 'HOLIDAY',
    isLongWeekend: true,
    longWeekendTag: '🌟 3-Day Weekend',
    description: 'Welcome 2027! 3-day weekend (Fri–Sun)',
  },
  {
    id: 'cal_0108',
    date: '2027-01-08',
    day: 'Friday',
    title: 'Class Committee Meeting - I (Semester 2)',
    type: 'ACADEMIC',
  },
  {
    id: 'cal_0115',
    date: '2027-01-15',
    endDate: '2027-01-17',
    day: 'Friday',
    title: 'Holiday - Pongal, Thiruvalluvar Day & Uzhavar Thirunal',
    type: 'HOLIDAY',
    isLongWeekend: true,
    longWeekendTag: '🌾 3-Day Harvest Break',
    description: 'Harvest festival holidays across Friday, Saturday & Sunday',
  },
  {
    id: 'cal_0118',
    date: '2027-01-18',
    endDate: '2027-01-20',
    day: 'Monday',
    title: 'I MBA Mid Term Examination — Semester 2',
    type: 'EXAM',
    description: 'Internal assessment exams for all Sem 2 subjects. Attendance is mandatory.',
  },
  {
    id: 'cal_0122',
    date: '2027-01-22',
    endDate: '2027-01-23',
    day: 'Friday',
    title: 'Srijana 2026 Management Fest',
    type: 'EVENT',
    description: 'Flagship national management festival',
  },
  {
    id: 'cal_0126',
    date: '2027-01-26',
    day: 'Tuesday',
    title: 'Holiday - Republic Day',
    type: 'HOLIDAY',
    isLongWeekend: true,
    longWeekendTag: '💡 4-Day Trip Opportunity',
    recommendedSmartLeave: 'Bunk Monday (Jan 25) to enjoy 4 consecutive days (Sat–Tue)!',
    description: 'Tuesday holiday. Bunking Monday turns it into a 4-day mini vacation.',
  },

  // ── FEBRUARY 2027 ───────────────────────────────────────────
  {
    id: 'cal_0202',
    date: '2027-02-02',
    day: 'Tuesday',
    title: 'C.R. Swaminathan Endowment Lecture',
    type: 'EVENT',
  },
  {
    id: 'cal_0214',
    date: '2027-02-14',
    endDate: '2027-02-28',
    day: 'Sunday',
    title: 'Global Immersion Program (GIP)',
    type: 'EVENT',
    description: '2-week international study & business tour immersion',
  },

  // ── MARCH 2027 ──────────────────────────────────────────────
  {
    id: 'cal_0303',
    date: '2027-03-03',
    endDate: '2027-03-05',
    day: 'Wednesday',
    title: 'AIMA NSMG 2027 National Simulation Games',
    type: 'EVENT',
  },
  {
    id: 'cal_0308',
    date: '2027-03-08',
    day: 'Monday',
    title: "International Women's Day 2027",
    type: 'EVENT',
  },
  {
    id: 'cal_0310',
    date: '2027-03-10',
    day: 'Wednesday',
    title: 'Holiday - Ramzan (Eid-ul-Fitr)',
    type: 'HOLIDAY',
  },
  {
    id: 'cal_0312',
    date: '2027-03-12',
    day: 'Friday',
    title: 'Annual Day 2027 Celebration',
    type: 'EVENT',
  },
  {
    id: 'cal_0326',
    date: '2027-03-26',
    day: 'Friday',
    title: 'Holiday - Good Friday',
    type: 'HOLIDAY',
    isLongWeekend: true,
    longWeekendTag: '🌟 3-Day Weekend',
    description: 'Friday holiday creates an automatic 3-day weekend (Fri–Sun)',
  },

  // ── APRIL 2027 ──────────────────────────────────────────────
  {
    id: 'cal_0407',
    date: '2027-04-07',
    day: 'Wednesday',
    title: 'Holiday - Telugu New Year (Ugadi)',
    type: 'HOLIDAY',
  },
  {
    id: 'cal_0408',
    date: '2027-04-08',
    day: 'Thursday',
    title: 'I MBA — Business Immersion Program (BIP) Viva',
    type: 'EXAM',
    description: 'Viva-voce for the Business Immersion Project. Present your industry findings, learnings, and management insights.',
  },
  {
    id: 'cal_0414',
    date: '2027-04-14',
    day: 'Wednesday',
    title: 'Holiday - Tamil New Year / Dr. B.R. Ambedkar Jayanthi',
    type: 'HOLIDAY',
  },
  {
    id: 'cal_0416',
    date: '2027-04-16',
    day: 'Friday',
    title: 'Last Working Day (Semester 2)',
    type: 'ACADEMIC',
    description: 'Final attendance cut-off for Year 1',
  },
  {
    id: 'cal_0419',
    date: '2027-04-19',
    day: 'Monday',
    title: 'Holiday - Mahaveer Jayanthi',
    type: 'HOLIDAY',
    isLongWeekend: true,
    longWeekendTag: '🌟 3-Day Weekend',
    description: 'Monday holiday creates an automatic 3-day weekend (Sat–Mon)',
  },
  {
    id: 'cal_0420',
    date: '2027-04-20',
    day: 'Tuesday',
    title: 'I MBA End Semester Examinations — Semester 2',
    type: 'EXAM',
    description: 'Final Year-1 university exams. Minimum 75% attendance required across all subjects to be eligible to appear.',
  },

  // ── MAY 2027 ────────────────────────────────────────────────
  {
    id: 'cal_0501',
    date: '2027-05-01',
    day: 'Saturday',
    title: 'Holiday - May Day',
    type: 'HOLIDAY',
  },
  {
    id: 'cal_0503',
    date: '2027-05-03',
    day: 'Monday',
    title: 'I MBA Summer Internship (SIP) Begins',
    type: 'ACADEMIC',
    description: '8-week corporate summer internship commences',
  },
];

/**
 * Returns the next upcoming holiday relative to today's date
 */
export function getNextHoliday(referenceDateStr?: string): {
  holiday: AcademicCalendarItem;
  daysRemaining: number;
} | null {
  const today = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const todayStr = today.toISOString().split('T')[0];

  const upcomingHolidays = ACADEMIC_CALENDAR.filter(
    (item) => item.type === 'HOLIDAY' && item.date >= todayStr
  ).sort((a, b) => a.date.localeCompare(b.date));

  if (upcomingHolidays.length === 0) return null;

  const next = upcomingHolidays[0];
  const targetDate = new Date(next.date);
  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return { holiday: next, daysRemaining };
}

export type SmartLeaveType =
  | 'FULL_DAY'
  | 'FORENOON_HALF_DAY'
  | 'AFTERNOON_HALF_DAY'
  | 'NOT_RECOMMENDED'
  | 'GENERAL_BRIDGE';

export interface SubjectLeaveStatus {
  subjectId: string;
  subjectName: string;
  code: string;
  session: 'FN' | 'AN';
  sessionLabel: string;
  timeSlot: string;
  slotHours: number;
  room?: string;
  attended: number;
  total: number;
  percentage: number;
  safeBunks: number;
  isSafe: boolean;
}

export interface SmartLeaveOption {
  day: string;
  date: string;
  optionLabel: string; // e.g. "BRIDGE AFTER HOLIDAY" or "BRIDGE BEFORE HOLIDAY"
  leaveType: SmartLeaveType;
  statusBadge: string;
  statusBadgeColor: string;
  statusBadgeBg: string;
  headline: string;
  reason: string;
  vacationDays: number; // e.g. 4 or 5
  subjectBreakdown: SubjectLeaveStatus[];
  fnSafe: boolean;
  anSafe: boolean;
  hasSlots: boolean;
}

export interface SmartTripSuggestion {
  tripTitle: string;
  suggestedLeaves: SmartLeaveOption[];
  totalDaysOff: number;
  explanation: string;
  hasPersonalizedAttendance: boolean;
}

function evaluateBridgeDay(
  dayName: string,
  dateStr: string,
  optionLabel: string,
  vacationDays: number,
  subjects: Subject[] = [],
  timetable: TimetableSlot[] = []
): SmartLeaveOption {
  const daySlots = timetable
    .filter((slot) => slot.day.toLowerCase() === dayName.toLowerCase())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (daySlots.length === 0 || subjects.length === 0) {
    return {
      day: dayName,
      date: dateStr,
      optionLabel,
      leaveType: 'GENERAL_BRIDGE',
      statusBadge: '🌴 BRIDGE DAY OPPORTUNITY',
      statusBadgeColor: '#38BDF8',
      statusBadgeBg: 'rgba(56, 189, 248, 0.15)',
      headline: `Take ${dayName} Off → ${vacationDays}-Day Vacation!`,
      reason: `Taking ${dayName} (${dateStr}) off connects your holiday schedule into a ${vacationDays}-day extended vacation! Check your attendance buffer before taking leave.`,
      vacationDays,
      subjectBreakdown: [],
      fnSafe: true,
      anSafe: true,
      hasSlots: false,
    };
  }

  // Parse each slot into SubjectLeaveStatus with exact academic hours
  const parsedSlots: SubjectLeaveStatus[] = daySlots.map((slot) => {
    const sub = subjects.find((s) => s.id === slot.subjectId) || {
      id: slot.subjectId,
      name: slot.subjectId,
      code: slot.subjectId,
      attended: 0,
      total: 0,
      hasMedicalClaim: false,
      standardTarget: 75,
      medicalTarget: 65,
      color: '#38BDF8',
      officialAttended: 0,
      officialTotal: 0,
    };

    const metrics = calculateAttendanceMetrics(
      sub.attended,
      sub.total,
      sub.hasMedicalClaim,
      sub.standardTarget,
      sub.medicalTarget
    );

    const [h] = slot.startTime.split(':').map(Number);
    const isFN = (h || 0) < 13;
    const session = isFN ? 'FN' : 'AN';
    const sessionLabel = isFN ? '🌅 Forenoon' : '🌇 Afternoon';
    const slotHours = getSlotHours(slot);

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      code: sub.code || sub.id,
      session,
      sessionLabel,
      timeSlot: `${slot.startTime} – ${slot.endTime} (${slotHours} hrs)`,
      slotHours,
      room: slot.room,
      attended: sub.attended,
      total: sub.total,
      percentage: metrics.percentage,
      safeBunks: metrics.safeBunksAt75,
      isSafe: metrics.safeBunksAt75 >= slotHours,
    };
  });

  const fnSlots = parsedSlots.filter((s) => s.session === 'FN');
  const anSlots = parsedSlots.filter((s) => s.session === 'AN');

  // Sum required hours per subject in FN, AN, and whole day
  const fnHoursBySubject: Record<string, number> = {};
  fnSlots.forEach((s) => {
    fnHoursBySubject[s.subjectId] = (fnHoursBySubject[s.subjectId] || 0) + s.slotHours;
  });

  const anHoursBySubject: Record<string, number> = {};
  anSlots.forEach((s) => {
    anHoursBySubject[s.subjectId] = (anHoursBySubject[s.subjectId] || 0) + s.slotHours;
  });

  const dayHoursBySubject: Record<string, number> = {};
  parsedSlots.forEach((s) => {
    dayHoursBySubject[s.subjectId] = (dayHoursBySubject[s.subjectId] || 0) + s.slotHours;
  });

  // Forenoon is safe if every FN subject has safeBunks >= total FN hours of that subject
  const fnSafe = fnSlots.length === 0 || fnSlots.every((s) => s.safeBunks >= (fnHoursBySubject[s.subjectId] || 1));
  // Afternoon is safe if every AN subject has safeBunks >= total AN hours of that subject
  const anSafe = anSlots.length === 0 || anSlots.every((s) => s.safeBunks >= (anHoursBySubject[s.subjectId] || 1));
  // Full day safe if all subjects have safeBunks >= total day hours of that subject
  const fullDaySafe = parsedSlots.every((s) => s.safeBunks >= (dayHoursBySubject[s.subjectId] || 1));

  let leaveType: SmartLeaveType;
  let statusBadge = '';
  let statusBadgeColor = '#10B981';
  let statusBadgeBg = 'rgba(16, 185, 129, 0.15)';
  let headline = '';
  let reason = '';

  const formatList = (items: SubjectLeaveStatus[]) =>
    items.map((i) => `${i.code}: +${i.safeBunks} safe hrs`).join(', ');

  const formatUnsafe = (items: SubjectLeaveStatus[]) =>
    items.filter((i) => !i.isSafe).map((i) => `${i.code} (${i.percentage}%, buffer: +${i.safeBunks}h vs ${i.slotHours}h)`).join(', ');

  if (fullDaySafe) {
    leaveType = 'FULL_DAY';
    statusBadge = '🌟 FULL DAY LEAVE RECOMMENDED';
    statusBadgeColor = '#10B981';
    statusBadgeBg = 'rgba(16, 185, 129, 0.15)';
    headline = `Take Full Day ${dayName} Off → ${vacationDays}-Day Mega Vacation!`;
    reason = `You have surplus attendance hours in all ${dayName} subjects (${formatList(parsedSlots)}). You can safely miss all scheduled hours to enjoy a ${vacationDays}-day vacation without dropping below 75%!`;
  } else if (fnSafe && !anSafe) {
    leaveType = 'FORENOON_HALF_DAY';
    statusBadge = '🌗 FORENOON HALF-DAY LEAVE RECOMMENDED';
    statusBadgeColor = '#38BDF8';
    statusBadgeBg = 'rgba(56, 189, 248, 0.15)';
    headline = `Take Forenoon Half-Day Leave on ${dayName}`;
    reason = `You have surplus buffer in your morning classes (${formatList(fnSlots)}), but afternoon class ${formatUnsafe(anSlots)} does not have enough safe hours. We recommend taking the forenoon off and attending afternoon classes to keep your attendance safe!`;
  } else if (!fnSafe && anSafe) {
    leaveType = 'AFTERNOON_HALF_DAY';
    statusBadge = '🌓 AFTERNOON HALF-DAY LEAVE RECOMMENDED';
    statusBadgeColor = '#A855F7';
    statusBadgeBg = 'rgba(168, 85, 247, 0.15)';
    headline = `Take Afternoon Half-Day Leave on ${dayName}`;
    reason = `Your morning subjects (${formatUnsafe(fnSlots)}) are tight, but you have surplus attendance in afternoon classes (${formatList(anSlots)}). Attend the morning classes and take the afternoon off!`;
  } else {
    leaveType = 'NOT_RECOMMENDED';
    statusBadge = '⚠️ LEAVE NOT RECOMMENDED (ATTEND CLASSES)';
    statusBadgeColor = '#EF4444';
    statusBadgeBg = 'rgba(239, 68, 68, 0.15)';
    headline = `Attend All Classes on ${dayName}`;
    reason = `Attendance buffer is insufficient in (${formatUnsafe(parsedSlots)}). Missing these hours on ${dayName} risks pushing your attendance below the mandatory 75% limit. Attending all classes is strongly advised.`;
  }


  return {
    day: dayName,
    date: dateStr,
    optionLabel,
    leaveType,
    statusBadge,
    statusBadgeColor,
    statusBadgeBg,
    headline,
    reason,
    vacationDays,
    subjectBreakdown: parsedSlots,
    fnSafe,
    anSafe,
    hasSlots: true,
  };
}

/**
 * Computes an intelligent leave suggestion for an individual holiday,
 * taking into account the student's timetable and real-time subject attendance surplus.
 */
export function getHolidaySmartTripSuggestion(
  item: AcademicCalendarItem,
  subjects: Subject[] = [],
  timetable: TimetableSlot[] = []
): SmartTripSuggestion | null {
  if (item.type !== 'HOLIDAY') return null;

  const startObj = new Date(item.date + 'T00:00:00');
  const endObj = new Date((item.endDate || item.date) + 'T00:00:00');
  const startDay = startObj.getDay(); // 0: Sun, 1: Mon, ... 6: Sat
  const endDay = endObj.getDay();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const formatDateHelper = (baseDate: Date, offsetDays: number) => {
    const target = new Date(baseDate);
    target.setDate(target.getDate() + offsetDays);
    return {
      dateStr: `${target.getDate()} ${months[target.getMonth()]}`,
      dayName: dayNames[target.getDay()],
    };
  };

  const hasPersonalizedAttendance = subjects.length > 0 && timetable.length > 0;
  const suggestedLeaves: SmartLeaveOption[] = [];

  // 1. Multi-Day Holiday ending on Tuesday (e.g. Saraswathi Pooja & Vijayadashami: Mon 19 - Tue 20 Oct)
  if (startDay === 1 && endDay === 2) {
    // Day after: Wednesday
    const wed = formatDateHelper(endObj, 1);
    suggestedLeaves.push(
      evaluateBridgeDay('Wednesday', wed.dateStr, 'OPTION 1 • AFTER HOLIDAY', 5, subjects, timetable)
    );

    // Day before: Friday (preceding the weekend)
    const fri = formatDateHelper(startObj, -3);
    suggestedLeaves.push(
      evaluateBridgeDay('Friday', fri.dateStr, 'OPTION 2 • BEFORE HOLIDAY', 5, subjects, timetable)
    );

    return {
      tripTitle: '🔥 5-Day Mega Vacation Optimizer',
      suggestedLeaves,
      totalDaysOff: 5,
      explanation: `Since ${item.title} covers Monday & Tuesday (4-day weekend with Sat–Tue), bridging Wednesday or the preceding Friday unlocks a massive 5-day holiday trip!`,
      hasPersonalizedAttendance,
    };
  }

  // 2. Friday Holiday (e.g. Christmas on Friday 25 Dec, Gandhi Jayanti)
  if (startDay === 5) {
    // Day before: Thursday
    const thu = formatDateHelper(startObj, -1);
    suggestedLeaves.push(
      evaluateBridgeDay('Thursday', thu.dateStr, 'OPTION 1 • BEFORE HOLIDAY', 4, subjects, timetable)
    );

    // Day after: Monday
    const mon = formatDateHelper(endObj, 3);
    suggestedLeaves.push(
      evaluateBridgeDay('Monday', mon.dateStr, 'OPTION 2 • AFTER HOLIDAY', 4, subjects, timetable)
    );

    return {
      tripTitle: '🌟 Long Weekend Vacation Optimizer',
      suggestedLeaves,
      totalDaysOff: 4,
      explanation: `Since ${item.title} is on a Friday, take Thursday or Monday off to transform your standard 3-day weekend into an uninterrupted 4-day trip!`,
      hasPersonalizedAttendance,
    };
  }

  // 3. Monday Holiday
  if (startDay === 1) {
    // Day before: Friday
    const fri = formatDateHelper(startObj, -3);
    suggestedLeaves.push(
      evaluateBridgeDay('Friday', fri.dateStr, 'OPTION 1 • BEFORE HOLIDAY', 4, subjects, timetable)
    );

    // Day after: Tuesday
    const tue = formatDateHelper(endObj, 1);
    suggestedLeaves.push(
      evaluateBridgeDay('Tuesday', tue.dateStr, 'OPTION 2 • AFTER HOLIDAY', 4, subjects, timetable)
    );

    return {
      tripTitle: '🌟 Long Weekend Vacation Optimizer',
      suggestedLeaves,
      totalDaysOff: 4,
      explanation: `Since ${item.title} is on a Monday, take Friday or Tuesday off to unlock an easy 4-day vacation!`,
      hasPersonalizedAttendance,
    };
  }

  // 4. Thursday Holiday
  if (startDay === 4) {
    // Day after: Friday
    const fri = formatDateHelper(endObj, 1);
    suggestedLeaves.push(
      evaluateBridgeDay('Friday', fri.dateStr, 'OPTION 1 • AFTER HOLIDAY', 4, subjects, timetable)
    );

    // Day before: Wednesday
    const wed = formatDateHelper(startObj, -1);
    suggestedLeaves.push(
      evaluateBridgeDay('Wednesday', wed.dateStr, 'OPTION 2 • BEFORE HOLIDAY', 3, subjects, timetable)
    );

    return {
      tripTitle: '🚀 4-Day Golden Weekend Opportunity',
      suggestedLeaves,
      totalDaysOff: 4,
      explanation: `A single smart bunk/leave on Friday (${fri.dateStr}) connects Thursday's holiday to Saturday & Sunday for a 4-day getaway!`,
      hasPersonalizedAttendance,
    };
  }

  // 5. Tuesday Holiday (single day)
  if (startDay === 2 && endDay === 2) {
    // Day before: Monday
    const mon = formatDateHelper(startObj, -1);
    suggestedLeaves.push(
      evaluateBridgeDay('Monday', mon.dateStr, 'OPTION 1 • BEFORE HOLIDAY', 4, subjects, timetable)
    );

    // Day after: Wednesday
    const wed = formatDateHelper(endObj, 1);
    suggestedLeaves.push(
      evaluateBridgeDay('Wednesday', wed.dateStr, 'OPTION 2 • AFTER HOLIDAY', 3, subjects, timetable)
    );

    return {
      tripTitle: '🚀 4-Day Golden Weekend Opportunity',
      suggestedLeaves,
      totalDaysOff: 4,
      explanation: `Taking Monday (${mon.dateStr}) off bridges the weekend into Tuesday holiday for 4 full days off!`,
      hasPersonalizedAttendance,
    };
  }

  // 6. Wednesday Holiday
  if (startDay === 3) {
    const thu = formatDateHelper(endObj, 1);
    suggestedLeaves.push(
      evaluateBridgeDay('Thursday', thu.dateStr, 'OPTION 1 • THURSDAY BRIDGE', 4, subjects, timetable)
    );

    const tue = formatDateHelper(startObj, -1);
    suggestedLeaves.push(
      evaluateBridgeDay('Tuesday', tue.dateStr, 'OPTION 2 • TUESDAY BRIDGE', 4, subjects, timetable)
    );

    return {
      tripTitle: '🌴 Mid-Week Break Optimizer',
      suggestedLeaves,
      totalDaysOff: 4,
      explanation: `Wednesday holiday splits the week nicely. Taking Thursday or Tuesday off gives you a long weekend opportunity!`,
      hasPersonalizedAttendance,
    };
  }

  // 7. Weekend Holiday (Saturday or Sunday)
  const fri = formatDateHelper(startObj, startDay === 6 ? -1 : -2);
  const mon = formatDateHelper(endObj, endDay === 0 ? 1 : 2);
  suggestedLeaves.push(
    evaluateBridgeDay('Friday', fri.dateStr, 'OPTION 1 • FRIDAY OFF', 3, subjects, timetable)
  );
  suggestedLeaves.push(
    evaluateBridgeDay('Monday', mon.dateStr, 'OPTION 2 • MONDAY OFF', 3, subjects, timetable)
  );

  return {
    tripTitle: '🏖️ Weekend Holiday Optimizer',
    suggestedLeaves,
    totalDaysOff: 3,
    explanation: `${item.title} falls on a weekend (${item.day}). Take Friday or Monday off to create a classic 3-day long weekend!`,
    hasPersonalizedAttendance,
  };
}

export interface ExpectedMakeupClass {
  subjectId: string;
  subjectName: string;
  code: string;
  hours: number;
  originalTime: string;
}

export interface WeekdayHolidayNotification {
  holiday: AcademicCalendarItem;
  daysRemaining: number;
  message: string;
  accountingNote: string;
  expectedMakeupClasses: ExpectedMakeupClass[];
  totalExpectedHours: number;
}

/**
 * Returns upcoming weekday holidays occurring within 7 days (a week ago).
 * Strictly excludes weekend holidays (Saturday and Sunday - NO notification).
 * Explicitly calculates how many classes and hours are expected to be rescheduled after college hours.
 */
export function getUpcomingWeekdayHolidayNotification(
  referenceDateStr?: string,
  timetable: TimetableSlot[] = [],
  subjects: Subject[] = []
): WeekdayHolidayNotification | null {
  const today = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Strictly filter for weekday holidays only (exclude Saturday & Sunday)
  const upcomingWeekdayHolidays = ACADEMIC_CALENDAR.filter((item) => {
    if (item.type !== 'HOLIDAY') return false;
    const day = item.day.trim().toLowerCase();
    const isWeekend = day === 'saturday' || day === 'sunday';
    if (isWeekend) return false; // Strictly NO notification for weekend holidays
    return item.date >= todayStr;
  }).sort((a, b) => a.date.localeCompare(b.date));

  if (upcomingWeekdayHolidays.length === 0) return null;

  const next = upcomingWeekdayHolidays[0];
  const targetDate = new Date(next.date + 'T00:00:00');
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffTime = targetDate.getTime() - todayMidnight.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Send notification a week ago (within 7 days)
  if (daysRemaining <= 7) {
    const countdownText =
      daysRemaining === 0
        ? 'Today is a weekday holiday!'
        : daysRemaining === 1
        ? 'Tomorrow is a weekday holiday!'
        : `Upcoming weekday holiday in ${daysRemaining} days (${next.day})!`;

    // Calculate which classes are missed on this holiday day from timetable
    const holidayDayName = next.day.trim().toLowerCase();
    const missedSlots = timetable.filter(
      (s) => s.day.toLowerCase() === holidayDayName
    );

    const expectedMakeupClasses: ExpectedMakeupClass[] = [];
    let totalExpectedHours = 0;

    missedSlots.forEach((slot) => {
      const sub = subjects.find((s) => s.id === slot.subjectId);
      const hours = getSlotHours(slot);
      totalExpectedHours += hours;
      expectedMakeupClasses.push({
        subjectId: slot.subjectId,
        subjectName: sub?.name || 'Class',
        code: sub?.code || 'COURSE',
        hours,
        originalTime: `${slot.startTime} - ${slot.endTime}`,
      });
    });

    return {
      holiday: next,
      daysRemaining,
      message: `${countdownText} ${next.title}`,
      accountingNote: 'This holiday is accounted in your academic calendar.',
      expectedMakeupClasses,
      totalExpectedHours,
    };
  }

  return null;
}

