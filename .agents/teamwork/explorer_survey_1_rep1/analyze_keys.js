const fs = require('fs');

const content = fs.readFileSync('src/data/psgimData.ts', 'utf8');
const masterData = fs.readFileSync('src/data/psgimMasterStudents.ts', 'utf8');

const regMatches = [...content.matchAll(/"(D26[A-Z0-9]+)":\s*\{/g)].map(m => m[1]);
const masterMatches = [...masterData.matchAll(/"(D26[A-Z0-9]+)":\s*\{/g)].map(m => m[1]);

console.log('STUDENT_REGISTRY D-roll count:', regMatches.length);
console.log('PSGIM_MASTER_STUDENTS D-roll count:', masterMatches.length);

const setReg = new Set(regMatches);
const setMaster = new Set(masterMatches);

const inRegNotMaster = regMatches.filter(k => !setMaster.has(k));
const inMasterNotReg = masterMatches.filter(k => !setReg.has(k));

console.log('In Registry NOT Master (count=' + inRegNotMaster.length + '):', inRegNotMaster);
console.log('In Master NOT Registry (count=' + inMasterNotReg.length + '):', inMasterNotReg);

// Check collegeRollNo in masterData
const collegeRollMatches = [...masterData.matchAll(/collegeRollNo:\s*"([^"]+)"/g)].map(m => m[1]);
console.log('Master collegeRollNo count:', collegeRollMatches.length);

// Also check rawLines from scripts/generatePsgimData.js
const genContent = fs.readFileSync('scripts/generatePsgimData.js', 'utf8');
const linesMatch = genContent.match(/const rawLines = `([\s\S]*?)`;/);
const rawLines = linesMatch ? linesMatch[1].trim().split('\n').map(l => l.trim().split(/\s+/)[0]).filter(Boolean) : [];
console.log('rawLines count in generatePsgimData.js:', rawLines.length);

const setRaw = new Set(rawLines);
const inRegNotRaw = regMatches.filter(k => !setRaw.has(k));
const inRawNotReg = rawLines.filter(k => !setReg.has(k));
console.log('In Registry NOT Raw (count=' + inRegNotRaw.length + '):', inRegNotRaw);
console.log('In Raw NOT Registry (count=' + inRawNotReg.length + '):', inRawNotReg);

const inMasterNotRaw = masterMatches.filter(k => !setRaw.has(k));
const inRawNotMaster = rawLines.filter(k => !setMaster.has(k));
console.log('In Master NOT Raw (count=' + inMasterNotRaw.length + '):', inMasterNotRaw);
console.log('In Raw NOT Master (count=' + inRawNotMaster.length + '):', inRawNotMaster);
