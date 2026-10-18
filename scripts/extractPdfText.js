const fs = require('fs');
const zlib = require('zlib');

const dir = 'C:/Users/DELL/.gemini/antigravity/brain/d19e460e-260b-4c4a-a665-fce6c76f8624/.user_uploaded/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

files.forEach(f => {
  console.log('--------------------------------------------------');
  console.log('FILE:', f);
  const buf = fs.readFileSync(dir + f);
  const str = buf.toString('binary');
  
  // Search for stream blocks and inflate them if FlateDecode
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  let textFound = [];
  while ((match = streamRegex.exec(str)) !== null) {
    const rawStream = Buffer.from(match[1], 'binary');
    try {
      const decompressed = zlib.inflateSync(rawStream);
      const decStr = decompressed.toString('utf8');
      // Look for text in BT ... ET blocks or string literals
      const tjMatches = decStr.match(/\((.*?)\)\s*Tj/g) || [];
      tjMatches.forEach(tj => {
        const t = tj.replace(/^\(/, '').replace(/\)\s*Tj$/, '').trim();
        if (t.length > 2) textFound.push(t);
      });
      const tArrayMatches = decStr.match(/\[(.*?)\]\s*TJ/g) || [];
      tArrayMatches.forEach(tj => {
        const parts = tj.match(/\((.*?)\)/g) || [];
        const combined = parts.map(p => p.slice(1, -1)).join('');
        if (combined.length > 2) textFound.push(combined);
      });
    } catch (e) {
      // not compressed or not flate
    }
  }
  console.log('EXTRACTED TEXT SAMPLE (First 400 chars):');
  console.log(textFound.join(' ').slice(0, 400));
});
