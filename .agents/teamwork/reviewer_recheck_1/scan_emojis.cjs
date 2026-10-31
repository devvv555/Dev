const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');

// All modified files from git status + all target files listed in dispatch
const targetFiles = [
  'App.tsx',
  'src/screens/DashboardScreen.tsx',
  'src/services/disputeReportService.ts',
  'src/components/CoursePlanModal.tsx',
  'src/components/LmsAssignmentCard.tsx',
  'src/components/LmsQuizCard.tsx',
  'src/screens/AuthScreen.tsx',
  'src/screens/TimetableScreen.tsx',
  'src/screens/ReconcileScreen.tsx',
  'src/screens/CalendarScreen.tsx',
  'src/screens/AdminDashboardScreen.tsx',
  'src/components/DigitalIdModal.tsx',
  'src/components/AttendanceDisputeModal.tsx',
  'src/data/psgimData.ts',
  'src/data/psgimMasterStudents.ts',
  'src/services/storageService.ts',
  'src/services/studzoneService.ts',
  'src/services/lmsService.ts',
  'src/services/psgimService.ts',
];

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2300}-\u{23FF}\u{2B50}]|\p{Extended_Pictographic}/gu;

let totalFound = 0;
const violations = [];

for (const relFile of targetFiles) {
  const fullPath = path.join(ROOT, relFile);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File does not exist: ${relFile}`);
    continue;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Reset regex lastIndex if global
    emojiRegex.lastIndex = 0;
    const matches = line.match(emojiRegex);
    if (matches) {
      // Exclude checkmark or cross or pure ASCII if any false positive, but let's see what matches
      totalFound += matches.length;
      violations.push({
        file: relFile,
        line: idx + 1,
        matches: matches.join(' '),
        content: line.trim()
      });
    }
  });
}

console.log(`Scan completed across ${targetFiles.length} target files.`);
console.log(`Total emojis found: ${totalFound}`);

if (violations.length > 0) {
  console.log('Violations:');
  violations.forEach(v => {
    console.log(`  ${v.file}:${v.line} -> [${v.matches}] ${v.content}`);
  });
  process.exit(1);
} else {
  console.log('Zero emoji violations confirmed across all target files!');
  process.exit(0);
}
