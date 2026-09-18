import { Subject, TimetableSlot } from '../types';
import {
  STUDENT_REGISTRY,
  PSGIM_COURSES,
  getTimetableForStudent as getPsgimTimetable,
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
    const student = this.getStudent(oldRoll) || STUDENT_REGISTRY['D26AA01'];
    const batches = student.batches;
    const mcobData = getMcobData(oldRoll) || getMcobData(rollNo);

    // Seed attendance statistics for other courses
    const attendancePresets: Record<string, { attended: number; total: number; hasMedicalClaim?: boolean }> = {
      MCOB: { attended: 26, total: 30 },
      EDM: { attended: 28, total: 41, hasMedicalClaim: true },
      ADM: { attended: 29, total: 32 },
      BS: { attended: 20, total: 28 },
      MC: { attended: 27, total: 30 },
      SSA: { attended: 18, total: 20 },
      SSM: { attended: 14, total: 16 },
      LA: { attended: 15, total: 18 },
      SPORTS: { attended: 7, total: 8 },
    };

    return Object.entries(batches).map(([courseKey, batchCode]) => {
      const course = PSGIM_COURSES[courseKey];
      const isBlankBatch = !batchCode || batchCode.trim() === '';
      const groupNum = isBlankBatch ? 0 : (parseInt(batchCode.replace(/\D/g, ''), 10) || 1);
      const faculty = isBlankBatch ? '' : (course?.faculty[groupNum] || 'Faculty');
      const stats = attendancePresets[courseKey] || { attended: 20, total: 24 };

      const isMcob = courseKey === 'MCOB' && mcobData;
      const attended = isMcob ? mcobData.attendedHours : (isBlankBatch ? 0 : stats.attended);
      const total = isMcob ? mcobData.totalHours : (isBlankBatch ? 0 : stats.total);
      const officialAttended = isMcob ? mcobData.attendedHours : (isBlankBatch ? 0 : Math.max(0, stats.attended - 2));
      const officialTotal = isMcob ? mcobData.totalHours : (isBlankBatch ? 0 : Math.max(0, stats.total - 2));

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
        lastOfficialUpdate: '2026-09-15',
        batch: isBlankBatch ? '' : batchCode,
        faculty: isBlankBatch ? '' : faculty,
        room: isBlankBatch ? '' : (course?.halls || 'LH-101'),
      };
    });
  },

  /**
   * Generates the student's exact weekly timetable slots based on their assigned groups
   */
  generateTimetableForStudent(rollNo: string): TimetableSlot[] {
    const oldRoll = toOldRollNo(rollNo);
    const rawSlots = getPsgimTimetable(oldRoll) || getPsgimTimetable(rollNo);
    if (!rawSlots || rawSlots.length === 0) return [];

    return rawSlots.map((slot) => ({
      id: slot.id,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subjectId: `sub_${slot.shortForm.toLowerCase()}`,
      room: slot.room,
    }));
  },
};
