/**
 * Independent Victory Auditor Phase B Forensic Verification Script
 * Executed independently by victory_auditor_2.
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// 1. Transparent TypeScript on-the-fly compiler hook for Node.js
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

const ROOT_DIR = path.resolve(__dirname, '../../..');
const psgimData = require(path.join(ROOT_DIR, 'src', 'data', 'psgimData.ts'));
const psgimMaster = require(path.join(ROOT_DIR, 'src', 'data', 'psgimMasterStudents.ts'));

const {
  toNewRollNo,
  toOldRollNo,
  getMasterStudent,
  PSGIM_MASTER_STUDENTS,
} = psgimMaster;

const {
  getTimetableForStudent,
  STUDENT_REGISTRY,
} = psgimData;

let violations = [];
let passCount = 0;

function check(desc, condition, details = '') {
  if (condition) {
    passCount++;
  } else {
    violations.push({ desc, details });
    console.error(`[FAIL] ${desc} - Details: ${details}`);
  }
}

console.log('=== RUNNING INDEPENDENT FORENSIC AUDIT CHECKS ===\n');

// 1. Devdarshan V Authenticity
console.log('--- Checking Devdarshan V Authenticity ---');
const devMaster = getMasterStudent('26AB12');
check('Devdarshan V resolves via 26AB12', devMaster && devMaster.name === 'DEVDARSHAN V', JSON.stringify(devMaster));
check('Devdarshan V dRollNo is D26AB05', devMaster && devMaster.dRollNo === 'D26AB05', devMaster?.dRollNo);
check('Devdarshan V collegeRollNo is 26AB12', devMaster && devMaster.collegeRollNo === '26AB12', devMaster?.collegeRollNo);
check('Devdarshan V dobPassword is authentic 13DEC05', devMaster && devMaster.dobPassword === '13DEC05', devMaster?.dobPassword);
check('toOldRollNo(26AB12) returns D26AB05', toOldRollNo('26AB12') === 'D26AB05', toOldRollNo('26AB12'));
check('toNewRollNo(D26AB05) returns 26AB12', toNewRollNo('D26AB05') === '26AB12', toNewRollNo('D26AB05'));

// 2. Amulya P Separation
console.log('\n--- Checking Amulya P Separation ---');
const amulyaMaster = getMasterStudent('26AB05');
check('Amulya P resolves via 26AB05', amulyaMaster && amulyaMaster.name === 'AMULYA P', JSON.stringify(amulyaMaster));
check('Amulya P dRollNo is D26AB56', amulyaMaster && amulyaMaster.dRollNo === 'D26AB56', amulyaMaster?.dRollNo);
check('Amulya P collegeRollNo is 26AB05', amulyaMaster && amulyaMaster.collegeRollNo === '26AB05', amulyaMaster?.collegeRollNo);
check('Amulya P is NOT Devdarshan V', amulyaMaster && amulyaMaster.name !== devMaster?.name, 'Same name found');
check('toOldRollNo(26AB05) returns D26AB56', toOldRollNo('26AB05') === 'D26AB56', toOldRollNo('26AB05'));
check('toNewRollNo(D26AB56) returns 26AB05', toNewRollNo('D26AB56') === '26AB05', toNewRollNo('D26AB56'));
check('Devdarshan V does not hijack 26AB05 in getMasterStudent', getMasterStudent('26AB05')?.name === 'AMULYA P', getMasterStudent('26AB05')?.name);

// 3. Full 252 Student Roster 1:1 Mapping
console.log('\n--- Checking 252 Students Roster 1:1 Bidirectional Mapping ---');
const csvPath = path.join(ROOT_DIR, 'scripts', 'excel_mapping.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);

let rosterStudents = [];
for (let i = 0; i < lines.length; i++) {
  const parts = lines[i].split(',').map(p => p.trim());
  if (parts.length >= 2) {
    rosterStudents.push({
      dRoll: parts[0],
      collegeRoll: parts[1],
      name: parts[2] || '',
      batch: parts[3] || '',
    });
  }
}
console.log(`Parsed ${rosterStudents.length} students from excel_mapping.csv`);
check('Exactly 252 students in roster CSV', rosterStudents.length === 252, `Found ${rosterStudents.length}`);

let dRollSet = new Set();
let collegeRollSet = new Set();
let rosterMismatches = 0;

rosterStudents.forEach(st => {
  if (dRollSet.has(st.dRoll)) {
    check(`Unique dRoll ${st.dRoll}`, false, 'Duplicate dRoll in CSV');
  }
  dRollSet.add(st.dRoll);

  if (collegeRollSet.has(st.collegeRoll)) {
    check(`Unique collegeRoll ${st.collegeRoll}`, false, 'Duplicate collegeRoll in CSV');
  }
  collegeRollSet.add(st.collegeRoll);

  const mappedNew = toNewRollNo(st.dRoll);
  const mappedOld = toOldRollNo(st.collegeRoll);
  const masterByD = getMasterStudent(st.dRoll);
  const masterByCollege = getMasterStudent(st.collegeRoll);

  if (mappedNew !== st.collegeRoll) {
    rosterMismatches++;
    check(`toNewRollNo(${st.dRoll})`, false, `Expected ${st.collegeRoll}, got ${mappedNew}`);
  }
  if (mappedOld !== st.dRoll) {
    rosterMismatches++;
    check(`toOldRollNo(${st.collegeRoll})`, false, `Expected ${st.dRoll}, got ${mappedOld}`);
  }
  if (!masterByD || masterByD.collegeRollNo !== st.collegeRoll) {
    rosterMismatches++;
    check(`getMasterStudent(${st.dRoll}).collegeRollNo`, false, `Expected ${st.collegeRoll}, got ${masterByD?.collegeRollNo}`);
  }
  if (!masterByCollege || masterByCollege.dRollNo !== st.dRoll) {
    rosterMismatches++;
    check(`getMasterStudent(${st.collegeRoll}).dRollNo`, false, `Expected ${st.dRoll}, got ${masterByCollege?.dRollNo}`);
  }
});
check('0 Roster mapping mismatches across 252 students', rosterMismatches === 0, `${rosterMismatches} mismatches`);

// 4. Timetable Parity Across All 252 Students
console.log('\n--- Checking Timetable Parity across all 252 Students ---');
let timetableMismatches = 0;
let slashRoomCount = 0;
let tbdRoomCount = 0;
let totalPeriodsChecked = 0;

rosterStudents.forEach(st => {
  const ttByCollege = getTimetableForStudent(st.collegeRoll);
  const ttByD = getTimetableForStudent(st.dRoll);

  if (ttByCollege.length === 0 || ttByD.length === 0) {
    timetableMismatches++;
    check(`Empty timetable for ${st.collegeRoll} or ${st.dRoll}`, false, `College: ${ttByCollege.length}, D: ${ttByD.length}`);
  }

  if (ttByCollege.length !== ttByD.length) {
    timetableMismatches++;
    check(`Length mismatch between ${st.collegeRoll} and ${st.dRoll}`, false, `College: ${ttByCollege.length}, D: ${ttByD.length}`);
  }

  totalPeriodsChecked += ttByCollege.length;

  for (let i = 0; i < Math.min(ttByCollege.length, ttByD.length); i++) {
    const sC = ttByCollege[i];
    const sD = ttByD[i];

    if (sC.day !== sD.day || sC.period !== sD.period || sC.course !== sD.course || sC.faculty !== sD.faculty || sC.room !== sD.room) {
      timetableMismatches++;
      check(`Period match for ${st.collegeRoll} vs ${st.dRoll} period ${i}`, false, `College: ${sC.course}/${sC.room}/${sC.faculty} vs D: ${sD.course}/${sD.room}/${sD.faculty}`);
    }

    if (sC.room && sC.room.includes('/')) {
      slashRoomCount++;
      check(`Slash room in ${st.collegeRoll}`, false, `Slot ${sC.course} has room ${sC.room}`);
    }
    if (!sC.room || sC.room.toUpperCase().includes('TBD') || sC.room.trim() === '') {
      tbdRoomCount++;
      check(`TBD room in ${st.collegeRoll}`, false, `Slot ${sC.course} has room ${sC.room}`);
    }
  }
});

check(`Checked ${totalPeriodsChecked} timetable periods across 252 students`, totalPeriodsChecked > 4500, `Total checked: ${totalPeriodsChecked}`);
check('0 Timetable mismatches between collegeRoll and dRoll queries', timetableMismatches === 0, `${timetableMismatches} mismatches`);
check('0 Slash rooms across all generated schedules', slashRoomCount === 0, `${slashRoomCount} slash rooms found`);
check('0 TBD or empty rooms across all generated schedules', tbdRoomCount === 0, `${tbdRoomCount} TBD rooms found`);

// 5. Devdarshan V Specific Timetable Classroom Verification
console.log('\n--- Checking Devdarshan V Classrooms ---');
const devTt = getTimetableForStudent('26AB12');
check('Devdarshan weekly slot count is exactly 19 periods', devTt.length === 19, `Got ${devTt.length}`);

const devSlotMap = {};
devTt.forEach(slot => {
  const key = slot.shortForm || slot.course;
  if (!devSlotMap[key]) devSlotMap[key] = [];
  devSlotMap[key].push(slot);
});
console.log('Devdarshan shortForm courses:', Object.keys(devSlotMap));

// Verify specific classrooms from prompt:
// LA1 -> LH-101
// MC3 -> LH-401
// SSA3 -> LH-101
// MCOB1 -> LH-101
// ADM2 -> LH-109
// BS2 -> LH-109
// EDM1 -> LH-101
check('Devdarshan LA slot in LH-101', devSlotMap['LA'] && devSlotMap['LA'].every(s => s.room === 'LH-101'), JSON.stringify(devSlotMap['LA']?.map(s => s.room)));
check('Devdarshan MC slot in LH-401', devSlotMap['MC'] && devSlotMap['MC'].every(s => s.room === 'LH-401'), JSON.stringify(devSlotMap['MC']?.map(s => s.room)));
check('Devdarshan SSA slot in LH-101', (devSlotMap['SSA'] || devSlotMap['SSA Lab']) && (devSlotMap['SSA'] || devSlotMap['SSA Lab']).every(s => s.room === 'LH-101'), JSON.stringify((devSlotMap['SSA'] || devSlotMap['SSA Lab'])?.map(s => s.room)));
check('Devdarshan MCOB slot in LH-101', devSlotMap['MCOB'] && devSlotMap['MCOB'].every(s => s.room === 'LH-101'), JSON.stringify(devSlotMap['MCOB']?.map(s => s.room)));
check('Devdarshan ADM slot in LH-109', devSlotMap['ADM'] && devSlotMap['ADM'].every(s => s.room === 'LH-109'), JSON.stringify(devSlotMap['ADM']?.map(s => s.room)));
check('Devdarshan BS slot in LH-109', devSlotMap['BS'] && devSlotMap['BS'].every(s => s.room === 'LH-109'), JSON.stringify(devSlotMap['BS']?.map(s => s.room)));
check('Devdarshan EDM slot in LH-101', devSlotMap['EDM'] && devSlotMap['EDM'].every(s => s.room === 'LH-101'), JSON.stringify(devSlotMap['EDM']?.map(s => s.room)));

console.log('\n=== AUDIT RESULTS SUMMARY ===');
console.log(`Passed checks: ${passCount}`);
console.log(`Violations: ${violations.length}`);
if (violations.length > 0) {
  console.log('VIOLATIONS DETAILS:');
  console.log(JSON.stringify(violations, null, 2));
  process.exit(1);
} else {
  console.log('ALL PHASE B CHECKS PASSED WITH 0 DISCREPANCIES!');
  process.exit(0);
}
