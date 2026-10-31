/**
 * Comprehensive Repo-Wide Zero Emoji Scanner
 * Executed independently by victory_auditor_2.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../../..');

// Unicode Emoji regex covering all standard emoji blocks and Extended_Pictographic
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2300}-\u{23FF}\u{2B50}]|\p{Extended_Pictographic}/gu;

// Get modified files from git status
const gitStatusOutput = execSync('git status --porcelain', { cwd: ROOT_DIR, encoding: 'utf8' });
const lines = gitStatusOutput.split('\n');

const filesToScan = new Set();

lines.forEach(line => {
  const trimmed = line.trim();
  if (!trimmed) return;
  const filePath = trimmed.slice(3).trim();
  // Filter for source code and test files
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.cjs')) {
    filesToScan.add(filePath);
  }
});

// Also include all files in src/screens, src/components, src/services, src/data, tests/
function walkDir(dir) {
  const fullDir = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(fullDir)) return;
  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  for (const ent of entries) {
    const rel = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name !== 'node_modules' && ent.name !== '.git' && ent.name !== 'dist' && ent.name !== '.expo') {
        walkDir(rel);
      }
    } else if (rel.endsWith('.ts') || rel.endsWith('.tsx') || rel.endsWith('.cjs')) {
      filesToScan.add(rel.replace(/\\/g, '/'));
    }
  }
}

['src/screens', 'src/components', 'src/services', 'src/data', 'tests'].forEach(d => walkDir(d));

console.log(`Scanning ${filesToScan.size} source and test files for emojis...\n`);

let totalEmojis = 0;
let fileViolations = [];

for (const relPath of filesToScan) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, 'utf8');
  const fileLines = content.split('\n');
  let fileMatches = 0;

  fileLines.forEach((lineText, lineIdx) => {
    const matches = lineText.match(emojiRegex);
    if (matches && matches.length > 0) {
      // Exclude the emoji scanner's own regex or comments defining the regex
      if (lineText.includes('Extended_Pictographic') || lineText.includes('emojiRegex')) {
        return;
      }
      fileMatches += matches.length;
      totalEmojis += matches.length;
      console.log(`[EMOJI FOUND] ${relPath}:${lineIdx + 1} (${matches.join(' ')}): ${lineText.trim()}`);
    }
  });

  if (fileMatches > 0) {
    fileViolations.push({ file: relPath, count: fileMatches });
  }
}

console.log('\n==================================================');
console.log(`ZERO EMOJI SCAN SUMMARY:`);
console.log(`Files scanned: ${filesToScan.size}`);
console.log(`Total emojis found: ${totalEmojis}`);
console.log(`Files with emoji violations: ${fileViolations.length}`);
console.log('==================================================');

if (totalEmojis > 0) {
  console.error('\nFAIL: Zero Emoji Policy violated.');
  process.exit(1);
} else {
  console.log('\nPASS: Zero Emoji Policy 100% compliant across all files.');
  process.exit(0);
}
