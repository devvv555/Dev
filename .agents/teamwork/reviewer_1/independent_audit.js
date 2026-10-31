const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Hook for loading ts files in Node
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

const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');
const specPath = path.join(ROOT_DIR, '.agents', 'teamwork', 'spec_miner_survey_1', 'official_dynamic_course_batch_list.json');
const psgimDataPath = path.join(ROOT_DIR, 'src', 'data', 'psgimData.ts');
const psgimMasterPath = path.join(ROOT_DIR, 'src', 'data', 'psgimMasterStudents.ts');

const specData = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const psgimData = require(psgimDataPath);
const psgimMaster = require(psgimMasterPath);

let errors = [];

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
    console.error('FAIL: ' + message);
  }
}

console.log('=== [REVIEWER_1 ADVERSARIAL AUDIT START] ===');

// --- 1. INTEGRITY INSPECTION ---
console.log('Checking source files for hardcoded cheating / bypass shortcuts...');
const psgimDataSrc = fs.readFileSync(psgimDataPath, 'utf8');
const psgimMasterSrc = fs.readFileSync(psgimMasterPath, 'utf8');

// Check if test cases 26AA01 / 26AB05 are hardcoded in function logic
const suspiciousPatterns = [
  /if\s*\([^)]*26AA01[^)]*\)\s*return/i,
  /if\s*\([^)]*26AB05[^)]*\)\s*return/i,
  /if\s*\([^)]*D26AA01[^)]*\)\s*return/i,
  /if\s*\([^)]*D26AB05[^)]*\)\s*return/i,
  /return\s*['"]MCOB1,\s*ADM1/i
];

suspiciousPatterns.forEach((p, idx) => {
  assert(!p.test(psgimDataSrc), `psgimData.ts contains suspicious hardcoding pattern #${idx}`);
  assert(!p.test(psgimMasterSrc), `psgimMasterStudents.ts contains suspicious hardcoding pattern #${idx}`);
});

// --- 2. SPECIFICATION CONFORMANCE & COMPLETENESS ---
console.log(`Checking all ${specData.length} students against STUDENT_REGISTRY...`);
assert(specData.length === 252, `Specification must contain 252 students, got ${specData.length}`);

const dynamicCourses = ['MCOB', 'ADM', 'MC', 'SSM', 'BS', 'EDM', 'LA', 'SSA'];

let missingRegistryStudents = 0;
let courseDiscrepancies = 0;
let sportsMissing = 0;

specData.forEach(item => {
  const dRoll = item.dRollNo;
  const colRoll = dRoll.substring(1);

  // Check both dRoll and colRoll in STUDENT_REGISTRY
  const dEntry = psgimData.STUDENT_REGISTRY[dRoll];
  const colEntry = psgimData.STUDENT_REGISTRY[colRoll];

  if (!dEntry) {
    missingRegistryStudents++;
    errors.push(`Missing dRoll ${dRoll} in STUDENT_REGISTRY`);
    return;
  }
  if (!colEntry) {
    missingRegistryStudents++;
    errors.push(`Missing collegeRoll ${colRoll} in STUDENT_REGISTRY`);
    return;
  }

  // Check batches match spec
  dynamicCourses.forEach(c => {
    const expected = item.courses[c];
    if (dEntry.batches[c] !== expected) {
      courseDiscrepancies++;
      errors.push(`Mismatch for ${dRoll} course ${c}: expected ${expected}, got ${dEntry.batches[c]}`);
    }
    if (colEntry.batches[c] !== expected) {
      courseDiscrepancies++;
      errors.push(`Mismatch for ${colRoll} course ${c}: expected ${expected}, got ${colEntry.batches[c]}`);
    }
  });

  // Check SPORTS is populated
  if (!dEntry.batches.SPORTS || !dEntry.batches.SPORTS.startsWith('SPORTS')) {
    sportsMissing++;
    errors.push(`Missing or invalid SPORTS for ${dRoll}: ${dEntry.batches.SPORTS}`);
  }
});

assert(missingRegistryStudents === 0, `Missing registry students: ${missingRegistryStudents}`);
assert(courseDiscrepancies === 0, `Course discrepancies: ${courseDiscrepancies}`);
assert(sportsMissing === 0, `Students with missing sports: ${sportsMissing}`);

// Check registry key count
const dKeys = Object.keys(psgimData.STUDENT_REGISTRY).filter(k => k.startsWith('D'));
const nonDKeys = Object.keys(psgimData.STUDENT_REGISTRY).filter(k => !k.startsWith('D'));
console.log(`STUDENT_REGISTRY has ${dKeys.length} 'D' keys and ${nonDKeys.length} college roll keys.`);
assert(dKeys.length === 252, `STUDENT_REGISTRY D-keys count should be 252, got ${dKeys.length}`);
assert(nonDKeys.length === 252, `STUDENT_REGISTRY non-D-keys count should be 252, got ${nonDKeys.length}`);

// Check obsolete dummy entries
const obsoleteKeys = ['D26AA62', 'D26AB61', 'D26AB62', 'D26AB63', 'D26AB64', 'D26AE10', '26AE10'];
obsoleteKeys.forEach(k => {
  assert(!psgimData.STUDENT_REGISTRY[k], `Obsolete key ${k} should NOT exist in STUDENT_REGISTRY`);
});

// --- 3. MASTER STUDENTS SYNC & BIDIRECTIONAL MAPPING ---
console.log('Checking PSGIM_MASTER_STUDENTS synchronization...');
const masterKeys = Object.keys(psgimMaster.PSGIM_MASTER_STUDENTS);
assert(masterKeys.length === 252, `PSGIM_MASTER_STUDENTS count should be 252, got ${masterKeys.length}`);

// Check missing students that were restored
['D26AA25', 'D26AB14', 'D26AC53', 'D26AE01', 'D26AE13'].forEach(k => {
  const s = psgimMaster.PSGIM_MASTER_STUDENTS[k];
  assert(!!s, `Restored student ${k} must exist in PSGIM_MASTER_STUDENTS`);
});

specData.forEach(item => {
  const dRoll = item.dRollNo;
  const colRoll = dRoll.substring(1);
  const s = psgimMaster.PSGIM_MASTER_STUDENTS[dRoll];
  assert(!!s, `Student ${dRoll} missing in PSGIM_MASTER_STUDENTS`);
  if (s) {
    assert(s.collegeRollNo === colRoll, `${dRoll} collegeRollNo expected ${colRoll}, got ${s.collegeRollNo}`);
    assert(s.dRollNo === dRoll, `${dRoll} dRollNo expected ${dRoll}, got ${s.dRollNo}`);
  }

  // Test helpers
  assert(psgimMaster.toOldRollNo(colRoll) === dRoll, `toOldRollNo(${colRoll}) expected ${dRoll}, got ${psgimMaster.toOldRollNo(colRoll)}`);
  assert(psgimMaster.toOldRollNo(dRoll) === dRoll, `toOldRollNo(${dRoll}) expected ${dRoll}, got ${psgimMaster.toOldRollNo(dRoll)}`);
  assert(psgimMaster.toNewRollNo(colRoll) === colRoll, `toNewRollNo(${colRoll}) expected ${colRoll}, got ${psgimMaster.toNewRollNo(colRoll)}`);
  assert(psgimMaster.toNewRollNo(dRoll) === colRoll, `toNewRollNo(${dRoll}) expected ${colRoll}, got ${psgimMaster.toNewRollNo(dRoll)}`);

  const fromAnyCol = psgimMaster.getStudentByAnyRoll(colRoll);
  const fromAnyD = psgimMaster.getStudentByAnyRoll(dRoll);
  assert(fromAnyCol?.dRollNo === dRoll, `getStudentByAnyRoll(${colRoll}) failed`);
  assert(fromAnyD?.dRollNo === dRoll, `getStudentByAnyRoll(${dRoll}) failed`);
});

// --- 4. VERIFIED TEST CASES ---
console.log('Verifying test cases 26AA01 and 26AB05...');
const tc1 = psgimData.STUDENT_REGISTRY['26AA01'];
assert(tc1.batches.MCOB === 'MCOB1', '26AA01 MCOB');
assert(tc1.batches.ADM === 'ADM1', '26AA01 ADM');
assert(tc1.batches.MC === 'MC2', '26AA01 MC');
assert(tc1.batches.SSM === 'SSM1', '26AA01 SSM');
assert(tc1.batches.BS === 'BS1', '26AA01 BS');
assert(tc1.batches.EDM === 'EDM3', '26AA01 EDM');
assert(tc1.batches.LA === 'LA1', '26AA01 LA');
assert(tc1.batches.SSA === 'SSA3', '26AA01 SSA');

const tc2 = psgimData.STUDENT_REGISTRY['26AB05'];
assert(tc2.batches.MCOB === 'MCOB1', '26AB05 MCOB');
assert(tc2.batches.ADM === 'ADM2', '26AB05 ADM');
assert(tc2.batches.MC === 'MC3', '26AB05 MC');
assert(tc2.batches.SSM === 'SSM2', '26AB05 SSM');
assert(tc2.batches.BS === 'BS2', '26AB05 BS');
assert(tc2.batches.EDM === 'EDM1', '26AB05 EDM');
assert(tc2.batches.LA === 'LA1', '26AB05 LA');
assert(tc2.batches.SSA === 'SSA3', '26AB05 SSA');

// --- 5. TIMETABLE RESOLUTION, VENUES & FACULTY AUDIT ---
console.log('Auditing timetable resolution for all 252 students...');
let badPeriodCount = 0;
let duplicateSlots = 0;
let slashRooms = 0;
let tbdRooms = 0;
let facultyMismatches = 0;

specData.forEach(item => {
  const dRoll = item.dRollNo;
  const colRoll = dRoll.substring(1);

  [dRoll, colRoll].forEach(roll => {
    const tt = psgimData.getTimetableForStudent(roll);
    if (!Array.isArray(tt) || tt.length !== 19) {
      badPeriodCount++;
      errors.push(`${roll} resolved to ${tt ? tt.length : 0} periods instead of 19`);
    }

    const seenTimes = new Set();
    if (Array.isArray(tt)) {
      tt.forEach(slot => {
        const timeKey = `${slot.day}_${slot.startTime}`;
        if (seenTimes.has(timeKey)) {
          duplicateSlots++;
          errors.push(`Duplicate slot for ${roll} at ${timeKey}`);
        }
        seenTimes.add(timeKey);

        if (typeof slot.room === 'string' && slot.room.includes('/')) {
          slashRooms++;
          errors.push(`Slash room for ${roll} slot ${slot.shortForm}: ${slot.room}`);
        }

        if (!slot.room || slot.room.trim() === '' || slot.room.includes('TBD')) {
          tbdRooms++;
          errors.push(`TBD room for ${roll} slot ${slot.shortForm}: ${slot.room}`);
        }

        // Faculty check
        if (slot.shortForm !== 'CLUB') {
          const course = psgimData.PSGIM_COURSES[slot.shortForm];
          const match = slot.batch.match(/\d+$/);
          const grp = match ? parseInt(match[0], 10) : 1;
          const expectedFac = course?.faculty?.[grp];
          if (expectedFac && slot.faculty !== expectedFac) {
            facultyMismatches++;
            errors.push(`Faculty mismatch for ${roll} ${slot.shortForm} grp ${grp}: got ${slot.faculty}, expected ${expectedFac}`);
          }
        }
      });
    }
  });
});

assert(badPeriodCount === 0, `Bad period count: ${badPeriodCount}`);
assert(duplicateSlots === 0, `Duplicate slots: ${duplicateSlots}`);
assert(slashRooms === 0, `Slash rooms count: ${slashRooms}`);
assert(tbdRooms === 0, `TBD rooms count: ${tbdRooms}`);
assert(facultyMismatches === 0, `Faculty mismatches: ${facultyMismatches}`);

// --- 6. ADVERSARIAL STRESS-TESTING (EDGE CASES) ---
console.log('Running adversarial stress-testing edge cases...');
// 1. Whitespace and case-folding
const edgeRolls = [
  '  26AA01  ',
  '  d26aa01  ',
  '26ab05',
  'D26AB05',
  'd26ae13',
  '26ae13'
];

edgeRolls.forEach(roll => {
  const tt = psgimData.getTimetableForStudent(roll);
  assert(Array.isArray(tt) && tt.length === 19, `Timetable resolution failed for edge input "${roll}"`);
  const s = psgimMaster.getStudentByAnyRoll(roll);
  assert(!!s, `getStudentByAnyRoll failed for edge input "${roll}"`);
});

// 2. Invalid inputs
const invalidInputs = ['', '   ', 'NONEXISTENT', '26ZZ99', 'D99ZZ99', null, undefined];
invalidInputs.forEach(inv => {
  let threw = false;
  try {
    const res = psgimData.getTimetableForStudent(inv);
    assert(Array.isArray(res), `getTimetableForStudent should return array for invalid input "${inv}"`);
  } catch (e) {
    threw = true;
  }
  assert(!threw, `getTimetableForStudent threw exception for invalid input "${inv}"`);

  let masterRes = null;
  try {
    masterRes = psgimMaster.getStudentByAnyRoll(inv);
  } catch (e) {
    threw = true;
  }
  assert(!threw && masterRes === null, `getStudentByAnyRoll should return null for invalid input "${inv}"`);
});

// 3. resolveExactRoom boundary test
assert(psgimData.resolveExactRoom('CLUB', 1, 'Auditorium / Clubs') === 'Auditorium', 'CLUB room');
assert(psgimData.resolveExactRoom('SPORTS', 1, 'Ground') === 'Sports Ground', 'SPORTS room');
assert(psgimData.resolveExactRoom('SSA', 1, 'LH-401/405') === 'LH-401', 'SSA grp 1');
assert(psgimData.resolveExactRoom('SSA', 2, 'LH-401/405') === 'LH-405', 'SSA grp 2');
assert(psgimData.resolveExactRoom('SSA', 3, 'LH-101/109') === 'LH-101', 'SSA grp 3');
assert(psgimData.resolveExactRoom('SSA', 4, 'LH-101/109') === 'LH-109', 'SSA grp 4');
assert(psgimData.resolveExactRoom('SSA', 99, 'LH-101/109') === 'LH-101', 'SSA grp 99 fallback');
assert(psgimData.resolveExactRoom('MCOB', 99, 'LH-101/109') === 'LH-101', 'MCOB grp 99 fallback');

// --- 7. EMOJI DETECTION ---
console.log('Auditing modified files for emoji violations...');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const filesToScan = [
  path.join(ROOT_DIR, 'scripts', 'buildPwa.js'),
  path.join(ROOT_DIR, 'src', 'data', 'psgimData.ts'),
  path.join(ROOT_DIR, 'src', 'data', 'psgimMasterStudents.ts')
];

filesToScan.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  assert(!emojiRegex.test(content), `Emoji found in ${f}`);
});

console.log('=== [REVIEWER_1 ADVERSARIAL AUDIT SUMMARY] ===');
console.log(`Total Errors Recorded: ${errors.length}`);
if (errors.length > 0) {
  console.error('Audit FAILED with errors:');
  errors.slice(0, 10).forEach(e => console.error(' - ' + e));
  process.exit(1);
} else {
  console.log('ALL INDEPENDENT REVIEWER CHECKS PASSED WITH 0 DEFECTS.');
  process.exit(0);
}
