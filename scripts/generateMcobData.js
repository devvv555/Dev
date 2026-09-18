const fs = require('fs');
const path = require('path');

const mcobRecords = [
  { rollNo: "D26AA02", name: "AKASH VARDHMAN", marks: [2, 2, 0, 2, 0, 2, 2, 2], pct: 75 },
  { rollNo: "D26AA05", name: "AJJAY MARSHAL", marks: [2, 2, 0, 0, 2, 2, 2, 2], pct: 75 },
  { rollNo: "D26AA09", name: "RAJESWARI K", marks: [2, 2, 2, 2, 2, 2, 2, 0], pct: 88 },
  { rollNo: "D26AA23", name: "POOJA VARSINEE PALANIAPPAN", marks: [2, 0, 2, 2, 2, 2, 2, 2], pct: 88 },
  { rollNo: "D26AA27", name: "AISWARYA MENON", marks: [2, 2, 2, 2, 2, 2, 2, 0], pct: 88 },
  { rollNo: "D26AA22", name: "SUBASH MOHAN BALAKRISHNAN", marks: [2, 2, 0, 2, 2, 2, 2, 2], pct: 88 },
  { rollNo: "D26AA29", name: "ANUSHREE R", marks: [2, 2, 0, 2, 2, 2, 2, 2], pct: 88 },
  { rollNo: "D26AA33", name: "HARINIKA UDAYAKUMAR", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AA37", name: "M SUMAA BARATHI", marks: [0, 2, 2, 2, 2, 2, 2, 0], pct: 75 },
  { rollNo: "D26AA42", name: "HARISH K", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AA45", name: "BARANIDHARAN VA", marks: [0, 0, 0, 2, 2, 2, 2, 2], pct: 63 },
  { rollNo: "D26AA49", name: "HARSHAVARDHAN B C", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AA53", name: "GANESH PRAVEEN V", marks: [0, 0, 0, 2, 2, 2, 2, 0], pct: 50 },
  { rollNo: "D26AA57", name: "HARAN J", marks: [0, 0, 0, 2, 2, 2, 2, 2], pct: 63 },
  { rollNo: "D26AB02", name: "MUKTHA MATHI S", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AB05", name: "DEVDARSHAN V", marks: [2, 2, 2, 2, 2, 2, 2, 0], pct: 88 },
  { rollNo: "D26AB09", name: "RAGHUL K B", marks: [2, 2, 0, 2, 2, 2, 2, 2], pct: 88 },
  { rollNo: "D26AB23", name: "KARNAM HARISRIYA NAIDU", marks: [2, 2, 0, 2, 2, 2, 2, 2], pct: 88 },
  { rollNo: "D26AB27", name: "KARTHIKEYAN S", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AB22", name: "PRIYADHARSHAN R", marks: [0, 0, 0, 0, 0, 0, 0, 0], pct: 0 },
  { rollNo: "D26AB25", name: "PRABHAKAR V L", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AB29", name: "SANDHYA SREE M", marks: [2, 2, 0, 2, 2, 2, 2, 2], pct: 88 },
  { rollNo: "D26AB33", name: "JANICE PREETHY G V", marks: [0, 2, 2, 0, 2, 2, 2, 0], pct: 63 },
  { rollNo: "D26AB37", name: "KEERTHI VASEN D", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AB42", name: "GOWTHAM S", marks: [2, 0, 2, 2, 2, 2, 2, 0], pct: 75 },
  { rollNo: "D26AB45", name: "R KRISHNA", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AB49", name: "PRAVEEN J A", marks: [0, 0, 0, 2, 0, 2, 2, 0], pct: 38 },
  { rollNo: "D26AB53", name: "MUKESH KUMAR S", marks: [2, 2, 0, 2, 2, 2, 2, 2], pct: 88 },
  { rollNo: "D26AB57", name: "AFRIN NIQMATHULLAH A", marks: [0, 0, 0, 2, 2, 2, 2, 2], pct: 63 },
  { rollNo: "D26AC02", name: "DHARSHINE E H", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AC05", name: "AKSHAYA KARTHEESAN NADAR", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AC09", name: "R S MAMADHIE SARA", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AC23", name: "MOHANA SHRI R E", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AC27", name: "KRISHNAGANTH R", marks: [2, 2, 2, 0, 2, 2, 2, 0], pct: 75 },
  { rollNo: "D26AC22", name: "SAMARTH NAIR", marks: [2, 2, 2, 2, 2, 2, 2, 0], pct: 88 },
  { rollNo: "D26AC25", name: "SHERIL LINCY V", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AC29", name: "YOGADHARSHINI M", marks: [2, 2, 2, 2, 2, 2, 2, 0], pct: 88 },
  { rollNo: "D26AC33", name: "SAKTHIHA SRI V", marks: [2, 2, 2, 2, 0, 2, 2, 2], pct: 88 },
  { rollNo: "D26AC37", name: "CHANDRAVEL S", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AC42", name: "VISHNU KARTHICK K S", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AC45", name: "RAKSATHA K R", marks: [2, 2, 2, 2, 2, 2, 2, 0], pct: 88 },
  { rollNo: "D26AC49", name: "MAANVI VASHISTHA", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AC57", name: "B HEMNARAYAN", marks: [0, 0, 0, 2, 2, 2, 2, 2], pct: 63 },
  { rollNo: "D26AD02", name: "LOHIT DEVESHWAR S K", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AD05", name: "DHATCHINA MOORTHI T A", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AD09", name: "RUPICKA A", marks: [2, 2, 0, 2, 2, 2, 2, 0], pct: 75 },
  { rollNo: "D26AD23", name: "SRUTHI B", marks: [2, 0, 2, 2, 2, 2, 2, 2], pct: 88 },
  { rollNo: "D26AD27", name: "SANJANA S", marks: [2, 2, 2, 2, 2, 2, 2, 0], pct: 88 },
  { rollNo: "D26AD22", name: "SATHYA PRIYA R", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AD25", name: "RISHABH KUMAR MISHRA", marks: [2, 2, 2, 2, 2, 0, 0, 2], pct: 75 },
  { rollNo: "D26AD29", name: "SUBHASHREE T", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AD33", name: "SARAN K M", marks: [2, 2, 2, 2, 2, 0, 0, 2], pct: 75 },
  { rollNo: "D26AD37", name: "VIJAY M", marks: [0, 2, 2, 2, 2, 0, 0, 2], pct: 63 },
  { rollNo: "D26AD45", name: "HARINI E", marks: [0, 0, 2, 2, 2, 0, 0, 0], pct: 38 },
  { rollNo: "D26AD42", name: "EZHILAN O", marks: [2, 2, 2, 2, 2, 2, 2, 0], pct: 88 },
  { rollNo: "D26AD49", name: "PRIYANKAA K", marks: [2, 2, 0, 2, 0, 0, 0, 0], pct: 38 },
  { rollNo: "D26AD53", name: "LEKSHMIKAMATHY ARUL", marks: [0, 0, 0, 2, 0, 2, 2, 2], pct: 50 },
  { rollNo: "D26AD57", name: "ABDUL KADER AZHAR S", marks: [0, 0, 0, 2, 2, 2, 2, 2], pct: 63 },
  { rollNo: "D26AB61", name: "ANUSREE O", marks: [2, 2, 2, 2, 2, 2, 2, 0], pct: 88 },
  { rollNo: "D26AB62", name: "RITHANYA S", marks: [2, 2, 2, 2, 2, 2, 2, 2], pct: 100 },
  { rollNo: "D26AB64", name: "AVANTHIKA PRABAKARAN", marks: [2, 2, 2, 0, 0, 2, 2, 0], pct: 63 },
  { rollNo: "D26AA62", name: "VISHWADIKA GANAPATHIRAMAN", marks: [2, 2, 2, 0, 2, 2, 2, 2], pct: 88 },
  { rollNo: "D26AD59", name: "SRI YASHWANTH RAGAVENDRA R", marks: [2, 2, 2, 0, 0, 2, 2, 0], pct: 63 }
];

const dates = [
  "Aug 25 (2 hrs)",
  "Aug 28 (2 hrs)",
  "Aug 29 (2 hrs)",
  "Sept 02 (2 hrs)",
  "Sept 08 (2 hrs)",
  "Sept 09 - Slot 1 (2 hrs)",
  "Sept 09 - Slot 2 (2 hrs)",
  "Sept 15 (2 hrs)"
];

const studentDataMap = {};

mcobRecords.forEach(rec => {
  const attendedHours = rec.marks.reduce((a, b) => a + b, 0);
  const totalHours = 16;
  const sessions = rec.marks.map((hrs, idx) => ({
    date: dates[idx],
    hoursAttended: hrs,
    status: hrs > 0 ? 'PRESENT' : 'ABSENT'
  }));

  studentDataMap[rec.rollNo] = {
    rollNo: rec.rollNo,
    name: rec.name,
    batch: "MCOB1",
    courseCode: "24GM11",
    attendedHours,
    totalHours,
    percentage: rec.pct,
    sessions
  };
});

const tsContent = `// Real-world official MCOB 1 Attendance Dataset
// Course: Management Concepts & OB (24GM11 / 24GM22) - Batch 2026-28
// Total Sessions: 8 (16 Hours Total)

export interface McobSessionRecord {
  date: string;
  hoursAttended: number;
  status: 'PRESENT' | 'ABSENT';
}

export interface McobStudentData {
  rollNo: string;
  name: string;
  batch: string;
  courseCode: string;
  attendedHours: number;
  totalHours: number;
  percentage: number;
  sessions: McobSessionRecord[];
}

export const MCOB_DATES = ${JSON.stringify(dates, null, 2)};

export const MCOB1_STUDENTS: Record<string, McobStudentData> = ${JSON.stringify(studentDataMap, null, 2)};

export function getMcobData(rollNo: string): McobStudentData | null {
  return MCOB1_STUDENTS[rollNo.toUpperCase()] || null;
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'mcobAttendanceData.ts'), tsContent, 'utf8');
console.log('Successfully generated src/data/mcobAttendanceData.ts with ' + Object.keys(studentDataMap).length + ' students!');
