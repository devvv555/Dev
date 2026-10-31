const fs = require('fs');

const content = fs.readFileSync('src/data/psgimData.ts', 'utf8');
const lines = content.split('\n');
const dRolls = [];
for (const line of lines) {
  const m = line.match(/^  "([^"]+)":/);
  if (m) dRolls.push(m[1]);
}
console.log('Total D-rolls in STUDENT_REGISTRY:', dRolls.length);
console.log('First 5:', dRolls.slice(0, 5));
console.log('Last 15:', dRolls.slice(-15));
