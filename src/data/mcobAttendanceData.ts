// Real-world official MCOB 1 Attendance Dataset
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

export const MCOB_DATES = [
  "Aug 25 (2 hrs)",
  "Aug 28 (2 hrs)",
  "Aug 29 (2 hrs)",
  "Sept 02 (2 hrs)",
  "Sept 08 (2 hrs)",
  "Sept 09 - Slot 1 (2 hrs)",
  "Sept 09 - Slot 2 (2 hrs)",
  "Sept 15 (2 hrs)"
];

export const MCOB1_STUDENTS: Record<string, McobStudentData> = {
  "D26AA02": {
    "rollNo": "D26AA02",
    "name": "AKASH VARDHMAN",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 12,
    "totalHours": 16,
    "percentage": 75,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AA05": {
    "rollNo": "D26AA05",
    "name": "AJJAY MARSHAL",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 12,
    "totalHours": 16,
    "percentage": 75,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AA09": {
    "rollNo": "D26AA09",
    "name": "RAJESWARI K",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AA23": {
    "rollNo": "D26AA23",
    "name": "POOJA VARSINEE PALANIAPPAN",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AA27": {
    "rollNo": "D26AA27",
    "name": "AISWARYA MENON",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AA22": {
    "rollNo": "D26AA22",
    "name": "SUBASH MOHAN BALAKRISHNAN",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AA29": {
    "rollNo": "D26AA29",
    "name": "ANUSHREE R",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AA33": {
    "rollNo": "D26AA33",
    "name": "HARINIKA UDAYAKUMAR",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AA37": {
    "rollNo": "D26AA37",
    "name": "M SUMAA BARATHI",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 12,
    "totalHours": 16,
    "percentage": 75,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AA42": {
    "rollNo": "D26AA42",
    "name": "HARISH K",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AA45": {
    "rollNo": "D26AA45",
    "name": "BARANIDHARAN VA",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 10,
    "totalHours": 16,
    "percentage": 63,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AA49": {
    "rollNo": "D26AA49",
    "name": "HARSHAVARDHAN B C",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AA53": {
    "rollNo": "D26AA53",
    "name": "GANESH PRAVEEN V",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 8,
    "totalHours": 16,
    "percentage": 50,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AA57": {
    "rollNo": "D26AA57",
    "name": "HARAN J",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 10,
    "totalHours": 16,
    "percentage": 63,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AB02": {
    "rollNo": "D26AB02",
    "name": "MUKTHA MATHI S",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AB05": {
    "rollNo": "D26AB05",
    "name": "DEVDARSHAN V",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AB09": {
    "rollNo": "D26AB09",
    "name": "RAGHUL K B",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AB23": {
    "rollNo": "D26AB23",
    "name": "KARNAM HARISRIYA NAIDU",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AB27": {
    "rollNo": "D26AB27",
    "name": "KARTHIKEYAN S",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AB22": {
    "rollNo": "D26AB22",
    "name": "PRIYADHARSHAN R",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 0,
    "totalHours": 16,
    "percentage": 0,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AB25": {
    "rollNo": "D26AB25",
    "name": "PRABHAKAR V L",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AB29": {
    "rollNo": "D26AB29",
    "name": "SANDHYA SREE M",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AB33": {
    "rollNo": "D26AB33",
    "name": "JANICE PREETHY G V",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 10,
    "totalHours": 16,
    "percentage": 63,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AB37": {
    "rollNo": "D26AB37",
    "name": "KEERTHI VASEN D",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AB42": {
    "rollNo": "D26AB42",
    "name": "GOWTHAM S",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 12,
    "totalHours": 16,
    "percentage": 75,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AB45": {
    "rollNo": "D26AB45",
    "name": "R KRISHNA",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AB49": {
    "rollNo": "D26AB49",
    "name": "PRAVEEN J A",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 6,
    "totalHours": 16,
    "percentage": 38,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AB53": {
    "rollNo": "D26AB53",
    "name": "MUKESH KUMAR S",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AB57": {
    "rollNo": "D26AB57",
    "name": "AFRIN NIQMATHULLAH A",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 10,
    "totalHours": 16,
    "percentage": 63,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AC02": {
    "rollNo": "D26AC02",
    "name": "DHARSHINE E H",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AC05": {
    "rollNo": "D26AC05",
    "name": "AKSHAYA KARTHEESAN NADAR",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AC09": {
    "rollNo": "D26AC09",
    "name": "R S MAMADHIE SARA",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AC23": {
    "rollNo": "D26AC23",
    "name": "MOHANA SHRI R E",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AC27": {
    "rollNo": "D26AC27",
    "name": "KRISHNAGANTH R",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 12,
    "totalHours": 16,
    "percentage": 75,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AC22": {
    "rollNo": "D26AC22",
    "name": "SAMARTH NAIR",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AC25": {
    "rollNo": "D26AC25",
    "name": "SHERIL LINCY V",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AC29": {
    "rollNo": "D26AC29",
    "name": "YOGADHARSHINI M",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AC33": {
    "rollNo": "D26AC33",
    "name": "SAKTHIHA SRI V",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AC37": {
    "rollNo": "D26AC37",
    "name": "CHANDRAVEL S",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AC42": {
    "rollNo": "D26AC42",
    "name": "VISHNU KARTHICK K S",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AC45": {
    "rollNo": "D26AC45",
    "name": "RAKSATHA K R",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AC49": {
    "rollNo": "D26AC49",
    "name": "MAANVI VASHISTHA",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AC57": {
    "rollNo": "D26AC57",
    "name": "B HEMNARAYAN",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 10,
    "totalHours": 16,
    "percentage": 63,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AD02": {
    "rollNo": "D26AD02",
    "name": "LOHIT DEVESHWAR S K",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AD05": {
    "rollNo": "D26AD05",
    "name": "DHATCHINA MOORTHI T A",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AD09": {
    "rollNo": "D26AD09",
    "name": "RUPICKA A",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 12,
    "totalHours": 16,
    "percentage": 75,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AD23": {
    "rollNo": "D26AD23",
    "name": "SRUTHI B",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AD27": {
    "rollNo": "D26AD27",
    "name": "SANJANA S",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AD22": {
    "rollNo": "D26AD22",
    "name": "SATHYA PRIYA R",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AD25": {
    "rollNo": "D26AD25",
    "name": "RISHABH KUMAR MISHRA",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 12,
    "totalHours": 16,
    "percentage": 75,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AD29": {
    "rollNo": "D26AD29",
    "name": "SUBHASHREE T",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AD33": {
    "rollNo": "D26AD33",
    "name": "SARAN K M",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 12,
    "totalHours": 16,
    "percentage": 75,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AD37": {
    "rollNo": "D26AD37",
    "name": "VIJAY M",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 10,
    "totalHours": 16,
    "percentage": 63,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AD45": {
    "rollNo": "D26AD45",
    "name": "HARINI E",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 6,
    "totalHours": 16,
    "percentage": 38,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AD42": {
    "rollNo": "D26AD42",
    "name": "EZHILAN O",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AD49": {
    "rollNo": "D26AD49",
    "name": "PRIYANKAA K",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 6,
    "totalHours": 16,
    "percentage": 38,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AD53": {
    "rollNo": "D26AD53",
    "name": "LEKSHMIKAMATHY ARUL",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 8,
    "totalHours": 16,
    "percentage": 50,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AD57": {
    "rollNo": "D26AD57",
    "name": "ABDUL KADER AZHAR S",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 10,
    "totalHours": 16,
    "percentage": 63,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AB61": {
    "rollNo": "D26AB61",
    "name": "RITHANYA S",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 16,
    "totalHours": 16,
    "percentage": 100,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AB62": {
    "rollNo": "D26AB62",
    "name": "ANUSREE O",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AB64": {
    "rollNo": "D26AB64",
    "name": "AVANTHIKA PRABAKARAN",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 10,
    "totalHours": 16,
    "percentage": 63,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  },
  "D26AA62": {
    "rollNo": "D26AA62",
    "name": "VISHWADIKA GANAPATHIRAMAN",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 14,
    "totalHours": 16,
    "percentage": 88,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      }
    ]
  },
  "D26AD59": {
    "rollNo": "D26AD59",
    "name": "SRI YASHWANTH RAGAVENDRA R",
    "batch": "MCOB1",
    "courseCode": "24GM11",
    "attendedHours": 10,
    "totalHours": 16,
    "percentage": 63,
    "sessions": [
      {
        "date": "Aug 25 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 28 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Aug 29 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 02 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 08 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      },
      {
        "date": "Sept 09 - Slot 1 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 09 - Slot 2 (2 hrs)",
        "hoursAttended": 2,
        "status": "PRESENT"
      },
      {
        "date": "Sept 15 (2 hrs)",
        "hoursAttended": 0,
        "status": "ABSENT"
      }
    ]
  }
};

export function getMcobData(rollNo: string): McobStudentData | null {
  return MCOB1_STUDENTS[rollNo.toUpperCase()] || null;
}
