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
    id: 'cal_0720',
    date: '2026-07-20',
    day: 'Monday',
    title: 'Semester III Commences (II MBA)',
    type: 'ACADEMIC',
  },
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
    title: 'Mid Term Examination (Semester 1)',
    type: 'EXAM',
    description: 'Strict attendance required - Do not bunk',
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
    title: 'Mid Term Examination 2 (Integrated MBA / Reviews)',
    type: 'EXAM',
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
    title: 'Social Sensitization for Managers (SSM) Viva',
    type: 'EXAM',
    description: 'Mandatory course viva for I Year MBA',
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
    title: 'End Semester Examinations Begin (Sem 1)',
    type: 'EXAM',
    description: 'Autonomous End Semester Theory & Lab Exams',
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
    title: 'Mid Term Examination (Semester 2)',
    type: 'EXAM',
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
    title: 'Business Immersion Viva for I MBA',
    type: 'EXAM',
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
    title: 'Semester II End Examinations Begin',
    type: 'EXAM',
    description: 'Final Year-1 university exams',
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
  {
    id: 'cal_0515',
    date: '2027-05-15',
    day: 'Saturday',
    title: 'Commencement Ceremony (Graduation)',
    type: 'EVENT',
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
