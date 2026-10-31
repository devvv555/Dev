const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('C:/Users/DELL/.gemini/antigravity/brain/67294920-a323-4ac2-b349-05b9b866df38/.user_uploaded/media_1789709359906.pdf');
const str = buf.toString('binary');

function getObject(id) {
  const m = str.match(new RegExp('\\b' + id + '\\s+0\\s+obj([\\s\\S]*?)endobj'));
  return m ? m[1] : null;
}

function getObjectStream(id) {
  const m = str.match(new RegExp('\\b' + id + '\\s+0\\s+obj[\\s\\S]*?stream\\r?\\n([\\s\\S]*?)\\r?\\nendstream'));
  if (!m) return null;
  try {
    return zlib.inflateSync(Buffer.from(m[1], 'binary')).toString('utf8');
  } catch (e) {
    return null;
  }
}

function parseCMap(cMapStr) {
  if (!cMapStr) return {};
  const map = {};
  const bfcharRegex = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g;
  let bfc;
  while ((bfc = bfcharRegex.exec(cMapStr)) !== null) {
    const src = parseInt(bfc[1], 16);
    const dest = String.fromCharCode(parseInt(bfc[2], 16));
    map[src] = dest;
  }
  const bfrangeRegex = /<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g;
  let bfr;
  while ((bfr = bfrangeRegex.exec(cMapStr)) !== null) {
    const start = parseInt(bfr[1], 16);
    const end = parseInt(bfr[2], 16);
    const target = parseInt(bfr[3], 16);
    for (let c = start; c <= end; c++) {
      map[c] = String.fromCharCode(target + (c - start));
    }
  }
  return map;
}

const fontMaps = {
  '/Font1': parseCMap(getObjectStream(56)),
  '/Font2': parseCMap(getObjectStream(60)),
  '/Font3': parseCMap(getObjectStream(64)),
  '/Font4': parseCMap(getObjectStream(68)),
};

const pageObjRegex = /\/Type\s*\/Page\b[\s\S]*?\/Contents\s+(\d+)\s+0\s+R/g;
let pm;
const pageContentIds = [];
while ((pm = pageObjRegex.exec(str)) !== null) {
  pageContentIds.push(parseInt(pm[1], 10));
}

pageContentIds.forEach((cid, pIdx) => {
  const content = getObjectStream(cid);
  if (!content) return;
  
  let currentFont = '/Font1';
  let elements = [];
  
  const cmdRegex = /(\/Font\d+)\s+[\d\.]+\s+Tf|(\((?:\\.|[^()])*\))\s*Tj/g;
  let m;
  while ((m = cmdRegex.exec(content)) !== null) {
    if (m[1]) {
      currentFont = m[1];
    } else if (m[2]) {
      let raw = m[2].slice(1, -1)
        .replace(/\\([()\\])/g, '$1')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t');
      
      const cmap = fontMaps[currentFont] || {};
      let decoded = '';
      for (let i = 0; i < raw.length; i += 2) {
        const code = (raw.charCodeAt(i) << 8) | (raw.charCodeAt(i + 1) || 0);
        decoded += (cmap[code] !== undefined ? cmap[code] : '?');
      }
      elements.push(decoded.trim());
    }
  }
  console.log(`Page ${pIdx + 1} has ${elements.length} elements. Elements containing D26:`);
  elements.forEach((el, idx) => {
    if (el.startsWith('D26')) {
      console.log(elements.slice(Math.max(0, idx - 1), idx + 3).join(' | '));
    }
  });
});
