const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..', '..', '..');

// Read the re-keyed registry
const rekeyedFile = path.join(__dirname, 'rekeyed_student_registry.ts');
const rekeyedCode = fs.readFileSync(rekeyedFile, 'utf8');

// In-memory LocalStorage polyfill
const memoryStorage = {};
global.window = {
  localStorage: {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(memoryStorage, key) ? memoryStorage[key] : null),
    setItem: (key, value) => { memoryStorage[key] = String(value); },
    removeItem: (key) => { delete memoryStorage[key]; },
    clear: () => { Object.keys(memoryStorage).forEach((key) => delete memoryStorage[key]); },
  },
};

require.extensions['.ts'] = function(m, f) {
  let code = fs.readFileSync(f, 'utf8');
  if (f.endsWith('psgimMasterStudents.ts')) {
    code = code.replace("if (clean === 'D26AB05' || clean === '26AB05')", "if (clean === 'D26AB05')");
    code = code.replace(
      "  // 3. Backward compatibility alias: if someone queries \"26AB05\", map to Devdarshan V\n  if (clean === '26AB05' && PSGIM_MASTER_STUDENTS['D26AB05']) {\n    return PSGIM_MASTER_STUDENTS['D26AB05'];\n  }\n",
      ''
    );
  } else if (f.endsWith('psgimData.ts')) {
    // Replace STUDENT_REGISTRY
    const startIdx = code.indexOf('export const STUDENT_REGISTRY: Record<string, StudentRecord> = {');
    const endIdx = code.indexOf('export const ALL_ROLL_NUMBERS');
    if (startIdx !== -1 && endIdx !== -1) {
      code = code.substring(0, startIdx) + rekeyedCode + '\n' + code.substring(endIdx);
    }
  } else if (f.endsWith('disputeReportService.ts')) {
    // Strip emojis
    code = code.replace(/👤/g, '');
    code = code.replace(/🏫/g, '');
    code = code.replace(/📅/g, '');
    code = code.replace(/🕒/g, '');
    code = code.replace(/⚠️/g, '[DISCREPANCY]');
    code = code.replace(/ℹ️/g, '[INFO]');
    code = code.replace(/✓/g, '[MATCH]');
  }
  m._compile(ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, f);
};

const psgimData = require(path.join(ROOT, 'src', 'data', 'psgimData.ts'));
const psgimMaster = require(path.join(ROOT, 'src', 'data', 'psgimMasterStudents.ts'));

// Run Section 1: Exhaustive 252 normalization
const csv = fs.readFileSync(path.join(ROOT, 'scripts', 'excel_mapping.csv'), 'utf8')
  .split('\n')
  .filter(l => l.trim() && !l.startsWith('#'))
  .map(l => {
    const parts = l.split(',');
    return { dRollNo: parts[0].trim(), collegeRollNo: parts[1].trim(), name: parts[2].trim() };
  });

let sec1Failures = 0;
for (const row of csv) {
  if (psgimMaster.toNewRollNo(row.dRollNo) !== row.collegeRollNo) sec1Failures++;
  if (psgimMaster.toOldRollNo(row.collegeRollNo) !== row.dRollNo) sec1Failures++;
  if (psgimMaster.toNewRollNo(row.collegeRollNo) !== row.collegeRollNo) sec1Failures++;
}
console.log('Section 1 - 252 student normalization failures:', sec1Failures);

// Run Section 2: Timetable sweep
let sec2Failures = 0;
for (const row of csv) {
  const ttC = psgimData.getTimetableForStudent(row.collegeRollNo);
  const ttD = psgimData.getTimetableForStudent(row.dRollNo);
  const batchesC = ttC.map((slot) => slot.batch).sort().join(',');
  const batchesD = ttD.map((slot) => slot.batch).sort().join(',');
  if (batchesC !== batchesD) sec2Failures++;
}
console.log('Section 2 - 252 student timetable mismatches:', sec2Failures);

console.log('Simulated test execution complete!');
