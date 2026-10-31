const fs = require('fs');

const psgimData = fs.readFileSync('src/data/psgimData.ts', 'utf8');
const masterData = fs.readFileSync('src/data/psgimMasterStudents.ts', 'utf8');

const extra = ['D26AA61', 'D26AA62', 'D26AA63', 'D26AB61', 'D26AB62', 'D26AB63', 'D26AB64'];

console.log('=== Checking Extra Keys ===');
extra.forEach(k => {
  console.log(`--- ${k} in psgimData.ts: ---`);
  const s = psgimData.indexOf(`"${k}": {`);
  if (s !== -1) {
    console.log(psgimData.slice(s, s + 350));
  } else {
    console.log('Not in psgimData.ts');
  }

  console.log(`--- ${k} in psgimMasterStudents.ts: ---`);
  const ms = masterData.indexOf(`"${k}": {`);
  if (ms !== -1) {
    console.log(masterData.slice(ms, ms + 150));
  } else {
    console.log('Not in psgimMasterStudents.ts');
  }
});
