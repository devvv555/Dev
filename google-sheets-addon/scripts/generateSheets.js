const fs = require('fs');
const path = require('path');

// Master Students from psgimMasterStudents.ts
const masterStudentsPath = path.join(__dirname, '../../src/data/psgimMasterStudents.ts');
const rawTs = fs.readFileSync(masterStudentsPath, 'utf8');

// Extract PSGIM_MASTER_STUDENTS
const students = [];
const regex = /"([^"]+)":\s*\{\s*dRollNo:\s*"([^"]+)",\s*collegeRollNo:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*batch:\s*"([^"]+)"\s*\}/g;
let match;
while ((match = regex.exec(rawTs)) !== null) {
  students.push({
    dRollNo: match[2],
    collegeRollNo: match[3],
    name: match[4],
    batch: match[5]
  });
}

console.log(`Parsed ${students.length} students.`);

const courses = [
  { short: 'MCOB', code: '24GM11', title: 'Management Concepts and Organizational Behaviour' },
  { short: 'EDM', code: '24GM12', title: 'Economics for Decision Making' },
  { short: 'ADM', code: '24GM13', title: 'Accounting for Decision Making' },
  { short: 'BS', code: '24GM14', title: 'Business Statistics' },
  { short: 'MC', code: '24GM15', title: 'Managerial Communication' },
  { short: 'SSA', code: '24GM16', title: 'Spreadsheet Applications' },
  { short: 'SSM', code: '24GM18', title: 'Social Sensitization for Managers' },
  { short: 'LA', code: '24GM19', title: 'Legal Aspects of Business' },
  { short: 'SPORTS', code: 'SPORTS', title: 'Physical Education & Sports' }
];

const batches = ['A', 'B', 'C', 'D'];
const outBase = path.join(__dirname, '../attendance_sheets');

if (!fs.existsSync(outBase)) {
  fs.mkdirSync(outBase, { recursive: true });
}

// Generate CSVs for each batch and course
let generatedCount = 0;
const todayStr = '2026-10-12';

batches.forEach(b => {
  const batchDir = path.join(outBase, `Batch_${b}`);
  if (!fs.existsSync(batchDir)) {
    fs.mkdirSync(batchDir, { recursive: true });
  }

  const batchStudents = students.filter(s => s.batch === b);
  console.log(`Batch ${b}: ${batchStudents.length} students`);

  courses.forEach(c => {
    const csvRows = [];
    csvRows.push(['Roll No', 'College Roll No', 'Student Name', 'Batch', 'Status (P/A/OD)', 'Date', 'Subject Code', 'Subject Title', 'Slot ID']);

    batchStudents.forEach(s => {
      // Default to P
      csvRows.push([
        s.dRollNo,
        s.collegeRollNo,
        `"${s.name}"`,
        s.batch,
        'P',
        todayStr,
        c.code,
        `"${c.title}"`,
        'period_1'
      ]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\r\n');
    const fileName = `Batch_${b}_${c.short}_${c.code}.csv`;
    fs.writeFileSync(path.join(batchDir, fileName), csvContent, 'utf8');
    generatedCount++;
  });

  // Also write Batch Master Roster
  const masterRows = [];
  masterRows.push(['Roll No', 'College Roll No', 'Student Name', 'Batch', 'Status (P/A/OD)', 'Date', 'Subject Code', 'Slot ID']);
  batchStudents.forEach(s => {
    masterRows.push([
      s.dRollNo,
      s.collegeRollNo,
      `"${s.name}"`,
      s.batch,
      'P',
      todayStr,
      '24GM11',
      'period_1'
    ]);
  });
  fs.writeFileSync(path.join(outBase, `Master_Attendance_Batch_${b}.csv`), masterRows.map(r => r.join(',')).join('\r\n'), 'utf8');
});

// Also write All Classes Combined Master Sheet
const allRows = [];
allRows.push(['Roll No', 'College Roll No', 'Student Name', 'Batch', 'Status (P/A/OD)', 'Date', 'Subject Code', 'Slot ID']);
students.forEach(s => {
  allRows.push([
    s.dRollNo,
    s.collegeRollNo,
    `"${s.name}"`,
    s.batch,
    'P',
    todayStr,
    '24GM11',
    'period_1'
  ]);
});
fs.writeFileSync(path.join(outBase, 'All_Students_Master_Attendance.csv'), allRows.map(r => r.join(',')).join('\r\n'), 'utf8');

// Export JSON database for Google Apps Script Code.gs
fs.writeFileSync(path.join(__dirname, '../all_students.json'), JSON.stringify(students, null, 2), 'utf8');

console.log(`Generated ${generatedCount} individual class sheets + master sheets in ${outBase}`);
