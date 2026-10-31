const fs = require('fs');

const masterData = fs.readFileSync('src/data/psgimMasterStudents.ts', 'utf8');
const entries = [...masterData.matchAll(/"(D26[A-Z0-9]+)":\s*\{\s*dRollNo:\s*"([^"]+)",\s*collegeRollNo:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*batch:\s*"([^"]+)"/g)];

console.log('Total Master Entries:', entries.length);

['A', 'B', 'C', 'D'].forEach(batch => {
  const bEntries = entries.filter(e => e[5] === batch);
  const collegeRolls = bEntries.map(e => e[3]).sort();
  const dRolls = bEntries.map(e => e[1]).sort();
  console.log(`\n=== BATCH ${batch} (count: ${bEntries.length}) ===`);
  console.log(`dRolls: min=${dRolls[0]}, max=${dRolls[dRolls.length - 1]}`);
  console.log(`collegeRolls: min=${collegeRolls[0]}, max=${collegeRolls[collegeRolls.length - 1]}`);
  
  // Check gaps in dRolls
  const dNums = dRolls.map(r => parseInt(r.slice(5), 10));
  const missingD = [];
  for (let i = 1; i <= Math.max(...dNums); i++) {
    if (!dNums.includes(i)) missingD.push(i);
  }
  if (missingD.length > 0) console.log(`Missing dRoll numbers in Batch ${batch}:`, missingD);

  // Check gaps in collegeRolls
  const colNums = collegeRolls.map(r => parseInt(r.slice(4), 10));
  const missingCol = [];
  for (let i = 1; i <= Math.max(...colNums); i++) {
    if (!colNums.includes(i)) missingCol.push(i);
  }
  if (missingCol.length > 0) console.log(`Missing collegeRoll numbers in Batch ${batch}:`, missingCol);
});
