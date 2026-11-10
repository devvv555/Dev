const fs = require('fs');
const path = require('path');

// Dynamically extract STUDENT_REGISTRY and PSGIM_COURSES from src/data/psgimData.ts
const psgData = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'psgimData.ts'), 'utf8');

// Match PSGIM_COURSES
const courseMatch = psgData.match(/export const PSGIM_COURSES: Record<string, CourseDetail> = \{([\s\S]*?)\n\};/);

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

// Find all student batch assignments
// e.g. "D26AA01": { ... "batches": { "MCOB": "MCOB1", ... } }
const registryBlock = psgData.substring(psgData.indexOf('export const STUDENT_REGISTRY:'), psgData.indexOf('export const ALL_ROLL_NUMBERS'));

const studentRegex = /"(D26[A-Z0-9]+)":\s*\{\s*"rollNo":\s*"[^"]+",\s*"batches":\s*\{([\s\S]*?)\}\s*\}/g;

const facultyStudentSet = {};
const facultySubjectBreakdown = {};

let studentCount = 0;
let m;
while ((m = studentRegex.exec(registryBlock)) !== null) {
  const roll = m[1];
  studentCount++;
  const batchStr = m[2];
  
  // match pairs e.g. "MCOB": "MCOB1"
  const pairRegex = /"([A-Za-z]+)":\s*"([A-Za-z0-9]+)"/g;
  let pm;
  while ((pm = pairRegex.exec(batchStr)) !== null) {
    const subj = pm[1];
    const grpStr = pm[2];
    const gmatch = grpStr.match(/^([A-Za-z]+)(\d+)$/);
    if (gmatch) {
      const gnum = parseInt(gmatch[2], 10);
      const teacher = courses[subj] && courses[subj][gnum];
      if (teacher) {
        if (!facultyStudentSet[teacher]) facultyStudentSet[teacher] = new Set();
        facultyStudentSet[teacher].add(roll);

        if (!facultySubjectBreakdown[teacher]) facultySubjectBreakdown[teacher] = {};
        if (!facultySubjectBreakdown[teacher][subj]) facultySubjectBreakdown[teacher][subj] = 0;
        facultySubjectBreakdown[teacher][subj]++;
      }
    }
  }
}

console.log(`Total Students Processed in Registry: ${studentCount}\n`);

const results = Object.entries(facultyStudentSet).map(([teacher, set]) => {
  return {
    teacher,
    uniqueStudents: set.size,
    subjects: facultySubjectBreakdown[teacher]
  };
}).sort((a, b) => b.uniqueStudents - a.uniqueStudents);

console.log(JSON.stringify(results, null, 2));
