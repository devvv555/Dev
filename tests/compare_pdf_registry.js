const fs = require('fs');
const zlib = require('zlib');
const masterData = require('./master_students.cjs');

// 1. Extract official PDF rows
const pdfPath = 'C:/Users/DELL/.gemini/antigravity/brain/0fe20059-b875-43a5-8bbf-033eb0baabd7/.user_uploaded/media_1793371917955_cb2c50f0.pdf';
const buf = fs.readFileSync(pdfPath);
const str = buf.toString('binary');
const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
let match, streams = [];
while ((match = streamRegex.exec(str)) !== null) {
  try { streams.push(zlib.inflateSync(Buffer.from(match[1], 'binary')).toString('utf8')); } catch(e) {}
}
const pageIndices = [0, 3, 4, 5, 6, 7];
let allPdfRows = [];
pageIndices.forEach((sIdx) => {
  const content = streams[sIdx];
  const tjRegex = /(?:\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ)/g;
  let rawTokens = [], m;
  while ((m = tjRegex.exec(content)) !== null) {
    if (m[1] !== undefined) rawTokens.push(m[1]);
    else if (m[2] !== undefined) {
      const parts = m[2].match(/\((.*?)\)/g) || [];
      rawTokens.push(parts.map(x => x.slice(1, -1)).join(''));
    }
  }
  let cleaned = [], buffer = '';
  for (let t of rawTokens) {
    if (t === ' ') { if (buffer.length > 0) { cleaned.push(buffer); buffer = ''; } }
    else buffer += t;
  }
  if (buffer.length > 0) cleaned.push(buffer);
  for (let i = 0; i < cleaned.length; i++) {
    if (/^D?26A[A-E]\d{2}$/.test(cleaned[i])) {
      allPdfRows.push(cleaned.slice(i, i + 9));
      i += 8;
    }
  }
});

console.log('Total PDF rows extracted:', allPdfRows.length);

// 2. Read current STUDENT_REGISTRY from psgim_data.cjs
const psgimData = require('./psgim_data.cjs');
const registry = psgimData.STUDENT_REGISTRY;

let diffCount = 0;
let matchCount = 0;
let missingCount = 0;
const diffs = [];

allPdfRows.forEach(row => {
  const dRoll = row[0]; // e.g. D26AA01
  const expected = {
    MCOB: row[1],
    ADM: row[2],
    MC: row[3],
    SSM: row[4],
    BS: row[5],
    EDM: row[6],
    LA: row[7],
    SSA: row[8],
  };

  const current = registry[dRoll];
  if (!current) {
    missingCount++;
    diffs.push({ dRoll, issue: 'Missing in current registry' });
  } else {
    const curBatches = current.batches;
    let hasDiff = false;
    let fieldDiffs = {};
    for (const k of Object.keys(expected)) {
      if (curBatches[k] !== expected[k]) {
        hasDiff = true;
        fieldDiffs[k] = { current: curBatches[k], expected: expected[k] };
      }
    }
    if (hasDiff) {
      diffCount++;
      diffs.push({ dRoll, fieldDiffs });
    } else {
      matchCount++;
    }
  }
});

console.log('--- COMPARISON OF PDF D-ROLLS vs CURRENT STUDENT_REGISTRY[D-ROLL] ---');
console.log('Matches:', matchCount);
console.log('Differences:', diffCount);
console.log('Missing:', missingCount);
console.log('Sample Diffs:', JSON.stringify(diffs.slice(0, 5), null, 2));
