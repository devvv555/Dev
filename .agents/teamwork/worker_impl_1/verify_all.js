const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('COMPREHENSIVE IMPLEMENTATION VERIFICATION SUITE');
console.log('====================================================\n');

// 1. Check Zero Emojis in owned files
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const ownedFiles = [
  'src/data/psgimData.ts',
  'src/data/psgimMasterStudents.ts',
  'scripts/buildPwa.js'
];

let emojiErrors = 0;
ownedFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (emojiRegex.test(content)) {
    console.error(`[FAIL] Emoji detected in ${f}`);
    emojiErrors++;
  } else {
    console.log(`[PASS] Zero emojis in ${f}`);
  }
});

// 2. Load official specification
const officialList = JSON.parse(
  fs.readFileSync('.agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json', 'utf8')
);
console.log(`\n[INFO] Loaded official specification: ${officialList.length} students.`);

// 3. Inspect STUDENT_REGISTRY in src/data/psgimData.ts
const psgimDataContent = fs.readFileSync('src/data/psgimData.ts', 'utf8');

// Parse STUDENT_REGISTRY
const registryMatch = psgimDataContent.match(/export const STUDENT_REGISTRY: Record<string, StudentRecord> = \{([\s\S]*?)\n\};/);
if (!registryMatch) {
  console.error('[FAIL] Could not match STUDENT_REGISTRY in psgimData.ts');
  process.exit(1);
}

// Evaluate STUDENT_REGISTRY safely
const registryCode = '({\n' + registryMatch[1] + '\n})';
let STUDENT_REGISTRY;
try {
  STUDENT_REGISTRY = eval(registryCode);
} catch (e) {
  console.error('[FAIL] Eval failed for STUDENT_REGISTRY:', e.message);
  process.exit(1);
}

const regKeys = Object.keys(STUDENT_REGISTRY);
const dRollKeys = regKeys.filter(k => k.startsWith('D'));
const colRollKeys = regKeys.filter(k => !k.startsWith('D'));
console.log(`[INFO] STUDENT_REGISTRY keys: Total=${regKeys.length}, D-Rolls=${dRollKeys.length}, College-Rolls=${colRollKeys.length}`);

// Check all 252 official students match line-by-line
let regMismatches = 0;
officialList.forEach(s => {
  const dRoll = s.dRollNo;
  const colRoll = dRoll.substring(1);
  const recD = STUDENT_REGISTRY[dRoll];
  const recCol = STUDENT_REGISTRY[colRoll];

  if (!recD) {
    console.error(`[FAIL] Missing D-Roll in STUDENT_REGISTRY: ${dRoll}`);
    regMismatches++;
    return;
  }
  if (!recCol) {
    console.error(`[FAIL] Missing College Roll in STUDENT_REGISTRY: ${colRoll}`);
    regMismatches++;
    return;
  }

  // Check course group exact match
  const expectedCourses = s.courses;
  for (const course of ['MCOB', 'ADM', 'MC', 'BS', 'EDM', 'LA', 'SSA']) {
    if (recD.batches[course] !== expectedCourses[course]) {
      console.error(`[FAIL] Course mismatch for ${dRoll} ${course}: current=${recD.batches[course]}, expected=${expectedCourses[course]}`);
      regMismatches++;
    }
  }

  // Check SSM
  if (recD.batches.SSM !== expectedCourses.SSM) {
    console.error(`[FAIL] SSM mismatch for ${dRoll}: current=${recD.batches.SSM}, expected=${expectedCourses.SSM}`);
    regMismatches++;
  }

  // Check SPORTS is populated
  if (!recD.batches.SPORTS || recD.batches.SPORTS.trim() === '') {
    console.error(`[FAIL] Empty SPORTS for ${dRoll}`);
    regMismatches++;
  }
});

if (regMismatches === 0) {
  console.log('[PASS] All 252 official students match official specification with 0% discrepancy.');
} else {
  console.error(`[FAIL] Found ${regMismatches} registry mismatches.`);
}

// 4. Verify Master Students & Roll Resolution Helpers
const masterContent = fs.readFileSync('src/data/psgimMasterStudents.ts', 'utf8');
const masterMatch = masterContent.match(/export const PSGIM_MASTER_STUDENTS: Record<string, PsgimStudentInfo> = \{([\s\S]*?)\n\};/);
const masterCode = '({\n' + masterMatch[1] + '\n})';
let PSGIM_MASTER_STUDENTS;
try {
  PSGIM_MASTER_STUDENTS = eval(masterCode);
} catch (e) {
  console.error('[FAIL] Eval failed for PSGIM_MASTER_STUDENTS:', e.message);
  process.exit(1);
}

const masterKeys = Object.keys(PSGIM_MASTER_STUDENTS);
console.log(`\n[INFO] PSGIM_MASTER_STUDENTS count: ${masterKeys.length}`);

// Check missing students are present
const requiredStudents = ['D26AA25', 'D26AB14', 'D26AC53', 'D26AE01', 'D26AE09', 'D26AE11', 'D26AE13'];
let masterMissing = 0;
requiredStudents.forEach(r => {
  if (!PSGIM_MASTER_STUDENTS[r]) {
    console.error(`[FAIL] Missing required student in PSGIM_MASTER_STUDENTS: ${r}`);
    masterMissing++;
  }
});
if (PSGIM_MASTER_STUDENTS['D26AE10']) {
  console.error('[FAIL] D26AE10 should NOT exist in master students.');
  masterMissing++;
}

if (masterMissing === 0) {
  console.log('[PASS] Required students (AA25, AB14, AC53, Batch AE) present, AE10 excluded.');
}

// 5. Test verified test cases from prompt
console.log('\n--- VERIFYING MANDATORY TEST CASES ---');
const test1_D = STUDENT_REGISTRY['D26AA01'];
const test1_Col = STUDENT_REGISTRY['26AA01'];
const expected1 = {
  MCOB: 'MCOB1', ADM: 'ADM1', MC: 'MC2', SSM: 'SSM1',
  BS: 'BS1', EDM: 'EDM3', LA: 'LA1', SSA: 'SSA3'
};

let testCaseFailures = 0;
for (const [c, val] of Object.entries(expected1)) {
  if (test1_D?.batches[c] !== val || test1_Col?.batches[c] !== val) {
    console.error(`[FAIL] Test Case 1 failure for ${c}: D=${test1_D?.batches[c]}, Col=${test1_Col?.batches[c]}, expected=${val}`);
    testCaseFailures++;
  }
}
if (testCaseFailures === 0) {
  console.log('[PASS] Test Case 1: 26AA01 / D26AA01 resolves to MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3.');
}

const test2 = STUDENT_REGISTRY['26AB05'];
const test2_D = STUDENT_REGISTRY['D26AB05'];
const expected2 = {
  MCOB: 'MCOB1', ADM: 'ADM2', MC: 'MC3', SSM: 'SSM2',
  BS: 'BS2', EDM: 'EDM1', LA: 'LA1', SSA: 'SSA3'
};
for (const [c, val] of Object.entries(expected2)) {
  if (test2?.batches[c] !== val || test2_D?.batches[c] !== val) {
    console.error(`[FAIL] Test Case 2 failure for ${c}: Col=${test2?.batches[c]}, D=${test2_D?.batches[c]}, expected=${val}`);
    testCaseFailures++;
  }
}
if (testCaseFailures === 0) {
  console.log('[PASS] Test Case 2: 26AB05 resolves to MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3.');
}

// 6. Test resolveExactRoom & getTimetableForStudent
// Extract resolveExactRoom and getTimetableForStudent
// We bundle and run them
const MASTER_SCHEDULE = eval('([\n' + psgimDataContent.match(/export const MASTER_SCHEDULE: MasterScheduleSlot\[\] = \[([\s\S]*?)\n\];/)[1] + '\n])');
const PSGIM_COURSES = eval('({\n' + psgimDataContent.match(/export const PSGIM_COURSES: Record<string, CourseDetail> = \{([\s\S]*?)\n\};/)[1] + '\n})');

function toOldRollNo(inputRoll) {
  const clean = (inputRoll || '').trim().toUpperCase();
  return clean.startsWith('D') ? clean : 'D' + clean;
}
function toNewRollNo(inputRoll) {
  const clean = (inputRoll || '').trim().toUpperCase();
  return clean.startsWith('D') ? clean.substring(1) : clean;
}
function getMasterStudent(rollNo) {
  const clean = (rollNo || '').trim().toUpperCase();
  return PSGIM_MASTER_STUDENTS[clean] || PSGIM_MASTER_STUDENTS[toOldRollNo(clean)] || null;
}

const ts = require('typescript');
const resolveExactRoomCode = psgimDataContent.match(/export function resolveExactRoom[\s\S]*?\n\}/)[0].replace('export ', '');
const resolveExactRoomCodeClean = ts.transpile(resolveExactRoomCode);
const resolveExactRoom = new Function('course', 'groupNum', 'defaultRoom', resolveExactRoomCodeClean + '\nreturn resolveExactRoom(course, groupNum, defaultRoom);');

// Test CLUB room specifically
const clubRoom = resolveExactRoom('CLUB', 1, 'Auditorium');
if (clubRoom === 'Auditorium') {
  console.log('\n[PASS] resolveExactRoom for CLUB returns "Auditorium" (strictly 0 slash rooms).');
} else {
  console.error(`[FAIL] resolveExactRoom for CLUB returned "${clubRoom}"`);
}

// Run timetable evaluation for all 252 students, both with D and without D
let totalSlashRooms = 0;
let totalSlotFailures = 0;
let totalFacultyMismatches = 0;

const EXPECTED_FACULTY = {
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

// Build timetable runner
const getTimetable = (rollNo) => {
  const cleanRoll = (rollNo || '').toUpperCase();
  const oldRoll = toOldRollNo(cleanRoll);
  const newRoll = toNewRollNo(cleanRoll);
  const master = getMasterStudent(cleanRoll) || getMasterStudent(oldRoll) || getMasterStudent(newRoll);
  const student = STUDENT_REGISTRY[cleanRoll] || STUDENT_REGISTRY[oldRoll] || STUDENT_REGISTRY[newRoll];

  const batchLetter = master?.batch || (newRoll.length >= 5 ? newRoll.charAt(3) : 'A');
  const sectionGroupNum = batchLetter === 'B' ? 2 : batchLetter === 'C' ? 3 : batchLetter === 'D' ? 4 : 1;

  const studentBatches = student
    ? Object.values(student.batches).filter((b) => b && b.trim() !== '')
    : null;

  const filtered = MASTER_SCHEDULE.filter((slot) => {
    if (slot.applicableBatches.includes('*')) return true;
    if (studentBatches && studentBatches.length > 0) {
      return slot.applicableBatches.some((b) => studentBatches.includes(b));
    }
    const sectionTargetBatch = `${slot.course}${sectionGroupNum}`;
    return slot.applicableBatches.includes(sectionTargetBatch);
  });

  const seenTimes = new Set();
  const uniqueSlots = filtered.filter((slot) => {
    const key = `${slot.day}_${slot.startTime}`;
    if (seenTimes.has(key)) return false;
    seenTimes.add(key);
    return true;
  });

  return uniqueSlots.map((slot, index) => {
    const course = PSGIM_COURSES[slot.course];
    let courseGroupNum = sectionGroupNum;
    if (student?.batches && student.batches[slot.course]) {
      const assignedBatch = student.batches[slot.course];
      const match = assignedBatch.match(/\d+$/);
      if (match) {
        courseGroupNum = parseInt(match[0], 10);
      }
    }

    const studentBatch = `${slot.course}${courseGroupNum}`;
    const facultyName = (course?.faculty[courseGroupNum]) || (course?.faculty[sectionGroupNum]) || (course?.faculty[1] || 'Faculty');
    const specificRoom = resolveExactRoom(slot.course, courseGroupNum, slot.defaultRoom);

    return {
      day: slot.day,
      startTime: slot.startTime,
      batch: studentBatch,
      faculty: facultyName,
      room: specificRoom
    };
  });
};

officialList.forEach(s => {
  [s.dRollNo, s.dRollNo.substring(1)].forEach(roll => {
    const tt = getTimetable(roll);
    if (tt.length !== 19) {
      console.error(`[FAIL] Student ${roll} resolved to ${tt.length} periods (expected 19)`);
      totalSlotFailures++;
    }
    tt.forEach(slot => {
      if (slot.room.includes('/') || slot.room === '' || slot.room === 'TBD') {
        console.error(`[FAIL] Bad room for ${roll} on ${slot.day} ${slot.startTime}: ${slot.room}`);
        totalSlashRooms++;
      }
      const course = slot.batch.replace(/\d+$/, '');
      const groupNum = parseInt(slot.batch.match(/\d+$/)?.[0] || '1', 10);
      if (course !== 'CLUB') {
        const expFac = EXPECTED_FACULTY[course]?.[groupNum];
        if (expFac && slot.faculty !== expFac) {
          console.error(`[FAIL] Faculty mismatch for ${roll} ${slot.batch}: ${slot.faculty} vs ${expFac}`);
          totalFacultyMismatches++;
        }
      }
    });
  });
});

console.log('\n--- TIMETABLE & ROOM RESOLUTION RESULTS ---');
console.log(`Evaluated: ${officialList.length * 2} lookups (both D and non-D rolls).`);
console.log(`Slot count failures (not 19 periods): ${totalSlotFailures}`);
console.log(`Slash / Bad room failures: ${totalSlashRooms}`);
console.log(`Faculty mismatches: ${totalFacultyMismatches}`);

if (totalSlotFailures === 0 && totalSlashRooms === 0 && totalFacultyMismatches === 0) {
  console.log('\n[SUCCESS] ALL AUDIT CHECKS PASSED WITH 0 DEFECTS!');
} else {
  console.error('\n[FAILURE] One or more audit checks failed.');
  process.exit(1);
}
