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
let studentRecords = [];

pageIndices.forEach((sIdx, pageNum) => {
  const content = streams[sIdx];
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

  for (let i = 0; i < cleaned.length; i++) {
    if (/^D?26A[A-E]\d{2}$/.test(cleaned[i])) {
      let r = cleaned.slice(i, i + 9);
      let rollNo = r[0];
      if (!rollNo.startsWith('D')) rollNo = 'D' + rollNo;
      const [mcob, adm, mc, ssm, bs, edm, la, ssa] = r.slice(1);
      const batchCode = rollNo.slice(3, 5); // AA, AB, AC, AD, AE
      const batchSection = batchCode === 'AA' ? 'A' : batchCode === 'AB' ? 'B' : batchCode === 'AC' ? 'C' : batchCode === 'AD' ? 'D' : 'AE';
      
      let sportsGroup = '';
      if (batchSection === 'A') sportsGroup = 'SPORTS1';
      else if (batchSection === 'B') sportsGroup = 'SPORTS2';
      else if (batchSection === 'C') sportsGroup = 'SPORTS3';
      else if (batchSection === 'D') sportsGroup = 'SPORTS4';

      studentRecords.push({
        dRollNo: rollNo,
        batchSection,
        page: pageNum + 1,
        courses: {
          MCOB: mcob,
          ADM: adm,
          MC: mc,
          SSM: ssm,
          SPORTS: sportsGroup,
          BS: bs,
          EDM: edm,
          LA: la,
          SSA: ssa
        }
      });
      i += 8;
    }
  }
});

console.log('Total extracted student records from PDF:', studentRecords.length);
const outPath = path.join(__dirname, 'official_dynamic_course_batch_list.json');
fs.writeFileSync(outPath, JSON.stringify(studentRecords, null, 2));
console.log('Successfully saved to:', outPath);
