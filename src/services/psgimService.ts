import { Subject, TimetableSlot } from '../types';
import {
  STUDENT_REGISTRY,
  PSGIM_COURSES,
  getTimetableForStudent as getPsgimTimetable,
  resolveExactRoom,
  ALL_ROLL_NUMBERS,
} from '../data/psgimData';
import { getMcobData, McobStudentData } from '../data/mcobAttendanceData';
import { getSectionBStudent, SectionBStudent } from '../data/psgimStudentsB';
import {
  getMasterStudent,
  toNewRollNo,
  toOldRollNo,
  ALL_COLLEGE_ROLL_NUMBERS,
} from '../data/psgimMasterStudents';

export const PsgimService = {
  getAllRollNumbers(): string[] {
    return ALL_COLLEGE_ROLL_NUMBERS.length > 0 ? ALL_COLLEGE_ROLL_NUMBERS : ALL_ROLL_NUMBERS;
  },

  getStudent(rollNo: string) {
    if (!rollNo) return null;
    const oldRoll = toOldRollNo(rollNo);
    return STUDENT_REGISTRY[oldRoll] || STUDENT_REGISTRY[rollNo.toUpperCase()] || null;
  },

  getStudentName(rollNo: string): string {
    const master = getMasterStudent(rollNo);
    if (master?.name) return master.name;
    const oldRoll = toOldRollNo(rollNo);
    const secB = getSectionBStudent(rollNo) || getSectionBStudent(oldRoll);
    if (secB?.name) return secB.name;
    const mcob = getMcobData(rollNo) || getMcobData(oldRoll);
    if (mcob?.name) return mcob.name;
    return toNewRollNo(rollNo);
  },

  getStudentProfile(rollNo: string): {
    rollNo: string;
    collegeRollNo?: string;
    dRollNo?: string;
    name: string;
    email?: string;
    section?: string;
  } {
    const master = getMasterStudent(rollNo);
    const oldRoll = toOldRollNo(rollNo);
    const newRoll = toNewRollNo(rollNo);
    const secB = getSectionBStudent(newRoll) || getSectionBStudent(oldRoll);
    const mcob = getMcobData(newRoll) || getMcobData(oldRoll);
    const name = master?.name || secB?.name || mcob?.name || newRoll;
    const batchLetter = master?.batch || (newRoll.length >= 5 ? newRoll.charAt(3) : 'A');

    return {
      rollNo: newRoll,
      collegeRollNo: newRoll,
      dRollNo: master?.dRollNo || oldRoll,
      name,
      email: secB?.email,
      section: `Batch ${batchLetter}`,
    };
  },

  getMcobDetails(rollNo: string): McobStudentData | null {
    const oldRoll = toOldRollNo(rollNo);
    return getMcobData(oldRoll) || getMcobData(rollNo);
  },

  /**
   * Generates the 8 academic subjects tailored to the student's assigned batches
   */
  generateSubjectsForStudent(rollNo: string): Subject[] {
    const oldRoll = toOldRollNo(rollNo);
    const newRoll = toNewRollNo(rollNo);
    const master = getMasterStudent(rollNo) || getMasterStudent(newRoll) || getMasterStudent(oldRoll);
    const student = this.getStudent(oldRoll) || STUDENT_REGISTRY['D26AA01'];
    const batches = student ? student.batches : STUDENT_REGISTRY['D26AA01'].batches;
    const mcobData = getMcobData(oldRoll) || getMcobData(rollNo);

    // Determine section group number (Batch A -> 1, Batch B -> 2, Batch C -> 3, Batch D -> 4)
    const batchLetter = master?.batch || (newRoll.length >= 5 ? newRoll.charAt(3) : 'A');
    const sectionGroupNum = batchLetter === 'B' ? 2 : batchLetter === 'C' ? 3 : batchLetter === 'D' ? 4 : 1;

    // Official attendance statistics matching latest verified Studzone portal table (17-08-2026 to 10-10-2026)
    const attendancePresets: Record<string, { attended: number; total: number; hasMedicalClaim?: boolean }> = {
      MCOB: { attended: 28, total: 28 }, // 24GM11: 28/28 (100%)
      EDM: { attended: 28, total: 28, hasMedicalClaim: false }, // 24GM12: 28/28 (100%)
      ADM: { attended: 30, total: 30 }, // 24GM13: 30/30 (100%)
      BS: { attended: 26, total: 26 }, // 24GM14: 26/26 (100%)
      MC: { attended: 39, total: 40 }, // 24GM15: 39/40 (98%)
      SSA: { attended: 24, total: 26 }, // 24GM16: 24/26 (93%)
      SSM: { attended: 32, total: 32 }, // 24GM18: 32/32 (100%)
      LA: { attended: 12, total: 12 }, // 24GM19: 12/12 (100%)
      SPORTS: { attended: 8, total: 8 }, // SPORTS: 8/8 (100%)
    };

    return Object.entries(batches).map(([courseKey, batchCode]) => {
      const course = PSGIM_COURSES[courseKey];
      const isBlankBatch = !batchCode || batchCode.trim() === '';
      const faculty = isBlankBatch ? '' : (course?.faculty[sectionGroupNum] || course?.faculty[1] || 'Faculty');
      const stats = attendancePresets[courseKey] || { attended: 20, total: 24 };

      const isMcob = courseKey === 'MCOB' && mcobData;
      const attended = isMcob ? mcobData.attendedHours : (isBlankBatch ? 0 : stats.attended);
      const total = isMcob ? mcobData.totalHours : (isBlankBatch ? 0 : stats.total);
      const officialAttended = isMcob ? mcobData.attendedHours : (isBlankBatch ? 0 : stats.attended);
      const officialTotal = isMcob ? mcobData.totalHours : (isBlankBatch ? 0 : stats.total);

      return {
        id: `sub_${courseKey.toLowerCase()}`,
        name: course?.title || courseKey,
        code: course?.code || courseKey,
        color: course?.color || '#3B82F6',
        standardTarget: 75,
        medicalTarget: 65,
        hasMedicalClaim: isBlankBatch ? false : (stats.hasMedicalClaim || false),
        attended,
        total,
        officialAttended,
        officialTotal,
        lastOfficialUpdate: '2026-10-10',
        batch: isBlankBatch ? '' : `Batch ${batchLetter}`,
        faculty: isBlankBatch ? '' : faculty,
        room: isBlankBatch
          ? ''
          : resolveExactRoom(
              courseKey,
              sectionGroupNum,
              course?.halls || 'LH-101'
            ),
      };
    });
  },

  /**
   * Generates the student's exact weekly timetable slots based on their assigned groups
   */
  generateTimetableForStudent(rollNo: string): TimetableSlot[] {
    const oldRoll = toOldRollNo(rollNo);
    const newRoll = toNewRollNo(rollNo);
    const master = getMasterStudent(rollNo) || getMasterStudent(newRoll) || getMasterStudent(oldRoll);
    const batchLetter = master?.batch || (newRoll.length >= 5 ? newRoll.charAt(3) : 'A');
    const sectionGroupNum = batchLetter === 'B' ? 2 : batchLetter === 'C' ? 3 : batchLetter === 'D' ? 4 : 1;

    const rawSlots = getPsgimTimetable(oldRoll) || getPsgimTimetable(rollNo);
    if (!rawSlots || rawSlots.length === 0) return [];

    return rawSlots.map((slot) => {
      const course = PSGIM_COURSES[slot.shortForm];
      const faculty = course?.faculty[sectionGroupNum] || slot.faculty || 'Faculty';
      return {
        id: slot.id,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subjectId: `sub_${slot.shortForm.toLowerCase()}`,
        room: slot.room,
        faculty: faculty,
      };
    });
  },
};


