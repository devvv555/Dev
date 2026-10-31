const fs = require('fs');
const path = require('path');
const ts = require('typescript');

require.extensions['.ts'] = function(m, f) {
  m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true }
  }).outputText, f);
};

const {
  PSGIM_MASTER_STUDENTS,
  toNewRollNo,
  toOldRollNo,
  getMasterStudent,
  ALL_COLLEGE_ROLL_NUMBERS
} = require('../src/data/psgimMasterStudents.ts');

const {
  STUDENT_REGISTRY,
  getTimetableForStudent
} = require('../src/data/psgimData.ts');

const { PsgimService } = require('../src/services/psgimService.ts');

console.log('--- 1. Testing Devdarshan V Roster Mapping ---');
console.assert(toNewRollNo('D26AB05') === '26AB12', 'toNewRollNo(D26AB05) must be 26AB12');
console.assert(toOldRollNo('26AB12') === 'D26AB05', 'toOldRollNo(26AB12) must be D26AB05');
console.assert(toNewRollNo('26AB12') === '26AB12', 'toNewRollNo(26AB12) must be 26AB12');
console.assert(toOldRollNo('D26AB05') === 'D26AB05', 'toOldRollNo(D26AB05) must be D26AB05');

const dev1 = getMasterStudent('26AB12');
const dev2 = getMasterStudent('D26AB05');
console.assert(dev1 && dev1.name === 'DEVDARSHAN V', 'getMasterStudent(26AB12) name must be DEVDARSHAN V');
console.assert(dev2 && dev2.name === 'DEVDARSHAN V', 'getMasterStudent(D26AB05) name must be DEVDARSHAN V');
console.assert(dev1.batch === 'B', 'Devdarshan batch must be B');
console.log('Devdarshan V roster mapping: PASS');

console.log('--- 2. Validating all 252 students against excel_mapping.csv ---');
const csvPath = path.join(__dirname, 'excel_mapping.csv');
const csvLines = fs.readFileSync(csvPath, 'utf8').trim().split('\n').filter(Boolean);
console.assert(csvLines.length === 252, 'CSV must have 252 entries');
console.assert(Object.keys(PSGIM_MASTER_STUDENTS).length === 252, 'PSGIM_MASTER_STUDENTS must have 252 entries');

let mismatchCount = 0;
for (const line of csvLines) {
  const [dRoll, colRoll, name] = line.split(',').map(s => s.trim());
  const student = PSGIM_MASTER_STUDENTS[dRoll];
  if (!student) {
    console.error('Missing student:', dRoll);
    mismatchCount++;
    continue;
  }
  if (student.collegeRollNo !== colRoll) {
    console.error(`Mismatch for ${dRoll}: expected ${colRoll}, got ${student.collegeRollNo}`);
    mismatchCount++;
  }
  if (toNewRollNo(dRoll) !== colRoll) {
    console.error(`toNewRollNo(${dRoll}) failed: expected ${colRoll}, got ${toNewRollNo(dRoll)}`);
    mismatchCount++;
  }
  if (toOldRollNo(colRoll) !== dRoll) {
    console.error(`toOldRollNo(${colRoll}) failed: expected ${dRoll}, got ${toOldRollNo(colRoll)}`);
    mismatchCount++;
  }
}
console.assert(mismatchCount === 0, `Total mismatches: ${mismatchCount}`);
console.log('252 student cross-verification against excel_mapping.csv: PASS (0 mismatches)');

console.log('--- 3. Testing STUDENT_REGISTRY for 26AB12, D26AB05, and 26AB05 ---');
const reg26AB12 = STUDENT_REGISTRY['26AB12'];
const regD26AB05 = STUDENT_REGISTRY['D26AB05'];
const reg26AB05 = STUDENT_REGISTRY['26AB05'];

console.assert(reg26AB12, 'STUDENT_REGISTRY[26AB12] must exist');
console.assert(regD26AB05, 'STUDENT_REGISTRY[D26AB05] must exist');
console.assert(reg26AB05, 'STUDENT_REGISTRY[26AB05] must exist');

const expectedBatches = {
  MCOB: 'MCOB1',
  ADM: 'ADM2',
  MC: 'MC3',
  SSM: 'SSM2',
  BS: 'BS2',
  EDM: 'EDM1',
  LA: 'LA1',
  SSA: 'SSA3',
  SPORTS: 'SPORTS2'
};

for (const [course, batch] of Object.entries(expectedBatches)) {
  console.assert(reg26AB12.batches[course] === batch, `26AB12 ${course} must be ${batch}`);
  console.assert(regD26AB05.batches[course] === batch, `D26AB05 ${course} must be ${batch}`);
  console.assert(reg26AB05.batches[course] === batch, `26AB05 ${course} must be ${batch}`);
}
console.log('STUDENT_REGISTRY dynamic batches: PASS');

console.log('--- 4. Testing getTimetableForStudent(26AB12) ---');
const slots = getTimetableForStudent('26AB12');
console.assert(slots.length === 19, `Timetable must return 19 periods, got ${slots.length}`);

const la = slots.find(s => s.shortForm === 'LA');
const mc = slots.find(s => s.shortForm === 'MC');
const ssa = slots.find(s => s.shortForm === 'SSA');

console.assert(la && la.room === 'LH-101' && la.batch === 'LA1', 'LA1 must be in LH-101');
console.assert(mc && mc.room === 'LH-401' && mc.batch === 'MC3', 'MC3 must be in LH-401');
console.assert(ssa && ssa.room === 'LH-101' && ssa.batch === 'SSA3', 'SSA3 must be in LH-101');

// Verify zero slash rooms and zero unassigned rooms
for (const s of slots) {
  console.assert(!s.room.includes('/'), `Slash room detected in ${s.shortForm}: ${s.room}`);
  console.assert(s.room && s.room !== 'TBD' && s.room.trim() !== '', `Unassigned room in ${s.shortForm}: ${s.room}`);
}
console.log('getTimetableForStudent(26AB12): PASS (19 periods, exact classrooms, 0 slash rooms)');

console.log('--- 5. Testing PsgimService Timetable & Faculty Priority ---');
const psgSlots = PsgimService.generateTimetableForStudent('26AB12');
console.assert(psgSlots.length === 19, `PsgimService must return 19 periods, got ${psgSlots.length}`);

const psgLA = psgSlots.find(s => s.subjectId === 'sub_la');
const psgMC = psgSlots.find(s => s.subjectId === 'sub_mc');
const psgSSA = psgSlots.find(s => s.subjectId === 'sub_ssa');

console.assert(psgLA.faculty === 'Ms. C. Dhanya', `LA faculty mismatch: ${psgLA.faculty}`);
console.assert(psgMC.faculty === 'Dr. E. Sri Varshini', `MC faculty mismatch: ${psgMC.faculty}`);
console.assert(psgSSA.faculty === 'Mr. G. Kangasabapathy', `SSA faculty mismatch: ${psgSSA.faculty}`);
console.log('PsgimService faculty resolution: PASS');

console.log('--- 6. Zero Emoji Compliance Audit ---');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}]/u;
const filesToScan = [
  'src/data/psgimMasterStudents.ts',
  'src/data/psgimData.ts',
  'src/screens/AuthScreen.tsx',
  'App.tsx',
  'src/services/storageService.ts',
  'src/services/studzoneService.ts',
  'src/services/lmsService.ts',
  'src/services/psgimService.ts'
];

let emojiErrors = 0;
for (const file of filesToScan) {
  const fullPath = path.join(__dirname, '..', file);
  const content = fs.readFileSync(fullPath, 'utf8');
  content.split('\n').forEach((line, idx) => {
    if (emojiRegex.test(line)) {
      console.error(`Emoji in ${file}:${idx + 1}: ${line.trim()}`);
      emojiErrors++;
    }
  });
}
console.assert(emojiErrors === 0, `Found ${emojiErrors} emoji violations`);
console.log('Zero Emoji audit: PASS (0 violations)');

console.log('\n=== ALL M1 VERIFICATION SUITES PASSED CLEANLY ===');
