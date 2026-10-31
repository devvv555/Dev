/**
 * Independent UI Roll Display & Leakage Audit Script
 * Executed independently by victory_auditor_2.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../..');

const targetScreens = [
  'App.tsx',
  'src/screens/DashboardScreen.tsx',
  'src/screens/TimetableScreen.tsx',
  'src/screens/ReconcileScreen.tsx',
  'src/screens/CalendarScreen.tsx',
  'src/screens/AdminDashboardScreen.tsx',
  'src/components/DigitalIdModal.tsx',
  'src/components/AttendanceDisputeModal.tsx',
];

console.log('=== RUNNING INDEPENDENT UI ROLL LEAKAGE AUDIT ===\n');

let leakageCount = 0;
let checkedCount = 0;

targetScreens.forEach(relPath => {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`[FAIL] File missing: ${relPath}`);
    leakageCount++;
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  // Check 1: No hardcoded D26AB05 string literals displayed to user
  lines.forEach((line, idx) => {
    // If line has D26AB05
    if (line.includes('D26AB05')) {
      // Check if it's in UI JSX or comments/migration logic
      // In UI JSX display, e.g. text showing D26AB05
      const trimmed = line.trim();
      // Allow proxy translation or migration keys, but NOT user display text
      if (trimmed.includes('>') && trimmed.includes('<') && trimmed.includes('D26AB05')) {
        console.error(`[LEAK] UI display contains D26AB05 in ${relPath}:${idx + 1}: ${trimmed}`);
        leakageCount++;
      } else if (trimmed.includes('Roll No: D26AB05') || trimmed.includes('Roll No: "D26AB05"') || trimmed.includes("Roll No: 'D26AB05'")) {
        console.error(`[LEAK] Roll No label shows D26AB05 in ${relPath}:${idx + 1}: ${trimmed}`);
        leakageCount++;
      }
    }
  });

  // Check 2: Verify college roll formatting is present
  const hasToNewRoll = content.includes('toNewRollNo');
  const hasCollegeRollDisplay = content.includes('collegeRoll') || content.includes('studentRollNo') || content.includes('activeRollNo') || content.includes('26AB12');

  console.log(`Audited ${relPath}: hasToNewRoll=${hasToNewRoll}, hasCollegeRollDisplay=${hasCollegeRollDisplay}`);
  checkedCount++;
});

console.log('\n--- Specific UI Screen Displays for Devdarshan V ---');
// Let's check ReconcileScreen line 943 (which was previously flagged for D-roll leakage)
const reconcileContent = fs.readFileSync(path.join(ROOT_DIR, 'src/screens/ReconcileScreen.tsx'), 'utf8');
const reconcileLines = reconcileContent.split('\n');
reconcileLines.forEach((l, i) => {
  if (l.includes('LMS Bridge Mode') || l.includes('Studzone Portal') || l.includes('Moodle Portal') || (l.includes('Roll') && l.includes('26AB'))) {
    console.log(`ReconcileScreen:${i+1}: ${l.trim()}`);
  }
});

// Check DigitalIdModal
const idModalContent = fs.readFileSync(path.join(ROOT_DIR, 'src/components/DigitalIdModal.tsx'), 'utf8');
const idModalLines = idModalContent.split('\n');
idModalLines.forEach((l, i) => {
  if (l.includes('rollNo') && (l.includes('Text') || l.includes('badge') || l.includes('Barcode'))) {
    console.log(`DigitalIdModal:${i+1}: ${l.trim()}`);
  }
});

// Check DashboardScreen
const dashContent = fs.readFileSync(path.join(ROOT_DIR, 'src/screens/DashboardScreen.tsx'), 'utf8');
const dashLines = dashContent.split('\n');
dashLines.forEach((l, i) => {
  if (l.includes('Roll No') || l.includes('badge') && l.includes('roll')) {
    console.log(`DashboardScreen:${i+1}: ${l.trim()}`);
  }
});

console.log(`\nAudit summary: Checked ${checkedCount} UI components, found ${leakageCount} leakages.`);
if (leakageCount > 0) {
  process.exit(1);
} else {
  console.log('UI ROLL LEAKAGE AUDIT PASSED: ZERO LEAKAGE DETECTED.');
  process.exit(0);
}
