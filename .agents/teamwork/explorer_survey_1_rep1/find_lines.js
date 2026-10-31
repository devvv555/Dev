const fs = require('fs');

const content = fs.readFileSync('src/data/psgimData.ts', 'utf8');
const lines = content.split('\n');

const regEntries = [];
lines.forEach((line, idx) => {
  const match = line.match(/^\s*"([^"]+)":\s*\{\s*$/);
  if (match && match[1].startsWith('D26')) {
    regEntries.push({ lineNum: idx + 1, key: match[1] });
  }
});

console.log('Total entries:', regEntries.length);
console.log('First 5:', regEntries.slice(0, 5));
console.log('Last 20:', regEntries.slice(-20));

// Let's filter by batch
const byBatch = {};
regEntries.forEach(e => {
  const b = e.key.slice(0, 5); // D26AA, D26AB, etc.
  if (!byBatch[b]) byBatch[b] = [];
  byBatch[b].push(e);
});

Object.keys(byBatch).forEach(b => {
  console.log(`Batch ${b}: count=${byBatch[b].length}, min=${byBatch[b][0].key} (line ${byBatch[b][0].lineNum}), max=${byBatch[b][byBatch[b].length - 1].key} (line ${byBatch[b][byBatch[b].length - 1].lineNum})`);
});
