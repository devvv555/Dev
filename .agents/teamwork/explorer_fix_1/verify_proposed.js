const fs = require('fs');
const path = require('path');
const ts = require('typescript');

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

const ROOT = path.resolve(__dirname, '..', '..', '..');
const psgimMaster = require(path.join(ROOT, 'src', 'data', 'psgimMasterStudents.ts'));
const psgimData = require(path.join(ROOT, 'src', 'data', 'psgimData.ts'));

console.log('--- TEST AMULYA P vs DEVDARSHAN V ---');
console.log('toNewRollNo("26AB05"):', psgimMaster.toNewRollNo('26AB05'));
console.log('toOldRollNo("26AB05"):', psgimMaster.toOldRollNo('26AB05'));
console.log('toNewRollNo("D26AB56"):', psgimMaster.toNewRollNo('D26AB56'));
console.log('toNewRollNo("26AB12"):', psgimMaster.toNewRollNo('26AB12'));
console.log('toOldRollNo("26AB12"):', psgimMaster.toOldRollNo('26AB12'));
console.log('toNewRollNo("D26AB05"):', psgimMaster.toNewRollNo('D26AB05'));
console.log('getMasterStudent("26AB05"):', psgimMaster.getMasterStudent('26AB05')?.name);
console.log('getMasterStudent("26AB12"):', psgimMaster.getMasterStudent('26AB12')?.name);

console.log('\n--- TEST ALL 252 STUDENTS IDEMPOTENCY & ROUNDTRIP ---');
const csv = fs.readFileSync(path.join(ROOT, 'scripts', 'excel_mapping.csv'), 'utf8')
  .split('\n')
  .filter(l => l.trim() && !l.startsWith('#'));

let idempFailures = 0;
let roundtripFailures = 0;
for (const line of csv) {
  const [dRoll, colRoll, name] = line.split(',').map(s => s.trim());
  if (psgimMaster.toNewRollNo(colRoll) !== colRoll) idempFailures++;
  if (psgimMaster.toNewRollNo(dRoll) !== colRoll) roundtripFailures++;
  if (psgimMaster.toOldRollNo(colRoll) !== dRoll) roundtripFailures++;
}
console.log('Idempotency failures:', idempFailures, 'of', csv.length);
console.log('Roundtrip failures:', roundtripFailures, 'of', csv.length);
