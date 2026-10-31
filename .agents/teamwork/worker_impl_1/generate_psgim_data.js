const fs = require('fs');

const officialList = JSON.parse(
  fs.readFileSync('.agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json', 'utf8')
);

// Read current psgimData.ts up to STUDENT_REGISTRY
const currentData = fs.readFileSync('src/data/psgimData.ts', 'utf8');

// Header and courses up to MASTER_SCHEDULE
const headerPart = currentData.slice(0, currentData.indexOf('export const MASTER_SCHEDULE: MasterScheduleSlot[] = ['));

// Updated MASTER_SCHEDULE with CLUB defaultRoom: 'Auditorium'
const masterScheduleCode = `export const MASTER_SCHEDULE: MasterScheduleSlot[] = [
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
`;

// Build student registry with all 252 official students (both dRollNo and collegeRollNo)
let studentRegistryBody = '';

// D-roll entries
officialList.forEach((s, idx) => {
  const dRoll = s.dRollNo;
  const courses = { ...s.courses };
  if (s.batchSection === 'AE') {
    const ssmNum = courses.SSM.slice(-1);
    courses.SPORTS = 'SPORTS' + ssmNum;
  }
  studentRegistryBody += `  "${dRoll}": {
    "rollNo": "${dRoll}",
    "batches": {
      "MCOB": "${courses.MCOB}",
      "ADM": "${courses.ADM}",
      "MC": "${courses.MC}",
      "SSM": "${courses.SSM}",
      "BS": "${courses.BS}",
      "EDM": "${courses.EDM}",
      "LA": "${courses.LA}",
      "SSA": "${courses.SSA}",
      "SPORTS": "${courses.SPORTS}"
    }
  },\n`;
});

// Bidirectional college roll entries (without leading 'D')
officialList.forEach((s) => {
  const dRoll = s.dRollNo;
  const colRoll = dRoll.substring(1);
  const courses = { ...s.courses };
  if (s.batchSection === 'AE') {
    const ssmNum = courses.SSM.slice(-1);
    courses.SPORTS = 'SPORTS' + ssmNum;
  }
  studentRegistryBody += `  "${colRoll}": {
    "rollNo": "${colRoll}",
    "batches": {
      "MCOB": "${courses.MCOB}",
      "ADM": "${courses.ADM}",
      "MC": "${courses.MC}",
      "SSM": "${courses.SSM}",
      "BS": "${courses.BS}",
      "EDM": "${courses.EDM}",
      "LA": "${courses.LA}",
      "SSA": "${courses.SSA}",
      "SPORTS": "${courses.SPORTS}"
    }
  },\n`;
});

// Remove trailing comma from last entry
studentRegistryBody = studentRegistryBody.replace(/,\n$/, '\n');

const footerCode = `};

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
    const sectionTargetBatch = \`\${slot.course}\${sectionGroupNum}\`;
    return slot.applicableBatches.includes(sectionTargetBatch);
  });

  // Guard against any accidental duplicate slots for the same day and start time
  const seenTimes = new Set<string>();
  const uniqueSlots = filtered.filter((slot) => {
    const key = \`\${slot.day}_\${slot.startTime}\`;
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
      const match = assignedBatch.match(/\\d+$/);
      if (match) {
        courseGroupNum = parseInt(match[0], 10);
      }
    }

    const studentBatch = \`\${slot.course}\${courseGroupNum}\`;
    const facultyName = (course?.faculty[courseGroupNum]) || (course?.faculty[sectionGroupNum]) || (course?.faculty[1] || 'Faculty');
    const specificRoom = resolveExactRoom(slot.course, courseGroupNum, slot.defaultRoom);

    return {
      id: \`slot_\${rollNo}_\${slot.day}_\${index}\`,
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
`;

const fullUpdatedPsgimData = headerPart + masterScheduleCode + studentRegistryBody + footerCode;
fs.writeFileSync('src/data/psgimData.ts', fullUpdatedPsgimData, 'utf8');
console.log('Updated src/data/psgimData.ts successfully.');
