// PSG Institute of Management - Batch 2026-28 (Semester 1)
// Master Database: Courses, Faculty, Master Timetable & Dynamic Student Batch Mappings

import { getMasterStudent, toOldRollNo, toNewRollNo } from './psgimMasterStudents';

export interface CourseDetail {
  code: string;
  title: string;
  shortForm: string;
  faculty: Record<number, string>;
  halls: string;
  color: string;
  noAttendance?: boolean;
}

export const PSGIM_COURSES: Record<string, CourseDetail> = {
  MCOB: {
    code: '24GM11',
    title: 'Management Concepts and Organizational Behaviour',
    shortForm: 'MCOB',
    faculty: {
      1: 'Dr. M. Kirupa Priyadarshini',
      2: 'Dr. Vijaya Vardhan Manchala',
      3: 'Dr. R. Indumathy',
      4: 'Dr. N. Udayakumar'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#3B82F6'
  },
  EDM: {
    code: '24GM12',
    title: 'Economics for Decision Making',
    shortForm: 'EDM',
    faculty: {
      1: 'Dr. Sreeanandan',
      2: 'Dr. Aiswarya D Pillai',
      3: 'Dr. E. Sri Varshini',
      4: 'Dr. Sreeanandan'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#10B981'
  },
  ADM: {
    code: '24GM13',
    title: 'Accounting for Decision Making',
    shortForm: 'ADM',
    faculty: {
      1: 'Dr. J. Nancy Christina',
      2: 'Dr. D. Kavitha',
      3: 'Dr. Nithya',
      4: 'Dr. Aiswarya D Pillai'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#3B82F6'
  },
  BS: {
    code: '24GM14',
    title: 'Business Statistics',
    shortForm: 'BS',
    faculty: {
      1: 'Mr. T. Sathish',
      2: 'Dr. J. Sekkizhar',
      3: 'Dr. Ravi Shankar Jetti',
      4: 'Mr. T. Sathish'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#8B5CF6'
  },
  MC: {
    code: '24GM15',
    title: 'Managerial Communication',
    shortForm: 'MC',
    faculty: {
      1: 'Dr. R. Deepa',
      2: 'Dr. R. Indumathy',
      3: 'Dr. E. Sri Varshini',
      4: 'Dr. Chenna Upendra'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#EC4899'
  },
  SSA: {
    code: '24GM16',
    title: 'Spreadsheet Applications',
    shortForm: 'SSA',
    faculty: {
      1: 'Mr. G. Kangasabapathy',
      2: 'Mr. Imayavendan',
      3: 'Mr. G. Kangasabapathy',
      4: 'Mr. Imayavendan'
    },
    halls: '401 / 405 / 101 / 109',
    color: '#06B6D4'
  },
  SSM: {
    code: '24GM18',
    title: 'Social Sensitization for Managers',
    shortForm: 'SSM',
    faculty: {
      1: 'Dr. D. Kavitha',
      2: 'Ms. C. Dhanya',
      3: 'Ms. Kanagathara',
      4: 'Dr. Venkatalakshmi'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#14B8A6'
  },
  LA: {
    code: '24GM19',
    title: 'Legal Aspects of Business',
    shortForm: 'LA',
    faculty: {
      1: 'Ms. C. Dhanya',
      2: 'Ms. C. Dhanya',
      3: 'Ms. C. Dhanya',
      4: 'Dr. Firdaus Bashir'
    },
    halls: '101 / 109 / 401 / 405',
    color: '#6366F1'
  },
  SPORTS: {
    code: 'SPORTS',
    title: 'Physical Education & Sports (No Attendance)',
    shortForm: 'SPORTS',
    faculty: {
      1: 'Mr. Zakeer Khan',
      2: 'Mr. Zakeer Khan',
      3: 'Mr. Zakeer Khan',
      4: 'Mr. Zakeer Khan'
    },
    halls: 'Sports Ground',
    color: '#6366F1',
    noAttendance: true,
  }
};

export interface MasterScheduleSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  course: string;
  applicableBatches: string[]; // e.g. ['MCOB1', 'MCOB2', 'MCOB3', 'MCOB4']
  defaultRoom: string;
}

export const MASTER_SCHEDULE: MasterScheduleSlot[] = [
  // MONDAY
  { day: 'Monday', startTime: '08:30', endTime: '10:20', course: 'LA', applicableBatches: ['LA1'], defaultRoom: 'LH-101' },
  { day: 'Monday', startTime: '08:30', endTime: '10:20', course: 'SSA', applicableBatches: ['SSA1', 'SSA2'], defaultRoom: 'LH-401/405' },
  { day: 'Monday', startTime: '10:40', endTime: '12:30', course: 'ADM', applicableBatches: ['ADM1', 'ADM2', 'ADM3', 'ADM4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Monday', startTime: '13:40', endTime: '15:30', course: 'BS', applicableBatches: ['BS1', 'BS2', 'BS3'], defaultRoom: 'LH-101/109/401' },
  { day: 'Monday', startTime: '13:40', endTime: '15:30', course: 'EDM', applicableBatches: ['EDM4'], defaultRoom: 'LH-405' },
  { day: 'Monday', startTime: '15:40', endTime: '16:35', course: 'SSM', applicableBatches: ['SSM4'], defaultRoom: 'LH-405' },
  { day: 'Monday', startTime: '15:40', endTime: '16:35', course: 'SPORTS', applicableBatches: ['SPORTS2'], defaultRoom: 'Ground' },

  // TUESDAY
  { day: 'Tuesday', startTime: '08:30', endTime: '10:20', course: 'MCOB', applicableBatches: ['MCOB1', 'MCOB2', 'MCOB3', 'MCOB4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Tuesday', startTime: '10:40', endTime: '12:30', course: 'EDM', applicableBatches: ['EDM1', 'EDM2', 'EDM3'], defaultRoom: 'LH-101/109/401' },
  { day: 'Tuesday', startTime: '10:40', endTime: '12:30', course: 'BS', applicableBatches: ['BS4'], defaultRoom: 'LH-405' },
  { day: 'Tuesday', startTime: '13:40', endTime: '15:30', course: 'MC', applicableBatches: ['MC1', 'MC2', 'MC3', 'MC4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Tuesday', startTime: '15:40', endTime: '16:35', course: 'SSM', applicableBatches: ['SSM2'], defaultRoom: 'LH-109' },
  { day: 'Tuesday', startTime: '15:40', endTime: '16:35', course: 'SPORTS', applicableBatches: ['SPORTS4'], defaultRoom: 'Ground' },

  // WEDNESDAY
  { day: 'Wednesday', startTime: '08:30', endTime: '10:20', course: 'BS', applicableBatches: ['BS1', 'BS2', 'BS3'], defaultRoom: 'LH-101/109/401' },
  { day: 'Wednesday', startTime: '08:30', endTime: '10:20', course: 'EDM', applicableBatches: ['EDM4'], defaultRoom: 'LH-405' },
  { day: 'Wednesday', startTime: '10:40', endTime: '12:30', course: 'MCOB', applicableBatches: ['MCOB1', 'MCOB2', 'MCOB3', 'MCOB4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Wednesday', startTime: '13:40', endTime: '15:30', course: 'SSA', applicableBatches: ['SSA3', 'SSA4'], defaultRoom: 'LH-101/109' },
  { day: 'Wednesday', startTime: '15:40', endTime: '16:35', course: 'SSM', applicableBatches: ['SSM1'], defaultRoom: 'LH-101' },
  { day: 'Wednesday', startTime: '15:40', endTime: '16:35', course: 'SPORTS', applicableBatches: ['SPORTS3'], defaultRoom: 'Ground' },

  // THURSDAY
  { day: 'Thursday', startTime: '08:30', endTime: '10:20', course: 'MC', applicableBatches: ['MC1', 'MC2', 'MC3', 'MC4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Thursday', startTime: '10:40', endTime: '12:30', course: 'ADM', applicableBatches: ['ADM1', 'ADM2', 'ADM3', 'ADM4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Thursday', startTime: '13:40', endTime: '14:35', course: 'MC', applicableBatches: ['MC1', 'MC2', 'MC3', 'MC4'], defaultRoom: 'LH-101/109/401/405' },
  { day: 'Thursday', startTime: '14:35', endTime: '16:35', course: 'CLUB', applicableBatches: ['*'], defaultRoom: 'Auditorium' },

  // FRIDAY
  { day: 'Friday', startTime: '08:30', endTime: '10:20', course: 'EDM', applicableBatches: ['EDM1', 'EDM2', 'EDM3'], defaultRoom: 'LH-101/109/401' },
  { day: 'Friday', startTime: '08:30', endTime: '10:20', course: 'BS', applicableBatches: ['BS4'], defaultRoom: 'LH-405' },
  { day: 'Friday', startTime: '10:40', endTime: '12:30', course: 'LA', applicableBatches: ['LA3', 'LA4'], defaultRoom: 'LH-401/405' },
  { day: 'Friday', startTime: '10:40', endTime: '12:30', course: 'SSA', applicableBatches: ['SSA3', 'SSA4'], defaultRoom: 'LH-101/109' },
  { day: 'Friday', startTime: '13:40', endTime: '15:30', course: 'SSA', applicableBatches: ['SSA1', 'SSA2'], defaultRoom: 'LH-401/405' },
  { day: 'Friday', startTime: '13:40', endTime: '15:30', course: 'LA', applicableBatches: ['LA2'], defaultRoom: 'LH-109' },
  { day: 'Friday', startTime: '15:40', endTime: '16:35', course: 'SSM', applicableBatches: ['SSM3'], defaultRoom: 'LH-401' },
  { day: 'Friday', startTime: '15:40', endTime: '16:35', course: 'SPORTS', applicableBatches: ['SPORTS1'], defaultRoom: 'Ground' },

  // SATURDAY
  { day: 'Saturday', startTime: '08:30', endTime: '12:30', course: 'SSM', applicableBatches: ['SSM1', 'SSM2', 'SSM3', 'SSM4'], defaultRoom: 'SSM' },
  { day: 'Saturday', startTime: '13:40', endTime: '16:35', course: 'SSM', applicableBatches: ['SSM1', 'SSM2', 'SSM3', 'SSM4'], defaultRoom: 'SSM' }
];

export interface StudentRecord {
  rollNo: string;
  batches: {
    MCOB: string;
    ADM: string;
    MC: string;
    SSM: string;
    BS: string;
    EDM: string;
    LA: string;
    SSA: string;
    SPORTS: string;
  };
}

export const STUDENT_REGISTRY: Record<string, StudentRecord> = {
  "D26AA01": {
    "rollNo": "D26AA01",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA02": {
    "rollNo": "D26AA02",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA03": {
    "rollNo": "D26AA03",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA04": {
    "rollNo": "D26AA04",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA05": {
    "rollNo": "D26AA05",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA06": {
    "rollNo": "D26AA06",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA07": {
    "rollNo": "D26AA07",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA08": {
    "rollNo": "D26AA08",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA09": {
    "rollNo": "D26AA09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA10": {
    "rollNo": "D26AA10",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA11": {
    "rollNo": "D26AA11",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA12": {
    "rollNo": "D26AA12",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA13": {
    "rollNo": "D26AA13",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA14": {
    "rollNo": "D26AA14",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA15": {
    "rollNo": "D26AA15",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA16": {
    "rollNo": "D26AA16",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA17": {
    "rollNo": "D26AA17",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA18": {
    "rollNo": "D26AA18",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA19": {
    "rollNo": "D26AA19",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA20": {
    "rollNo": "D26AA20",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA21": {
    "rollNo": "D26AA21",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA22": {
    "rollNo": "D26AA22",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA23": {
    "rollNo": "D26AA23",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA24": {
    "rollNo": "D26AA24",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA25": {
    "rollNo": "D26AA25",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA26": {
    "rollNo": "D26AA26",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA27": {
    "rollNo": "D26AA27",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA28": {
    "rollNo": "D26AA28",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA29": {
    "rollNo": "D26AA29",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA30": {
    "rollNo": "D26AA30",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA31": {
    "rollNo": "D26AA31",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA32": {
    "rollNo": "D26AA32",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA33": {
    "rollNo": "D26AA33",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA34": {
    "rollNo": "D26AA34",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA35": {
    "rollNo": "D26AA35",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA36": {
    "rollNo": "D26AA36",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA37": {
    "rollNo": "D26AA37",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA38": {
    "rollNo": "D26AA38",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA39": {
    "rollNo": "D26AA39",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA40": {
    "rollNo": "D26AA40",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA41": {
    "rollNo": "D26AA41",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA42": {
    "rollNo": "D26AA42",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA43": {
    "rollNo": "D26AA43",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA44": {
    "rollNo": "D26AA44",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA45": {
    "rollNo": "D26AA45",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA46": {
    "rollNo": "D26AA46",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA47": {
    "rollNo": "D26AA47",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA48": {
    "rollNo": "D26AA48",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA49": {
    "rollNo": "D26AA49",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA50": {
    "rollNo": "D26AA50",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA51": {
    "rollNo": "D26AA51",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA52": {
    "rollNo": "D26AA52",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA53": {
    "rollNo": "D26AA53",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA54": {
    "rollNo": "D26AA54",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA55": {
    "rollNo": "D26AA55",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA56": {
    "rollNo": "D26AA56",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA57": {
    "rollNo": "D26AA57",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA58": {
    "rollNo": "D26AA58",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA59": {
    "rollNo": "D26AA59",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA60": {
    "rollNo": "D26AA60",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AB01": {
    "rollNo": "D26AB01",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB02": {
    "rollNo": "D26AB02",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB03": {
    "rollNo": "D26AB03",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB04": {
    "rollNo": "D26AB04",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB05": {
    "rollNo": "D26AB05",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB06": {
    "rollNo": "D26AB06",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB07": {
    "rollNo": "D26AB07",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB08": {
    "rollNo": "D26AB08",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB09": {
    "rollNo": "D26AB09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB10": {
    "rollNo": "D26AB10",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB11": {
    "rollNo": "D26AB11",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB12": {
    "rollNo": "D26AB12",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB13": {
    "rollNo": "D26AB13",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB14": {
    "rollNo": "D26AB14",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB15": {
    "rollNo": "D26AB15",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB16": {
    "rollNo": "D26AB16",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB17": {
    "rollNo": "D26AB17",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB18": {
    "rollNo": "D26AB18",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB19": {
    "rollNo": "D26AB19",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB20": {
    "rollNo": "D26AB20",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB21": {
    "rollNo": "D26AB21",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB22": {
    "rollNo": "D26AB22",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB23": {
    "rollNo": "D26AB23",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB24": {
    "rollNo": "D26AB24",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB25": {
    "rollNo": "D26AB25",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB26": {
    "rollNo": "D26AB26",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB27": {
    "rollNo": "D26AB27",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB28": {
    "rollNo": "D26AB28",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB29": {
    "rollNo": "D26AB29",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB30": {
    "rollNo": "D26AB30",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB31": {
    "rollNo": "D26AB31",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB32": {
    "rollNo": "D26AB32",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB33": {
    "rollNo": "D26AB33",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB34": {
    "rollNo": "D26AB34",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB35": {
    "rollNo": "D26AB35",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB36": {
    "rollNo": "D26AB36",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB37": {
    "rollNo": "D26AB37",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB38": {
    "rollNo": "D26AB38",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB39": {
    "rollNo": "D26AB39",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB40": {
    "rollNo": "D26AB40",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB41": {
    "rollNo": "D26AB41",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB42": {
    "rollNo": "D26AB42",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB43": {
    "rollNo": "D26AB43",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB44": {
    "rollNo": "D26AB44",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB45": {
    "rollNo": "D26AB45",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB46": {
    "rollNo": "D26AB46",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB47": {
    "rollNo": "D26AB47",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB48": {
    "rollNo": "D26AB48",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB49": {
    "rollNo": "D26AB49",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB50": {
    "rollNo": "D26AB50",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB51": {
    "rollNo": "D26AB51",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB52": {
    "rollNo": "D26AB52",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB53": {
    "rollNo": "D26AB53",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB54": {
    "rollNo": "D26AB54",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB55": {
    "rollNo": "D26AB55",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB56": {
    "rollNo": "D26AB56",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB57": {
    "rollNo": "D26AB57",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB58": {
    "rollNo": "D26AB58",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB59": {
    "rollNo": "D26AB59",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB60": {
    "rollNo": "D26AB60",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AC01": {
    "rollNo": "D26AC01",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC02": {
    "rollNo": "D26AC02",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC03": {
    "rollNo": "D26AC03",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC04": {
    "rollNo": "D26AC04",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC05": {
    "rollNo": "D26AC05",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC06": {
    "rollNo": "D26AC06",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC07": {
    "rollNo": "D26AC07",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC08": {
    "rollNo": "D26AC08",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC09": {
    "rollNo": "D26AC09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC10": {
    "rollNo": "D26AC10",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC11": {
    "rollNo": "D26AC11",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC12": {
    "rollNo": "D26AC12",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC13": {
    "rollNo": "D26AC13",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC14": {
    "rollNo": "D26AC14",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC15": {
    "rollNo": "D26AC15",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC16": {
    "rollNo": "D26AC16",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC17": {
    "rollNo": "D26AC17",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC18": {
    "rollNo": "D26AC18",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC19": {
    "rollNo": "D26AC19",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC20": {
    "rollNo": "D26AC20",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC21": {
    "rollNo": "D26AC21",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC22": {
    "rollNo": "D26AC22",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC23": {
    "rollNo": "D26AC23",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC24": {
    "rollNo": "D26AC24",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC25": {
    "rollNo": "D26AC25",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC26": {
    "rollNo": "D26AC26",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC27": {
    "rollNo": "D26AC27",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC28": {
    "rollNo": "D26AC28",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC29": {
    "rollNo": "D26AC29",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC30": {
    "rollNo": "D26AC30",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC31": {
    "rollNo": "D26AC31",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC32": {
    "rollNo": "D26AC32",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC33": {
    "rollNo": "D26AC33",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC34": {
    "rollNo": "D26AC34",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC35": {
    "rollNo": "D26AC35",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC36": {
    "rollNo": "D26AC36",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC37": {
    "rollNo": "D26AC37",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC38": {
    "rollNo": "D26AC38",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC39": {
    "rollNo": "D26AC39",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC40": {
    "rollNo": "D26AC40",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC41": {
    "rollNo": "D26AC41",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC42": {
    "rollNo": "D26AC42",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC43": {
    "rollNo": "D26AC43",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC44": {
    "rollNo": "D26AC44",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC45": {
    "rollNo": "D26AC45",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC46": {
    "rollNo": "D26AC46",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC47": {
    "rollNo": "D26AC47",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC48": {
    "rollNo": "D26AC48",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC49": {
    "rollNo": "D26AC49",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC50": {
    "rollNo": "D26AC50",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC51": {
    "rollNo": "D26AC51",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC52": {
    "rollNo": "D26AC52",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC53": {
    "rollNo": "D26AC53",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC54": {
    "rollNo": "D26AC54",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC55": {
    "rollNo": "D26AC55",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC56": {
    "rollNo": "D26AC56",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC57": {
    "rollNo": "D26AC57",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC58": {
    "rollNo": "D26AC58",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC59": {
    "rollNo": "D26AC59",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC60": {
    "rollNo": "D26AC60",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AD01": {
    "rollNo": "D26AD01",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD02": {
    "rollNo": "D26AD02",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD03": {
    "rollNo": "D26AD03",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD04": {
    "rollNo": "D26AD04",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD05": {
    "rollNo": "D26AD05",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD06": {
    "rollNo": "D26AD06",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD07": {
    "rollNo": "D26AD07",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD08": {
    "rollNo": "D26AD08",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD09": {
    "rollNo": "D26AD09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD10": {
    "rollNo": "D26AD10",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD11": {
    "rollNo": "D26AD11",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD12": {
    "rollNo": "D26AD12",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD13": {
    "rollNo": "D26AD13",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD14": {
    "rollNo": "D26AD14",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD15": {
    "rollNo": "D26AD15",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD16": {
    "rollNo": "D26AD16",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD17": {
    "rollNo": "D26AD17",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD18": {
    "rollNo": "D26AD18",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD19": {
    "rollNo": "D26AD19",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD20": {
    "rollNo": "D26AD20",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD21": {
    "rollNo": "D26AD21",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD22": {
    "rollNo": "D26AD22",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD23": {
    "rollNo": "D26AD23",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD24": {
    "rollNo": "D26AD24",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD25": {
    "rollNo": "D26AD25",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD26": {
    "rollNo": "D26AD26",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD27": {
    "rollNo": "D26AD27",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD28": {
    "rollNo": "D26AD28",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD29": {
    "rollNo": "D26AD29",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD30": {
    "rollNo": "D26AD30",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD31": {
    "rollNo": "D26AD31",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD32": {
    "rollNo": "D26AD32",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD33": {
    "rollNo": "D26AD33",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD34": {
    "rollNo": "D26AD34",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD35": {
    "rollNo": "D26AD35",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD36": {
    "rollNo": "D26AD36",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD37": {
    "rollNo": "D26AD37",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD38": {
    "rollNo": "D26AD38",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD39": {
    "rollNo": "D26AD39",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD40": {
    "rollNo": "D26AD40",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD41": {
    "rollNo": "D26AD41",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD42": {
    "rollNo": "D26AD42",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD43": {
    "rollNo": "D26AD43",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD44": {
    "rollNo": "D26AD44",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD45": {
    "rollNo": "D26AD45",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD46": {
    "rollNo": "D26AD46",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD47": {
    "rollNo": "D26AD47",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD48": {
    "rollNo": "D26AD48",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD49": {
    "rollNo": "D26AD49",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD50": {
    "rollNo": "D26AD50",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD51": {
    "rollNo": "D26AD51",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD52": {
    "rollNo": "D26AD52",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD53": {
    "rollNo": "D26AD53",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD54": {
    "rollNo": "D26AD54",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD55": {
    "rollNo": "D26AD55",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD56": {
    "rollNo": "D26AD56",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD57": {
    "rollNo": "D26AD57",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD58": {
    "rollNo": "D26AD58",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD59": {
    "rollNo": "D26AD59",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD60": {
    "rollNo": "D26AD60",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AE01": {
    "rollNo": "D26AE01",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AE02": {
    "rollNo": "D26AE02",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AE03": {
    "rollNo": "D26AE03",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AE04": {
    "rollNo": "D26AE04",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AE05": {
    "rollNo": "D26AE05",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AE06": {
    "rollNo": "D26AE06",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AE07": {
    "rollNo": "D26AE07",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AE08": {
    "rollNo": "D26AE08",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AE09": {
    "rollNo": "D26AE09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AE11": {
    "rollNo": "D26AE11",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AE12": {
    "rollNo": "D26AE12",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AE13": {
    "rollNo": "D26AE13",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AA61": {
    "rollNo": "D26AA61",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA62": {
    "rollNo": "D26AA62",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA63": {
    "rollNo": "D26AA63",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AB61": {
    "rollNo": "D26AB61",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AB62": {
    "rollNo": "D26AB62",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AB63": {
    "rollNo": "D26AB63",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AB64": {
    "rollNo": "D26AB64",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AC61": {
    "rollNo": "D26AC61",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AC62": {
    "rollNo": "D26AC62",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AC63": {
    "rollNo": "D26AC63",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AD61": {
    "rollNo": "D26AD61",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AD62": {
    "rollNo": "D26AD62",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AD63": {
    "rollNo": "D26AD63",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AD64": {
    "rollNo": "D26AD64",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AD65": {
    "rollNo": "D26AD65",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA04": {
    "rollNo": "26AA04",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA27": {
    "rollNo": "26AA27",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA38": {
    "rollNo": "26AA38",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA08": {
    "rollNo": "26AA08",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA03": {
    "rollNo": "26AA03",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA33": {
    "rollNo": "26AA33",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA15": {
    "rollNo": "26AA15",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA37": {
    "rollNo": "26AA37",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA22": {
    "rollNo": "26AA22",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA24": {
    "rollNo": "26AA24",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA39": {
    "rollNo": "26AA39",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA10": {
    "rollNo": "26AA10",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA34": {
    "rollNo": "26AA34",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA35": {
    "rollNo": "26AA35",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA36": {
    "rollNo": "26AA36",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA18": {
    "rollNo": "26AA18",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA02": {
    "rollNo": "26AA02",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA46": {
    "rollNo": "26AA46",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA51": {
    "rollNo": "26AA51",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA41": {
    "rollNo": "26AA41",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA53": {
    "rollNo": "26AA53",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA47": {
    "rollNo": "26AA47",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA52": {
    "rollNo": "26AA52",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA58": {
    "rollNo": "26AA58",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA23": {
    "rollNo": "26AA23",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA01": {
    "rollNo": "26AA01",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA42": {
    "rollNo": "26AA42",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA05": {
    "rollNo": "26AA05",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA30": {
    "rollNo": "26AA30",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA56": {
    "rollNo": "26AA56",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA28": {
    "rollNo": "26AA28",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA13": {
    "rollNo": "26AA13",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA55": {
    "rollNo": "26AA55",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA16": {
    "rollNo": "26AA16",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA20": {
    "rollNo": "26AA20",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA54": {
    "rollNo": "26AA54",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA57": {
    "rollNo": "26AA57",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA61": {
    "rollNo": "26AA61",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA59": {
    "rollNo": "26AA59",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA14": {
    "rollNo": "26AA14",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA21": {
    "rollNo": "26AA21",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA45": {
    "rollNo": "26AA45",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA48": {
    "rollNo": "26AA48",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA06": {
    "rollNo": "26AA06",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA60": {
    "rollNo": "26AA60",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA44": {
    "rollNo": "26AA44",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA32": {
    "rollNo": "26AA32",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA19": {
    "rollNo": "26AA19",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA49": {
    "rollNo": "26AA49",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA31": {
    "rollNo": "26AA31",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA29": {
    "rollNo": "26AA29",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA09": {
    "rollNo": "26AA09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA11": {
    "rollNo": "26AA11",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA25": {
    "rollNo": "26AA25",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA26": {
    "rollNo": "26AA26",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA12": {
    "rollNo": "26AA12",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA17": {
    "rollNo": "26AA17",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA50": {
    "rollNo": "26AA50",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA40": {
    "rollNo": "26AA40",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA62": {
    "rollNo": "26AA62",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA43": {
    "rollNo": "26AA43",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AA07": {
    "rollNo": "26AA07",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AB33": {
    "rollNo": "26AB33",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB18": {
    "rollNo": "26AB18",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB19": {
    "rollNo": "26AB19",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB13": {
    "rollNo": "26AB13",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB12": {
    "rollNo": "26AB12",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB30": {
    "rollNo": "26AB30",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB04": {
    "rollNo": "26AB04",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB34": {
    "rollNo": "26AB34",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB43": {
    "rollNo": "26AB43",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB16": {
    "rollNo": "26AB16",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB28": {
    "rollNo": "26AB28",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB29": {
    "rollNo": "26AB29",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB24": {
    "rollNo": "26AB24",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB39": {
    "rollNo": "26AB39",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB48": {
    "rollNo": "26AB48",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB25": {
    "rollNo": "26AB25",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB47": {
    "rollNo": "26AB47",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB50": {
    "rollNo": "26AB50",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB57": {
    "rollNo": "26AB57",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB41": {
    "rollNo": "26AB41",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB54": {
    "rollNo": "26AB54",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB53": {
    "rollNo": "26AB53",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB56": {
    "rollNo": "26AB56",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB36": {
    "rollNo": "26AB36",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB59": {
    "rollNo": "26AB59",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB45": {
    "rollNo": "26AB45",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB51": {
    "rollNo": "26AB51",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB49": {
    "rollNo": "26AB49",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB07": {
    "rollNo": "26AB07",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB55": {
    "rollNo": "26AB55",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB06": {
    "rollNo": "26AB06",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB17": {
    "rollNo": "26AB17",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB31": {
    "rollNo": "26AB31",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB27": {
    "rollNo": "26AB27",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB01": {
    "rollNo": "26AB01",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB26": {
    "rollNo": "26AB26",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB10": {
    "rollNo": "26AB10",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB22": {
    "rollNo": "26AB22",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB37": {
    "rollNo": "26AB37",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB20": {
    "rollNo": "26AB20",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB63": {
    "rollNo": "26AB63",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB58": {
    "rollNo": "26AB58",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB38": {
    "rollNo": "26AB38",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB42": {
    "rollNo": "26AB42",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB62": {
    "rollNo": "26AB62",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB61": {
    "rollNo": "26AB61",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB44": {
    "rollNo": "26AB44",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB40": {
    "rollNo": "26AB40",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB23": {
    "rollNo": "26AB23",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB35": {
    "rollNo": "26AB35",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB21": {
    "rollNo": "26AB21",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB32": {
    "rollNo": "26AB32",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB14": {
    "rollNo": "26AB14",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB60": {
    "rollNo": "26AB60",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB05": {
    "rollNo": "26AB05",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB03": {
    "rollNo": "26AB03",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB15": {
    "rollNo": "26AB15",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB02": {
    "rollNo": "26AB02",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB52": {
    "rollNo": "26AB52",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "26AB46": {
    "rollNo": "26AB46",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AB08": {
    "rollNo": "26AB08",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AB09": {
    "rollNo": "26AB09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AB11": {
    "rollNo": "26AB11",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AC09": {
    "rollNo": "26AC09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC19": {
    "rollNo": "26AC19",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC17": {
    "rollNo": "26AC17",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC43": {
    "rollNo": "26AC43",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC28": {
    "rollNo": "26AC28",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC13": {
    "rollNo": "26AC13",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC56": {
    "rollNo": "26AC56",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC05": {
    "rollNo": "26AC05",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC37": {
    "rollNo": "26AC37",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC33": {
    "rollNo": "26AC33",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC18": {
    "rollNo": "26AC18",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC22": {
    "rollNo": "26AC22",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC26": {
    "rollNo": "26AC26",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC34": {
    "rollNo": "26AC34",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC30": {
    "rollNo": "26AC30",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC39": {
    "rollNo": "26AC39",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC20": {
    "rollNo": "26AC20",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC51": {
    "rollNo": "26AC51",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC42": {
    "rollNo": "26AC42",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC53": {
    "rollNo": "26AC53",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC47": {
    "rollNo": "26AC47",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC55": {
    "rollNo": "26AC55",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC52": {
    "rollNo": "26AC52",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC40": {
    "rollNo": "26AC40",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC49": {
    "rollNo": "26AC49",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC54": {
    "rollNo": "26AC54",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC59": {
    "rollNo": "26AC59",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC58": {
    "rollNo": "26AC58",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC62": {
    "rollNo": "26AC62",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC50": {
    "rollNo": "26AC50",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC48": {
    "rollNo": "26AC48",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC03": {
    "rollNo": "26AC03",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC45": {
    "rollNo": "26AC45",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC12": {
    "rollNo": "26AC12",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC46": {
    "rollNo": "26AC46",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC24": {
    "rollNo": "26AC24",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC08": {
    "rollNo": "26AC08",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC06": {
    "rollNo": "26AC06",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC29": {
    "rollNo": "26AC29",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC44": {
    "rollNo": "26AC44",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC61": {
    "rollNo": "26AC61",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC15": {
    "rollNo": "26AC15",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC07": {
    "rollNo": "26AC07",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC32": {
    "rollNo": "26AC32",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC38": {
    "rollNo": "26AC38",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC31": {
    "rollNo": "26AC31",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC27": {
    "rollNo": "26AC27",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC60": {
    "rollNo": "26AC60",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC23": {
    "rollNo": "26AC23",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC35": {
    "rollNo": "26AC35",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC02": {
    "rollNo": "26AC02",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC10": {
    "rollNo": "26AC10",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC57": {
    "rollNo": "26AC57",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC01": {
    "rollNo": "26AC01",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC14": {
    "rollNo": "26AC14",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC16": {
    "rollNo": "26AC16",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC21": {
    "rollNo": "26AC21",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC25": {
    "rollNo": "26AC25",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC36": {
    "rollNo": "26AC36",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "26AC11": {
    "rollNo": "26AC11",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AC41": {
    "rollNo": "26AC41",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AC04": {
    "rollNo": "26AC04",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AD28": {
    "rollNo": "26AD28",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD09": {
    "rollNo": "26AD09",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD11": {
    "rollNo": "26AD11",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD21": {
    "rollNo": "26AD21",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD15": {
    "rollNo": "26AD15",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD14": {
    "rollNo": "26AD14",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD33": {
    "rollNo": "26AD33",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD24": {
    "rollNo": "26AD24",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD45": {
    "rollNo": "26AD45",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD19": {
    "rollNo": "26AD19",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD39": {
    "rollNo": "26AD39",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD23": {
    "rollNo": "26AD23",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD55": {
    "rollNo": "26AD55",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD61": {
    "rollNo": "26AD61",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD40": {
    "rollNo": "26AD40",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD53": {
    "rollNo": "26AD53",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD48": {
    "rollNo": "26AD48",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD42": {
    "rollNo": "26AD42",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD65": {
    "rollNo": "26AD65",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD51": {
    "rollNo": "26AD51",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD50": {
    "rollNo": "26AD50",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD60": {
    "rollNo": "26AD60",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD46": {
    "rollNo": "26AD46",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD31": {
    "rollNo": "26AD31",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD43": {
    "rollNo": "26AD43",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD44": {
    "rollNo": "26AD44",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD02": {
    "rollNo": "26AD02",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD64": {
    "rollNo": "26AD64",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD58": {
    "rollNo": "26AD58",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD56": {
    "rollNo": "26AD56",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD10": {
    "rollNo": "26AD10",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD57": {
    "rollNo": "26AD57",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD49": {
    "rollNo": "26AD49",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD13": {
    "rollNo": "26AD13",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD17": {
    "rollNo": "26AD17",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD12": {
    "rollNo": "26AD12",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD63": {
    "rollNo": "26AD63",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD03": {
    "rollNo": "26AD03",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD06": {
    "rollNo": "26AD06",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD07": {
    "rollNo": "26AD07",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD16": {
    "rollNo": "26AD16",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD08": {
    "rollNo": "26AD08",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD22": {
    "rollNo": "26AD22",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD04": {
    "rollNo": "26AD04",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD20": {
    "rollNo": "26AD20",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD34": {
    "rollNo": "26AD34",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD35": {
    "rollNo": "26AD35",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD54": {
    "rollNo": "26AD54",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD36": {
    "rollNo": "26AD36",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD38": {
    "rollNo": "26AD38",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD29": {
    "rollNo": "26AD29",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD18": {
    "rollNo": "26AD18",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD27": {
    "rollNo": "26AD27",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD26": {
    "rollNo": "26AD26",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD62": {
    "rollNo": "26AD62",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD59": {
    "rollNo": "26AD59",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD01": {
    "rollNo": "26AD01",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD37": {
    "rollNo": "26AD37",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD52": {
    "rollNo": "26AD52",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD32": {
    "rollNo": "26AD32",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "26AD41": {
    "rollNo": "26AD41",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AD47": {
    "rollNo": "26AD47",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AD30": {
    "rollNo": "26AD30",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AD25": {
    "rollNo": "26AD25",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AD05": {
    "rollNo": "26AD05",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AE01": {
    "rollNo": "26AE01",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "26AE02": {
    "rollNo": "26AE02",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "26AE03": {
    "rollNo": "26AE03",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AE04": {
    "rollNo": "26AE04",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "26AE05": {
    "rollNo": "26AE05",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "26AE06": {
    "rollNo": "26AE06",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AE07": {
    "rollNo": "26AE07",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AE08": {
    "rollNo": "26AE08",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "26AE09": {
    "rollNo": "26AE09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "26AE11": {
    "rollNo": "26AE11",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "26AE12": {
    "rollNo": "26AE12",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "26AE13": {
    "rollNo": "26AE13",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  }
};

export const ALL_ROLL_NUMBERS = Object.keys(STUDENT_REGISTRY).filter((r) => r.startsWith('D'));

/**
 * Resolves the specific classroom/hall for a student based on their assigned group
 */
export function resolveExactRoom(course: string, groupNum: number, defaultRoom: string): string {
  if (course === 'SPORTS') return 'Sports Ground';
  if (course === 'CLUB') return 'Auditorium';
  if (defaultRoom && (defaultRoom.includes('ALPS') || defaultRoom === 'SSM')) return 'SSM';

  // Spreadsheet Applications (SSA) Lab / Hall mappings
  if (course === 'SSA') {
    switch (groupNum) {
      case 1: return 'LH-401';
      case 2: return 'LH-405';
      case 3: return 'LH-101';
      case 4: return 'LH-109';
      default: return defaultRoom && !defaultRoom.includes('/') ? defaultRoom : 'LH-101';
    }
  }

  // Standard courses: MCOB, EDM, ADM, BS, MC, SSM, LA
  switch (groupNum) {
    case 1: return 'LH-101';
    case 2: return 'LH-109';
    case 3: return 'LH-401';
    case 4: return 'LH-405';
    default:
      if (defaultRoom && !defaultRoom.includes('/')) return defaultRoom;
      return 'LH-101';
  }
}

/**
 * Returns personalized timetable slots for any specific student roll number
 */
export function getTimetableForStudent(rollNo: string) {
  const cleanRoll = (rollNo || '').toUpperCase();
  const oldRoll = toOldRollNo(cleanRoll);
  const newRoll = toNewRollNo(cleanRoll);
  const master = getMasterStudent(cleanRoll) || getMasterStudent(oldRoll) || getMasterStudent(newRoll);
  const student = STUDENT_REGISTRY[cleanRoll] || STUDENT_REGISTRY[oldRoll] || STUDENT_REGISTRY[newRoll];

  // Determine section group number (Batch A -> 1, Batch B -> 2, Batch C -> 3, Batch D -> 4)
  const batchLetter = master?.batch || (newRoll.length >= 5 ? newRoll.charAt(3) : 'A');
  const sectionGroupNum = batchLetter === 'B' ? 2 : batchLetter === 'C' ? 3 : batchLetter === 'D' ? 4 : 1;

  // Use student's section batches if available
  const studentBatches = student
    ? Object.values(student.batches).filter((b) => b && b.trim() !== '')
    : null;

  const filtered = MASTER_SCHEDULE.filter((slot) => {
    if (slot.applicableBatches.includes('*')) return true;
    if (studentBatches && studentBatches.length > 0) {
      return slot.applicableBatches.some((b) => studentBatches.includes(b));
    }
    const sectionTargetBatch = `${slot.course}${sectionGroupNum}`;
    return slot.applicableBatches.includes(sectionTargetBatch);
  });

  // Guard against any accidental duplicate slots for the same day and start time
  const seenTimes = new Set<string>();
  const uniqueSlots = filtered.filter((slot) => {
    const key = `${slot.day}_${slot.startTime}`;
    if (seenTimes.has(key)) return false;
    seenTimes.add(key);
    return true;
  });

  return uniqueSlots.map((slot, index) => {
    const course = PSGIM_COURSES[slot.course];
    
    // Resolve course-specific batch for this student (e.g. LA -> LA1 => group 1; MC -> MC3 => group 3; SSA -> SSA3 => group 3)
    let courseGroupNum = sectionGroupNum;
    if (student?.batches && student.batches[slot.course as keyof typeof student.batches]) {
      const assignedBatch = student.batches[slot.course as keyof typeof student.batches];
      const match = assignedBatch.match(/\d+$/);
      if (match) {
        courseGroupNum = parseInt(match[0], 10);
      }
    }

    const studentBatch = `${slot.course}${courseGroupNum}`;
    const facultyName = (course?.faculty[courseGroupNum]) || (course?.faculty[sectionGroupNum]) || (course?.faculty[1] || 'Faculty');
    const specificRoom = resolveExactRoom(slot.course, courseGroupNum, slot.defaultRoom);

    return {
      id: `slot_${rollNo}_${slot.day}_${index}`,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      courseCode: course?.code || slot.course,
      courseTitle: course?.title || slot.course,
      shortForm: slot.course,
      batch: studentBatch,
      faculty: facultyName,
      room: specificRoom,
      color: course?.color || '#3B82F6',
    };
  });
}
