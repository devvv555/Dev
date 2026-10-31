const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const files = [
  'C:/Users/DELL/.gemini/antigravity/brain/67294920-a323-4ac2-b349-05b9b866df38/.user_uploaded/media_1789662129576.pdf',
  'C:/Users/DELL/.gemini/antigravity/brain/67294920-a323-4ac2-b349-05b9b866df38/.user_uploaded/media_1789664411440.pdf',
  'C:/Users/DELL/.gemini/antigravity/brain/67294920-a323-4ac2-b349-05b9b866df38/.user_uploaded/media_1789664733280.pdf',
  'C:/Users/DELL/.gemini/antigravity/brain/67294920-a323-4ac2-b349-05b9b866df38/.user_uploaded/media_1789709359906.pdf',
  'C:/Users/DELL/.gemini/antigravity/brain/67294920-a323-4ac2-b349-05b9b866df38/.user_uploaded/media_1792468011964_6888fda2.pdf',
  'C:/Users/DELL/.gemini/antigravity/brain/67294920-a323-4ac2-b349-05b9b866df38/.user_uploaded/media_1792470245215_a5d236f3.pdf'
];

files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.log('File not found:', f);
    return;
  }
  const buf = fs.readFileSync(f);
  const str = buf.toString('binary');
  const pages = (str.match(/\/Type\s*\/Page\b/g) || []).length;
  console.log(`\n========================================\nFile: ${path.basename(f)} (Pages: ${pages}, Size: ${buf.length})`);
  
  // Extract text
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  let allText = [];
  while ((match = streamRegex.exec(str)) !== null) {
    try {
      const dec = zlib.inflateSync(Buffer.from(match[1], 'binary')).toString('utf8');
      const tjRegex = /(?:\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ)/g;
      let m;
      while ((m = tjRegex.exec(dec)) !== null) {
        if (m[1] !== undefined) allText.push(m[1]);
        else if (m[2] !== undefined) {
          const parts = m[2].match(/\((.*?)\)/g) || [];
          allText.push(parts.map(x => x.slice(1, -1)).join(''));
        }
      }
    } catch(e) {}
  }
  if (allText.length > 0) {
    console.log('Extracted sample text (first 500 chars):');
    console.log(allText.join(' ').slice(0, 500));
  } else {
    console.log('No direct text stream found (likely image-based or DCTDecode).');
  }
});
