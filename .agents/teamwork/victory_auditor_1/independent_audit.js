// Independent Victory Audit Verification Script
// Authored by Victory Auditor (victory_auditor_1)
// Evaluates attendance-monitor against ORIGINAL_REQUEST.md requirements R1-R4

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const rootDir = path.resolve(__dirname, '..', '..', '..');

// Helper to transpile and load TS module
function loadTsModule(relativePath) {
  const fullPath = path.join(rootDir, relativePath);
  const code = fs.readFileSync(fullPath, 'utf8');
  const transpiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  
  const m = { exports: {} };
  const wrapper = new Function('exports', 'require', 'module', '__filename', '__dirname', transpiled);
  const customRequire = (reqPath) => {
    if (reqPath.startsWith('.')) {
      const resolved = path.resolve(path.dirname(fullPath), reqPath);
      if (fs.existsSync(resolved + '.ts')) return loadTsModule(path.relative(rootDir, resolved + '.ts'));
      if (fs.existsSync(resolved + '.js')) return require(resolved);
      if (fs.existsSync(resolved)) return require(resolved);
    }
    return require(reqPath);
  };
  wrapper(m.exports, customRequire, m, fullPath, path.dirname(fullPath));
  return m.exports;
}

const specPath = path.join(rootDir, '.agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json');
const officialSpec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

const psgimData = loadTsModule('src/data/psgimData.ts');
const psgimMaster = loadTsModule('src/data/psgimMasterStudents.ts');

const registry = psgimData.STUDENT_REGISTRY;
const master = psgimMaster.PSGIM_MASTER_STUDENTS;
const getTimetableForStudent = psgimData.getTimetableForStudent;
const courses = psgimData.PSGIM_COURSES;

const results = {
  R1: { passed: true, checks: [], failures: [] },
  R2: { passed: true, checks: [], failures: [] },
  R3: { passed: true, checks: [], failures: [] },
  R4: { passed: true, checks: [], failures: [] }
};

function assertR1(condition, desc) {
  if (condition) {
    results.R1.checks.push(desc);
  } else {
    results.R1.passed = false;
    results.R1.failures.push(desc);
  }
}

function assertR2(condition, desc) {
  if (condition) {
    results.R2.checks.push(desc);
  } else {
    results.R2.passed = false;
    results.R2.failures.push(desc);
  }
}

function assertR3(condition, desc) {
  if (condition) {
    results.R3.checks.push(desc);
  } else {
    results.R3.passed = false;
    results.R3.failures.push(desc);
  }
}

function assertR4(condition, desc) {
  if (condition) {
    results.R4.checks.push(desc);
  } else {
    results.R4.passed = false;
    results.R4.failures.push(desc);
  }
}

console.log('=== STARTING INDEPENDENT VICTORY AUDIT SUITE ===');

// --- AUDIT R1: DYNAMIC COURSE REGISTRY ---
console.log('[Phase C.1] Auditing R1: Dynamic Course Registry...');
assertR1(officialSpec.length === 252, `Official spec contains exactly 252 students (found ${officialSpec.length})`);
assertR1(Object.keys(registry).length >= 504, `STUDENT_REGISTRY has >= 504 entries (found ${Object.keys(registry).length})`);

// Check each student in spec
for (const student of officialSpec) {
  const dRoll = student.dRollNo;
  const colRoll = student.collegeRollNo || student.dRollNo.substring(1);
  
  const dEntry = registry[dRoll];
  const colEntry = registry[colRoll];
  
  assertR1(dEntry !== undefined, `Student ${dRoll} exists in STUDENT_REGISTRY via D-roll`);
  assertR1(colEntry !== undefined, `Student ${colRoll} exists in STUDENT_REGISTRY via College roll`);
  
  if (dEntry && student.courses) {
    for (const [courseName, expectedGroup] of Object.entries(student.courses)) {
      const actualGroup = dEntry.batches[courseName];
      if (expectedGroup && expectedGroup.trim() !== '') {
        assertR1(actualGroup === expectedGroup, `Student ${dRoll} course ${courseName}: expected ${expectedGroup}, got ${actualGroup}`);
      } else {
        assertR1(Boolean(actualGroup && actualGroup.trim() !== ''), `Student ${dRoll} course ${courseName}: non-empty group populated`);
      }
    }
  }
  
  if (dEntry && colEntry) {
    for (const courseName of ['MCOB', 'ADM', 'MC', 'SSM', 'BS', 'EDM', 'LA', 'SSA']) {
      assertR1(dEntry.batches[courseName] === colEntry.batches[courseName], `Bidirectional parity for ${dRoll}/${colRoll} on ${courseName}`);
    }
  }
}

// Test case 1: 26AA01 / D26AA01
const s1 = registry['26AA01'];
const s1D = registry['D26AA01'];
const expected1 = {
  MCOB: 'MCOB1', ADM: 'ADM1', MC: 'MC2', SSM: 'SSM1', BS: 'BS1', EDM: 'EDM3', LA: 'LA1', SSA: 'SSA3'
};
for (const [k, v] of Object.entries(expected1)) {
  assertR1(s1 && s1.batches[k] === v, `Test case 26AA01 ${k} === ${v} (got ${s1?.batches[k]})`);
  assertR1(s1D && s1D.batches[k] === v, `Test case D26AA01 ${k} === ${v} (got ${s1D?.batches[k]})`);
}

// Test case 2: 26AB05
const s2 = registry['26AB05'];
const expected2 = {
  MCOB: 'MCOB1', ADM: 'ADM2', MC: 'MC3', SSM: 'SSM2', BS: 'BS2', EDM: 'EDM1', LA: 'LA1', SSA: 'SSA3'
};
for (const [k, v] of Object.entries(expected2)) {
  assertR1(s2 && s2.batches[k] === v, `Test case 26AB05 ${k} === ${v} (got ${s2?.batches[k]})`);
}

// Boundary checks: AE10 omitted, dummy keys removed
assertR1(registry['D26AE10'] === undefined && registry['26AE10'] === undefined, 'D26AE10 / 26AE10 is correctly omitted');
const dummyKeys = ['D26AA62', 'D26AB61', 'D26AB62', 'D26AB63', 'D26AB64'];
for (const dk of dummyKeys) {
  assertR1(registry[dk] === undefined, `Dummy key ${dk} is purged from STUDENT_REGISTRY`);
}

// --- AUDIT R2: ROLL NUMBER & REGISTRY CROSS-VERIFICATION ---
console.log('[Phase C.2] Auditing R2: Master Roster Cross-Verification...');
const masterKeys = Object.keys(master);
assertR2(masterKeys.length === 252, `PSGIM_MASTER_STUDENTS has exactly 252 entries (found ${masterKeys.length})`);

for (const mKey of masterKeys) {
  const mStudent = master[mKey];
  assertR2(mStudent.dRollNo === mKey, `Master key ${mKey} matches dRollNo`);
  assertR2(mStudent.collegeRollNo === mKey.substring(1), `Zero offset mismatch: ${mKey} -> ${mStudent.collegeRollNo}`);
  
  const regByD = registry[mStudent.dRollNo];
  const regByCol = registry[mStudent.collegeRollNo];
  assertR2(regByD !== undefined, `Master student ${mKey} resolves to STUDENT_REGISTRY by dRollNo`);
  assertR2(regByCol !== undefined, `Master student ${mKey} resolves to STUDENT_REGISTRY by collegeRollNo`);
  for (const courseName of ['MCOB', 'ADM', 'MC', 'SSM', 'BS', 'EDM', 'LA', 'SSA']) {
    assertR2(regByD.batches[courseName] === regByCol.batches[courseName], `Master parity for ${mKey} on ${courseName}`);
  }
}

// Helpers test
assertR2(psgimMaster.toOldRollNo('26AA01') === 'D26AA01', "toOldRollNo('26AA01') === 'D26AA01'");
assertR2(psgimMaster.toNewRollNo('D26AA01') === '26AA01', "toNewRollNo('D26AA01') === '26AA01'");
assertR2(psgimMaster.getStudentByAnyRoll('26AA01')?.dRollNo === 'D26AA01', "getStudentByAnyRoll('26AA01') resolves");
assertR2(psgimMaster.getStudentByAnyRoll('d26aa01')?.dRollNo === 'D26AA01', "getStudentByAnyRoll lowercase resolves");
assertR2(psgimMaster.getStudentByAnyRoll('D26AE10') === null, 'Non-existent D26AE10 returns null');

// --- AUDIT R3: TIMETABLE, FACULTY & CLASSROOM ASSIGNMENTS ---
console.log('[Phase C.3] Auditing R3: Timetable Engine & Classroom Verification...');

const expectedFacultyMap = {
  MCOB: { 1: 'Dr. M. Kirupa Priyadarshini', 2: 'Dr. Vijaya Vardhan Manchala', 3: 'Dr. R. Indumathy', 4: 'Dr. N. Udayakumar' },
  EDM: { 1: 'Dr. Sreeanandan', 2: 'Dr. Aiswarya D Pillai', 3: 'Dr. E. Sri Varshini', 4: 'Dr. Sreeanandan' },
  ADM: { 1: 'Dr. J. Nancy Christina', 2: 'Dr. D. Kavitha', 3: 'Dr. Nithya', 4: 'Dr. Aiswarya D Pillai' },
  BS: { 1: 'Mr. T. Sathish', 2: 'Dr. J. Sekkizhar', 3: 'Dr. Ravi Shankar Jetti', 4: 'Mr. T. Sathish' },
  MC: { 1: 'Dr. R. Deepa', 2: 'Dr. R. Indumathy', 3: 'Dr. E. Sri Varshini', 4: 'Dr. Chenna Upendra' },
  SSA: { 1: 'Mr. G. Kangasabapathy', 2: 'Mr. Imayavendan', 3: 'Mr. G. Kangasabapathy', 4: 'Mr. Imayavendan' },
  SSM: { 1: 'Dr. D. Kavitha', 2: 'Ms. C. Dhanya', 3: 'Ms. Kanagathara', 4: 'Dr. Venkatalakshmi' },
  LA: { 1: 'Ms. C. Dhanya', 2: 'Ms. C. Dhanya', 3: 'Ms. C. Dhanya', 4: 'Dr. Firdaus Bashir' },
  SPORTS: { 1: 'Mr. Zakeer Khan', 2: 'Mr. Zakeer Khan', 3: 'Mr. Zakeer Khan', 4: 'Mr. Zakeer Khan' }
};

let totalSlotsAudited = 0;
let slashRoomCount = 0;
let unassignedRoomCount = 0;
let facultyMismatchCount = 0;

for (const student of officialSpec) {
  const dRoll = student.dRollNo;
  const colRoll = student.collegeRollNo || student.dRollNo.substring(1);
  
  const slotsD = getTimetableForStudent(dRoll);
  const slotsCol = getTimetableForStudent(colRoll);
  
  assertR3(slotsD.length === 19, `Student ${dRoll} has exactly 19 periods (got ${slotsD.length})`);
  assertR3(slotsCol.length === 19, `Student ${colRoll} has exactly 19 periods (got ${slotsCol.length})`);
  
  // Verify equivalence (excluding roll-specific slot id)
  const stripId = (slots) => slots.map(s => {
    const { id, ...rest } = s;
    return rest;
  });
  assertR3(JSON.stringify(stripId(slotsD)) === JSON.stringify(stripId(slotsCol)), `Timetable content equivalence for ${dRoll} and ${colRoll}`);
  
  for (const slot of slotsD) {
    totalSlotsAudited++;
    
    // Check room
    if (!slot.room || slot.room.trim() === '' || slot.room.includes('TBD')) {
      unassignedRoomCount++;
      assertR3(false, `Unassigned/TBD room in slot for ${dRoll} on ${slot.day} ${slot.startTime}`);
    }
    if (slot.room.includes('/')) {
      slashRoomCount++;
      assertR3(false, `Slash room '${slot.room}' for ${dRoll} on ${slot.day} ${slot.startTime}`);
    }
    
    // Check faculty against expectedFacultyMap
    const course = slot.shortForm;
    if (expectedFacultyMap[course]) {
      const match = slot.batch.match(/\d+$/);
      const groupNum = match ? parseInt(match[0], 10) : 1;
      const expectedFac = expectedFacultyMap[course][groupNum];
      if (expectedFac && slot.faculty !== expectedFac) {
        facultyMismatchCount++;
        assertR3(false, `Faculty mismatch for ${dRoll} ${slot.batch}: expected '${expectedFac}', got '${slot.faculty}'`);
      }
    }
  }
}

assertR3(slashRoomCount === 0, `Total slash rooms across all ${totalSlotsAudited} slots is 0 (found ${slashRoomCount})`);
assertR3(unassignedRoomCount === 0, `Total unassigned/TBD rooms is 0 (found ${unassignedRoomCount})`);
assertR3(facultyMismatchCount === 0, `Total faculty mismatches is 0 (found ${facultyMismatchCount})`);

// Verify Thursday 14:35 CLUB period specifically
const thurClubSlot = getTimetableForStudent('D26AA01').find(s => s.day === 'Thursday' && s.startTime === '14:35');
assertR3(thurClubSlot !== undefined, 'Thursday 14:35 CLUB period exists');
assertR3(thurClubSlot && thurClubSlot.room === 'Auditorium', `Thursday CLUB resolves to 'Auditorium' (got '${thurClubSlot?.room}')`);

// --- AUDIT R4: ZERO EMOJI & BUILDS ---
console.log('[Phase C.4] Auditing R4: Zero Emoji Policy & Quality...');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

const filesToCheck = [
  'scripts/buildPwa.js',
  'src/data/psgimData.ts',
  'src/data/psgimMasterStudents.ts',
  'tests/e2e_comprehensive_audit.js'
];

for (const relFile of filesToCheck) {
  const content = fs.readFileSync(path.join(rootDir, relFile), 'utf8');
  const hasEmoji = emojiRegex.test(content);
  assertR4(!hasEmoji, `Zero Emoji Policy: ${relFile} contains no emojis`);
}

console.log('=== AUDIT RESULTS SUMMARY ===');
console.log(`R1 (Dynamic Course Registry):  ${results.R1.passed ? 'PASS' : 'FAIL'} (${results.R1.checks.length} assertions passed, ${results.R1.failures.length} failed)`);
console.log(`R2 (Master Cross-Verification): ${results.R2.passed ? 'PASS' : 'FAIL'} (${results.R2.checks.length} assertions passed, ${results.R2.failures.length} failed)`);
console.log(`R3 (Timetable & Rooms):        ${results.R3.passed ? 'PASS' : 'FAIL'} (${results.R3.checks.length} assertions passed, ${results.R3.failures.length} failed, slots audited: ${totalSlotsAudited})`);
console.log(`R4 (Zero Emoji & Monitoring):   ${results.R4.passed ? 'PASS' : 'FAIL'} (${results.R4.checks.length} assertions passed, ${results.R4.failures.length} failed)`);

const overallPassed = results.R1.passed && results.R2.passed && results.R3.passed && results.R4.passed;
console.log(`OVERALL AUDIT VERDICT: ${overallPassed ? 'ALL REQUIREMENTS SATISFIED' : 'FAILURES DETECTED'}`);

if (!overallPassed) {
  console.error('FAILURES:');
  ['R1', 'R2', 'R3', 'R4'].forEach(r => {
    if (results[r].failures.length > 0) {
      console.error(`- ${r}:`, results[r].failures);
    }
  });
  process.exit(1);
} else {
  process.exit(0);
}
