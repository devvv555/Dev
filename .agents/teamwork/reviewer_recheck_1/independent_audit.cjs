const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Hook TypeScript
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

const ROOT = path.resolve(__dirname, '../../..');
const psgimData = require(path.join(ROOT, 'src/data/psgimData.ts'));
const psgimMaster = require(path.join(ROOT, 'src/data/psgimMasterStudents.ts'));

// 1. Load CSV
const csvLines = fs.readFileSync(path.join(ROOT, 'scripts/excel_mapping.csv'), 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(l => l && !l.startsWith('#'))
  .map(l => {
    const [dRoll, colRoll, name] = l.split(',');
    return { dRoll: dRoll.trim(), colRoll: colRoll.trim(), name: name ? name.trim() : '' };
  });

console.log(`Loaded ${csvLines.length} mapping entries from excel_mapping.csv`);

let errors = [];

// 2. Check all 252 students exist in STUDENT_REGISTRY under both dRoll and colRoll
csvLines.forEach(({ dRoll, colRoll, name }) => {
  const regD = psgimData.STUDENT_REGISTRY[dRoll];
  const regCol = psgimData.STUDENT_REGISTRY[colRoll];

  if (!regD) {
    errors.push(`STUDENT_REGISTRY missing D-Roll key: ${dRoll} (${name})`);
    return;
  }
  if (!regCol) {
    errors.push(`STUDENT_REGISTRY missing College-Roll key: ${colRoll} (${name})`);
    return;
  }

  // Check batch parity
  const batchesD = JSON.stringify(regD.batches);
  const batchesCol = JSON.stringify(regCol.batches);
  if (batchesD !== batchesCol) {
    errors.push(`Batch mismatch for ${dRoll} vs ${colRoll}: D=${batchesD} Col=${batchesCol}`);
  }

  // Check getTimetableForStudent parity
  const ttD = psgimData.getTimetableForStudent(dRoll);
  const ttCol = psgimData.getTimetableForStudent(colRoll);

  if (ttD.length !== ttCol.length) {
    errors.push(`Timetable length mismatch for ${name} (${dRoll}/${colRoll}): D=${ttD.length}, Col=${ttCol.length}`);
  } else {
    for (let i = 0; i < ttD.length; i++) {
      const sD = ttD[i];
      const sCol = ttCol[i];
      if (sD.day !== sCol.day || sD.startTime !== sCol.startTime || sD.room !== sCol.room || sD.faculty !== sCol.faculty || sD.batch !== sCol.batch) {
        errors.push(`Slot mismatch for ${name} at index ${i}: D=[${sD.day} ${sD.startTime} ${sD.batch} ${sD.room} ${sD.faculty}] vs Col=[${sCol.day} ${sCol.startTime} ${sCol.batch} ${sCol.room} ${sCol.faculty}]`);
        break;
      }
      if (sCol.room.includes('/') || sCol.room === 'TBD' || !sCol.room) {
        errors.push(`Unresolved or slash room for ${name} (${colRoll}) slot ${sCol.day} ${sCol.startTime}: ${sCol.room}`);
      }
    }
  }
});

console.log(`Registry & Timetable check finished. Total errors: ${errors.length}`);

// 3. Check key conversions:
console.log('Testing key conversions:');
console.log("toNewRollNo('26AB05') =", psgimMaster.toNewRollNo('26AB05'));
console.log("toNewRollNo('D26AB05') =", psgimMaster.toNewRollNo('D26AB05'));
console.log("toOldRollNo('26AB05') =", psgimMaster.toOldRollNo('26AB05'));
console.log("toOldRollNo('26AB12') =", psgimMaster.toOldRollNo('26AB12'));
console.log("toOldRollNo('D26AB05') =", psgimMaster.toOldRollNo('D26AB05'));
console.log("toNewRollNo('26AB12') =", psgimMaster.toNewRollNo('26AB12'));

if (psgimMaster.toNewRollNo('26AB05') !== '26AB05') errors.push("toNewRollNo('26AB05') !== '26AB05'");
if (psgimMaster.toNewRollNo('D26AB05') !== '26AB12') errors.push("toNewRollNo('D26AB05') !== '26AB12'");
if (psgimMaster.toOldRollNo('26AB05') !== 'D26AB56') errors.push("toOldRollNo('26AB05') !== 'D26AB56'");
if (psgimMaster.toOldRollNo('26AB12') !== 'D26AB05') errors.push("toOldRollNo('26AB12') !== 'D26AB05'");
if (psgimMaster.toOldRollNo('D26AB05') !== 'D26AB05') errors.push("toOldRollNo('D26AB05') !== 'D26AB05'");
if (psgimMaster.toNewRollNo('26AB12') !== '26AB12') errors.push("toNewRollNo('26AB12') !== '26AB12'");

// 4. Test master students lookup
const dev = psgimMaster.getMasterStudent('26AB12');
const devD = psgimMaster.getMasterStudent('D26AB05');
if (!dev || dev.name !== 'DEVDARSHAN V') errors.push("getMasterStudent('26AB12') failed to return DEVDARSHAN V");
if (!devD || devD.name !== 'DEVDARSHAN V') errors.push("getMasterStudent('D26AB05') failed to return DEVDARSHAN V");
if (dev?.dobPassword !== '13DEC05') errors.push(`Devdarshan password mismatch: ${dev?.dobPassword}`);

const amulya = psgimMaster.getMasterStudent('26AB05');
const amulyaD = psgimMaster.getMasterStudent('D26AB56');
if (!amulya || amulya.name !== 'AMULYA P') errors.push("getMasterStudent('26AB05') failed to return AMULYA P");
if (!amulyaD || amulyaD.name !== 'AMULYA P') errors.push("getMasterStudent('D26AB56') failed to return AMULYA P");
if (amulya?.dobPassword !== '08NOV00') errors.push(`Amulya password mismatch: ${amulya?.dobPassword}`);

if (errors.length > 0) {
  console.error('FAILURES FOUND:');
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
} else {
  console.log('ALL INDEPENDENT AUDIT CHECKS PASSED PERFECTLY!');
  process.exit(0);
}
