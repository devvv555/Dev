const fs = require('fs');
const path = require('path');

// Read the excel_mapping.csv which has student to subject-group mapping
const csvPath = path.join(__dirname, 'excel_mapping.csv');
const psgDataFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'psgimData.ts'), 'utf8');

// Parse PSGIM_COURSES faculty mappings
const courses = {
  MCOB: { 1: 'Dr. M. Kirupa Priyadarshini', 2: 'Dr. Vijaya Vardhan Manchala', 3: 'Dr. R. Indumathy', 4: 'Dr. N. Udayakumar' },
  EDM: { 1: 'Dr. Sreeanandan', 2: 'Dr. Aiswarya D Pillai', 3: 'Dr. E. Sri Varshini', 4: 'Dr. Sreeanandan' },
  ADM: { 1: 'Dr. J. Nancy Christina', 2: 'Dr. D. Kavitha', 3: 'Dr. Nithya', 4: 'Dr. Aiswarya D Pillai' },
  BS: { 1: 'Dr. R. Sujatha', 2: 'Dr. R. S. Sathyanarayanan', 3: 'Dr. J. Sekkizhar', 4: 'Dr. J. Sekkizhar' },
  MC: { 1: 'Dr. Saradha', 2: 'Dr. R. Deepa', 3: 'Dr. M. Kirupa Priyadarshini', 4: 'Dr. G. Suganthi' },
  SSA: { 1: 'Dr. S. Radhakrishnan', 2: 'Dr. P. Sadhasivam', 3: 'Dr. S. Srividya', 4: 'Dr. Saradha' },
  SSM: { 1: 'Dr. S. Radhakrishnan', 2: 'Dr. P. Sadhasivam', 3: 'Dr. S. Srividya', 4: 'Dr. Saradha' },
  LA: { 1: 'Dr. R. Indumathy', 2: 'Dr. R. Indumathy', 3: 'Dr. G. Suganthi', 4: 'Dr. G. Suganthi' }
};

if (!fs.existsSync(csvPath)) {
  console.log('excel_mapping.csv not found');
  process.exit(1);
}

const lines = fs.readFileSync(csvPath, 'utf8').split('\n').filter(l => l.trim().length > 0);
const headers = lines[0].split(',').map(h => h.trim());
console.log('Headers:', headers);

const facultyStudentCounts = {};
const facultySubjectCounts = {};

// Process lines
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',').map(p => p.trim());
  if (parts.length < 3) continue;

  // parts: RollNo, Name, Batch, MCOB, EDM, ADM, BS, MC, SSA, SSM, LA
  for (let c = 3; c < parts.length; c++) {
    const colName = headers[c];
    const val = parts[c]; // e.g. MCOB1, EDM2
    if (!val || val === '-' || val === '') continue;

    // extract subject and group number
    const match = val.match(/^([A-Za-z]+)(\d+)$/);
    if (match) {
      const subj = match[1];
      const grp = parseInt(match[2], 10);
      const teacher = courses[subj] && courses[subj][grp];
      if (teacher) {
        facultyStudentCounts[teacher] = (facultyStudentCounts[teacher] || 0) + 1;
        if (!facultySubjectCounts[teacher]) facultySubjectCounts[teacher] = {};
        facultySubjectCounts[teacher][subj] = (facultySubjectCounts[teacher][subj] || 0) + 1;
      }
    }
  }
}

console.log('\n=== FACULTY TEACHING NUMBERS ===');
const sorted = Object.entries(facultyStudentCounts).sort((a, b) => b[1] - a[1]);
for (const [teacher, count] of sorted) {
  const subjs = Object.entries(facultySubjectCounts[teacher]).map(([s, n]) => `${s}: ${n} students`).join(', ');
  console.log(`${teacher}: ${count} total student-course enrollments (${subjs})`);
}
