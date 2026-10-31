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

require.extensions['.ts'] = function(m, f) {
  m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, f);
};

const psgimData = require(path.join(ROOT, 'src', 'data', 'psgimData.ts'));

// 1. Gather all D-records
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

// 2. Build College records directly mapped 1:1 to D-records
const collegeRegistry = {};
students.forEach(s => {
  const dRec = dRegistry[s.dRollNo];
  collegeRegistry[s.collegeRollNo] = {
    rollNo: s.collegeRollNo,
    batches: { ...dRec.batches }
  };
});

// Also keep legacy AE college rolls for compatibility
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

// 3. Format into TypeScript
let out = 'export const STUDENT_REGISTRY: Record<string, StudentRecord> = {\n';

// Write D-Roll entries
for (const [roll, rec] of Object.entries(dRegistry)) {
  out += `  "${roll}": {\n    "rollNo": "${rec.rollNo}",\n    "batches": {\n`;
  const bEntries = Object.entries(rec.batches);
  bEntries.forEach(([course, bVal], idx) => {
    out += `      "${course}": "${bVal}"${idx < bEntries.length - 1 ? ',' : ''}\n`;
  });
  out += `    }\n  },\n`;
}

// Write College Roll entries
const colEntries = Object.entries(collegeRegistry);
colEntries.forEach(([roll, rec], cIdx) => {
  out += `  "${roll}": {\n    "rollNo": "${rec.rollNo}",\n    "batches": {\n`;
  const bEntries = Object.entries(rec.batches);
  bEntries.forEach(([course, bVal], idx) => {
    out += `      "${course}": "${bVal}"${idx < bEntries.length - 1 ? ',' : ''}\n`;
  });
  out += `    }\n  }${cIdx < colEntries.length - 1 ? ',' : ''}\n`;
});

out += '};\n';

fs.writeFileSync(path.join(__dirname, 'rekeyed_student_registry.ts'), out, 'utf8');
console.log('Successfully generated rekeyed_student_registry.ts with total entries:', Object.keys(dRegistry).length + Object.keys(collegeRegistry).length);
