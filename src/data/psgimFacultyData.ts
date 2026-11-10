// PSG Institute of Management - Faculty Directory & Master Timetable Resolver
// Comprehensive mapping of Professors, Official Emails, Courses, Batches & Hourly Class Lists

import { MASTER_SCHEDULE, MasterScheduleSlot, PSGIM_COURSES } from './psgimData';
import { PSGIM_MASTER_STUDENTS, PsgimStudentInfo } from './psgimMasterStudents';
import { STUDENT_REGISTRY } from './psgimData';

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: 'Human Resources' | 'Finance' | 'Marketing' | 'Decision Sciences' | 'Leadership';
  email: string;
  courses: {
    courseKey: string; // e.g. 'MCOB', 'ADM', 'BS', etc.
    batchNumber: number; // e.g. 1, 2, 3, 4
    batchCode: string; // e.g. 'MCOB1', 'ADM2'
  }[];
}

export const FACULTY_DIRECTORY: FacultyMember[] = [
  // ── Human Resources ──
  {
    id: 'fac_kirupa',
    name: 'Dr. M. Kirupa Priyadarsini',
    designation: 'Associate Professor',
    department: 'Human Resources',
    email: 'kirupa@psgim.ac.in',
    courses: [
      { courseKey: 'MCOB', batchNumber: 1, batchCode: 'MCOB1' }
    ]
  },
  {
    id: 'fac_vmanchala',
    name: 'Dr. Vijaya Vardhan Manchala',
    designation: 'Assistant Professor (Sr. Grade)',
    department: 'Human Resources',
    email: 'vmanchala@psgim.ac.in',
    courses: [
      { courseKey: 'MCOB', batchNumber: 2, batchCode: 'MCOB2' }
    ]
  },
  {
    id: 'fac_indumathy',
    name: 'Dr. R. Indumathy',
    designation: 'Assistant Professor (Sr. Grade)',
    department: 'Human Resources',
    email: 'indumathy@psgim.ac.in',
    courses: [
      { courseKey: 'MCOB', batchNumber: 3, batchCode: 'MCOB3' },
      { courseKey: 'MC', batchNumber: 2, batchCode: 'MC2' }
    ]
  },
  {
    id: 'fac_deepa',
    name: 'Dr. R. Deepa',
    designation: 'Associate Professor',
    department: 'Human Resources',
    email: 'deepa@psgim.ac.in',
    courses: [
      { courseKey: 'MC', batchNumber: 1, batchCode: 'MC1' }
    ]
  },
  {
    id: 'fac_kanagathara',
    name: 'Dr. S. Kanagathara',
    designation: 'Assistant Professor',
    department: 'Human Resources',
    email: 'kanagathara@psgim.ac.in',
    courses: [
      { courseKey: 'SSM', batchNumber: 3, batchCode: 'SSM3' }
    ]
  },

  // ── Marketing ──
  {
    id: 'fac_udayakumar',
    name: 'Mr. N. Udayakumar',
    designation: 'Assistant Professor',
    department: 'Marketing',
    email: 'udayakumar@psgim.ac.in',
    courses: [
      { courseKey: 'MCOB', batchNumber: 4, batchCode: 'MCOB4' }
    ]
  },
  {
    id: 'fac_srivarsini',
    name: 'Dr. Sri Varsini Elangovan',
    designation: 'Assistant Professor',
    department: 'Marketing',
    email: 'srivarsini@psgim.ac.in',
    courses: [
      { courseKey: 'EDM', batchNumber: 3, batchCode: 'EDM3' },
      { courseKey: 'MC', batchNumber: 3, batchCode: 'MC3' }
    ]
  },
  {
    id: 'fac_chenna',
    name: 'Dr. Chenna Upendra Madduri',
    designation: 'Assistant Professor',
    department: 'Marketing',
    email: 'chenna_upendra@psgim.ac.in',
    courses: [
      { courseKey: 'MC', batchNumber: 4, batchCode: 'MC4' }
    ]
  },
  {
    id: 'fac_venkatalakshmi',
    name: 'Dr. R. Venkatalakshmi',
    designation: 'Assistant Professor',
    department: 'Marketing',
    email: 'venkatalakshmi@psgim.ac.in',
    courses: [
      { courseKey: 'SSM', batchNumber: 4, batchCode: 'SSM4' }
    ]
  },

  // ── Finance ──
  {
    id: 'fac_sreeanandan',
    name: 'Dr. Sree Anandan',
    designation: 'Assistant Professor',
    department: 'Finance',
    email: 'sreeanandan@psgim.ac.in',
    courses: [
      { courseKey: 'EDM', batchNumber: 1, batchCode: 'EDM1' },
      { courseKey: 'EDM', batchNumber: 4, batchCode: 'EDM4' }
    ]
  },
  {
    id: 'fac_aiswaryad',
    name: 'Dr. Aiswarya D. Pillai',
    designation: 'Assistant Professor (Sr. Grade)',
    department: 'Finance',
    email: 'aiswaryad@psgim.ac.in',
    courses: [
      { courseKey: 'EDM', batchNumber: 2, batchCode: 'EDM2' },
      { courseKey: 'ADM', batchNumber: 4, batchCode: 'ADM4' }
    ]
  },
  {
    id: 'fac_nancy',
    name: 'Dr. J. Nancy Christina',
    designation: 'Assistant Professor (Sr. Grade)',
    department: 'Finance',
    email: 'nancy@psgim.ac.in',
    courses: [
      { courseKey: 'ADM', batchNumber: 1, batchCode: 'ADM1' }
    ]
  },
  {
    id: 'fac_kavitha',
    name: 'Dr. D. Kavitha',
    designation: 'Professor',
    department: 'Finance',
    email: 'kavitha@psgim.ac.in',
    courses: [
      { courseKey: 'ADM', batchNumber: 2, batchCode: 'ADM2' },
      { courseKey: 'SSM', batchNumber: 1, batchCode: 'SSM1' }
    ]
  },
  {
    id: 'fac_nithya',
    name: 'Dr. G. Nithya',
    designation: 'Assistant Professor (Sr. Grade)',
    department: 'Finance',
    email: 'nithya@psgim.ac.in',
    courses: [
      { courseKey: 'ADM', batchNumber: 3, batchCode: 'ADM3' }
    ]
  },
  {
    id: 'fac_ravisankarj',
    name: 'Dr. Ravi S. J.',
    designation: 'Assistant Professor',
    department: 'Finance',
    email: 'ravisankarj@psgim.ac.in',
    courses: [
      { courseKey: 'BS', batchNumber: 3, batchCode: 'BS3' }
    ]
  },
  {
    id: 'fac_kanagasabapathy',
    name: 'Mr. Kanagasabapathy Gnanasekaran',
    designation: 'Assistant Professor',
    department: 'Finance',
    email: 'kanagasabapathy@psgim.ac.in',
    courses: [
      { courseKey: 'SSA', batchNumber: 1, batchCode: 'SSA1' },
      { courseKey: 'SSA', batchNumber: 3, batchCode: 'SSA3' }
    ]
  },
  {
    id: 'fac_dhanya',
    name: 'Mrs. Dhanya Chandrasekaran',
    designation: 'Assistant Professor (Sr. Grade)',
    department: 'Finance',
    email: 'dhanya@psgim.ac.in',
    courses: [
      { courseKey: 'SSM', batchNumber: 2, batchCode: 'SSM2' },
      { courseKey: 'LA', batchNumber: 1, batchCode: 'LA1' },
      { courseKey: 'LA', batchNumber: 2, batchCode: 'LA2' },
      { courseKey: 'LA', batchNumber: 3, batchCode: 'LA3' }
    ]
  },
  {
    id: 'fac_firdaus',
    name: 'Dr. Firdaus Bashir',
    designation: 'Assistant Professor',
    department: 'Human Resources',
    email: 'firdaus@psgim.ac.in',
    courses: [
      { courseKey: 'LA', batchNumber: 4, batchCode: 'LA4' }
    ]
  },

  // ── Decision Sciences ──
  {
    id: 'fac_sathish',
    name: 'Mr. T. Sathish',
    designation: 'Assistant Professor',
    department: 'Decision Sciences',
    email: 'sathish@psgim.ac.in',
    courses: [
      { courseKey: 'BS', batchNumber: 1, batchCode: 'BS1' },
      { courseKey: 'BS', batchNumber: 4, batchCode: 'BS4' }
    ]
  },
  {
    id: 'fac_sekkizhar',
    name: 'Dr. J. Sekkizhar',
    designation: 'Associate Professor',
    department: 'Decision Sciences',
    email: 'sekkizhar@psgim.ac.in',
    courses: [
      { courseKey: 'BS', batchNumber: 2, batchCode: 'BS2' }
    ]
  },
  {
    id: 'fac_imayavendan',
    name: 'Mr. V. Imayavendan',
    designation: 'Assistant Professor',
    department: 'Decision Sciences',
    email: 'imayavendan@psgim.ac.in',
    courses: [
      { courseKey: 'SSA', batchNumber: 2, batchCode: 'SSA2' },
      { courseKey: 'SSA', batchNumber: 4, batchCode: 'SSA4' }
    ]
  },

  // ── Director & Dean ──
  {
    id: 'fac_srividya',
    name: 'Dr. V. Srividya',
    designation: 'Director & Professor',
    department: 'Finance',
    email: 'srividya@psgim.ac.in',
    courses: [
      { courseKey: 'MCOB', batchNumber: 1, batchCode: 'MCOB1' }
    ]
  },
  {
    id: 'fac_sujatha',
    name: 'Dr. R. Sujatha',
    designation: 'Professor',
    department: 'Decision Sciences',
    email: 'sujatha@psgim.ac.in',
    courses: [
      { courseKey: 'BS', batchNumber: 1, batchCode: 'BS1' }
    ]
  }
];

export const FacultyDataService = {
  /**
   * Look up faculty member by email or partial id
   */
  findFacultyByEmail(email: string): FacultyMember | null {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    return FACULTY_DIRECTORY.find((f) => f.email.toLowerCase() === clean) || null;
  },

  /**
   * Verify teacher login credentials
   * Fixed password welcome@123 (or Welcome@123)
   */
  verifyFacultyLogin(email: string, password: string): { success: boolean; faculty?: FacultyMember; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your official PSGIM email address (e.g. kirupa@psgim.ac.in).' };
    }

    const faculty = this.findFacultyByEmail(cleanEmail);
    if (!faculty) {
      return {
        success: false,
        error: 'Teacher account not found for this email. Please check spelling or contact the PSGIM IT administrator.'
      };
    }

    if (cleanPass.toLowerCase() !== 'welcome@123') {
      return {
        success: false,
        error: 'Incorrect faculty password. The default access password is welcome@123'
      };
    }

    return { success: true, faculty };
  },

  /**
   * Returns schedule slots assigned to a specific faculty member for a given day or whole week
   */
  getFacultySchedule(facultyEmail: string, dayFilter?: string): {
    slotId: string;
    day: string;
    startTime: string;
    endTime: string;
    hours: number;
    courseKey: string;
    courseTitle: string;
    batchCode: string;
    batchNumber: number;
    room: string;
  }[] {
    const faculty = this.findFacultyByEmail(facultyEmail);
    if (!faculty) return [];

    const scheduleList: {
      slotId: string;
      day: string;
      startTime: string;
      endTime: string;
      hours: number;
      courseKey: string;
      courseTitle: string;
      batchCode: string;
      batchNumber: number;
      room: string;
    }[] = [];

    const days = dayFilter ? [dayFilter] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    days.forEach((dayName) => {
      MASTER_SCHEDULE.filter((slot) => slot.day === dayName).forEach((slot, index) => {
        // Check if any of this faculty's courses match this slot
        faculty.courses.forEach((c) => {
          if (slot.course === c.courseKey && slot.applicableBatches.includes(c.batchCode)) {
            const courseMeta = PSGIM_COURSES[c.courseKey];
            // Calculate academic hours for this timetable slot (e.g. 08:30-10:20 -> 2 hours, 15:40-16:35 -> 1 hour)
            const [sh, sm] = slot.startTime.split(':').map(Number);
            const [eh, em] = slot.endTime.split(':').map(Number);
            const diffMinutes = ((eh || 0) * 60 + (em || 0)) - ((sh || 0) * 60 + (sm || 0));
            const calculatedHours = diffMinutes > 0 ? Math.max(1, Math.round(diffMinutes / 60)) : 1;

            scheduleList.push({
              slotId: `slot_${dayName.toLowerCase()}_${slot.startTime.replace(':', '')}_${c.batchCode}`,
              day: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime,
              hours: calculatedHours,
              courseKey: c.courseKey,
              courseTitle: courseMeta?.title || c.courseKey,
              batchCode: c.batchCode,
              batchNumber: c.batchNumber,
              room: slot.defaultRoom,
            });
          }
        });
      });
    });

    return scheduleList;
  },

  /**
   * Retrieves all students belonging to a course batch (e.g. MCOB1 or ADM2)
   */
  getStudentsForBatch(courseKey: string, batchCode: string): PsgimStudentInfo[] {
    const matchedStudents: PsgimStudentInfo[] = [];

    // Iterate through STUDENT_REGISTRY
    Object.entries(STUDENT_REGISTRY).forEach(([rollNo, record]) => {
      if (rollNo === 'GUEST') return;
      const studentBatch = (record.batches as any)[courseKey];
      if (studentBatch === batchCode) {
        const info = PSGIM_MASTER_STUDENTS[rollNo];
        if (info) {
          matchedStudents.push(info);
        } else {
          matchedStudents.push({
            dRollNo: record.rollNo,
            collegeRollNo: record.rollNo,
            name: `Student (${record.rollNo})`,
            batch: 'A',
          });
        }
      }
    });

    // Sort by College Roll Number
    return matchedStudents.sort((a, b) => a.collegeRollNo.localeCompare(b.collegeRollNo));
  }
};
