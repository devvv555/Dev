const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const pdfPath = 'C:/Users/DELL/.gemini/antigravity/brain/0fe20059-b875-43a5-8bbf-033eb0baabd7/.user_uploaded/media_1793371917955_cb2c50f0.pdf';
const buf = fs.readFileSync(pdfPath);
const str = buf.toString('binary');

const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
let match;
let streams = [];
while ((match = streamRegex.exec(str)) !== null) {
  try {
    const dec = zlib.inflateSync(Buffer.from(match[1], 'binary')).toString('utf8');
    streams.push(dec);
  } catch(e) {}
}

const pageIndices = [0, 3, 4, 5, 6, 7];

pageIndices.forEach((sIdx, pageNum) => {
  const content = streams[sIdx];
  console.log(`=== PAGE ${pageNum + 1} (Stream ${sIdx}) ===`);
  
  // Extract text operations
  const tjRegex = /(?:\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ)/g;
  let rawTokens = [];
  let m;
  while ((m = tjRegex.exec(content)) !== null) {
    if (m[1] !== undefined) {
      rawTokens.push(m[1]);
    } else if (m[2] !== undefined) {
      const parts = m[2].match(/\((.*?)\)/g) || [];
      rawTokens.push(parts.map(x => x.slice(1, -1)).join(''));
    }
  }

  // Join tokens that are separated by empty spaces or split
  // Note: let's see rawTokens
  console.log(`Total raw tokens: ${rawTokens.length}`);
  
  // Let's filter out pure spaces or inspect how tokens relate
  let cleaned = [];
  let buffer = '';
  for (let i = 0; i < rawTokens.length; i++) {
    const t = rawTokens[i];
    if (t === ' ') {
      if (buffer.length > 0) {
        cleaned.push(buffer);
        buffer = '';
      }
    } else {
      buffer += t;
    }
  }
  if (buffer.length > 0) cleaned.push(buffer);

  console.log(`Cleaned tokens: ${cleaned.length}`);
  // Find where student rows start
  const studentRows = [];
  for (let i = 0; i < cleaned.length; i++) {
    if (/^D?26A[A-E]\d{2}$/.test(cleaned[i])) {
      const row = cleaned.slice(i, i + 9);
      studentRows.push(row);
      i += 8; // skip ahead
    }
  }
  console.log(`Found ${studentRows.length} student rows on page ${pageNum + 1}`);
  if (studentRows.length > 0) {
    console.log(`  First row:`, studentRows[0].join(' '));
    console.log(`  Last row:`, studentRows[studentRows.length - 1].join(' '));
  }
});
