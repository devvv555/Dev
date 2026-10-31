const fs = require('fs');
const zlib = require('zlib');

const f = 'C:/Users/DELL/.gemini/antigravity/brain/67294920-a323-4ac2-b349-05b9b866df38/.user_uploaded/media_1789709359906.pdf';
const buf = fs.readFileSync(f);
const str = buf.toString('binary');

// Find all streams
const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
let match;
let streams = [];
while ((match = streamRegex.exec(str)) !== null) {
  try {
    const dec = zlib.inflateSync(Buffer.from(match[1], 'binary')).toString('utf8');
    streams.push(dec);
  } catch(e) {}
}

console.log('Total streams in media_1789709359906.pdf:', streams.length);
// Check if any stream has ToUnicode or cmap
streams.forEach((s, idx) => {
  if (s.includes('begincmap') || s.includes('beginbfchar') || s.includes('beginbfrange')) {
    console.log('Stream', idx, 'is CMap!');
    console.log(s.slice(0, 500));
  }
});
