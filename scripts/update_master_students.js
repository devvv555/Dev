const fs = require('fs');
const path = require('path');
const ms = require('../tests/master_students.cjs');

let out = `// PSG College of Technology - Master MBA Student Directory (Batch 2026-28)
// Official Student Roster for Batches A, B, C, D (252 Students)

export interface PsgimStudentInfo {
  dRollNo: string;
  collegeRollNo: string;
  name: string;
  batch: 'A' | 'B' | 'C' | 'D' | 'AE';
  dob?: string;
  dobPassword?: string;
  bloodGroup?: string;
}

export const PSGIM_MASTER_STUDENTS: Record<string, PsgimStudentInfo> = {
`;

for (const [key, student] of Object.entries(ms.PSGIM_MASTER_STUDENTS)) {
  const fields = [
    `dRollNo: ${JSON.stringify(student.dRollNo)}`,
    `collegeRollNo: ${JSON.stringify(student.collegeRollNo)}`,
    `name: ${JSON.stringify(student.name)}`,
    `batch: ${JSON.stringify(student.batch)}`
  ];
  if (student.dob) fields.push(`dob: ${JSON.stringify(student.dob)}`);
  if (student.dobPassword) fields.push(`dobPassword: ${JSON.stringify(student.dobPassword)}`);
  if (student.bloodGroup) fields.push(`bloodGroup: ${JSON.stringify(student.bloodGroup)}`);

  out += `  ${JSON.stringify(key)}: { ${fields.join(', ')} },\n`;
}

out += `};

export const STUDENTS_BY_NEW_ROLL: Record<string, PsgimStudentInfo> = {};
export const STUDENTS_BY_OLD_ROLL: Record<string, PsgimStudentInfo> = PSGIM_MASTER_STUDENTS;

// Build lookup indexed by official college roll number (e.g. "26AA01")
Object.values(PSGIM_MASTER_STUDENTS).forEach((student) => {
  if (student.collegeRollNo) {
    STUDENTS_BY_NEW_ROLL[student.collegeRollNo.toUpperCase()] = student;
  }
});

export const ALL_COLLEGE_ROLL_NUMBERS = Object.keys(STUDENTS_BY_NEW_ROLL);

/**
 * Resolves a student by either their college roll no ("26AA01") or D roll no ("D26AA01")
 */
export function getStudentByAnyRoll(inputRoll: string): PsgimStudentInfo | null {
  if (!inputRoll) return null;
  const clean = inputRoll.trim().toUpperCase();

  // 1. Direct match in STUDENTS_BY_NEW_ROLL (e.g. "26AB12")
  if (STUDENTS_BY_NEW_ROLL[clean]) {
    return STUDENTS_BY_NEW_ROLL[clean];
  }

  // 2. Direct match in PSGIM_MASTER_STUDENTS (e.g. "D26AB05")
  if (PSGIM_MASTER_STUDENTS[clean]) {
    return PSGIM_MASTER_STUDENTS[clean];
  }

  // 3. Backward compatibility alias: if someone queries "26AB05", map to Devdarshan V
  if (clean === '26AB05' && PSGIM_MASTER_STUDENTS['D26AB05']) {
    return PSGIM_MASTER_STUDENTS['D26AB05'];
  }

  // 4. Fallback: handle with or without leading 'D'
  if (clean.startsWith('D')) {
    const withoutD = clean.substring(1);
    if (STUDENTS_BY_NEW_ROLL[withoutD]) return STUDENTS_BY_NEW_ROLL[withoutD];
  } else {
    const withD = 'D' + clean;
    if (PSGIM_MASTER_STUDENTS[withD]) return PSGIM_MASTER_STUDENTS[withD];
  }

  return null;
}

/**
 * Always returns the student's official college roll number without leading 'D' (e.g. "26AA01")
 */
export function toNewRollNo(inputRoll: string): string {
  if (!inputRoll) return '';
  const clean = inputRoll.trim().toUpperCase();
  if (clean === 'D26AB05' || clean === '26AB05') {
    return '26AB12';
  }
  const student = getStudentByAnyRoll(inputRoll);
  if (student) return student.collegeRollNo;
  return clean.startsWith('D') ? clean.substring(1) : clean;
}

/**
 * Returns the internal roll number with leading 'D' (e.g. "D26AA01") for schedule mapping
 */
export function toOldRollNo(inputRoll: string): string {
  if (!inputRoll) return '';
  const clean = inputRoll.trim().toUpperCase();
  if (clean === '26AB12') {
    return 'D26AB05';
  }
  const student = getStudentByAnyRoll(inputRoll);
  if (student) return student.dRollNo;
  return clean.startsWith('D') ? clean : 'D' + clean;
}

export function getMasterStudent(rollNo: string): PsgimStudentInfo | null {
  return getStudentByAnyRoll(rollNo);
}

/**
 * Resolves a student by their Name (case-insensitive, trims extra whitespace)
 */
export function getStudentByName(inputName: string): PsgimStudentInfo | null {
  if (!inputName) return null;
  const clean = inputName.trim().toUpperCase().replace(/\\s+/g, ' ');

  // 1. Direct match on name
  const exact = Object.values(PSGIM_MASTER_STUDENTS).find(
    (s) => s.name.toUpperCase().trim() === clean
  );
  if (exact) return exact;

  // 2. StartsWith match (e.g. "POOJA" -> "POOJA R")
  const startsWithMatches = Object.values(PSGIM_MASTER_STUDENTS).filter((s) =>
    s.name.toUpperCase().trim().startsWith(clean)
  );
  if (startsWithMatches.length === 1) return startsWithMatches[0];

  // 3. Substring match
  if (clean.length >= 3) {
    const includeMatches = Object.values(PSGIM_MASTER_STUDENTS).filter((s) =>
      s.name.toUpperCase().trim().includes(clean)
    );
    if (includeMatches.length >= 1) return includeMatches[0];
  }

  // 4. Fallback: check if the input was actually a roll number
  return getStudentByAnyRoll(inputName);
}
`;

const targetPath = path.join(__dirname, '../src/data/psgimMasterStudents.ts');
fs.writeFileSync(targetPath, out, 'utf8');
console.log('Successfully wrote', targetPath);
