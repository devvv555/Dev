const fs = require('fs');

const psgimData = fs.readFileSync('src/data/psgimData.ts', 'utf8');
const masterData = fs.readFileSync('src/data/psgimMasterStudents.ts', 'utf8');

const regMatches = [...psgimData.matchAll(/"(D26[A-Z0-9]+)":\s*\{/g)].map(m => m[1]);
const masterMatches = [...masterData.matchAll(/"(D26[A-Z0-9]+)":\s*\{/g)].map(m => m[1]);

// 252 official PDF students
const genContent = fs.readFileSync('scripts/generatePsgimData.js', 'utf8');
const lines = genContent.split('\n');
const gStart = lines.findIndex(l => l.includes('const rawLines ='));
const gEnd = lines.findIndex(l => l.includes('const students ='));
const pdfRolls = lines.slice(gStart + 1, gEnd).map(l => l.trim().replace(/^`|`|;$/g, '')).filter(l => l.length > 0 && l.startsWith('D26')).map(l => l.split(/\s+/)[0]);

console.log('PDF Rolls Count:', pdfRolls.length);
console.log('STUDENT_REGISTRY Keys Count:', regMatches.length);
console.log('PSGIM_MASTER_STUDENTS Keys Count:', masterMatches.length);

const inPdfNotInMaster = pdfRolls.filter(r => !masterMatches.includes(r));
console.log('In PDF but NOT in PSGIM_MASTER_STUDENTS:', inPdfNotInMaster.length, inPdfNotInMaster);

const inMasterNotInPdf = masterMatches.filter(r => !pdfRolls.includes(r));
console.log('In PSGIM_MASTER_STUDENTS but NOT in PDF:', inMasterNotInPdf.length, inMasterNotInPdf);

const inRegNotInPdf = regMatches.filter(r => !pdfRolls.includes(r));
console.log('In STUDENT_REGISTRY but NOT in PDF:', inRegNotInPdf.length, inRegNotInPdf);
