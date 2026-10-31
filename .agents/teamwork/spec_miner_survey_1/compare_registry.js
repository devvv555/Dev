const fs = require('fs');

const content = fs.readFileSync('src/data/psgimData.ts', 'utf8');

// Read rawLines from scripts/generatePsgimData.js which matches 100% with the PDF
const genContent = fs.readFileSync('scripts/generatePsgimData.js', 'utf8');
const lines = genContent.split('\n');
const start = lines.findIndex(l => l.includes('const rawLines ='));
const end = lines.findIndex(l => l.includes('const students ='));
const rawLines = lines.slice(start + 1, end).map(l => l.trim().replace(/^`|`|;$/g, '')).filter(l => l.length > 0 && l.startsWith('D26'));

console.log('Total official students to check in psgimData.ts:', rawLines.length);

let missingInRegistry = [];
let batchDiscrepancies = [];

rawLines.forEach(line => {
  const parts = line.split(/\s+/);
  const rollNo = parts[0];
  const [mcob, adm, mc, ssm, bs, edm, la, ssa] = parts.slice(1);

  // Check if rollNo is in psgimData.ts STUDENT_REGISTRY
  const startIdx = content.indexOf(`"${rollNo}": {`);
  if (startIdx === -1) {
    missingInRegistry.push(rollNo);
  } else {
    const endIdx = content.indexOf('},', startIdx);
    const block = content.slice(startIdx, endIdx !== -1 ? endIdx + 2 : startIdx + 500);

    const checkField = (field, expected) => {
      const match = block.match(new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`));
      const actual = match ? match[1] : '';
      if (actual !== expected) {
        batchDiscrepancies.push({ rollNo, field, expected, actual });
      }
    };

    checkField('MCOB', mcob);
    checkField('ADM', adm);
    checkField('MC', mc);
    checkField('BS', bs);
    checkField('EDM', edm);
    checkField('LA', la);
    checkField('SSA', ssa);
    // Note: SSM in psgimData.ts for AE batch:
    const sec = rollNo.slice(3, 5);
    const expectedSsm = sec === 'AE' ? '' : ssm;
    checkField('SSM', expectedSsm);
  }
});

console.log('Missing students in psgimData.ts STUDENT_REGISTRY:', missingInRegistry.length, missingInRegistry);
console.log('Batch discrepancies in psgimData.ts STUDENT_REGISTRY:', batchDiscrepancies.length);

// Check total keys in STUDENT_REGISTRY
const regStart = content.indexOf('export const STUDENT_REGISTRY: Record<string, StudentRecord> = {');
const regEnd = content.indexOf('export const ALL_ROLL_NUMBERS =');
const regBlock = content.slice(regStart, regEnd);
const keyMatches = [...regBlock.matchAll(/"(D26[A-Z0-9]+)":\s*\{/g)].map(m => m[1]);
console.log('Total keys in STUDENT_REGISTRY:', keyMatches.length);
const officialSet = new Set(rawLines.map(l => l.split(/\s+/)[0]));
const extraKeys = keyMatches.filter(k => !officialSet.has(k));
console.log('Extra keys in STUDENT_REGISTRY:', extraKeys.length, extraKeys);
