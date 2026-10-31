const fs = require('fs');

const content = fs.readFileSync('src/data/psgimMasterStudents.ts', 'utf8');
const regex = /"(D26[A-Z0-9]+)":\s*\{\s*dRollNo:\s*"[^"]+",\s*collegeRollNo:\s*"[^"]+",\s*name:\s*"([^"]+)",\s*batch:\s*"([^"]+)"/g;
let m;
const existing = {};
while ((m = regex.exec(content)) !== null) {
  existing[m[1]] = { name: m[2], batch: m[3] };
}
console.log('Existing count in psgimMasterStudents:', Object.keys(existing).length);
console.log('D26AA01:', existing['D26AA01']);
console.log('D26AA25:', existing['D26AA25']);
console.log('D26AB14:', existing['D26AB14']);
console.log('D26AC53:', existing['D26AC53']);
console.log('D26AE01:', existing['D26AE01']);
