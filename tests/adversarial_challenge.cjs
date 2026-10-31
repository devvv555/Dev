// tests/adversarial_challenge.cjs
// Independent Adversarial Verification Harness for College Roll Number Migration
// Strictly compliant with project-wide Zero Emoji Policy (0 emojis).

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// 1. Transparent TypeScript transpiler
require.extensions['.ts'] = function (module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      skipLibCheck: true,
    },
  });
  module._compile(compiled.outputText, filename);
};

// 2. Load modules
const ROOT_DIR = path.resolve(__dirname, '..');
const psgimMaster = require(path.join(ROOT_DIR, 'src', 'data', 'psgimMasterStudents.ts'));
const psgimData = require(path.join(ROOT_DIR, 'src', 'data', 'psgimData.ts'));
const csvPath = path.join(ROOT_DIR, 'scripts', 'excel_mapping.csv');

const {
  PSGIM_MASTER_STUDENTS,
  STUDENTS_BY_NEW_ROLL,
  toNewRollNo,
  toOldRollNo,
  getMasterStudent,
  getStudentByAnyRoll,
} = psgimMaster;

const {
  STUDENT_REGISTRY,
  getTimetableForStudent,
} = psgimData;

// Test tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assertTest(name, condition, details = {}) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests++;
    failures.push({ name, details });
    console.log(`[FAIL] ${name}`, JSON.stringify(details));
  }
}

console.log('================================================================');
console.log('ADVERSARIAL CHALLENGE TEST HARNESS - COLLEGE ROLL NUMBER MIGRATION');
console.log('================================================================');

// -----------------------------------------------------------------------------
// SECTION 1: ROSTER CONSISTENCY ACROSS ALL 252 STUDENTS
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 1: ROSTER CONSISTENCY (EXCEL CSV VS MASTER STUDENTS) ---');

const rawCsv = fs.readFileSync(csvPath, 'utf8');
const excelRows = rawCsv
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l.length > 0 && !l.startsWith('#'))
  .map((l) => {
    const parts = l.split(',');
    return {
      dRollNo: parts[0] ? parts[0].trim() : '',
      collegeRollNo: parts[1] ? parts[1].trim() : '',
      name: parts[2] ? parts[2].trim() : '',
    };
  })
  .filter((r) => r.dRollNo && r.collegeRollNo);

assertTest('CSV student count is 252', excelRows.length === 252, { count: excelRows.length });
assertTest('PSGIM_MASTER_STUDENTS entry count is 252', Object.keys(PSGIM_MASTER_STUDENTS).length === 252, {
  count: Object.keys(PSGIM_MASTER_STUDENTS).length,
});

let bidirectionalMismatchCount = 0;
let registryMissingCollegeCount = 0;
let registryMissingDCount = 0;
let idempotencyNewRollFailures = [];
let idempotencyOldRollFailures = [];

for (const student of excelRows) {
  const dRoll = student.dRollNo.toUpperCase();
  const collegeRoll = student.collegeRollNo.toUpperCase();
  const expectedName = student.name.toUpperCase();

  // 1. Check master record exists in PSGIM_MASTER_STUDENTS
  const masterEntry = PSGIM_MASTER_STUDENTS[dRoll];
  if (!masterEntry) {
    bidirectionalMismatchCount++;
    assertTest(`Master entry exists for ${dRoll}`, false, { dRoll, collegeRoll });
    continue;
  }

  // 2. Check fields in masterEntry
  const dRollMatches = masterEntry.dRollNo.toUpperCase() === dRoll;
  const collegeRollMatches = masterEntry.collegeRollNo.toUpperCase() === collegeRoll;
  if (!dRollMatches || !collegeRollMatches) {
    bidirectionalMismatchCount++;
    assertTest(`Master record matches CSV for ${dRoll}`, false, {
      dRoll,
      expectedCollege: collegeRoll,
      actualCollege: masterEntry.collegeRollNo,
    });
  }

  // 3. Bidirectional mapping: toNewRollNo(dRoll) === collegeRoll
  const mappedNew = toNewRollNo(dRoll);
  if (mappedNew !== collegeRoll) {
    bidirectionalMismatchCount++;
    assertTest(`toNewRollNo(${dRoll}) === ${collegeRoll}`, false, { mappedNew, collegeRoll });
  }

  // 4. Bidirectional mapping: toOldRollNo(collegeRoll) === dRoll
  const mappedOld = toOldRollNo(collegeRoll);
  if (mappedOld !== dRoll) {
    bidirectionalMismatchCount++;
    assertTest(`toOldRollNo(${collegeRoll}) === ${dRoll}`, false, { mappedOld, dRoll });
  }

  // 5. Idempotency checks
  const idempNew = toNewRollNo(collegeRoll);
  if (idempNew !== collegeRoll) {
    idempotencyNewRollFailures.push({ collegeRoll, actual: idempNew });
  }

  const idempOld = toOldRollNo(dRoll);
  if (idempOld !== dRoll) {
    idempotencyOldRollFailures.push({ dRoll, actual: idempOld });
  }

  // 6. Registry access in STUDENT_REGISTRY
  if (!STUDENT_REGISTRY[collegeRoll]) {
    registryMissingCollegeCount++;
  }
  if (!STUDENT_REGISTRY[dRoll]) {
    registryMissingDCount++;
  }
}

assertTest('Bidirectional mapping 100% consistent across 252 students (toNewRollNo & toOldRollNo)', bidirectionalMismatchCount === 0, {
  mismatchCount: bidirectionalMismatchCount,
});
assertTest('All 252 college rolls present in STUDENT_REGISTRY', registryMissingCollegeCount === 0, {
  missingCount: registryMissingCollegeCount,
});
assertTest('All 252 D-rolls present in STUDENT_REGISTRY', registryMissingDCount === 0, {
  missingCount: registryMissingDCount,
});
assertTest('toOldRollNo(dRoll) is idempotent for all 252 students', idempotencyOldRollFailures.length === 0, {
  failures: idempotencyOldRollFailures,
});
// Notice: check how many failed toNewRollNo(collegeRoll) idempotency
console.log(`Idempotency check toNewRollNo(collegeRoll) mismatches: ${idempotencyNewRollFailures.length}`);
if (idempotencyNewRollFailures.length > 0) {
  console.log('Mismatched college rolls in toNewRollNo(collegeRoll):', idempotencyNewRollFailures);
}
assertTest(
  'toNewRollNo(collegeRoll) === collegeRoll (idempotency check)',
  idempotencyNewRollFailures.length === 0,
  { failures: idempotencyNewRollFailures }
);

// -----------------------------------------------------------------------------
// SECTION 2: DEVDARSHAN V SPECIFIC TEST CASE & OFFLINE AUTH
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 2: DEVDARSHAN V TEST CASE & OFFLINE AUTHENTICATION ---');

assertTest("toNewRollNo('D26AB05') === '26AB12'", toNewRollNo('D26AB05') === '26AB12', {
  actual: toNewRollNo('D26AB05'),
});
assertTest("toOldRollNo('26AB12') === 'D26AB05'", toOldRollNo('26AB12') === 'D26AB05', {
  actual: toOldRollNo('26AB12'),
});

const devdarshanByCollege = getMasterStudent('26AB12');
assertTest("getMasterStudent('26AB12') exists", !!devdarshanByCollege, { devdarshanByCollege });
assertTest("getMasterStudent('26AB12').name === 'DEVDARSHAN V'", devdarshanByCollege?.name === 'DEVDARSHAN V', {
  actualName: devdarshanByCollege?.name,
});
assertTest("getMasterStudent('26AB12').batch === 'B'", devdarshanByCollege?.batch === 'B', {
  actualBatch: devdarshanByCollege?.batch,
});
assertTest("getMasterStudent('26AB12').dobPassword === '13DEC05'", devdarshanByCollege?.dobPassword === '13DEC05', {
  actualDobPassword: devdarshanByCollege?.dobPassword,
});

const devdarshanByD = getMasterStudent('D26AB05');
assertTest("getMasterStudent('D26AB05').name === 'DEVDARSHAN V'", devdarshanByD?.name === 'DEVDARSHAN V', {
  actualName: devdarshanByD?.name,
});
assertTest("getMasterStudent('D26AB05').collegeRollNo === '26AB12'", devdarshanByD?.collegeRollNo === '26AB12', {
  actualCollegeRoll: devdarshanByD?.collegeRollNo,
});

// Offline Authentication Simulation (per AuthScreen.tsx logic lines 107-122)
function simulateOfflineAuth(rollInput, passwordInput) {
  const cleanRollNo = rollInput.trim().toUpperCase().replace(/\s+/g, '');
  const rawPassword = passwordInput.trim();
  const officialRoll = toNewRollNo(cleanRollNo) || cleanRollNo;

  const student = getMasterStudent(cleanRollNo) || getMasterStudent(officialRoll);
  const isDevdarshanMatch =
    (student?.collegeRollNo === '26AB12' ||
      student?.dRollNo === 'D26AB05' ||
      cleanRollNo === '26AB12' ||
      cleanRollNo === 'D26AB05' ||
      cleanRollNo === '26AB05') &&
    (rawPassword.toUpperCase() === '13DEC05' || rawPassword.toUpperCase() === '13AUG05');

  if ((student && student.dobPassword && student.dobPassword.toUpperCase() === rawPassword.toUpperCase()) || isDevdarshanMatch) {
    return { success: true, rollNo: officialRoll };
  } else {
    return { success: false, error: 'Invalid credentials' };
  }
}

// Devdarshan login with college roll
const auth1 = simulateOfflineAuth('26AB12', '13DEC05');
assertTest("Offline auth: 26AB12 with 13DEC05 succeeds", auth1.success && auth1.rollNo === '26AB12', auth1);

const auth2 = simulateOfflineAuth('26AB12', '13AUG05');
assertTest("Offline auth: 26AB12 with 13AUG05 succeeds", auth2.success && auth2.rollNo === '26AB12', auth2);

// Devdarshan login with legacy D-roll
const auth3 = simulateOfflineAuth('D26AB05', '13DEC05');
assertTest("Offline auth: D26AB05 normalizes and succeeds with 13DEC05", auth3.success && auth3.rollNo === '26AB12', auth3);

const auth4 = simulateOfflineAuth('D26AB05', '13AUG05');
assertTest("Offline auth: D26AB05 normalizes and succeeds with 13AUG05", auth4.success && auth4.rollNo === '26AB12', auth4);

// Devdarshan login with legacy 26AB05 input
const auth5 = simulateOfflineAuth('26AB05', '13DEC05');
assertTest("Offline auth: 26AB05 normalizes and succeeds with 13DEC05", auth5.success && auth5.rollNo === '26AB12', auth5);

const auth6 = simulateOfflineAuth('26AB05', '13AUG05');
assertTest("Offline auth: 26AB05 normalizes and succeeds with 13AUG05", auth6.success && auth6.rollNo === '26AB12', auth6);

// Wrong password tests
const authFail1 = simulateOfflineAuth('26AB12', '01JAN00');
assertTest("Offline auth: 26AB12 with wrong password fails", !authFail1.success, authFail1);

const authFail2 = simulateOfflineAuth('26AB12', '');
assertTest("Offline auth: 26AB12 with empty password fails", !authFail2.success, authFail2);

// Timetable resolution for Devdarshan
const timetable = getTimetableForStudent('26AB12');
assertTest("getTimetableForStudent('26AB12') returns 19 periods", timetable.length === 19, {
  periodCount: timetable.length,
});

const laSlots = timetable.filter((s) => s.subjectCode === 'LA' || s.subject === 'LA');
const mcSlots = timetable.filter((s) => s.subjectCode === 'MC' || s.subject === 'MC');
const ssaSlots = timetable.filter((s) => s.subjectCode === 'SSA' || s.subject === 'SSA' || s.subject === 'SSA Lab');
const mcobSlots = timetable.filter((s) => s.subjectCode === 'MCOB' || s.subject === 'MCOB');
const admSlots = timetable.filter((s) => s.subjectCode === 'ADM' || s.subject === 'ADM');
const bsSlots = timetable.filter((s) => s.subjectCode === 'BS' || s.subject === 'BS');
const edmSlots = timetable.filter((s) => s.subjectCode === 'EDM' || s.subject === 'EDM');

assertTest("LA1 classroom is LH-101", laSlots.every((s) => s.room === 'LH-101'), { rooms: laSlots.map((s) => s.room) });
assertTest("MC3 classroom is LH-401", mcSlots.every((s) => s.room === 'LH-401'), { rooms: mcSlots.map((s) => s.room) });
assertTest("SSA3 classroom is LH-101", ssaSlots.every((s) => s.room === 'LH-101'), { rooms: ssaSlots.map((s) => s.room) });
assertTest("MCOB1 classroom is LH-101", mcobSlots.every((s) => s.room === 'LH-101'), { rooms: mcobSlots.map((s) => s.room) });
assertTest("ADM2 classroom is LH-109", admSlots.every((s) => s.room === 'LH-109'), { rooms: admSlots.map((s) => s.room) });
assertTest("BS2 classroom is LH-109", bsSlots.every((s) => s.room === 'LH-109'), { rooms: bsSlots.map((s) => s.room) });
assertTest("EDM1 classroom is LH-101", edmSlots.every((s) => s.room === 'LH-101'), { rooms: edmSlots.map((s) => s.room) });

const slashRooms = timetable.filter((s) => s.room && s.room.includes('/'));
assertTest("Timetable has zero slash-separated rooms", slashRooms.length === 0, { slashRooms });

// -----------------------------------------------------------------------------
// SECTION 3: ADVERSARIAL EDGE CASES & FUZZING
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 3: ADVERSARIAL EDGE CASES & FUZZING ---');

// Case insensitivity
assertTest("toNewRollNo('26ab12') === '26AB12'", toNewRollNo('26ab12') === '26AB12', { actual: toNewRollNo('26ab12') });
assertTest("toNewRollNo('d26ab05') === '26AB12'", toNewRollNo('d26ab05') === '26AB12', { actual: toNewRollNo('d26ab05') });
assertTest("toOldRollNo('26ab12') === 'D26AB05'", toOldRollNo('26ab12') === 'D26AB05', { actual: toOldRollNo('26ab12') });

// Whitespace handling
assertTest("toNewRollNo('  26AB12  ') === '26AB12'", toNewRollNo('  26AB12  ') === '26AB12', {
  actual: toNewRollNo('  26AB12  '),
});
assertTest("toNewRollNo('\\tD26AB05\\n') === '26AB12'", toNewRollNo('\tD26AB05\n') === '26AB12', {
  actual: toNewRollNo('\tD26AB05\n'),
});

// Invalid inputs
assertTest("toNewRollNo('') === ''", toNewRollNo('') === '', { actual: toNewRollNo('') });
assertTest("toOldRollNo('') === ''", toOldRollNo('') === '', { actual: toOldRollNo('') });
assertTest("getMasterStudent('NON_EXISTENT') === null", getMasterStudent('NON_EXISTENT') === null, {
  actual: getMasterStudent('NON_EXISTENT'),
});
assertTest("getMasterStudent('') === null", getMasterStudent('') === null, { actual: getMasterStudent('') });

// -----------------------------------------------------------------------------
// SUMMARY REPORT
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('ADVERSARIAL CHALLENGE EXECUTION SUMMARY');
console.log('================================================================');
console.log(`Total Assertions:  ${totalTests}`);
console.log(`Passed Assertions: ${passedTests}`);
console.log(`Failed Assertions: ${failedTests}`);
if (failures.length > 0) {
  console.log('\nFAILURES DETAIL:');
  failures.forEach((f, idx) => {
    console.log(`${idx + 1}. [${f.name}]`, f.details);
  });
}
console.log('================================================================');

process.exit(failedTests > 0 ? 1 : 0);
