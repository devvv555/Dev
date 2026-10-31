// PSG Institute of Management - Adversarial Challenger Audit Suite
// Independent verification harness by Challenger 2
// Strictly compliant with project-wide Zero Emoji Policy.

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { execSync } = require('child_process');

// 1. Transparent TypeScript on-the-fly compiler hook for Node.js
require.extensions['.ts'] = function (module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      skipLibCheck: true
    }
  });
  module._compile(compiled.outputText, filename);
};

const ROOT_DIR = path.resolve(__dirname, '..');
const psgimDataPath = path.join(ROOT_DIR, 'src', 'data', 'psgimData.ts');
const psgimMasterPath = path.join(ROOT_DIR, 'src', 'data', 'psgimMasterStudents.ts');
const officialSpecPath = path.join(ROOT_DIR, '.agents', 'teamwork', 'spec_miner_survey_1', 'official_dynamic_course_batch_list.json');

const psgimData = require(psgimDataPath);
const psgimMaster = require(psgimMasterPath);
const officialStudents = JSON.parse(fs.readFileSync(officialSpecPath, 'utf8'));

// Audit tracking
let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failureLog = [];

function assertCheck(category, checkId, description, condition, actual, expected) {
  totalChecks++;
  if (condition) {
    passedChecks++;
  } else {
    failedChecks++;
    failureLog.push({
      category,
      checkId,
      description,
      actual,
      expected
    });
    console.error(`[FAIL] ${category} | ${checkId}: ${description}`);
    if (actual !== undefined || expected !== undefined) {
      console.error(`       Expected: ${JSON.stringify(expected)}`);
      console.error(`       Actual:   ${JSON.stringify(actual)}`);
    }
  }
}

console.log('================================================================================');
console.log('CHALLENGER 2: ADVERSARIAL VERIFICATION AUDIT');
console.log('================================================================================');

// -----------------------------------------------------------------------------
// SECTION 1: MASTER DATA CROSS-VERIFICATION (R1 & R2)
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 1: STUDENT REGISTRY & MASTER ROSTER CROSS-VERIFICATION ---');

// Check 1.1: Official student count
assertCheck(
  'Data Consistency',
  'CHALLENGE-1.1',
  'Official student circular contains exactly 252 students',
  officialStudents.length === 252,
  officialStudents.length,
  252
);

// Check 1.2: Batch breakdown
const batchCounts = { A: 0, B: 0, C: 0, D: 0, AE: 0 };
officialStudents.forEach((s) => {
  if (batchCounts[s.batchSection] !== undefined) {
    batchCounts[s.batchSection]++;
  }
});
assertCheck(
  'Data Consistency',
  'CHALLENGE-1.2A',
  'Batch A contains exactly 60 students',
  batchCounts.A === 60,
  batchCounts.A,
  60
);
assertCheck(
  'Data Consistency',
  'CHALLENGE-1.2B',
  'Batch B contains exactly 60 students',
  batchCounts.B === 60,
  batchCounts.B,
  60
);
assertCheck(
  'Data Consistency',
  'CHALLENGE-1.2C',
  'Batch C contains exactly 60 students',
  batchCounts.C === 60,
  batchCounts.C,
  60
);
assertCheck(
  'Data Consistency',
  'CHALLENGE-1.2D',
  'Batch D contains exactly 60 students',
  batchCounts.D === 60,
  batchCounts.D,
  60
);
assertCheck(
  'Data Consistency',
  'CHALLENGE-1.2E',
  'Batch AE contains exactly 12 students',
  batchCounts.AE === 12,
  batchCounts.AE,
  12
);

// Check 1.3: D26AE10 omission confirmed
const hasAE10 = officialStudents.some((s) => s.dRollNo === 'D26AE10');
assertCheck(
  'Data Consistency',
  'CHALLENGE-1.3',
  'Batch AE explicitly omits D26AE10 per official circular',
  hasAE10 === false,
  hasAE10,
  false
);

// Check 1.4: Line-by-line course group match for all 252 students x 8 dynamic courses
const dynamicCourses = ['MCOB', 'ADM', 'MC', 'SSM', 'BS', 'EDM', 'LA', 'SSA'];
let courseDiscrepancies = 0;
let missingRegistryCount = 0;
let missingBidirectionalCount = 0;

for (const official of officialStudents) {
  const dRoll = official.dRollNo;
  const colRoll = dRoll.substring(1);

  const regEntryD = psgimData.STUDENT_REGISTRY[dRoll];
  const regEntryCol = psgimData.STUDENT_REGISTRY[colRoll];

  if (!regEntryD) {
    missingRegistryCount++;
    continue;
  }
  if (!regEntryCol) {
    missingBidirectionalCount++;
  }

  for (const course of dynamicCourses) {
    const expected = official.courses[course];
    const actual = regEntryD.batches[course];
    if (actual !== expected) {
      courseDiscrepancies++;
      console.error(`Discrepancy at ${dRoll} course ${course}: expected ${expected}, got ${actual}`);
    }
  }

  // Sports group check
  if (official.batchSection !== 'AE') {
    const expSports = official.courses.SPORTS;
    const actSports = regEntryD.batches.SPORTS;
    if (actSports !== expSports) {
      courseDiscrepancies++;
      console.error(`Discrepancy at ${dRoll} SPORTS: expected ${expSports}, got ${actSports}`);
    }
  } else {
    // Batch AE must have non-empty valid SPORTS assignment
    const actSports = regEntryD.batches.SPORTS;
    if (!actSports || !/^SPORTS[1-4]$/.test(actSports)) {
      courseDiscrepancies++;
      console.error(`Invalid Batch AE sports at ${dRoll}: got ${actSports}`);
    }
  }
}

assertCheck(
  'Data Consistency',
  'CHALLENGE-1.4',
  'All 252 students present in STUDENT_REGISTRY via D-Roll',
  missingRegistryCount === 0,
  missingRegistryCount,
  0
);
assertCheck(
  'Data Consistency',
  'CHALLENGE-1.5',
  'All 252 students accessible in STUDENT_REGISTRY via College Roll without D',
  missingBidirectionalCount === 0,
  missingBidirectionalCount,
  0
);
assertCheck(
  'Data Consistency',
  'CHALLENGE-1.6',
  '0% course discrepancy across all 2,016 dynamic course assignments',
  courseDiscrepancies === 0,
  courseDiscrepancies,
  0
);

// Check 1.7: Roll number synchronization in PSGIM_MASTER_STUDENTS
let unmappedMasterCount = 0;
let offsetMismatchCount = 0;

for (const official of officialStudents) {
  const dRoll = official.dRollNo;
  const colRoll = dRoll.substring(1);

  const masterEntry = psgimMaster.PSGIM_MASTER_STUDENTS[dRoll];
  if (!masterEntry) {
    unmappedMasterCount++;
    continue;
  }

  if (masterEntry.collegeRollNo !== colRoll) {
    offsetMismatchCount++;
  }

  const resolvedOld = psgimMaster.toOldRollNo(colRoll);
  const resolvedNew = psgimMaster.toNewRollNo(dRoll);
  const resolvedAnyFromCol = psgimMaster.getStudentByAnyRoll(colRoll);
  const resolvedAnyFromOld = psgimMaster.getStudentByAnyRoll(dRoll);

  if (resolvedOld !== dRoll || resolvedNew !== colRoll) {
    offsetMismatchCount++;
  }
  if (!resolvedAnyFromCol || resolvedAnyFromCol.dRollNo !== dRoll) {
    offsetMismatchCount++;
  }
  if (!resolvedAnyFromOld || resolvedAnyFromOld.collegeRollNo !== colRoll) {
    offsetMismatchCount++;
  }
}

assertCheck(
  'Data Consistency',
  'CHALLENGE-1.7',
  'All 252 students mapped in PSGIM_MASTER_STUDENTS',
  unmappedMasterCount === 0,
  unmappedMasterCount,
  0
);
assertCheck(
  'Data Consistency',
  'CHALLENGE-1.8',
  '0 offset mismatches between college roll numbers and internal D-Roll numbers',
  offsetMismatchCount === 0,
  offsetMismatchCount,
  0
);

// Check 1.9: Acceptance criteria test cases
const tc1 = psgimData.STUDENT_REGISTRY['26AA01'];
const tc1D = psgimData.STUDENT_REGISTRY['D26AA01'];
const tc1Expected = {
  MCOB: 'MCOB1',
  ADM: 'ADM1',
  MC: 'MC2',
  SSM: 'SSM1',
  BS: 'BS1',
  EDM: 'EDM3',
  LA: 'LA1',
  SSA: 'SSA3'
};
let tc1Match = true;
if (!tc1 || !tc1D) {
  tc1Match = false;
} else {
  for (const [k, v] of Object.entries(tc1Expected)) {
    if (tc1.batches[k] !== v || tc1D.batches[k] !== v) tc1Match = false;
  }
}
assertCheck(
  'Data Consistency',
  'CHALLENGE-1.9',
  'Verified test case 1: 26AA01 / D26AA01 resolves to MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3',
  tc1Match,
  tc1Match,
  true
);

const tc2 = psgimData.STUDENT_REGISTRY['26AB05'];
const tc2D = psgimData.STUDENT_REGISTRY['D26AB05'];
const tc2Expected = {
  MCOB: 'MCOB1',
  ADM: 'ADM2',
  MC: 'MC3',
  SSM: 'SSM2',
  BS: 'BS2',
  EDM: 'EDM1',
  LA: 'LA1',
  SSA: 'SSA3'
};
let tc2Match = true;
if (!tc2 || !tc2D) {
  tc2Match = false;
} else {
  for (const [k, v] of Object.entries(tc2Expected)) {
    if (tc2.batches[k] !== v || tc2D.batches[k] !== v) tc2Match = false;
  }
}
assertCheck(
  'Data Consistency',
  'CHALLENGE-1.10',
  'Verified test case 2: 26AB05 resolves to MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3',
  tc2Match,
  tc2Match,
  true
);

// Check 1.11: Specific previously missing students present
const checkEdgeStudents = ['D26AA25', 'D26AB14', 'D26AC53', 'D26AE01', 'D26AE13'];
for (const edgeRoll of checkEdgeStudents) {
  const inMaster = !!psgimMaster.PSGIM_MASTER_STUDENTS[edgeRoll];
  const inRegistry = !!psgimData.STUDENT_REGISTRY[edgeRoll];
  assertCheck(
    'Data Consistency',
    `CHALLENGE-1.11-${edgeRoll}`,
    `Critical student ${edgeRoll} present in both master roster and registry`,
    inMaster && inRegistry,
    { inMaster, inRegistry },
    { inMaster: true, inRegistry: true }
  );
}

// -----------------------------------------------------------------------------
// SECTION 2: EXHAUSTIVE TIMETABLE, FACULTY & CLASSROOM AUDIT (R3)
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 2: EXHAUSTIVE SCHEDULE SCAN (4,788 SLOTS) ---');

// Official Master Faculty Roster from ORIGINAL_REQUEST.md
const MASTER_FACULTY_ROSTER = {
  MCOB: {
    1: 'Dr. M. Kirupa Priyadarshini',
    2: 'Dr. Vijaya Vardhan Manchala',
    3: 'Dr. R. Indumathy',
    4: 'Dr. N. Udayakumar'
  },
  EDM: {
    1: 'Dr. Sreeanandan',
    2: 'Dr. Aiswarya D Pillai',
    3: 'Dr. E. Sri Varshini',
    4: 'Dr. Sreeanandan'
  },
  ADM: {
    1: 'Dr. J. Nancy Christina',
    2: 'Dr. D. Kavitha',
    3: 'Dr. Nithya',
    4: 'Dr. Aiswarya D Pillai'
  },
  BS: {
    1: 'Mr. T. Sathish',
    2: 'Dr. J. Sekkizhar',
    3: 'Dr. Ravi Shankar Jetti',
    4: 'Mr. T. Sathish'
  },
  MC: {
    1: 'Dr. R. Deepa',
    2: 'Dr. R. Indumathy',
    3: 'Dr. E. Sri Varshini',
    4: 'Dr. Chenna Upendra'
  },
  SSA: {
    1: 'Mr. G. Kangasabapathy',
    2: 'Mr. Imayavendan',
    3: 'Mr. G. Kangasabapathy',
    4: 'Mr. Imayavendan'
  },
  SSM: {
    1: 'Dr. D. Kavitha',
    2: 'Ms. C. Dhanya',
    3: 'Ms. Kanagathara',
    4: 'Dr. Venkatalakshmi'
  },
  LA: {
    1: 'Ms. C. Dhanya',
    2: 'Ms. C. Dhanya',
    3: 'Ms. C. Dhanya',
    4: 'Dr. Firdaus Bashir'
  },
  SPORTS: {
    1: 'Mr. Zakeer Khan',
    2: 'Mr. Zakeer Khan',
    3: 'Mr. Zakeer Khan',
    4: 'Mr. Zakeer Khan'
  }
};

// Expected Classrooms per ORIGINAL_REQUEST.md
const MASTER_ROOM_ROSTER = {
  MCOB: { 1: 'LH-101', 2: 'LH-109', 3: 'LH-401', 4: 'LH-405' },
  EDM: { 1: 'LH-101', 2: 'LH-109', 3: 'LH-401', 4: 'LH-405' },
  ADM: { 1: 'LH-101', 2: 'LH-109', 3: 'LH-401', 4: 'LH-405' },
  BS: { 1: 'LH-101', 2: 'LH-109', 3: 'LH-401', 4: 'LH-405' },
  MC: { 1: 'LH-101', 2: 'LH-109', 3: 'LH-401', 4: 'LH-405' },
  SSA: { 1: 'LH-401', 2: 'LH-405', 3: 'LH-101', 4: 'LH-109' },
  SPORTS: { 1: 'Sports Ground', 2: 'Sports Ground', 3: 'Sports Ground', 4: 'Sports Ground' }
};

const VALID_ROOMS = new Set(['LH-101', 'LH-109', 'LH-401', 'LH-405', 'Sports Ground', 'SSM', 'Auditorium']);

let totalScheduleSlotsChecked = 0;
let slashRoomCount = 0;
let unassignedRoomCount = 0;
let invalidRoomCount = 0;
let facultyMismatchCount = 0;
let unassignedFacultyCount = 0;
let slotCountDeviations = 0;
let bidirectionalTimetableMismatches = 0;
let internalCollisions = 0;

for (const student of officialStudents) {
  const dRoll = student.dRollNo;
  const colRoll = dRoll.substring(1);

  const dSlots = psgimData.getTimetableForStudent(dRoll);
  const colSlots = psgimData.getTimetableForStudent(colRoll);

  if (dSlots.length !== 19) {
    slotCountDeviations++;
    console.error(`Slot deviation for ${dRoll}: expected 19, got ${dSlots.length}`);
  }
  if (colSlots.length !== 19) {
    slotCountDeviations++;
  }

  // Bidirectional equality check: all semantic schedule properties must match 100%
  let semanticMatch = true;
  for (let i = 0; i < dSlots.length; i++) {
    const ds = dSlots[i];
    const cs = colSlots[i];
    const semanticFields = ['day', 'startTime', 'endTime', 'courseCode', 'courseTitle', 'shortForm', 'batch', 'faculty', 'room', 'color'];
    for (const f of semanticFields) {
      if (ds[f] !== cs[f]) {
        semanticMatch = false;
        console.error(`Field ${f} mismatch for ${dRoll} vs ${colRoll} at slot ${i}: '${ds[f]}' vs '${cs[f]}'`);
      }
    }
    // Verify slot id convention matches slot_<queriedRoll>_<day>_<index>
    if (ds.id !== `slot_${dRoll}_${ds.day}_${i}` || cs.id !== `slot_${colRoll}_${cs.day}_${i}`) {
      semanticMatch = false;
      console.error(`Slot ID format error: ${ds.id} vs ${cs.id}`);
    }
  }
  if (!semanticMatch) {
    bidirectionalTimetableMismatches++;
  }

  totalScheduleSlotsChecked += dSlots.length;

  // Check temporal collision within student's week
  const timeSeen = new Set();
  for (const slot of dSlots) {
    const key = `${slot.day}_${slot.startTime}_${slot.endTime}`;
    if (timeSeen.has(key)) {
      internalCollisions++;
      console.error(`Temporal collision in student ${dRoll} at ${key}`);
    }
    timeSeen.add(key);

    // 1. Room assertions
    if (typeof slot.room !== 'string' || slot.room.trim() === '') {
      unassignedRoomCount++;
    } else {
      if (slot.room.includes('/')) {
        slashRoomCount++;
        console.error(`Slash room detected: ${dRoll} ${slot.day} ${slot.startTime} -> ${slot.room}`);
      }
      if (/TBD|unassigned|unknown/i.test(slot.room)) {
        unassignedRoomCount++;
      }
      if (!VALID_ROOMS.has(slot.room)) {
        invalidRoomCount++;
        console.error(`Unrecognized room venue: ${dRoll} ${slot.day} ${slot.startTime} -> ${slot.room}`);
      }
    }

    // 2. Faculty assertions
    if (typeof slot.faculty !== 'string' || slot.faculty.trim() === '' || /TBD|unassigned/i.test(slot.faculty)) {
      unassignedFacultyCount++;
    }

    // 3. Faculty roster adherence
    const courseCode = slot.shortForm;
    if (MASTER_FACULTY_ROSTER[courseCode]) {
      // Find course group from slot.batch or student's registry
      const groupMatch = slot.batch ? slot.batch.match(/\d+$/) : null;
      const groupNum = groupMatch ? parseInt(groupMatch[0], 10) : 1;
      const expectedFaculty = MASTER_FACULTY_ROSTER[courseCode][groupNum];

      if (slot.faculty !== expectedFaculty) {
        facultyMismatchCount++;
        console.error(`Faculty mismatch for ${dRoll} course ${courseCode} group ${groupNum}: expected '${expectedFaculty}', got '${slot.faculty}'`);
      }
    }

    // 4. Room roster adherence for mapped subjects
    if (MASTER_ROOM_ROSTER[courseCode]) {
      const groupMatch = slot.batch ? slot.batch.match(/\d+$/) : null;
      const groupNum = groupMatch ? parseInt(groupMatch[0], 10) : 1;
      const expectedRoom = MASTER_ROOM_ROSTER[courseCode][groupNum];

      if (slot.room !== expectedRoom) {
        invalidRoomCount++;
        console.error(`Room mismatch for ${dRoll} course ${courseCode} group ${groupNum}: expected '${expectedRoom}', got '${slot.room}'`);
      }
    }
  }
}

assertCheck(
  'Timetable & Faculty',
  'CHALLENGE-2.1',
  'Exhaustive scan of all 4,788 schedule slots (252 students x 19 periods)',
  totalScheduleSlotsChecked === 4788,
  totalScheduleSlotsChecked,
  4788
);
assertCheck(
  'Timetable & Faculty',
  'CHALLENGE-2.2',
  'Every student resolves to exactly 19 periods (0 deviations)',
  slotCountDeviations === 0,
  slotCountDeviations,
  0
);
assertCheck(
  'Timetable & Faculty',
  'CHALLENGE-2.3',
  'Timetable identical when resolved via D-roll or College Roll',
  bidirectionalTimetableMismatches === 0,
  bidirectionalTimetableMismatches,
  0
);
assertCheck(
  'Timetable & Faculty',
  'CHALLENGE-2.4',
  'Strict 0 slash rooms across all 4,788 slots (regex /\\// matches 0)',
  slashRoomCount === 0,
  slashRoomCount,
  0
);
assertCheck(
  'Timetable & Faculty',
  'CHALLENGE-2.5',
  'Strict 0 unassigned, empty, or TBD rooms across all 4,788 slots',
  unassignedRoomCount === 0,
  unassignedRoomCount,
  0
);
assertCheck(
  'Timetable & Faculty',
  'CHALLENGE-2.6',
  '100% of rooms belong to designated official venues',
  invalidRoomCount === 0,
  invalidRoomCount,
  0
);
assertCheck(
  'Timetable & Faculty',
  'CHALLENGE-2.7',
  'Strict 0 faculty mismatches against 9-course master roster',
  facultyMismatchCount === 0,
  facultyMismatchCount,
  0
);
assertCheck(
  'Timetable & Faculty',
  'CHALLENGE-2.8',
  'Strict 0 unassigned or TBD faculty members across all 4,788 slots',
  unassignedFacultyCount === 0,
  unassignedFacultyCount,
  0
);
assertCheck(
  'Timetable & Faculty',
  'CHALLENGE-2.9',
  'Strict 0 time collisions or duplicate slots within each student schedule',
  internalCollisions === 0,
  internalCollisions,
  0
);

// -----------------------------------------------------------------------------
// SECTION 3: ADVERSARIAL EDGE CASES, FUZZING & CORNER CASES
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 3: ADVERSARIAL EDGE CASES & CORNER CASES ---');

// Fuzzing 3.1: Case insensitivity
const testRolls = ['d26aa01', '26aa01', 'd26ae05', '26ae05', 'd26ad60', '26ad60'];
let caseInsensitiveSuccess = true;
for (const roll of testRolls) {
  const slots = psgimData.getTimetableForStudent(roll);
  if (!slots || slots.length !== 19) {
    caseInsensitiveSuccess = false;
    console.error(`Case insensitivity failed for ${roll}`);
  }
}
assertCheck(
  'Edge Cases & Fuzzing',
  'CHALLENGE-3.1',
  'getTimetableForStudent is case-insensitive for lowercase input rolls',
  caseInsensitiveSuccess,
  caseInsensitiveSuccess,
  true
);

// Fuzzing 3.2: Whitespace padding
const paddedRolls = ['  D26AA01  ', ' 26AB05 ', '\tD26AE12\n'];
let whitespaceSuccess = true;
for (const roll of paddedRolls) {
  const masterStudent = psgimMaster.getStudentByAnyRoll(roll);
  const slots = psgimData.getTimetableForStudent(roll.trim());
  if (!masterStudent || !slots || slots.length !== 19) {
    whitespaceSuccess = false;
    console.error(`Whitespace tolerance failed for '${roll}'`);
  }
}
assertCheck(
  'Edge Cases & Fuzzing',
  'CHALLENGE-3.2',
  'getStudentByAnyRoll and timetable resolve padded roll numbers',
  whitespaceSuccess,
  whitespaceSuccess,
  true
);

// Fuzzing 3.3: Graceful fallback for non-existent rolls
const invalidRolls = ['INVALID99', 'D99ZZ99', '26ZZ99', '', null, undefined];
let gracefulFallbackSuccess = true;
for (const roll of invalidRolls) {
  try {
    const student = psgimMaster.getStudentByAnyRoll(roll);
    const slots = psgimData.getTimetableForStudent(roll);
    if (student !== null) gracefulFallbackSuccess = false;
    if (!Array.isArray(slots)) gracefulFallbackSuccess = false;
  } catch (err) {
    gracefulFallbackSuccess = false;
    console.error(`Crash on invalid roll '${roll}':`, err.message);
  }
}
assertCheck(
  'Edge Cases & Fuzzing',
  'CHALLENGE-3.3',
  'Non-existent or null roll inputs return graceful fallbacks without crashing',
  gracefulFallbackSuccess,
  gracefulFallbackSuccess,
  true
);

// Fuzzing 3.4: resolveExactRoom pure function test
const testRoomResolutions = [
  { course: 'SPORTS', group: 1, def: 'Ground', exp: 'Sports Ground' },
  { course: 'CLUB', group: 1, def: 'Auditorium / Clubs', exp: 'Auditorium' },
  { course: 'SSM', group: 1, def: 'SSM', exp: 'SSM' },
  { course: 'SSM', group: 2, def: 'LH-109', exp: 'LH-109' },
  { course: 'SSA', group: 1, def: 'LH-401/405', exp: 'LH-401' },
  { course: 'SSA', group: 2, def: 'LH-401/405', exp: 'LH-405' },
  { course: 'SSA', group: 3, def: 'LH-101/109', exp: 'LH-101' },
  { course: 'SSA', group: 4, def: 'LH-101/109', exp: 'LH-109' },
  { course: 'MCOB', group: 1, def: 'LH-101/109', exp: 'LH-101' },
  { course: 'MCOB', group: 2, def: 'LH-101/109', exp: 'LH-109' },
  { course: 'MCOB', group: 3, def: 'LH-101/109', exp: 'LH-401' },
  { course: 'MCOB', group: 4, def: 'LH-101/109', exp: 'LH-405' }
];

let pureRoomSuccess = true;
for (const tr of testRoomResolutions) {
  const res = psgimData.resolveExactRoom(tr.course, tr.group, tr.def);
  if (res !== tr.exp || res.includes('/')) {
    pureRoomSuccess = false;
    console.error(`resolveExactRoom mismatch for ${tr.course} group ${tr.group}: expected ${tr.exp}, got ${res}`);
  }
}
assertCheck(
  'Edge Cases & Fuzzing',
  'CHALLENGE-3.4',
  'resolveExactRoom resolves individual venues with zero slashes across all courses and groups',
  pureRoomSuccess,
  pureRoomSuccess,
  true
);

// -----------------------------------------------------------------------------
// SECTION 4: CODEBASE QUALITY, ZERO EMOJI & BUILD COMPLIANCE (R4)
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 4: ZERO EMOJI POLICY & BUILD COMPLIANCE ---');

// Check 4.1: Zero Emoji audit in modified files
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const filesToEmojiCheck = [
  path.join(ROOT_DIR, 'src', 'data', 'psgimData.ts'),
  path.join(ROOT_DIR, 'src', 'data', 'psgimMasterStudents.ts'),
  path.join(ROOT_DIR, 'scripts', 'buildPwa.js')
];

let emojiViolations = 0;
for (const filePath of filesToEmojiCheck) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (emojiRegex.test(content)) {
    emojiViolations++;
    console.error(`Emoji detected in file: ${filePath}`);
  }
}
assertCheck(
  'Code Quality',
  'CHALLENGE-4.1',
  'Zero Emoji Policy maintained in psgimData.ts, psgimMasterStudents.ts, and buildPwa.js',
  emojiViolations === 0,
  emojiViolations,
  0
);

// Check 4.2: TypeScript compilation
let tscClean = false;
try {
  console.log('Running npx tsc --noEmit...');
  execSync('npx tsc --noEmit', { cwd: ROOT_DIR, stdio: 'pipe' });
  tscClean = true;
} catch (err) {
  console.error('TypeScript compilation error:', err.stdout ? err.stdout.toString() : err.message);
}
assertCheck(
  'Code Quality',
  'CHALLENGE-4.2',
  'TypeScript compiler exits cleanly with zero errors (npx tsc --noEmit)',
  tscClean,
  tscClean,
  true
);

// Check 4.3: Production build
let buildClean = false;
try {
  console.log('Running npm run build:pwa...');
  execSync('npm run build:pwa', { cwd: ROOT_DIR, stdio: 'pipe' });
  buildClean = true;
} catch (err) {
  console.error('PWA build error:', err.stdout ? err.stdout.toString() : err.message);
}
assertCheck(
  'Code Quality',
  'CHALLENGE-4.3',
  'Production PWA build completes with exit code 0 (npm run build:pwa)',
  buildClean,
  buildClean,
  true
);

// -----------------------------------------------------------------------------
// SUMMARY & VERDICT
// -----------------------------------------------------------------------------
console.log('\n================================================================================');
console.log('CHALLENGER 2 AUDIT SUMMARY');
console.log('================================================================================');
console.log(`Total Checks:  ${totalChecks}`);
console.log(`Passed Checks: ${passedChecks}`);
console.log(`Failed Checks: ${failedChecks}`);
const verdict = failedChecks === 0 ? 'APPROVE' : 'REQUEST_CHANGES';
console.log(`VERDICT:       ${verdict}`);
console.log('================================================================================');

if (failedChecks > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
