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

export type CanteenId = 'MAIN' | 'ANNEX' | 'KIOSK';

export interface CanteenInfo {
  id: CanteenId;
  name: string;
  tagline: string;
  operatingHours: string;
  lunchWindow: string;
  hasBreakfast: boolean;
  specialties: string[];
}

export interface XeroxRushStatus {
  currentCrowdLevel: 'LOW' | 'MODERATE' | 'PEAK' | 'CLOSED';
  crowdPercentage: number;
  statusMessage: string;
  estimatedWaitMinutes: number;
  recommendedTime: string;
}

export interface XeroxPricingRates {
  bwSingle: number;
  bwDouble: number;
  colorSingle: number;
  spiralBinding: number;
  softFolder: number;
}

export const CANTEEN_LOCATIONS: Record<CanteenId, CanteenInfo> = {
  MAIN: {
    id: 'MAIN',
    name: 'Main IM Canteen & Cafeteria',
    tagline: 'Primary dining hall with full South Indian lunch & beverages',
    operatingHours: '08:30 AM - 06:00 PM',
    lunchWindow: '12:30 PM - 02:00 PM',
    hasBreakfast: false,
    specialties: ['Hot South Indian Meals', 'Variety Rice', 'Filter Coffee & Tea', 'Fresh Juices & Puffs'],
  },
  ANNEX: {
    id: 'ANNEX',
    name: 'Campus Annex / Food Court',
    tagline: 'Quick bites, sandwiches, evening snacks & chaat counter',
    operatingHours: '08:30 AM - 06:00 PM',
    lunchWindow: '12:30 PM - 02:00 PM',
    hasBreakfast: false,
    specialties: ['Grilled Sandwiches', 'Veg Rolls', 'Cool Drinks', 'Evening Samosas & Tea'],
  },
  KIOSK: {
    id: 'KIOSK',
    name: 'Coffee Kiosk / Refreshment Corner',
    tagline: 'Express hot beverages, biscuits, cool drinks & rapid pickup',
    operatingHours: '08:30 AM - 06:00 PM',
    lunchWindow: 'Beverages & Light Snacks Only',
    hasBreakfast: false,
    specialties: ['Express Filter Coffee', 'Masala Chai', 'Packaged Snacks', 'Cold Beverages'],
  },
};

export const DEFAULT_XEROX_RATES: XeroxPricingRates = {
  bwSingle: 1.5,
  bwDouble: 2.0,
  colorSingle: 10.0,
  spiralBinding: 25.0,
  softFolder: 10.0,
};

export const CampusLifeFeaturesEngine = {
  /**
   * #004: Predicts Canteen crowd levels based on PSGIM bell schedules.
   * Operating hours: 08:30 AM (510 mins) to 06:00 PM max (1080 mins).
   * Note: No breakfast served; Hot Lunch available 12:30 PM - 02:00 PM only.
   */
  getCanteenRushStatus(canteenId: CanteenId = 'MAIN', currentDate: Date = new Date()): CanteenRushStatus {
    const hours = currentDate.getHours();
    const mins = currentDate.getMinutes();
    const timeMins = hours * 60 + mins;

    // College hours: 08:30 AM (510) to 06:00 PM (1080)
    if (timeMins < 510 || timeMins > 1080) {
      return {
        currentCrowdLevel: 'CLOSED',
        crowdPercentage: 0,
        statusMessage: 'Canteen closed. Operating hours: 08:30 AM to 06:00 PM.',
        recommendedTime: 'Opens tomorrow at 08:30 AM',
        nextRushHour: 'Morning Break at 10:20 AM',
      };
    }

    // Morning Pre-Break (08:30 - 10:20) = 510 to 620
    if (timeMins >= 510 && timeMins < 620) {
      return {
        currentCrowdLevel: 'LOW',
        crowdPercentage: 25,
        statusMessage: 'Open for morning tea, filter coffee and fresh juices. No breakfast.',
        recommendedTime: 'Right now before 10:20 AM bell',
        nextRushHour: 'Morning Tea Break at 10:20 AM',
      };
    }

    // Morning Break (10:20 - 10:40) = 620 to 640
    if (timeMins >= 620 && timeMins <= 645) {
      return {
        currentCrowdLevel: 'PEAK',
        crowdPercentage: 95,
        statusMessage: 'Peak rush! Morning tea and juice break in progress across all batches.',
        recommendedTime: 'Visit after 10:45 AM',
        nextRushHour: 'Hot Lunch at 12:30 PM',
      };
    }

    // Pre-lunch lecture hours (10:45 - 12:30)
    if (timeMins > 645 && timeMins < 750) {
      return {
        currentCrowdLevel: 'LOW',
        crowdPercentage: 15,
        statusMessage: 'Counters completely free. Smooth service for coffee, tea and beverages.',
        recommendedTime: 'Right now is optimal!',
        nextRushHour: 'Hot Lunch begins at 12:30 PM',
      };
    }

    // Lunch Break (12:30 - 01:40) = 750 to 820
    if (timeMins >= 750 && timeMins <= 825) {
      return {
        currentCrowdLevel: 'PEAK',
        crowdPercentage: 98,
        statusMessage: 'Maximum rush! Hot lunch counters active across MBA sections.',
        recommendedTime: 'Visit at 01:15 PM for shorter token queue',
        nextRushHour: 'Evening tea at 04:35 PM',
      };
    }

    // Post-lunch / Afternoon lecture hours (01:40 - 04:30)
    if (timeMins > 825 && timeMins < 995) {
      return {
        currentCrowdLevel: 'LOW',
        crowdPercentage: 20,
        statusMessage: 'Calm and uncrowded. Cold beverages, fruit juices and quick snacks available.',
        recommendedTime: 'Right now before 04:35 PM bell',
        nextRushHour: 'Evening dispersal at 04:35 PM',
      };
    }

    // Evening Dispersal (04:35 - 05:30)
    if (timeMins >= 995 && timeMins <= 1050) {
      return {
        currentCrowdLevel: 'MODERATE',
        crowdPercentage: 65,
        statusMessage: 'Moderate crowd grabbing evening chai, samosas and snacks after class.',
        recommendedTime: 'Grab quick snack or coffee',
        nextRushHour: 'Closing countdown at 05:45 PM',
      };
    }

    // Closing Window (05:30 - 06:00)
    return {
      currentCrowdLevel: 'LOW',
      crowdPercentage: 30,
      statusMessage: 'Winding down. Parcel and beverage counters only before 06:00 PM closing.',
      recommendedTime: 'Place final orders now',
      nextRushHour: 'Closes at 06:00 PM sharp',
    };
  },

  /**
   * Xerox & Reprography Shop Rush Tracker
   * Timings: 08:30 AM to 06:00 PM
   */
  getXeroxRushStatus(currentDate: Date = new Date()): XeroxRushStatus {
    const hours = currentDate.getHours();
    const mins = currentDate.getMinutes();
    const timeMins = hours * 60 + mins;

    if (timeMins < 510 || timeMins > 1080) {
      return {
        currentCrowdLevel: 'CLOSED',
        crowdPercentage: 0,
        statusMessage: 'Xerox & Print Shop is closed. Opens at 08:30 AM.',
        estimatedWaitMinutes: 0,
        recommendedTime: 'Tomorrow morning 08:30 AM',
      };
    }

    // Pre-lecture morning print rush (08:30 - 09:05)
    if (timeMins >= 510 && timeMins <= 545) {
      return {
        currentCrowdLevel: 'PEAK',
        crowdPercentage: 90,
        statusMessage: 'Heavy morning rush! Students printing assignments before Period 1.',
        estimatedWaitMinutes: 12,
        recommendedTime: 'Free lecture periods (11:00 AM - 12:00 PM)',
      };
    }

    // Morning Break rush (10:20 - 10:45)
    if (timeMins >= 620 && timeMins <= 645) {
      return {
        currentCrowdLevel: 'PEAK',
        crowdPercentage: 85,
        statusMessage: 'Morning break rush for notes & case study prints.',
        estimatedWaitMinutes: 10,
        recommendedTime: 'After 10:45 AM during lecture hours',
      };
    }

    // Lunch rush (12:30 - 01:30)
    if (timeMins >= 750 && timeMins <= 810) {
      return {
        currentCrowdLevel: 'MODERATE',
        crowdPercentage: 60,
        statusMessage: 'Moderate queue. Project binding and photocopy jobs active.',
        estimatedWaitMinutes: 6,
        recommendedTime: '01:30 PM - 03:00 PM',
      };
    }

    // General lecture hours
    return {
      currentCrowdLevel: 'LOW',
      crowdPercentage: 20,
      statusMessage: 'Zero queue! Printers idle, instant printouts and binding available.',
      estimatedWaitMinutes: 2,
      recommendedTime: 'Right now for immediate collection',
    };
  },

  /**
   * Calculates print cost
   */
  calculatePrintCost(
    pages: number,
    copies: number,
    isColor: boolean,
    isDoubleSided: boolean,
    bindingType: 'NONE' | 'STAPLE' | 'SPIRAL' | 'FOLDER' = 'NONE',
    rates: XeroxPricingRates = DEFAULT_XEROX_RATES
  ): number {
    const safePages = Math.max(1, pages);
    const safeCopies = Math.max(1, copies);

    let perPageRate = rates.bwSingle;
    if (isColor) {
      perPageRate = rates.colorSingle;
    } else if (isDoubleSided) {
      perPageRate = rates.bwDouble / 2; // rate per page face
    }

    const printCost = safePages * perPageRate * safeCopies;
    let bindingCost = 0;
    if (bindingType === 'SPIRAL') bindingCost = rates.spiralBinding * safeCopies;
    if (bindingType === 'FOLDER') bindingCost = rates.softFolder * safeCopies;

    return Math.round((printCost + bindingCost) * 10) / 10;
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
