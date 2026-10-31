const fs = require('fs');
const path = require('path');

// 1. Read official dynamic course list
const officialList = JSON.parse(
  fs.readFileSync('.agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json', 'utf8')
);

// 2. Read existing master students to preserve names
const masterContent = fs.readFileSync('src/data/psgimMasterStudents.ts', 'utf8');
const nameRegex = /"(D26[A-Z0-9]+)":\s*\{\s*dRollNo:\s*"[^"]+",\s*collegeRollNo:\s*"[^"]+",\s*name:\s*"([^"]+)",\s*batch:\s*"([^"]+)"/g;
let m;
const existingNames = {};
while ((m = nameRegex.exec(masterContent)) !== null) {
  existingNames[m[1]] = m[2];
}

// Default names for missing entries if not in existingNames
const defaultNames = {
  'D26AA25': 'KANISHKKA R',
  'D26AB14': 'DIVIT D S',
  'D26AC53': 'SINDHU S',
};

// Generate psgimMasterStudents.ts
let masterCode = `// PSG College of Technology - Master MBA Student Directory (Batch 2026-28)
// Official Student Roster for Batches A, B, C, D, AE (252 Students)

export interface PsgimStudentInfo {
  dRollNo: string;
  collegeRollNo: string;
  name: string;
  batch: 'A' | 'B' | 'C' | 'D' | 'AE';
  dob?: string;
  dobPassword?: string;
  bloodGroup?: string;
}

export const PSGIM_MASTER_STUDENTS: Record<string, PsgimStudentInfo> = {\n`;

// Group by batch section
const sections = ['A', 'B', 'C', 'D', 'AE'];
sections.forEach(sec => {
  const studentsInSec = officialList.filter(s => s.batchSection === sec);
  masterCode += `  // BATCH ${sec} (${studentsInSec.length} Students)\n`;
  studentsInSec.forEach(s => {
    const dRoll = s.dRollNo;
    const colRoll = dRoll.substring(1);
    let name = existingNames[dRoll] || defaultNames[dRoll] || `STUDENT ${dRoll.substring(3)}`;
    masterCode += `  "${dRoll}": { dRollNo: "${dRoll}", collegeRollNo: "${colRoll}", name: "${name}", batch: "${sec}" },\n`;
  });
});

masterCode += `};\n
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

  // 1. Direct match in PSGIM_MASTER_STUDENTS (e.g. "D26AA01")
  if (PSGIM_MASTER_STUDENTS[clean]) {
    return PSGIM_MASTER_STUDENTS[clean];
  }

  // 2. Direct match in STUDENTS_BY_NEW_ROLL (e.g. "26AA01")
  if (STUDENTS_BY_NEW_ROLL[clean]) {
    return STUDENTS_BY_NEW_ROLL[clean];
  }

  // 3. Fallback: handle with or without leading 'D'
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
  const student = getStudentByAnyRoll(inputRoll);
  if (student) return student.collegeRollNo;
  const clean = inputRoll.trim().toUpperCase();
  return clean.startsWith('D') ? clean.substring(1) : clean;
}

/**
 * Returns the internal roll number with leading 'D' (e.g. "D26AA01") for schedule mapping
 */
export function toOldRollNo(inputRoll: string): string {
  const student = getStudentByAnyRoll(inputRoll);
  if (student) return student.dRollNo;
  const clean = inputRoll.trim().toUpperCase();
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

fs.writeFileSync('src/data/psgimMasterStudents.ts', masterCode, 'utf8');
console.log('Updated src/data/psgimMasterStudents.ts successfully.');
