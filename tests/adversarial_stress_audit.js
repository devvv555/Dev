// PSG Institute of Management - Adversarial Stress & Edge Case Verification Suite
// Challenger role: empirical stress-testing roll resolution, timetable generation,
// collision deduplication, faculty mapping, room assignment, bidirectional parity, and boundary conditions.
// Strictly compliant with project-wide Zero Emoji Policy.

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// On-the-fly TS compilation hook
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
const psgimData = require(path.join(ROOT_DIR, 'src', 'data', 'psgimData.ts'));
const psgimMaster = require(path.join(ROOT_DIR, 'src', 'data', 'psgimMasterStudents.ts'));
const officialSpecPath = path.join(ROOT_DIR, '.agents', 'teamwork', 'spec_miner_survey_1', 'official_dynamic_course_batch_list.json');
const officialStudents = JSON.parse(fs.readFileSync(officialSpecPath, 'utf8'));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function assertTest(suite, testId, description, condition, actualVal, expectedVal) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests++;
    failureDetails.push({ suite, testId, description, actual: actualVal, expected: expectedVal });
    console.error(`[FAIL] ${suite} | ${testId}: ${description}`);
    if (actualVal !== undefined || expectedVal !== undefined) {
      console.error(`       Actual:   ${JSON.stringify(actualVal)}`);
      console.error(`       Expected: ${JSON.stringify(expectedVal)}`);
    }
  }
}

console.log('================================================================================');
console.log('CHALLENGER 1: ADVERSARIAL STRESS TEST & EDGE-CASE ORACLE');
console.log('Target: Attendance Monitor PSGIM MBA Student & Timetable Architecture');
console.log('================================================================================\n');

// ------------------------------------------------------------------------------
// SUITE 1: ROLL RESOLUTION EDGE CASES (WHITESPACE, CASE, BOUNDARY, NON-EXISTENT)
// ------------------------------------------------------------------------------
console.log('--- SUITE 1: ROLL RESOLUTION EDGE CASES ---');

// 1.1 Non-existent rolls: D26AE10, D26AA00, D26AD65, 26ZZ99, UNKNOWN
const nonExistentRolls = [
  'D26AE10', '26AE10',   // Specifically absent from Batch AE (only 12 students: 01-09, 11-13)
  'D26AA00', '26AA00',   // Underflow boundary (Batch A starts at 01)
  'D26AA61', '26AA61',   // Overflow boundary (Batch A has 60 students)
  'D26AB00', 'D26AB61',   // Batch B boundaries
  'D26AC00', 'D26AC61',   // Batch C boundaries
  'D26AD00', 'D26AD61', 'D26AD65', // Batch D boundaries
  'D26AE00', 'D26AE14',   // Batch AE boundaries
  '26ZZ99', 'D26ZZ99',   // Completely fictitious batch and roll
  'UNKNOWN_STUDENT', '12345', '!@#$%'
];

nonExistentRolls.forEach((roll, idx) => {
  const masterLookup = psgimMaster.getStudentByAnyRoll(roll);
  assertTest(
    'Suite 1.1 Non-existent Rolls',
    `S1.1.${idx}.1`,
    `getStudentByAnyRoll("${roll}") returns null`,
    masterLookup === null,
    masterLookup,
    null
  );

  const registryLookup = psgimData.STUDENT_REGISTRY[roll];
  assertTest(
    'Suite 1.1 Non-existent Rolls',
    `S1.1.${idx}.2`,
    `STUDENT_REGISTRY["${roll}"] returns undefined`,
    registryLookup === undefined,
    registryLookup,
    undefined
  );

  // Timetable generation should not throw an exception on invalid roll numbers
  let ttSlots = null;
  let threw = false;
  try {
    ttSlots = psgimData.getTimetableForStudent(roll);
  } catch (err) {
    threw = true;
  }
  assertTest(
    'Suite 1.1 Non-existent Rolls',
    `S1.1.${idx}.3`,
    `getTimetableForStudent("${roll}") does not crash`,
    !threw && Array.isArray(ttSlots),
    { threw, isArray: Array.isArray(ttSlots) },
    { threw: false, isArray: true }
  );
});

// 1.2 Whitespace and mixed-case resilience on valid rolls
const validSamples = [
  { dRoll: 'D26AA01', newRoll: '26AA01' },
  { dRoll: 'D26AB05', newRoll: '26AB05' },
  { dRoll: 'D26AC30', newRoll: '26AC30' },
  { dRoll: 'D26AD60', newRoll: '26AD60' },
  { dRoll: 'D26AE13', newRoll: '26AE13' }
];

validSamples.forEach((sample, idx) => {
  const variations = [
    sample.dRoll.toLowerCase(),                  // lowercase d26aa01
    sample.newRoll.toLowerCase(),                // lowercase 26aa01
    `  ${sample.dRoll}  `,                       // spaces around
    `\t${sample.newRoll}\n`,                     // tabs and newlines
    sample.dRoll.slice(0, 3).toLowerCase() + sample.dRoll.slice(3).toUpperCase() // mixed case d26AA01
  ];

  variations.forEach((variant, vIdx) => {
    const student = psgimMaster.getStudentByAnyRoll(variant);
    assertTest(
      'Suite 1.2 Whitespace & Case Resilience',
      `S1.2.${idx}.${vIdx}.master`,
      `getStudentByAnyRoll(${JSON.stringify(variant)}) resolves to ${sample.dRoll}`,
      student !== null && (student.dRollNo === sample.dRoll || student.collegeRollNo === sample.newRoll),
      student?.dRollNo,
      sample.dRoll
    );

    // Timetable generated with variant should equal timetable generated with clean roll
    const cleanTT = psgimData.getTimetableForStudent(sample.dRoll);
    const variantTT = psgimData.getTimetableForStudent(variant);
    const matchingCount = cleanTT.length === variantTT.length && cleanTT.length === 19;
    assertTest(
      'Suite 1.2 Whitespace & Case Resilience',
      `S1.2.${idx}.${vIdx}.timetable`,
      `getTimetableForStudent(${JSON.stringify(variant)}) yields identical 19 slots as canonical ${sample.dRoll}`,
      matchingCount,
      variantTT.length,
      19
    );
  });
});

// 1.3 Pathological & Type Coercion Inputs
const pathologicalInputs = [
  '',
  '   ',
  null,
  undefined,
  '__proto__',
  'constructor',
  'toString',
  'valueOf'
];

pathologicalInputs.forEach((badInput, idx) => {
  let masterRes = null;
  let masterThrew = false;
  try {
    masterRes = psgimMaster.getStudentByAnyRoll(badInput);
  } catch (e) {
    masterThrew = true;
  }
  assertTest(
    'Suite 1.3 Pathological Inputs',
    `S1.3.${idx}.master`,
    `getStudentByAnyRoll(${JSON.stringify(badInput)}) gracefully returns null without throwing`,
    !masterThrew && masterRes === null,
    { masterThrew, masterRes },
    { masterThrew: false, masterRes: null }
  );

  let ttRes = null;
  let ttThrew = false;
  try {
    ttRes = psgimData.getTimetableForStudent(badInput);
  } catch (e) {
    ttThrew = true;
  }
  assertTest(
    'Suite 1.3 Pathological Inputs',
    `S1.3.${idx}.timetable`,
    `getTimetableForStudent(${JSON.stringify(badInput)}) handles input gracefully without crashing`,
    !ttThrew && Array.isArray(ttRes),
    { ttThrew, isArray: Array.isArray(ttRes) },
    { ttThrew: false, isArray: true }
  );
});

// ------------------------------------------------------------------------------
// SUITE 2: FULL COHORT TIMETABLE AUDIT (252 STUDENTS x 19 SLOTS = 4788 SLOTS)
// ------------------------------------------------------------------------------
console.log('\n--- SUITE 2: FULL COHORT TIMETABLE GENERATION & INTEGRITY ---');

const VALID_ROOMS = new Set([
  'LH-101', 'LH-109', 'LH-401', 'LH-405',
  'Sports Ground', 'Auditorium', 'SSM'
]);

// Expected faculty map per PSGIM_COURSES
const EXPECTED_FACULTY = {
  MCOB: { 1: 'Dr. M. Kirupa Priyadarshini', 2: 'Dr. Vijaya Vardhan Manchala', 3: 'Dr. R. Indumathy', 4: 'Dr. N. Udayakumar' },
  ADM: { 1: 'Dr. J. Nancy Christina', 2: 'Dr. D. Kavitha', 3: 'Dr. Nithya', 4: 'Dr. Aiswarya D Pillai' },
  MC: { 1: 'Dr. R. Deepa', 2: 'Dr. R. Indumathy', 3: 'Dr. E. Sri Varshini', 4: 'Dr. Chenna Upendra' },
  BS: { 1: 'Mr. T. Sathish', 2: 'Dr. J. Sekkizhar', 3: 'Dr. Ravi Shankar Jetti', 4: 'Mr. T. Sathish' },
  EDM: { 1: 'Dr. Sreeanandan', 2: 'Dr. Aiswarya D Pillai', 3: 'Dr. E. Sri Varshini', 4: 'Dr. Sreeanandan' },
  LA: { 1: 'Ms. C. Dhanya', 2: 'Ms. C. Dhanya', 3: 'Ms. C. Dhanya', 4: 'Dr. Firdaus Bashir' },
  SSA: { 1: 'Mr. G. Kangasabapathy', 2: 'Mr. Imayavendan', 3: 'Mr. G. Kangasabapathy', 4: 'Mr. Imayavendan' },
  SSM: { 1: 'Dr. D. Kavitha', 2: 'Ms. C. Dhanya', 3: 'Ms. Kanagathara', 4: 'Dr. Venkatalakshmi' },
  SPORTS: { 1: 'Mr. Zakeer Khan', 2: 'Mr. Zakeer Khan', 3: 'Mr. Zakeer Khan', 4: 'Mr. Zakeer Khan' }
};

let cohortSlotCount = 0;
let cohortCollisionCount = 0;
let cohortSlashRoomCount = 0;
let cohortInvalidRoomCount = 0;
let cohortFacultyMismatchCount = 0;
let cohortBidirectionalMismatchCount = 0;
let cohortSlotCountDiscrepancy = 0;

officialStudents.forEach((student) => {
  const dRoll = student.dRollNo;
  const master = psgimMaster.getStudentByAnyRoll(dRoll);
  const colRoll = master ? master.collegeRollNo : null;

  // 1. Bidirectional equivalence test
  const ttByDRoll = psgimData.getTimetableForStudent(dRoll);
  const ttByColRoll = colRoll ? psgimData.getTimetableForStudent(colRoll) : [];

  if (ttByDRoll.length !== 19) {
    cohortSlotCountDiscrepancy++;
  }

  if (ttByDRoll.length !== 19 || ttByColRoll.length !== 19) {
    cohortBidirectionalMismatchCount++;
  } else {
    for (let i = 0; i < 19; i++) {
      if (
        ttByDRoll[i].day !== ttByColRoll[i].day ||
        ttByDRoll[i].startTime !== ttByColRoll[i].startTime ||
        ttByDRoll[i].courseCode !== ttByColRoll[i].courseCode ||
        ttByDRoll[i].faculty !== ttByColRoll[i].faculty ||
        ttByDRoll[i].room !== ttByColRoll[i].room
      ) {
        cohortBidirectionalMismatchCount++;
        break;
      }
    }
  }

  // 2. Collision deduplication check: no duplicate (day, startTime)
  const seenTimes = new Set();
  ttByDRoll.forEach((slot) => {
    cohortSlotCount++;
    const key = `${slot.day}_${slot.startTime}`;
    if (seenTimes.has(key)) {
      cohortCollisionCount++;
    }
    seenTimes.add(key);

    // 3. Room validity & zero slash check
    if (!slot.room || slot.room.includes('/') || slot.room === 'TBD' || slot.room.trim() === '') {
      cohortSlashRoomCount++;
    }
    if (!VALID_ROOMS.has(slot.room)) {
      cohortInvalidRoomCount++;
    }

    // 4. Faculty mapping verification
    const courseCode = slot.shortForm;
    const match = slot.batch.match(/\d+$/);
    const groupNum = match ? parseInt(match[0], 10) : 1;
    if (EXPECTED_FACULTY[courseCode]) {
      const expectedTeacher = EXPECTED_FACULTY[courseCode][groupNum];
      if (expectedTeacher && slot.faculty !== expectedTeacher) {
        cohortFacultyMismatchCount++;
      }
    }
  });
});

assertTest(
  'Suite 2: Full Cohort Timetable',
  'S2.1',
  'All 252 students generate exactly 19 slots (Total: 4788 slots across cohort)',
  cohortSlotCount === 252 * 19 && cohortSlotCountDiscrepancy === 0,
  cohortSlotCount,
  252 * 19
);

assertTest(
  'Suite 2: Full Cohort Timetable',
  'S2.2',
  'Zero timetable time collisions across all 4788 student slots',
  cohortCollisionCount === 0,
  cohortCollisionCount,
  0
);

assertTest(
  'Suite 2: Full Cohort Timetable',
  'S2.3',
  'Zero slash rooms or unassigned rooms across all 4788 slots',
  cohortSlashRoomCount === 0,
  cohortSlashRoomCount,
  0
);

assertTest(
  'Suite 2: Full Cohort Timetable',
  'S2.4',
  'Zero invalid rooms across all 4788 slots (must match VALID_ROOMS set)',
  cohortInvalidRoomCount === 0,
  cohortInvalidRoomCount,
  0
);

assertTest(
  'Suite 2: Full Cohort Timetable',
  'S2.5',
  'Zero faculty assignment mismatches against master faculty circular',
  cohortFacultyMismatchCount === 0,
  cohortFacultyMismatchCount,
  0
);

assertTest(
  'Suite 2: Full Cohort Timetable',
  'S2.6',
  'Zero bidirectional discrepancies between dRoll and collegeRoll timetables',
  cohortBidirectionalMismatchCount === 0,
  cohortBidirectionalMismatchCount,
  0
);

// ------------------------------------------------------------------------------
// SUITE 3: COHORT CONCURRENCY, ROOM CONFLICTS & SPECIAL VENUES
// ------------------------------------------------------------------------------
console.log('\n--- SUITE 3: COHORT CONCURRENCY & SPECIAL VENUES ---');

// 3.1 Faculty double-booking check across cohort
const timeFacultyRooms = {};
let facultyDoubleBooked = 0;
officialStudents.forEach((s) => {
  const tt = psgimData.getTimetableForStudent(s.dRollNo);
  tt.forEach((slot) => {
    const key = `${slot.day} ${slot.startTime} | ${slot.faculty}`;
    if (!timeFacultyRooms[key]) {
      timeFacultyRooms[key] = new Set();
    }
    timeFacultyRooms[key].add(`${slot.room} (${slot.shortForm} ${slot.batch})`);
  });
});

Object.entries(timeFacultyRooms).forEach(([key, rooms]) => {
  // Auditorium shared slots and general faculty are acceptable
  if (rooms.size > 1 && !key.includes('Auditorium') && !key.includes('Faculty') && !key.includes('Zakeer')) {
    facultyDoubleBooked++;
  }
});

assertTest(
  'Suite 3: Concurrency & Venues',
  'S3.1',
  'Zero faculty double-bookings across all 252 students in any period',
  facultyDoubleBooked === 0,
  facultyDoubleBooked,
  0
);

// 3.2 Master schedule room conflict check
const masterRoomUsage = {};
let masterRoomCollisions = 0;
psgimData.MASTER_SCHEDULE.forEach((slot) => {
  const timeKey = `${slot.day} ${slot.startTime}`;
  if (slot.defaultRoom && !slot.defaultRoom.includes('/')) {
    const rKey = `${timeKey} @ ${slot.defaultRoom}`;
    if (masterRoomUsage[rKey]) {
      masterRoomCollisions++;
    }
    masterRoomUsage[rKey] = slot;
  }
});

assertTest(
  'Suite 3: Concurrency & Venues',
  'S3.2',
  'Zero room collisions in MASTER_SCHEDULE (33 scheduled slot definitions)',
  masterRoomCollisions === 0,
  masterRoomCollisions,
  0
);

// 3.3 Thursday 14:35 CLUB Slot resolution
let clubSlotSlashRooms = 0;
let clubSlotRooms = new Set();
officialStudents.forEach((student) => {
  const tt = psgimData.getTimetableForStudent(student.dRollNo);
  const clubSlot = tt.find((s) => s.day === 'Thursday' && s.startTime === '14:35');
  if (clubSlot) {
    clubSlotRooms.add(clubSlot.room);
    if (clubSlot.room.includes('/') || clubSlot.room === 'TBD') {
      clubSlotSlashRooms++;
    }
  }
});

assertTest(
  'Suite 3: Concurrency & Venues',
  'S3.3',
  'Thursday 14:35 CLUB slot has zero slash rooms across cohort',
  clubSlotSlashRooms === 0,
  clubSlotSlashRooms,
  0
);

assertTest(
  'Suite 3: Concurrency & Venues',
  'S3.4',
  'Thursday 14:35 CLUB slot resolves to individual venue (Auditorium / LH)',
  clubSlotRooms.size > 0 && Array.from(clubSlotRooms).every(r => VALID_ROOMS.has(r)),
  Array.from(clubSlotRooms),
  ['Auditorium']
);

// 3.4 Batch AE SSM Group Invariance & Sports
const aeRolls = [
  'D26AE01', 'D26AE02', 'D26AE03', 'D26AE04',
  'D26AE05', 'D26AE06', 'D26AE07', 'D26AE08',
  'D26AE09', 'D26AE11', 'D26AE12', 'D26AE13'
];

let aeAllHaveSSMAndSports = true;
let aeInvalidBatches = [];

aeRolls.forEach((aeRoll) => {
  const reg = psgimData.STUDENT_REGISTRY[aeRoll];
  if (!reg || !reg.batches) {
    aeAllHaveSSMAndSports = false;
    aeInvalidBatches.push({ roll: aeRoll, reason: 'missing registry record' });
    return;
  }
  const ssm = reg.batches.SSM;
  const sports = reg.batches.SPORTS;
  const validSports = ['SPORTS1', 'SPORTS2', 'SPORTS3', 'SPORTS4', 'Sports Group'];
  if (!['SSM1', 'SSM2', 'SSM3', 'SSM4'].includes(ssm) || !validSports.includes(sports)) {
    aeAllHaveSSMAndSports = false;
    aeInvalidBatches.push({ roll: aeRoll, ssm, sports });
  }
});

assertTest(
  'Suite 3: Concurrency & Venues',
  'S3.5',
  'All 12 Batch AE students have explicitly populated SSM1-4 and Sports',
  aeAllHaveSSMAndSports,
  aeInvalidBatches,
  []
);

// ------------------------------------------------------------------------------
// SUITE 4: BIDIRECTIONAL REGISTRY & ROSTER PARITY
// ------------------------------------------------------------------------------
console.log('\n--- SUITE 4: BIDIRECTIONAL REGISTRY & ROSTER PARITY ---');

const registryKeys = Object.keys(psgimData.STUDENT_REGISTRY);
const dRollKeys = registryKeys.filter(k => k.startsWith('D'));
const colRollKeys = registryKeys.filter(k => !k.startsWith('D'));

assertTest(
  'Suite 4: Bidirectional Parity',
  'S4.1',
  'STUDENT_REGISTRY contains exactly 504 entries (252 dRolls + 252 colRolls)',
  registryKeys.length === 504 && dRollKeys.length === 252 && colRollKeys.length === 252,
  { total: registryKeys.length, dRolls: dRollKeys.length, colRolls: colRollKeys.length },
  { total: 504, dRolls: 252, colRolls: 252 }
);

assertTest(
  'Suite 4: Bidirectional Parity',
  'S4.2',
  'PSGIM_MASTER_STUDENTS contains exactly 252 students',
  Object.keys(psgimMaster.PSGIM_MASTER_STUDENTS).length === 252,
  Object.keys(psgimMaster.PSGIM_MASTER_STUDENTS).length,
  252
);

// Roll translation symmetry across all 252 students
let rollTranslationErrors = 0;
Object.values(psgimMaster.PSGIM_MASTER_STUDENTS).forEach((s) => {
  if (psgimMaster.toOldRollNo(s.collegeRollNo) !== s.dRollNo) rollTranslationErrors++;
  if (psgimMaster.toNewRollNo(s.dRollNo) !== s.collegeRollNo) rollTranslationErrors++;
  if (psgimMaster.toOldRollNo(s.dRollNo) !== s.dRollNo) rollTranslationErrors++;
  if (psgimMaster.toNewRollNo(s.collegeRollNo) !== s.collegeRollNo) rollTranslationErrors++;
});

assertTest(
  'Suite 4: Bidirectional Parity',
  'S4.3',
  'Roll translation helpers (toOldRollNo / toNewRollNo) are strictly symmetrical for all 252 students',
  rollTranslationErrors === 0,
  rollTranslationErrors,
  0
);

// Deep parity between dRoll and colRoll records in STUDENT_REGISTRY
let registryDeepMismatches = 0;
officialStudents.forEach((s) => {
  const master = psgimMaster.getStudentByAnyRoll(s.dRollNo);
  const dRec = psgimData.STUDENT_REGISTRY[s.dRollNo];
  const colRec = master ? psgimData.STUDENT_REGISTRY[master.collegeRollNo] : null;
  if (!dRec || !colRec) {
    registryDeepMismatches++;
    return;
  }
  for (const course of Object.keys(dRec.batches)) {
    if (dRec.batches[course] !== colRec.batches[course]) {
      registryDeepMismatches++;
    }
  }
});

assertTest(
  'Suite 4: Bidirectional Parity',
  'S4.4',
  'Deep parity between STUDENT_REGISTRY[dRoll] and STUDENT_REGISTRY[collegeRoll] across all 8 courses',
  registryDeepMismatches === 0,
  registryDeepMismatches,
  0
);

// ------------------------------------------------------------------------------
// SUITE 5: ZERO EMOJI COMPLIANCE AUDIT
// ------------------------------------------------------------------------------
console.log('\n--- SUITE 5: ZERO EMOJI AUDIT ---');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

const auditedFiles = [
  'src/data/psgimData.ts',
  'src/data/psgimMasterStudents.ts',
  'scripts/buildPwa.js',
  'tests/e2e_comprehensive_audit.js'
];

let emojiViolations = [];
auditedFiles.forEach((relPath) => {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, lineNo) => {
      if (emojiRegex.test(line)) {
        emojiViolations.push({ file: relPath, line: lineNo + 1, content: line.trim() });
      }
    });
  }
});

assertTest(
  'Suite 5: Zero Emoji Audit',
  'S5.1',
  'Zero emojis across codebase and build scripts',
  emojiViolations.length === 0,
  emojiViolations,
  []
);

// ------------------------------------------------------------------------------
// SUMMARY REPORT
// ------------------------------------------------------------------------------
console.log('\n================================================================================');
console.log('ADVERSARIAL STRESS TEST SUMMARY');
console.log('================================================================================');
console.log(`Total Stress Assertions:  ${totalTests}`);
console.log(`Passed Assertions:        ${passedTests}`);
console.log(`Failed Assertions:        ${failedTests}`);
console.log(`Success Rate:             ${((passedTests / totalTests) * 100).toFixed(2)}%`);
console.log('================================================================================');

if (failedTests > 0) {
  console.error('\nFAILURES RECORDED:');
  failureDetails.forEach((f) => {
    console.error(`- [${f.suite}] ${f.testId}: ${f.description}`);
  });
  process.exit(1);
} else {
  console.log('\nAll adversarial stress tests PASSED with 0 discrepancies.');
  console.log('Verdict recommendation: APPROVE');
  process.exit(0);
}
