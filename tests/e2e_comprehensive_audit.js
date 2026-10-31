// PSG Institute of Management - E2E Comprehensive Dynamic Course & Timetable Audit
// Requirement-driven, opaque-box test suite verifying Tiers 1-4 per TEST_INFRA.md and ORIGINAL_REQUEST.md.
// Strictly compliant with project-wide Zero Emoji Policy.

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

// 1. Transparent TypeScript on-the-fly compiler hook for Node.js
require.extensions['.ts'] = function(module, filename) {
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

// 2. Load application data modules and authoritative ground truth specification
const ROOT_DIR = path.resolve(__dirname, '..');
const psgimDataPath = path.join(ROOT_DIR, 'src', 'data', 'psgimData.ts');
const psgimMasterPath = path.join(ROOT_DIR, 'src', 'data', 'psgimMasterStudents.ts');
const officialSpecPath = path.join(ROOT_DIR, '.agents', 'teamwork', 'spec_miner_survey_1', 'official_dynamic_course_batch_list.json');

const psgimData = require(psgimDataPath);
const psgimMaster = require(psgimMasterPath);
const officialStudents = JSON.parse(fs.readFileSync(officialSpecPath, 'utf8'));

// Test Harness State
let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const failures = [];

function check(tier, testId, description, condition, actualVal, expectedVal) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
  } else {
    failedAssertions++;
    failures.push({
      tier,
      testId,
      description,
      actual: actualVal,
      expected: expectedVal
    });
    console.error(`  [FAIL] ${tier} | ${testId} - ${description}`);
    if (actualVal !== undefined || expectedVal !== undefined) {
      console.error(`         Expected: ${JSON.stringify(expectedVal)}`);
      console.error(`         Actual:   ${JSON.stringify(actualVal)}`);
    }
  }
}

console.log('================================================================================');
console.log('PSGIM MBA Dynamic Course Registry & Timetable Comprehensive E2E Audit');
console.log('Execution Mode: Direct Node.js opaque-box verification');
console.log('================================================================================\n');

// ==============================================================================
// TIER 1: FEATURE COVERAGE (ISOLATED)
// ==============================================================================
console.log('--- RUNNING TIER 1: FEATURE COVERAGE (ISOLATED) ---');

// 1.1 Verified Test Case 1: 26AA01 / D26AA01
const aa01Expected = {
  MCOB: 'MCOB1',
  ADM: 'ADM1',
  MC: 'MC2',
  SSM: 'SSM1',
  BS: 'BS1',
  EDM: 'EDM3',
  LA: 'LA1',
  SSA: 'SSA3'
};

const d26aa01Record = psgimData.STUDENT_REGISTRY['D26AA01'];
check(
  'Tier 1',
  'T1.1.1',
  'D26AA01 exists in STUDENT_REGISTRY',
  !!d26aa01Record,
  !!d26aa01Record,
  true
);

if (d26aa01Record) {
  for (const [course, expectedGroup] of Object.entries(aa01Expected)) {
    check(
      'Tier 1',
      `T1.1.2.${course}`,
      `D26AA01 ${course} group equals ${expectedGroup}`,
      d26aa01Record.batches[course] === expectedGroup,
      d26aa01Record.batches[course],
      expectedGroup
    );
  }
}

// Check bidirectional resolution for 26AA01 (without leading D)
const r26aa01Record = psgimData.STUDENT_REGISTRY['26AA01'];
check(
  'Tier 1',
  'T1.1.3',
  '26AA01 directly accessible in STUDENT_REGISTRY',
  !!r26aa01Record,
  !!r26aa01Record,
  true
);

if (r26aa01Record) {
  for (const [course, expectedGroup] of Object.entries(aa01Expected)) {
    check(
      'Tier 1',
      `T1.1.4.${course}`,
      `26AA01 ${course} group equals ${expectedGroup}`,
      r26aa01Record.batches[course] === expectedGroup,
      r26aa01Record.batches[course],
      expectedGroup
    );
  }
}

// 1.2 Verified Test Case 2: 26AB05 / D26AB05
const ab05Expected = {
  MCOB: 'MCOB1',
  ADM: 'ADM2',
  MC: 'MC3',
  SSM: 'SSM2',
  BS: 'BS2',
  EDM: 'EDM1',
  LA: 'LA1',
  SSA: 'SSA3'
};

const d26ab05Record = psgimData.STUDENT_REGISTRY['D26AB05'];
check(
  'Tier 1',
  'T1.2.1',
  'D26AB05 exists in STUDENT_REGISTRY',
  !!d26ab05Record,
  !!d26ab05Record,
  true
);

if (d26ab05Record) {
  for (const [course, expectedGroup] of Object.entries(ab05Expected)) {
    check(
      'Tier 1',
      `T1.2.2.${course}`,
      `D26AB05 ${course} group equals ${expectedGroup}`,
      d26ab05Record.batches[course] === expectedGroup,
      d26ab05Record.batches[course],
      expectedGroup
    );
  }
}

// Check bidirectional resolution for 26AB05 (without leading D)
const r26ab05Record = psgimData.STUDENT_REGISTRY['26AB05'];
check(
  'Tier 1',
  'T1.2.3',
  '26AB05 directly accessible in STUDENT_REGISTRY',
  !!r26ab05Record,
  !!r26ab05Record,
  true
);

if (r26ab05Record) {
  for (const [course, expectedGroup] of Object.entries(ab05Expected)) {
    check(
      'Tier 1',
      `T1.2.4.${course}`,
      `26AB05 ${course} group equals ${expectedGroup}`,
      r26ab05Record.batches[course] === expectedGroup,
      r26ab05Record.batches[course],
      expectedGroup
    );
  }
}

// 1.3 Feature Coverage: >=5 isolated cases per dynamic course across all 8 courses
const isolatedCourseCases = {
  MCOB: [
    { roll: 'D26AA01', expected: 'MCOB1' },
    { roll: 'D26AA02', expected: 'MCOB2' },
    { roll: 'D26AA03', expected: 'MCOB3' },
    { roll: 'D26AA04', expected: 'MCOB4' },
    { roll: 'D26AA05', expected: 'MCOB1' }
  ],
  ADM: [
    { roll: 'D26AA01', expected: 'ADM1' },
    { roll: 'D26AA05', expected: 'ADM2' },
    { roll: 'D26AA09', expected: 'ADM3' },
    { roll: 'D26AA13', expected: 'ADM4' },
    { roll: 'D26AA02', expected: 'ADM1' }
  ],
  MC: [
    { roll: 'D26AA02', expected: 'MC1' },
    { roll: 'D26AA01', expected: 'MC2' },
    { roll: 'D26AA03', expected: 'MC3' },
    { roll: 'D26AA04', expected: 'MC4' },
    { roll: 'D26AA08', expected: 'MC1' }
  ],
  SSM: [
    { roll: 'D26AA01', expected: 'SSM1' },
    { roll: 'D26AB01', expected: 'SSM2' },
    { roll: 'D26AC01', expected: 'SSM3' },
    { roll: 'D26AD01', expected: 'SSM4' },
    { roll: 'D26AA02', expected: 'SSM1' }
  ],
  BS: [
    { roll: 'D26AA01', expected: 'BS1' },
    { roll: 'D26AA02', expected: 'BS2' },
    { roll: 'D26AA03', expected: 'BS3' },
    { roll: 'D26AA46', expected: 'BS4' },
    { roll: 'D26AA04', expected: 'BS1' }
  ],
  EDM: [
    { roll: 'D26AA03', expected: 'EDM1' },
    { roll: 'D26AA02', expected: 'EDM2' },
    { roll: 'D26AA01', expected: 'EDM3' },
    { roll: 'D26AA46', expected: 'EDM4' },
    { roll: 'D26AA05', expected: 'EDM1' }
  ],
  LA: [
    { roll: 'D26AA01', expected: 'LA1' },
    { roll: 'D26AA31', expected: 'LA2' },
    { roll: 'D26AA02', expected: 'LA3' },
    { roll: 'D26AA18', expected: 'LA4' },
    { roll: 'D26AA03', expected: 'LA1' }
  ],
  SSA: [
    { roll: 'D26AA02', expected: 'SSA1' },
    { roll: 'D26AA32', expected: 'SSA2' },
    { roll: 'D26AA01', expected: 'SSA3' },
    { roll: 'D26AA15', expected: 'SSA4' },
    { roll: 'D26AA04', expected: 'SSA1' }
  ]
};

for (const [courseName, sampleList] of Object.entries(isolatedCourseCases)) {
  sampleList.forEach((item, idx) => {
    const student = psgimData.STUDENT_REGISTRY[item.roll];
    const actual = student?.batches?.[courseName];
    check(
      'Tier 1',
      `T1.3.${courseName}.${idx + 1}`,
      `${courseName} isolated case ${item.roll} equals ${item.expected}`,
      actual === item.expected,
      actual,
      item.expected
    );
  });
}

// 1.4 Master Faculty Roster Adherence (100% adherence to all 9 courses)
const expectedFacultyRoster = {
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

for (const [courseName, groups] of Object.entries(expectedFacultyRoster)) {
  const courseObj = psgimData.PSGIM_COURSES[courseName];
  check(
    'Tier 1',
    `T1.4.${courseName}.exists`,
    `Course ${courseName} defined in PSGIM_COURSES`,
    !!courseObj,
    !!courseObj,
    true
  );
  if (courseObj && courseObj.faculty) {
    for (const [grp, expectedTeacher] of Object.entries(groups)) {
      const actualTeacher = courseObj.faculty[grp];
      check(
        'Tier 1',
        `T1.4.${courseName}.grp${grp}`,
        `Faculty for ${courseName} Group ${grp} is ${expectedTeacher}`,
        actualTeacher === expectedTeacher,
        actualTeacher,
        expectedTeacher
      );
    }
  }
}

// 1.5 Classroom Allocations Verification (LH-101, LH-109, LH-401, LH-405, Sports Ground, SSM, Auditorium)
const classroomTestCases = [
  { course: 'MCOB', grp: 1, defaultRoom: 'LH-101/109/401/405', expected: 'LH-101' },
  { course: 'EDM', grp: 2, defaultRoom: 'LH-101/109/401', expected: 'LH-109' },
  { course: 'ADM', grp: 3, defaultRoom: 'LH-101/109/401/405', expected: 'LH-401' },
  { course: 'BS', grp: 4, defaultRoom: 'LH-405', expected: 'LH-405' },
  { course: 'SSA', grp: 1, defaultRoom: 'LH-401/405', expected: 'LH-401' },
  { course: 'SSA', grp: 2, defaultRoom: 'LH-401/405', expected: 'LH-405' },
  { course: 'SSA', grp: 3, defaultRoom: 'LH-101/109', expected: 'LH-101' },
  { course: 'SSA', grp: 4, defaultRoom: 'LH-101/109', expected: 'LH-109' },
  { course: 'SPORTS', grp: 1, defaultRoom: 'Ground', expected: 'Sports Ground' },
  { course: 'SSM', grp: 1, defaultRoom: 'SSM', expected: 'SSM' },
  { course: 'CLUB', grp: 1, defaultRoom: 'Auditorium / Clubs', expected: 'Auditorium' }
];

classroomTestCases.forEach((item, idx) => {
  const actualRoom = psgimData.resolveExactRoom(item.course, item.grp, item.defaultRoom);
  check(
    'Tier 1',
    `T1.5.${item.course}.grp${item.grp}`,
    `resolveExactRoom(${item.course}, grp ${item.grp}) returns ${item.expected}`,
    actualRoom === item.expected,
    actualRoom,
    item.expected
  );
});

// ==============================================================================
// TIER 2: BOUNDARY & CORNER CASES
// ==============================================================================
console.log('\n--- RUNNING TIER 2: BOUNDARY & CORNER CASES ---');

// 2.1 All 12 Batch AE Students & Explicit SSM Groups
const batchAeExpected = {
  D26AE01: 'SSM1',
  D26AE02: 'SSM2',
  D26AE03: 'SSM3',
  D26AE04: 'SSM4',
  D26AE05: 'SSM2',
  D26AE06: 'SSM3',
  D26AE07: 'SSM4',
  D26AE08: 'SSM1',
  D26AE09: 'SSM4',
  D26AE11: 'SSM3',
  D26AE12: 'SSM3',
  D26AE13: 'SSM2'
};

for (const [aeRoll, expectedSsm] of Object.entries(batchAeExpected)) {
  const student = psgimData.STUDENT_REGISTRY[aeRoll];
  check(
    'Tier 2',
    `T2.1.${aeRoll}.exists`,
    `Batch AE student ${aeRoll} present in STUDENT_REGISTRY`,
    !!student,
    !!student,
    true
  );

  if (student && student.batches) {
    check(
      'Tier 2',
      `T2.1.${aeRoll}.ssm`,
      `Batch AE student ${aeRoll} SSM group equals ${expectedSsm}`,
      student.batches.SSM === expectedSsm,
      student.batches.SSM,
      expectedSsm
    );
    check(
      'Tier 2',
      `T2.1.${aeRoll}.sports`,
      `Batch AE student ${aeRoll} has non-empty sports group`,
      typeof student.batches.SPORTS === 'string' && student.batches.SPORTS.trim() !== '',
      student.batches.SPORTS,
      'Non-empty sports string'
    );
  }
}

// 2.2 Skipped Roll Number D26AE10 Non-Existence
check(
  'Tier 2',
  'T2.2.AE10_omitted',
  'Non-existent roll D26AE10 is not in STUDENT_REGISTRY',
  psgimData.STUDENT_REGISTRY['D26AE10'] === undefined,
  psgimData.STUDENT_REGISTRY['D26AE10'],
  undefined
);

// 2.3 Roll Format Variations & Edge Cases
const rollVariationTests = [
  { roll: 'D26AA01', label: 'Canonical with D' },
  { roll: '26AA01', label: 'Without D' },
  { roll: 'd26aa01', label: 'Lowercase with d' },
  { roll: '26aa01', label: 'Lowercase without d' },
  { roll: '  26AA01  ', label: 'With leading/trailing whitespace' },
  { roll: 'D26AB05', label: 'Canonical D26AB05' },
  { roll: '26ab05', label: 'Lowercase 26ab05' }
];

rollVariationTests.forEach((t, idx) => {
  const timetable = psgimData.getTimetableForStudent(t.roll);
  check(
    'Tier 2',
    `T2.3.variation_${idx + 1}`,
    `getTimetableForStudent resolves for ${t.label} ("${t.roll}")`,
    Array.isArray(timetable) && timetable.length > 0,
    timetable?.length || 0,
    'Array with slots'
  );
});

// Non-existent & invalid roll handling
const invalidRolls = ['INVALID99', '26ZZ99', '', null, undefined];
invalidRolls.forEach((inv, idx) => {
  let threw = false;
  let res = null;
  try {
    res = psgimData.getTimetableForStudent(inv);
  } catch (err) {
    threw = true;
  }
  const masterLookup = inv ? psgimMaster.getStudentByAnyRoll(inv) : null;
  check(
    'Tier 2',
    `T2.3.invalid_${idx + 1}`,
    `Graceful fallback for invalid roll "${inv}" without uncaught exception`,
    !threw && Array.isArray(res) && masterLookup === null,
    { threw, isArray: Array.isArray(res), masterLookup },
    { threw: false, isArray: true, masterLookup: null }
  );
});

// 2.4 Zero Slash Rooms Verification Across Whole Cohort
let totalSlashSlots = 0;
const slashOffenders = [];

for (const student of officialStudents) {
  const tt = psgimData.getTimetableForStudent(student.dRollNo);
  if (Array.isArray(tt)) {
    for (const slot of tt) {
      if (typeof slot.room === 'string' && slot.room.includes('/')) {
        totalSlashSlots++;
        if (slashOffenders.length < 5) {
          slashOffenders.push({ roll: student.dRollNo, day: slot.day, time: slot.startTime, room: slot.room });
        }
      }
    }
  }
}

check(
  'Tier 2',
  'T2.4.zero_slash_cohort',
  'Zero slash rooms in generated timetables across all official students',
  totalSlashSlots === 0,
  { totalSlashSlots, samples: slashOffenders },
  { totalSlashSlots: 0 }
);

// Explicit CLUB classroom check (Thursday 14:35 must not be "Auditorium / Clubs")
const clubResolvedRoom = psgimData.resolveExactRoom('CLUB', 1, 'Auditorium / Clubs');
check(
  'Tier 2',
  'T2.4.club_room_slash_free',
  'CLUB resolveExactRoom has 0 slashes and equals "Auditorium"',
  clubResolvedRoom === 'Auditorium',
  clubResolvedRoom,
  'Auditorium'
);

// 2.5 Zero Unassigned, TBD, or Empty Rooms
let unassignedCount = 0;
for (const student of officialStudents) {
  const tt = psgimData.getTimetableForStudent(student.dRollNo);
  if (Array.isArray(tt)) {
    for (const slot of tt) {
      if (!slot.room || slot.room.trim() === '' || slot.room.toUpperCase().includes('TBD')) {
        unassignedCount++;
      }
    }
  }
}

check(
  'Tier 2',
  'T2.5.zero_unassigned_rooms',
  'Zero unassigned, empty or TBD rooms across all timetable slots',
  unassignedCount === 0,
  unassignedCount,
  0
);

// ==============================================================================
// TIER 3: CROSS-FEATURE COMBINATIONS
// ==============================================================================
console.log('\n--- RUNNING TIER 3: CROSS-FEATURE COMBINATIONS ---');

// 3.1 Full-Week 19-Period Schedule Resolution
let wrongPeriodCount = 0;
const wrongPeriodSamples = [];

for (const student of officialStudents) {
  const tt = psgimData.getTimetableForStudent(student.dRollNo);
  if (!Array.isArray(tt) || tt.length !== 19) {
    wrongPeriodCount++;
    if (wrongPeriodSamples.length < 5) {
      wrongPeriodSamples.push({ roll: student.dRollNo, count: tt?.length || 0 });
    }
  }
}

check(
  'Tier 3',
  'T3.1.exact_19_periods',
  'Every official student resolves to exactly 19 periods Monday through Saturday',
  wrongPeriodCount === 0,
  { wrongPeriodCount, samples: wrongPeriodSamples },
  { wrongPeriodCount: 0 }
);

// 3.2 Schedule Collision & Deduplication Verification
let duplicateTimeSlotCount = 0;
const collisionSamples = [];

for (const student of officialStudents) {
  const tt = psgimData.getTimetableForStudent(student.dRollNo);
  if (Array.isArray(tt)) {
    const seenTimes = new Set();
    for (const slot of tt) {
      const timeKey = `${slot.day}_${slot.startTime}`;
      if (seenTimes.has(timeKey)) {
        duplicateTimeSlotCount++;
        if (collisionSamples.length < 5) {
          collisionSamples.push({ roll: student.dRollNo, collision: timeKey });
        }
      }
      seenTimes.add(timeKey);
    }
  }
}

check(
  'Tier 3',
  'T3.2.zero_schedule_collisions',
  'Zero schedule collisions / duplicate start times per student',
  duplicateTimeSlotCount === 0,
  { duplicateTimeSlotCount, samples: collisionSamples },
  { duplicateTimeSlotCount: 0 }
);

// 3.3 Timetable Slot Faculty & Room Cross-Consistency
let facultyMismatchCount = 0;
let roomMismatchCount = 0;

for (const student of officialStudents.slice(0, 50)) { // Intensive audit across sample
  const tt = psgimData.getTimetableForStudent(student.dRollNo);
  if (Array.isArray(tt)) {
    for (const slot of tt) {
      if (slot.shortForm !== 'CLUB') {
        const course = psgimData.PSGIM_COURSES[slot.shortForm];
        const match = slot.batch ? slot.batch.match(/\d+$/) : null;
        const grp = match ? parseInt(match[0], 10) : 1;
        const expectedFac = course?.faculty?.[grp];
        if (expectedFac && slot.faculty !== expectedFac) {
          facultyMismatchCount++;
        }
      }
    }
  }
}

check(
  'Tier 3',
  'T3.3.faculty_timetable_consistency',
  'Slot faculty strictly matches course master roster',
  facultyMismatchCount === 0,
  facultyMismatchCount,
  0
);

// ==============================================================================
// TIER 4: REAL-WORLD COHORT WORKLOAD TESTING
// ==============================================================================
console.log('\n--- RUNNING TIER 4: REAL-WORLD COHORT WORKLOAD TESTING ---');

// 4.1 Cohort Bulk Audit (All 252 Official Students Line-by-Line)
check(
  'Tier 4',
  'T4.1.official_count_252',
  'Official dynamic batch specification contains exactly 252 students',
  officialStudents.length === 252,
  officialStudents.length,
  252
);

let totalFieldChecks = 0;
let fieldDiscrepancies = 0;
const discrepancyLog = [];

const dynamicCourses = ['MCOB', 'ADM', 'MC', 'SSM', 'BS', 'EDM', 'LA', 'SSA'];

for (const student of officialStudents) {
  const dRoll = student.dRollNo;
  const regStudent = psgimData.STUDENT_REGISTRY[dRoll];

  if (!regStudent) {
    fieldDiscrepancies += dynamicCourses.length;
    discrepancyLog.push({ roll: dRoll, error: 'Student missing entirely from registry' });
    continue;
  }

  for (const c of dynamicCourses) {
    totalFieldChecks++;
    const expectedBatch = student.courses[c];
    const actualBatch = regStudent.batches?.[c];
    if (actualBatch !== expectedBatch) {
      fieldDiscrepancies++;
      if (discrepancyLog.length < 10) {
        discrepancyLog.push({
          roll: dRoll,
          course: c,
          expected: expectedBatch,
          actual: actualBatch
        });
      }
    }
  }
}

const discrepancyPct = totalFieldChecks > 0 ? (fieldDiscrepancies / totalFieldChecks) * 100 : 100;

check(
  'Tier 4',
  'T4.1.zero_discrepancy_rate',
  'Course group discrepancy against official circular is exactly 0.00%',
  fieldDiscrepancies === 0,
  { totalChecked: totalFieldChecks, mismatches: fieldDiscrepancies, rate: `${discrepancyPct.toFixed(2)}%`, samples: discrepancyLog },
  { mismatches: 0, rate: '0.00%' }
);

// 4.2 Cross-Roster Synchronization (PSGIM_MASTER_STUDENTS vs STUDENT_REGISTRY)
const masterKeys = Object.keys(psgimMaster.PSGIM_MASTER_STUDENTS || {});
check(
  'Tier 4',
  'T4.2.master_count_252',
  'PSGIM_MASTER_STUDENTS contains all 252 official students',
  masterKeys.length === 252,
  masterKeys.length,
  252
);

let unmappedMasterStudents = 0;
const unmappedSamples = [];

for (const key of masterKeys) {
  const masterEntry = psgimMaster.PSGIM_MASTER_STUDENTS[key];
  const dRoll = masterEntry.dRollNo;
  const regEntry = psgimData.STUDENT_REGISTRY[dRoll];
  if (!regEntry) {
    unmappedMasterStudents++;
    if (unmappedSamples.length < 5) {
      unmappedSamples.push({ dRoll, name: masterEntry.name });
    }
  }
}

check(
  'Tier 4',
  'T4.2.zero_unmapped_master',
  'Every student in PSGIM_MASTER_STUDENTS resolves to STUDENT_REGISTRY (0 unmapped gaps)',
  unmappedMasterStudents === 0,
  { unmappedMasterStudents, samples: unmappedSamples },
  { unmappedMasterStudents: 0 }
);

// 4.3 Zero Emoji Policy Verification Across Repository
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const filesToScanForEmojis = [
  path.join(ROOT_DIR, 'src', 'data', 'psgimData.ts'),
  path.join(ROOT_DIR, 'src', 'data', 'psgimMasterStudents.ts'),
  path.join(ROOT_DIR, 'scripts', 'buildPwa.js'),
  path.join(ROOT_DIR, 'tests', 'e2e_comprehensive_audit.js')
];

let totalEmojiViolations = 0;
const emojiViolationLog = [];

for (const filePath of filesToScanForEmojis) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    lines.forEach((line, lineIdx) => {
      if (emojiRegex.test(line)) {
        totalEmojiViolations++;
        emojiViolationLog.push({
          file: path.relative(ROOT_DIR, filePath),
          line: lineIdx + 1,
          content: line.trim()
        });
      }
    });
  }
}

check(
  'Tier 4',
  'T4.3.zero_emoji_enforcement',
  'Zero Emoji Policy maintained across core data files and build scripts',
  totalEmojiViolations === 0,
  { totalEmojiViolations, violations: emojiViolationLog },
  { totalEmojiViolations: 0 }
);

// ==============================================================================
// FINAL AUDIT SUMMARY & REPORTING
// ==============================================================================
console.log('\n================================================================================');
console.log('PSGIM E2E COMPREHENSIVE AUDIT REPORT');
console.log('================================================================================');
console.log(`Total Assertions:  ${totalAssertions}`);
console.log(`Passed Assertions: ${passedAssertions}`);
console.log(`Failed Assertions: ${failedAssertions}`);
console.log(`Audit Status:      ${failedAssertions === 0 ? 'PASSED (100% COMPLIANT)' : 'FAILED (DISCREPANCIES DETECTED)'}`);
console.log('================================================================================\n');

if (failedAssertions > 0) {
  console.log('SUMMARY OF DISCOVERED DISCREPANCIES / IMPLEMENTATION DEFECTS:');
  failures.forEach((f, idx) => {
    console.log(`${idx + 1}. [${f.tier}] ${f.testId}: ${f.description}`);
  });
  console.log('\nAudit complete with failures. Exit code 1.');
  process.exit(1);
} else {
  console.log('All Tiers 1-4 successfully passed with 0 discrepancies.');
  console.log('Test suite ready.');
  process.exit(0);
}
