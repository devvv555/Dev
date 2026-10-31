const fs = require('fs');

const masterData = fs.readFileSync('src/data/psgimMasterStudents.ts', 'utf8');
const entries = [...masterData.matchAll(/"(D26[A-Z0-9]+)":\s*\{\s*dRollNo:\s*"([^"]+)",\s*collegeRollNo:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*batch:\s*"([^"]+)"/g)];

console.log('Total entries in psgimMasterStudents.ts:', entries.length);
const byBatch = {};
entries.forEach(e => {
  const b = e[5];
  byBatch[b] = (byBatch[b] || 0) + 1;
});
console.log('By batch in psgimMasterStudents.ts:', byBatch);
