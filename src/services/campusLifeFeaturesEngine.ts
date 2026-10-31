/**
 * CampusLifeFeaturesEngine
 * 
 * Implements Features #004, #005, #006, #011:
 * - #004: Canteen Rush Radar (Predictive queue traffic based on timetable bell schedules)
 * - #005: Faculty Office Hours Booking
 * - #006: Batch Syllabus Velocity Tracker (Compares syllabus sessions taught vs remaining weeks)
 * - #011: Library Book Renewal & Overdue Shield
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { OFFICIAL_COURSE_PLANS } from '../data/coursePlanData';

export interface CanteenRushStatus {
  currentCrowdLevel: 'LOW' | 'MODERATE' | 'PEAK' | 'CLOSED';
  crowdPercentage: number; // 0 - 100%
  statusMessage: string;
  recommendedTime: string;
  nextRushHour: string;
}

export interface FacultyOfficeHourSlot {
  id: string;
  facultyName: string;
  subjectCode: string;
  subjectName: string;
  day: string;
  timing: string;
  cabin: string;
  isAvailable: boolean;
}

export interface SyllabusVelocity {
  subjectCode: string;
  subjectTitle: string;
  totalPlannedSessions: number;
  completedSessions: number;
  remainingSessions: number;
  weeksRemaining: number;
  velocityStatus: 'ON_TRACK' | 'SLIGHTLY_BEHIND' | 'ACCELERATED';
  completionPercentage: number;
  expectedPacePerWeek: number;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  accessionNo: string;
  borrowedDate: string;
  dueDate: string;
  daysRemaining: number;
  isOverdue: boolean;
  fineAmountInr: number;
  canRenewOnline: boolean;
}

const STORAGE_KEYS = {
  FACULTY_BOOKINGS: '@psgim_faculty_office_bookings',
  LIBRARY_BOOKS: '@psgim_library_borrowed_books',
};

export const CampusLifeFeaturesEngine = {
  /**
   * #004: Predicts Canteen & Cafeteria crowd levels based on PSGIM bell schedules.
   * Peak times:
   * - 10:20 - 10:40 AM (Morning tea break)
   * - 12:30 - 01:40 PM (Lunch break)
   * - 04:35 - 05:30 PM (Evening dispersal)
   */
  getCanteenRushStatus(currentDate: Date = new Date()): CanteenRushStatus {
    const hours = currentDate.getHours();
    const mins = currentDate.getMinutes();
    const timeMins = hours * 60 + mins;

    // College hours: 08:00 AM (480) to 06:30 PM (1110)
    if (timeMins < 480 || timeMins > 1110) {
      return {
        currentCrowdLevel: 'CLOSED',
        crowdPercentage: 0,
        statusMessage: 'Canteen is currently closed. Opens at 08:00 AM.',
        recommendedTime: 'Morning Tea: 09:30 AM',
        nextRushHour: 'Morning Break at 10:20 AM',
      };
    }

    // Morning Break (10:20 - 10:40) = 620 to 640
    if (timeMins >= 615 && timeMins <= 645) {
      return {
        currentCrowdLevel: 'PEAK',
        crowdPercentage: 95,
        statusMessage: 'Peak rush! Morning tea break in progress across all batches.',
        recommendedTime: 'Visit after 10:45 AM',
        nextRushHour: 'Lunch at 12:30 PM',
      };
    }

    // Lunch Break (12:30 - 01:40) = 750 to 820
    if (timeMins >= 745 && timeMins <= 825) {
      return {
        currentCrowdLevel: 'PEAK',
        crowdPercentage: 98,
        statusMessage: 'Maximum rush! MBA lunch break is active.',
        recommendedTime: 'Visit at 01:15 PM or take-away counter',
        nextRushHour: 'Evening tea at 04:35 PM',
      };
    }

    // Pre-lunch / mid-morning (10:45 - 12:15)
    if (timeMins > 645 && timeMins < 745) {
      return {
        currentCrowdLevel: 'LOW',
        crowdPercentage: 20,
        statusMessage: 'Smooth sailing! Very light queue, all counters free.',
        recommendedTime: 'Right now is ideal!',
        nextRushHour: 'Lunch at 12:30 PM',
      };
    }

    // Afternoon lecture hours (01:40 - 04:30)
    if (timeMins > 825 && timeMins < 995) {
      return {
        currentCrowdLevel: 'LOW',
        crowdPercentage: 25,
        statusMessage: 'Peaceful ambience. Snacks and cold beverages readily available.',
        recommendedTime: 'Right now before 04:35 PM bell',
        nextRushHour: 'Evening dispersal at 04:35 PM',
      };
    }

    // Evening Dispersal (04:35 - 05:30)
    return {
      currentCrowdLevel: 'MODERATE',
      crowdPercentage: 65,
      statusMessage: 'Moderate crowd grabbing evening snacks after final lecture.',
      recommendedTime: 'Grab quick snack or coffee',
      nextRushHour: 'Closing at 06:30 PM',
    };
  },

  /**
   * #005: Faculty Office Hours Directory & Slot Booking
   */
  getFacultyOfficeSlots(): FacultyOfficeHourSlot[] {
    return [
      {
        id: 'slot_fac_01',
        facultyName: 'Dr. M. Kirupa Priyadarshini',
        subjectCode: '24GM11',
        subjectName: 'Management Concepts & Org Behaviour',
        day: 'Tuesday & Thursday',
        timing: '03:40 PM - 04:30 PM',
        cabin: 'Faculty Block 2nd Floor, Cabin 204',
        isAvailable: true,
      },
      {
        id: 'slot_fac_02',
        facultyName: 'Dr. J. Sekkizhar',
        subjectCode: '24GM14',
        subjectName: 'Business Statistics',
        day: 'Monday & Wednesday',
        timing: '12:30 PM - 01:15 PM',
        cabin: 'Faculty Block 1st Floor, Cabin 108',
        isAvailable: true,
      },
      {
        id: 'slot_fac_03',
        facultyName: 'Dr. D. Kavitha',
        subjectCode: '24GM13',
        subjectName: 'Accounting for Decision Making',
        day: 'Friday',
        timing: '02:00 PM - 03:00 PM',
        cabin: 'Faculty Block 2nd Floor, Cabin 212',
        isAvailable: true,
      },
      {
        id: 'slot_fac_04',
        facultyName: 'Dr. Sreeanandan',
        subjectCode: '24GM12',
        subjectName: 'Economics for Decision Making',
        day: 'Wednesday',
        timing: '03:40 PM - 04:30 PM',
        cabin: 'Faculty Block 3rd Floor, Cabin 305',
        isAvailable: true,
      },
    ];
  },

  /**
   * #006: Batch Syllabus Velocity Tracker
   * Evaluates syllabus progress towards the Nov 27 cut-off date.
   */
  getSyllabusVelocitySummary(todayDateStr: string = '2026-10-31'): SyllabusVelocity[] {
    // Cut-off date is Nov 27, 2026 (approx 4 weeks from Oct 31)
    const weeksRemaining = 4;

    const courseCodes = ['24GM14', '24GM13', '24GM11', '24GM12'];
    const mockTaughtSessions: Record<string, number> = {
      '24GM14': 24, // 24 of 30 taught
      '24GM13': 22, // 22 of 28 taught
      '24GM11': 23, // 23 of 30 taught
      '24GM12': 21, // 21 of 28 taught
    };

    return courseCodes.map((code) => {
      const plan = OFFICIAL_COURSE_PLANS[code];
      const totalPlanned = plan?.sessions?.length || 30;
      const completed = mockTaughtSessions[code] || 22;
      const remaining = Math.max(0, totalPlanned - completed);
      const completionPct = Math.round((completed / totalPlanned) * 100);
      const paceNeeded = Number((remaining / weeksRemaining).toFixed(1));

      let velocityStatus: SyllabusVelocity['velocityStatus'] = 'ON_TRACK';
      if (completionPct < 70) {
        velocityStatus = 'SLIGHTLY_BEHIND';
      } else if (completionPct >= 80) {
        velocityStatus = 'ACCELERATED';
      }

      return {
        subjectCode: code,
        subjectTitle: plan?.subjectTitle || code,
        totalPlannedSessions: totalPlanned,
        completedSessions: completed,
        remainingSessions: remaining,
        weeksRemaining,
        velocityStatus,
        completionPercentage: completionPct,
        expectedPacePerWeek: paceNeeded,
      };
    });
  },

  /**
   * #011: Library Book Renewal & Overdue Shield
   */
  async getBorrowedLibraryBooks(): Promise<LibraryBook[]> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.LIBRARY_BOOKS);
      if (saved) return JSON.parse(saved);
    } catch {}

    const defaultBooks: LibraryBook[] = [
      {
        id: 'lib_01',
        title: 'Business Statistics for Contemporary Decision Making',
        author: 'Ken Black',
        accessionNo: 'PSGIM-LIB-84920',
        borrowedDate: '2026-10-18',
        dueDate: '2026-11-03',
        daysRemaining: 3,
        isOverdue: false,
        fineAmountInr: 0,
        canRenewOnline: true,
      },
      {
        id: 'lib_02',
        title: 'Organizational Behavior: Human Behavior at Work',
        author: 'John W. Newstrom',
        accessionNo: 'PSGIM-LIB-71204',
        borrowedDate: '2026-10-12',
        dueDate: '2026-11-01',
        daysRemaining: 1,
        isOverdue: false,
        fineAmountInr: 0,
        canRenewOnline: true,
      },
    ];

    await AsyncStorage.setItem(STORAGE_KEYS.LIBRARY_BOOKS, JSON.stringify(defaultBooks));
    return defaultBooks;
  },

  async renewBook(bookId: string): Promise<{ success: boolean; newDueDate: string }> {
    const books = await this.getBorrowedLibraryBooks();
    const updated = books.map((b) => {
      if (b.id === bookId) {
        const nextDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return {
          ...b,
          dueDate: nextDue,
          daysRemaining: 14,
          isOverdue: false,
        };
      }
      return b;
    });

    await AsyncStorage.setItem(STORAGE_KEYS.LIBRARY_BOOKS, JSON.stringify(updated));
    const renewed = updated.find((b) => b.id === bookId);
    return { success: true, newDueDate: renewed?.dueDate || 'In 14 days' };
  },
};
