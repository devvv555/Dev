const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..', '..', '..');

// Load excel_mapping.csv
const csvPath = path.join(ROOT, 'scripts', 'excel_mapping.csv');
const csvLines = fs.readFileSync(csvPath, 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(l => l.length > 0 && !l.startsWith('#'));

const students = csvLines.map(line => {
  const [dRollNo, collegeRollNo, name] = line.split(',').map(s => s.trim());
  return { dRollNo, collegeRollNo, name };
});

// Require psgimData with TS transpile
require.extensions['.ts'] = function(m, f) {
  let code = fs.readFileSync(f, 'utf8');
  if (f.endsWith('psgimMasterStudents.ts')) {
    code = code.replace("if (clean === 'D26AB05' || clean === '26AB05')", "if (clean === 'D26AB05')");
    code = code.replace(
      "  // 3. Backward compatibility alias: if someone queries \"26AB05\", map to Devdarshan V\n  if (clean === '26AB05' && PSGIM_MASTER_STUDENTS['D26AB05']) {\n    return PSGIM_MASTER_STUDENTS['D26AB05'];\n  }\n",
      ''
    );
  }
  m._compile(ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, f);
};

const psgimData = require(path.join(ROOT, 'src', 'data', 'psgimData.ts'));
const psgimMaster = require(path.join(ROOT, 'src', 'data', 'psgimMasterStudents.ts'));

// Extract existing legacy D records from STUDENT_REGISTRY
const dRegistry = {};
for (const [k, v] of Object.entries(psgimData.STUDENT_REGISTRY)) {
  if (k.startsWith('D')) {
    dRegistry[k] = JSON.parse(JSON.stringify(v));
  }
}

// Ensure all 252 D-rolls exist in dRegistry
students.forEach(s => {
  if (!dRegistry[s.dRollNo]) {
    const batchLetter = s.dRollNo.charAt(3);
    const grp = batchLetter === 'B' ? '2' : batchLetter === 'C' ? '3' : batchLetter === 'D' ? '4' : '1';
    dRegistry[s.dRollNo] = {
      rollNo: s.dRollNo,
      batches: {
        MCOB: 'MCOB' + grp,
        ADM: 'ADM' + grp,
        MC: 'MC' + grp,
        SSM: 'SSM' + grp,
        BS: 'BS' + grp,
        EDM: 'EDM' + grp,
        LA: 'LA' + grp,
        SSA: 'SSA' + grp,
        SPORTS: 'SPORTS' + (grp === '4' ? '2' : grp)
      }
    };
  }
});

// Build college registry strictly from excel mapping
const collegeRegistry = {};
students.forEach(s => {
  const dRec = dRegistry[s.dRollNo];
  collegeRegistry[s.collegeRollNo] = {
    rollNo: s.collegeRollNo,
    batches: { ...dRec.batches }
  };
});

// Also keep legacy AE college rolls if any
for (let i = 1; i <= 13; i++) {
  if (i === 10) continue;
  const num = i < 10 ? '0' + i : '' + i;
  const aeD = 'D26AE' + num;
  const aeC = '26AE' + num;
  if (dRegistry[aeD] && !collegeRegistry[aeC]) {
    collegeRegistry[aeC] = {
      rollNo: aeC,
      batches: { ...dRegistry[aeD].batches }
    };
  }
}

// Re-key the live registry in psgimData
const fullRegistry = { ...dRegistry, ...collegeRegistry };
for (const k of Object.keys(psgimData.STUDENT_REGISTRY)) {
  delete psgimData.STUDENT_REGISTRY[k];
}
Object.assign(psgimData.STUDENT_REGISTRY, fullRegistry);

console.log('Full registry total keys:', Object.keys(psgimData.STUDENT_REGISTRY).length);

// Validation 1: Deep parity across all 252 students
let parityMismatches = 0;
let timetableSlotMismatches = 0;
let slashRooms = 0;
let unassignedRooms = 0;

function stripId(slots) {
  return slots.map(s => ({
    day: s.day,
    startTime: s.startTime,
    endTime: s.endTime,
    courseCode: s.courseCode,
    courseTitle: s.courseTitle,
    shortForm: s.shortForm,
    batch: s.batch,
    faculty: s.faculty,
    room: s.room,
    color: s.color
  }));
}

students.forEach(s => {
  const regD = psgimData.STUDENT_REGISTRY[s.dRollNo];
  const regC = psgimData.STUDENT_REGISTRY[s.collegeRollNo];
  if (!regD || !regC) {
    parityMismatches++;
    return;
  }
  if (JSON.stringify(regD.batches) !== JSON.stringify(regC.batches)) {
    parityMismatches++;
  }

  const ttD = psgimData.getTimetableForStudent(s.dRollNo);
  const ttC = psgimData.getTimetableForStudent(s.collegeRollNo);
  const cleanD = stripId(ttD);
  const cleanC = stripId(ttC);
  if (JSON.stringify(cleanD) !== JSON.stringify(cleanC)) {
    timetableSlotMismatches++;
  }

  [...ttD, ...ttC].forEach(slot => {
    if (slot.room && slot.room.includes('/')) slashRooms++;
    if (!slot.room || slot.room.includes('TBD') || slot.room.trim() === '') unassignedRooms++;
  });
});

console.log('Deep parity mismatches (expected 0):', parityMismatches);
console.log('Timetable content mismatches (expected 0):', timetableSlotMismatches);
console.log('Slash rooms (expected 0):', slashRooms);
console.log('Unassigned rooms (expected 0):', unassignedRooms);
