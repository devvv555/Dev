const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..', '..');
const genFile = path.join(rootDir, 'scripts', 'generatePsgimData.js');
const psgimDataFile = path.join(rootDir, 'src', 'data', 'psgimData.ts');
const masterFile = path.join(rootDir, 'src', 'data', 'psgimMasterStudents.ts');

console.log('--- SURVEY ANALYSIS SCRIPT ---');

// 1. Analyze generatePsgimData.js rawLines
const genContent = fs.readFileSync(genFile, 'utf8');
const linesMatch = genContent.match(/const rawLines = `([\s\S]*?)`;/);
if (linesMatch) {
  const lines = linesMatch[1].trim().split('\n').map(l => l.trim()).filter(Boolean);
  console.log('generatePsgimData.js total rawLines:', lines.length);
  console.log('First line:', lines[0]);
  console.log('Last line:', lines[lines.length - 1]);
}

// 2. Analyze STUDENT_REGISTRY in src/data/psgimData.ts
const bundleData = require(path.join(rootDir, 'tests', 'bundle_data.js'));
const registry = bundleData.STUDENT_REGISTRY;
const studentKeys = Object.keys(registry);
console.log('STUDENT_REGISTRY key count:', studentKeys.length);

// Check roll number format in registry keys
const dRollKeys = studentKeys.filter(k => k.startsWith('D'));
const nonDRollKeys = studentKeys.filter(k => !k.startsWith('D'));
console.log('Keys starting with D:', dRollKeys.length);
console.log('Keys NOT starting with D:', nonDRollKeys.length);

// 3. Analyze getTimetableForStudent for all registered students
const errors = [];
const slashRooms = new Set();
const unassignedRooms = new Set();
const facultyMismatches = [];

// Expected faculty map from ORIGINAL_REQUEST.md:
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

// Expected room mappings from ORIGINAL_REQUEST.md:
// MCOB: 1: LH-101, 2: LH-109, 3: LH-401, 4: LH-405
// EDM: 1: LH-101, 2: LH-109, 3: LH-401, 4: LH-405
// ADM: 1: LH-101, 2: LH-109, 3: LH-401, 4: LH-405
// BS: 1: LH-101, 2: LH-109, 3: LH-401, 4: LH-405
// MC: 1: LH-101, 2: LH-109, 3: LH-401, 4: LH-405
// SSA Lab: 1: LH-401, 2: LH-405, 3: LH-101, 4: LH-109
// SSM: 1: LH-101, 2: LH-109, 3: LH-401, 4: LH-405 (or ALPS/SSM for Saturday?)
// LA: 1: LH-101, 2: LH-109, 3: LH-401, 4: LH-405
// Sports: Sports Ground

studentKeys.forEach(rollNo => {
  const timetable = bundleData.getTimetableForStudent(rollNo);
  if (!timetable || timetable.length === 0) {
    errors.push(`Empty timetable for ${rollNo}`);
    return;
  }

  timetable.forEach(slot => {
    // Check room
    if (!slot.room || slot.room.trim() === '' || slot.room.toUpperCase() === 'TBD') {
      unassignedRooms.add(`${rollNo} ${slot.day} ${slot.shortForm}: ${slot.room}`);
    }
    if (slot.room && slot.room.includes('/')) {
      slashRooms.add(`${slot.shortForm} on ${slot.day} ${slot.startTime} has room: "${slot.room}"`);
    }

    // Check faculty
    const courseCode = slot.shortForm;
    if (EXPECTED_FACULTY[courseCode]) {
      const match = (slot.batch || '').match(/\d+$/);
      const group = match ? parseInt(match[0], 10) : 1;
      const expectedFac = EXPECTED_FACULTY[courseCode][group];
      if (expectedFac && slot.faculty !== expectedFac) {
        facultyMismatches.push(`${rollNo} ${slot.day} ${slot.shortForm}${group}: expected "${expectedFac}", got "${slot.faculty}"`);
      }
    }
  });
});

console.log('--- FINDINGS ---');
console.log('Errors count:', errors.length);
console.log('Slash rooms occurrences:', Array.from(slashRooms));
console.log('Unassigned/TBD rooms count:', Array.from(unassignedRooms).length);
console.log('Faculty mismatches count:', facultyMismatches.length);
if (facultyMismatches.length > 0) {
  console.log('First 5 faculty mismatches:', facultyMismatches.slice(0, 5));
}

// 4. Test bidirectional retrieval: collegeRollNo vs dRollNo
console.log('\n--- BIDIRECTIONAL RETRIEVAL TEST ---');
const masterStudents = require(path.join(rootDir, 'tests', 'bundle_master.js')).PSGIM_MASTER_STUDENTS;
const masterKeys = Object.keys(masterStudents);
console.log('PSGIM_MASTER_STUDENTS count:', masterKeys.length);

let collegeRollLookupSuccess = 0;
let collegeRollLookupFailed = 0;
let failedRolls = [];

masterKeys.forEach(dRoll => {
  const info = masterStudents[dRoll];
  const colRoll = info.collegeRollNo;
  
  // Test getTimetableForStudent with colRoll
  const ttCol = bundleData.getTimetableForStudent(colRoll);
  const ttDRoll = bundleData.getTimetableForStudent(dRoll);

  if (!ttCol || ttCol.length === 0) {
    collegeRollLookupFailed++;
    failedRolls.push({ dRoll, colRoll, reason: 'empty timetable with college roll' });
  } else {
    collegeRollLookupSuccess++;
    // Check if batches match
    const colBatches = ttCol.map(s => s.batch).sort();
    const dBatches = ttDRoll.map(s => s.batch).sort();
    if (JSON.stringify(colBatches) !== JSON.stringify(dBatches)) {
      failedRolls.push({ dRoll, colRoll, reason: 'batches mismatch between dRoll and colRoll', colBatches: colBatches.slice(0, 3), dBatches: dBatches.slice(0, 3) });
    }
  }
});

console.log('College roll lookup success:', collegeRollLookupSuccess);
console.log('College roll lookup failed:', collegeRollLookupFailed);
if (failedRolls.length > 0) {
  console.log('First 5 failed roll lookups:', failedRolls.slice(0, 5));
}

// 5. Test specific Acceptance Criteria cases
console.log('\n--- ACCEPTANCE CRITERIA CASES ---');
['26AA01', 'D26AA01', '26AB05', 'D26AB05'].forEach(roll => {
  const tt = bundleData.getTimetableForStudent(roll);
  console.log(`Roll ${roll} slot count: ${tt.length}`);
  const uniqueBatches = Array.from(new Set(tt.map(s => s.batch)));
  console.log(`  Batches: ${uniqueBatches.join(', ')}`);
});

// 6. Compare rawLines vs STUDENT_REGISTRY vs PSGIM_MASTER_STUDENTS
console.log('\n--- DATASET RECONCILIATION ---');
const rawRolls = new Set(linesMatch ? linesMatch[1].trim().split('\n').map(l => l.trim().split(/\s+/)[0]) : []);
const regRolls = new Set(Object.keys(registry));
const masterRolls = new Set(Object.keys(masterStudents));

console.log('Raw lines count:', rawRolls.size);
console.log('Registry count:', regRolls.size);
console.log('Master students count:', masterRolls.size);

const inRegNotRaw = Array.from(regRolls).filter(r => !rawRolls.has(r));
const inRawNotReg = Array.from(rawRolls).filter(r => !regRolls.has(r));
const inMasterNotReg = Array.from(masterRolls).filter(r => !regRolls.has(r));
const inRegNotMaster = Array.from(regRolls).filter(r => !masterRolls.has(r));

console.log('In Registry but NOT in Raw:', inRegNotRaw);
console.log('In Raw but NOT in Registry:', inRawNotReg);
console.log('In Master but NOT in Registry:', inMasterNotReg);
console.log('In Registry but NOT in Master:', inRegNotMaster);


