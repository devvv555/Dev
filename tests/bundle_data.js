"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/data/psgimData.ts
var psgimData_exports = {};
__export(psgimData_exports, {
  ALL_ROLL_NUMBERS: () => ALL_ROLL_NUMBERS,
  MASTER_SCHEDULE: () => MASTER_SCHEDULE,
  PSGIM_COURSES: () => PSGIM_COURSES,
  STUDENT_REGISTRY: () => STUDENT_REGISTRY,
  getTimetableForStudent: () => getTimetableForStudent,
  resolveExactRoom: () => resolveExactRoom
});
module.exports = __toCommonJS(psgimData_exports);

// src/data/psgimMasterStudents.ts
var PSGIM_MASTER_STUDENTS = {
  // BATCH A (62 Students)
  "D26AA01": { dRollNo: "D26AA01", collegeRollNo: "26AA04", name: "AKASH VARDHAMAN", batch: "A" },
  "D26AA02": { dRollNo: "D26AA02", collegeRollNo: "26AA27", name: "MITHUN K", batch: "A" },
  "D26AA03": { dRollNo: "D26AA03", collegeRollNo: "26AA38", name: "R NIVEDA", batch: "A" },
  "D26AA04": { dRollNo: "D26AA04", collegeRollNo: "26AA08", name: "DEVIKA BABU", batch: "A" },
  "D26AA05": { dRollNo: "D26AA05", collegeRollNo: "26AA03", name: "AJJAY MARSHAL R", batch: "A" },
  "D26AA06": { dRollNo: "D26AA06", collegeRollNo: "26AA33", name: "POOJA R", batch: "A" },
  "D26AA07": { dRollNo: "D26AA07", collegeRollNo: "26AA15", name: "HARISH KAARTHIK C S", batch: "A" },
  "D26AA08": { dRollNo: "D26AA08", collegeRollNo: "26AA37", name: "PRIYADHARSHCINI L", batch: "A" },
  "D26AA09": { dRollNo: "D26AA09", collegeRollNo: "26AA22", name: "K RAJESWARI", batch: "A" },
  "D26AA10": { dRollNo: "D26AA10", collegeRollNo: "26AA24", name: "KANISHKA SUNDARESAN", batch: "A" },
  "D26AA11": { dRollNo: "D26AA11", collegeRollNo: "26AA39", name: "RAAMPRASANTH R", batch: "A" },
  "D26AA12": { dRollNo: "D26AA12", collegeRollNo: "26AA10", name: "GOPIKA K", batch: "A" },
  "D26AA13": { dRollNo: "D26AA13", collegeRollNo: "26AA34", name: "POOJA VARSINEE P", batch: "A" },
  "D26AA14": { dRollNo: "D26AA14", collegeRollNo: "26AA35", name: "PRAKASH VELLINGIRI G", batch: "A" },
  "D26AA15": { dRollNo: "D26AA15", collegeRollNo: "26AA36", name: "PRITHIVE RAJ M", batch: "A" },
  "D26AA16": { dRollNo: "D26AA16", collegeRollNo: "26AA18", name: "HARSHAVARDHAN A", batch: "A" },
  "D26AA17": { dRollNo: "D26AA17", collegeRollNo: "26AA02", name: "AISWARYA MENON", batch: "A" },
  "D26AA18": { dRollNo: "D26AA18", collegeRollNo: "26AA46", name: "SANJANA S C", batch: "A" },
  "D26AA19": { dRollNo: "D26AA19", collegeRollNo: "26AA51", name: "SRIVARSHINI M G", batch: "A" },
  "D26AA20": { dRollNo: "D26AA20", collegeRollNo: "26AA41", name: "RITIKA S", batch: "A" },
  "D26AA21": { dRollNo: "D26AA21", collegeRollNo: "26AA53", name: "SUBASH MOHAN B", batch: "A" },
  "D26AA22": { dRollNo: "D26AA22", collegeRollNo: "26AA47", name: "SANTHOSH SRINIVAS R", batch: "A" },
  "D26AA23": { dRollNo: "D26AA23", collegeRollNo: "26AA52", name: "SUBA VIDHYUT R", batch: "A" },
  "D26AA24": { dRollNo: "D26AA24", collegeRollNo: "26AA58", name: "VASANTHAKUMAR R", batch: "A" },
  "D26AA26": { dRollNo: "D26AA26", collegeRollNo: "26AA23", name: "KAMALISHREE U S", batch: "A" },
  "D26AA27": { dRollNo: "D26AA27", collegeRollNo: "26AA01", name: "A R SRISHAA", batch: "A" },
  "D26AA28": { dRollNo: "D26AA28", collegeRollNo: "26AA42", name: "ROSHINI G", batch: "A" },
  "D26AA29": { dRollNo: "D26AA29", collegeRollNo: "26AA05", name: "ANUSHREE R", batch: "A" },
  "D26AA30": { dRollNo: "D26AA30", collegeRollNo: "26AA30", name: "NISHAANTH K", batch: "A" },
  "D26AA31": { dRollNo: "D26AA31", collegeRollNo: "26AA56", name: "SUSHMITHA KUMARESAN", batch: "A" },
  "D26AA32": { dRollNo: "D26AA32", collegeRollNo: "26AA28", name: "MOHAMMED OMER MUSSARAF R", batch: "A" },
  "D26AA33": { dRollNo: "D26AA33", collegeRollNo: "26AA13", name: "HARINIKA UDAYAKUMAR", batch: "A" },
  "D26AA34": { dRollNo: "D26AA34", collegeRollNo: "26AA55", name: "SURYA NARAYANAN R", batch: "A" },
  "D26AA35": { dRollNo: "D26AA35", collegeRollNo: "26AA16", name: "HARISH RAJ S", batch: "A" },
  "D26AA36": { dRollNo: "D26AA36", collegeRollNo: "26AA20", name: "ISMAIL R", batch: "A" },
  "D26AA37": { dRollNo: "D26AA37", collegeRollNo: "26AA54", name: "SUMAA BARATHI M", batch: "A" },
  "D26AA38": { dRollNo: "D26AA38", collegeRollNo: "26AA57", name: "V NIKETHANA SHRI", batch: "A" },
  "D26AA39": { dRollNo: "D26AA39", collegeRollNo: "26AA61", name: "VISHAL K S", batch: "A" },
  "D26AA40": { dRollNo: "D26AA40", collegeRollNo: "26AA59", name: "VIJAY KRISHNARAJ B K", batch: "A" },
  "D26AA41": { dRollNo: "D26AA41", collegeRollNo: "26AA14", name: "HARISH K", batch: "A" },
  "D26AA42": { dRollNo: "D26AA42", collegeRollNo: "26AA21", name: "JACKULIN CLARA SUBIKSHA R", batch: "A" },
  "D26AA43": { dRollNo: "D26AA43", collegeRollNo: "26AA45", name: "SANJAI S", batch: "A" },
  "D26AA44": { dRollNo: "D26AA44", collegeRollNo: "26AA48", name: "SHALINI K", batch: "A" },
  "D26AA45": { dRollNo: "D26AA45", collegeRollNo: "26AA06", name: "BARANIDHARAN VA", batch: "A" },
  "D26AA46": { dRollNo: "D26AA46", collegeRollNo: "26AA60", name: "VISALINI S", batch: "A" },
  "D26AA47": { dRollNo: "D26AA47", collegeRollNo: "26AA44", name: "SAGARI KRISHNAN", batch: "A" },
  "D26AA48": { dRollNo: "D26AA48", collegeRollNo: "26AA32", name: "NITHYASHREE G", batch: "A" },
  "D26AA49": { dRollNo: "D26AA49", collegeRollNo: "26AA19", name: "HARSHAVARDHAN B C", batch: "A" },
  "D26AA50": { dRollNo: "D26AA50", collegeRollNo: "26AA49", name: "SHARMILA BEGAM A", batch: "A" },
  "D26AA51": { dRollNo: "D26AA51", collegeRollNo: "26AA31", name: "NITHISH KUMAR R", batch: "A" },
  "D26AA52": { dRollNo: "D26AA52", collegeRollNo: "26AA29", name: "MUHILAN JEFRYRAJ M", batch: "A" },
  "D26AA53": { dRollNo: "D26AA53", collegeRollNo: "26AA09", name: "GANESH PRAVEEN V", batch: "A" },
  "D26AA54": { dRollNo: "D26AA54", collegeRollNo: "26AA11", name: "GOWTHAM S", batch: "A" },
  "D26AA55": { dRollNo: "D26AA55", collegeRollNo: "26AA25", name: "KANISHKKA R", batch: "A" },
  "D26AA56": { dRollNo: "D26AA56", collegeRollNo: "26AA26", name: "LINGESH G", batch: "A" },
  "D26AA57": { dRollNo: "D26AA57", collegeRollNo: "26AA12", name: "HARAN J", batch: "A" },
  "D26AA58": { dRollNo: "D26AA58", collegeRollNo: "26AA17", name: "HARISHWAR MS", batch: "A" },
  "D26AA59": { dRollNo: "D26AA59", collegeRollNo: "26AA50", name: "SIVAHARSHINI P", batch: "A" },
  "D26AA60": { dRollNo: "D26AA60", collegeRollNo: "26AA40", name: "RAKESH R", batch: "A" },
  "D26AA61": { dRollNo: "D26AA61", collegeRollNo: "26AA62", name: "VISHWADIKA G", batch: "A" },
  "D26AA62": { dRollNo: "D26AA62", collegeRollNo: "26AA43", name: "SADHIKA MUGUNDAN", batch: "A" },
  "D26AA63": { dRollNo: "D26AA63", collegeRollNo: "26AA07", name: "DARSHAN M S", batch: "A" },
  // BATCH B (63 Students)
  "D26AB01": { dRollNo: "D26AB01", collegeRollNo: "26AB33", name: "MUKTHA MATHI S", batch: "B", dob: "2005-02-13", dobPassword: "13FEB05", bloodGroup: "B +ve" },
  "D26AB02": { dRollNo: "D26AB02", collegeRollNo: "26AB18", name: "GIFTY SHARON K", batch: "B", dob: "2001-08-05", dobPassword: "05AUG01", bloodGroup: "B +ve" },
  "D26AB03": { dRollNo: "D26AB03", collegeRollNo: "26AB19", name: "GOKUL NANDHAN VENUGOPAL", batch: "B", dob: "2005-05-16", dobPassword: "16MAY05", bloodGroup: "B +ve" },
  "D26AB04": { dRollNo: "D26AB04", collegeRollNo: "26AB13", name: "DHAARANI G", batch: "B", dob: "2004-10-15", dobPassword: "15OCT04", bloodGroup: "AB +ve" },
  "D26AB05": { dRollNo: "D26AB05", collegeRollNo: "26AB12", name: "DEVDARSHAN V", batch: "B", dob: "2005-12-13", dobPassword: "13DEC05", bloodGroup: "B +ve" },
  "D26AB06": { dRollNo: "D26AB06", collegeRollNo: "26AB30", name: "MIRTHIKA S N", batch: "B", dob: "2002-03-12", dobPassword: "12MAR02", bloodGroup: "A1 +ve" },
  "D26AB07": { dRollNo: "D26AB07", collegeRollNo: "26AB04", name: "AMRUTHA SIVAANI", batch: "B", dob: "2002-01-24", dobPassword: "24JAN02", bloodGroup: "O +ve" },
  "D26AB08": { dRollNo: "D26AB08", collegeRollNo: "26AB34", name: "NEVEDHA B", batch: "B", dob: "2004-08-24", dobPassword: "24AUG04", bloodGroup: "B +ve" },
  "D26AB09": { dRollNo: "D26AB09", collegeRollNo: "26AB43", name: "RAGHUL K B", batch: "B", dob: "2003-07-08", dobPassword: "08JUL03", bloodGroup: "B +ve" },
  "D26AB10": { dRollNo: "D26AB10", collegeRollNo: "26AB16", name: "FERMI DAVISH J", batch: "B", dob: "2003-08-26", dobPassword: "26AUG03", bloodGroup: "A +ve" },
  "D26AB11": { dRollNo: "D26AB11", collegeRollNo: "26AB28", name: "KRISHNA SUBRAMANIAN", batch: "B", dob: "2004-04-23", dobPassword: "23APR04", bloodGroup: "B +ve" },
  "D26AB12": { dRollNo: "D26AB12", collegeRollNo: "26AB29", name: "MATHUMITHA M", batch: "B", dob: "2006-01-26", dobPassword: "26JAN06", bloodGroup: "A +ve" },
  "D26AB13": { dRollNo: "D26AB13", collegeRollNo: "26AB24", name: "KARNAM HARISRIYA NAIDU", batch: "B", dob: "2003-11-15", dobPassword: "15NOV03", bloodGroup: "A +ve" },
  "D26AB15": { dRollNo: "D26AB15", collegeRollNo: "26AB39", name: "PRAVEEN J", batch: "B", dob: "2003-07-13", dobPassword: "13JUL03", bloodGroup: "B +ve" },
  "D26AB16": { dRollNo: "D26AB16", collegeRollNo: "26AB48", name: "ROKITH S", batch: "B", dob: "2002-12-29", dobPassword: "29DEC02", bloodGroup: "O +ve" },
  "D26AB17": { dRollNo: "D26AB17", collegeRollNo: "26AB25", name: "KARTHIKEYAN S", batch: "B", dob: "2003-11-01", dobPassword: "01NOV03", bloodGroup: "O +ve" },
  "D26AB18": { dRollNo: "D26AB18", collegeRollNo: "26AB47", name: "RITIKA M", batch: "B", dob: "2002-12-09", dobPassword: "09DEC02", bloodGroup: "B +ve" },
  "D26AB19": { dRollNo: "D26AB19", collegeRollNo: "26AB50", name: "SANJANA K", batch: "B", dob: "2005-06-24", dobPassword: "24JUN05", bloodGroup: "A +ve" },
  "D26AB20": { dRollNo: "D26AB20", collegeRollNo: "26AB57", name: "SRINISAMHITAA V S", batch: "B", dob: "2004-10-27", dobPassword: "27OCT04", bloodGroup: "B +ve" },
  "D26AB21": { dRollNo: "D26AB21", collegeRollNo: "26AB41", name: "PRIYADHARSHAN R", batch: "B", dob: "2003-08-07", dobPassword: "07AUG03", bloodGroup: "O -ve" },
  "D26AB22": { dRollNo: "D26AB22", collegeRollNo: "26AB54", name: "SNIKTHA S", batch: "B", dob: "2005-10-06", dobPassword: "06OCT05", bloodGroup: "AB +ve" },
  "D26AB23": { dRollNo: "D26AB23", collegeRollNo: "26AB53", name: "SHASMITHA M R", batch: "B", dob: "2005-11-27", dobPassword: "27NOV05", bloodGroup: "O +ve" },
  "D26AB24": { dRollNo: "D26AB24", collegeRollNo: "26AB56", name: "SRINIDHI R", batch: "B", dob: "2005-05-30", dobPassword: "30MAY05", bloodGroup: "O +ve" },
  "D26AB25": { dRollNo: "D26AB25", collegeRollNo: "26AB36", name: "PRABHAKAR VL", batch: "B", dob: "2005-06-15", dobPassword: "15JUN05", bloodGroup: "B +ve" },
  "D26AB26": { dRollNo: "D26AB26", collegeRollNo: "26AB59", name: "SUWETHA S", batch: "B", dob: "2003-06-16", dobPassword: "16JUN03", bloodGroup: "A1 +ve" },
  "D26AB27": { dRollNo: "D26AB27", collegeRollNo: "26AB45", name: "RHOSHINIEE R", batch: "B", dob: "2005-09-08", dobPassword: "08SEP05", bloodGroup: "B +ve" },
  "D26AB28": { dRollNo: "D26AB28", collegeRollNo: "26AB51", name: "SARAVANA SELVA P", batch: "B", dob: "2005-02-24", dobPassword: "24FEB05", bloodGroup: "B +ve" },
  "D26AB29": { dRollNo: "D26AB29", collegeRollNo: "26AB49", name: "SANDHYA SREE M", batch: "B", dob: "2005-11-10", dobPassword: "10NOV05", bloodGroup: "A1 +ve" },
  "D26AB30": { dRollNo: "D26AB30", collegeRollNo: "26AB07", name: "ANJALI V", batch: "B", dob: "2005-08-29", dobPassword: "29AUG05", bloodGroup: "B +ve" },
  "D26AB31": { dRollNo: "D26AB31", collegeRollNo: "26AB55", name: "SREEDARSUNYAA U A", batch: "B", dob: "2005-09-04", dobPassword: "04SEP05", bloodGroup: "B +ve" },
  "D26AB32": { dRollNo: "D26AB32", collegeRollNo: "26AB06", name: "ANEEQUA S", batch: "B", dob: "2005-08-08", dobPassword: "08AUG05", bloodGroup: "A +ve" },
  "D26AB33": { dRollNo: "D26AB33", collegeRollNo: "26AB17", name: "G V JANICE PREETHY", batch: "B", dob: "1998-06-13", dobPassword: "13JUN98", bloodGroup: "AB +ve" },
  "D26AB34": { dRollNo: "D26AB34", collegeRollNo: "26AB31", name: "MONIKHA S", batch: "B", dob: "2003-11-19", dobPassword: "19NOV03", bloodGroup: "O +ve" },
  "D26AB35": { dRollNo: "D26AB35", collegeRollNo: "26AB27", name: "KIVAND RAJAN N R", batch: "B", dob: "2003-07-15", dobPassword: "15JUL03", bloodGroup: "A1 +ve" },
  "D26AB36": { dRollNo: "D26AB36", collegeRollNo: "26AB01", name: "ABINAYA M", batch: "B", dob: "2006-03-25", dobPassword: "25MAR06", bloodGroup: "AB -ve" },
  "D26AB37": { dRollNo: "D26AB37", collegeRollNo: "26AB26", name: "KEERTHI VASEN D", batch: "B", dob: "2000-12-21", dobPassword: "21DEC00", bloodGroup: "B +ve" },
  "D26AB38": { dRollNo: "D26AB38", collegeRollNo: "26AB10", name: "ASHITHA SANDRIN A", batch: "B", dob: "2002-08-31", dobPassword: "31AUG02", bloodGroup: "O +ve" },
  "D26AB39": { dRollNo: "D26AB39", collegeRollNo: "26AB22", name: "HARINI V", batch: "B", dob: "2005-01-24", dobPassword: "24JAN05", bloodGroup: "AB +ve" },
  "D26AB40": { dRollNo: "D26AB40", collegeRollNo: "26AB37", name: "PRADEEP C M", batch: "B", dob: "2003-07-06", dobPassword: "06JUL03", bloodGroup: "A +ve" },
  "D26AB41": { dRollNo: "D26AB41", collegeRollNo: "26AB20", name: "GOWTHAM S", batch: "B", dob: "2004-12-01", dobPassword: "01DEC04", bloodGroup: "O +ve" },
  "D26AB42": { dRollNo: "D26AB42", collegeRollNo: "26AB63", name: "VISHNU S", batch: "B", dob: "2005-01-01", dobPassword: "01JAN05", bloodGroup: "B +ve" },
  "D26AB43": { dRollNo: "D26AB43", collegeRollNo: "26AB58", name: "SRISWETHA S", batch: "B", dob: "2004-04-04", dobPassword: "04APR04", bloodGroup: "B +ve" },
  "D26AB44": { dRollNo: "D26AB44", collegeRollNo: "26AB38", name: "PRASANYA A", batch: "B", dob: "2005-10-30", dobPassword: "30OCT05", bloodGroup: "B +ve" },
  "D26AB45": { dRollNo: "D26AB45", collegeRollNo: "26AB42", name: "R KRISHNA", batch: "B", dob: "2003-11-11", dobPassword: "11NOV03", bloodGroup: "A +ve" },
  "D26AB46": { dRollNo: "D26AB46", collegeRollNo: "26AB62", name: "VIKASH KUMAR K S", batch: "B", dob: "2002-01-03", dobPassword: "03JAN02", bloodGroup: "O +ve" },
  "D26AB47": { dRollNo: "D26AB47", collegeRollNo: "26AB61", name: "VAANMUHIL JAYAPRAKASH MANIYAMMAI", batch: "B", dob: "2004-01-04", dobPassword: "04JAN04", bloodGroup: "O +ve" },
  "D26AB48": { dRollNo: "D26AB48", collegeRollNo: "26AB44", name: "RAVICHANDRAN R", batch: "B", dob: "2005-04-24", dobPassword: "24APR05", bloodGroup: "O +ve" },
  "D26AB49": { dRollNo: "D26AB49", collegeRollNo: "26AB40", name: "PRAVEEN J A", batch: "B", dob: "2004-12-12", dobPassword: "12DEC04", bloodGroup: "B +ve" },
  "D26AB50": { dRollNo: "D26AB50", collegeRollNo: "26AB23", name: "HARISRUTHI J K", batch: "B", dob: "2004-09-09", dobPassword: "09SEP04", bloodGroup: "B +ve" },
  "D26AB51": { dRollNo: "D26AB51", collegeRollNo: "26AB35", name: "PADMINI S J", batch: "B", dob: "2005-11-06", dobPassword: "06NOV05", bloodGroup: "A +ve" },
  "D26AB52": { dRollNo: "D26AB52", collegeRollNo: "26AB21", name: "GOWTHAM S", batch: "B", dob: "2002-12-23", dobPassword: "23DEC02", bloodGroup: "B +ve" },
  "D26AB53": { dRollNo: "D26AB53", collegeRollNo: "26AB32", name: "MUKESH KUMAR S", batch: "B", dob: "2005-05-25", dobPassword: "25MAY05", bloodGroup: "B +ve" },
  "D26AB54": { dRollNo: "D26AB54", collegeRollNo: "26AB14", name: "DIVIT D S", batch: "B", dob: "2005-09-01", dobPassword: "01SEP05", bloodGroup: "B +ve" },
  "D26AB55": { dRollNo: "D26AB55", collegeRollNo: "26AB60", name: "SWETHA K", batch: "B", dob: "2004-07-04", dobPassword: "04JUL04", bloodGroup: "A1 +ve" },
  "D26AB56": { dRollNo: "D26AB56", collegeRollNo: "26AB05", name: "AMULYA P", batch: "B", dob: "2000-11-08", dobPassword: "08NOV00", bloodGroup: "O +ve" },
  "D26AB57": { dRollNo: "D26AB57", collegeRollNo: "26AB03", name: "AFRIN NIQMATHULLAH A", batch: "B", dob: "2004-03-14", dobPassword: "14MAR04", bloodGroup: "O +ve" },
  "D26AB58": { dRollNo: "D26AB58", collegeRollNo: "26AB15", name: "DIVYABHARATHI P", batch: "B", dob: "2002-05-25", dobPassword: "25MAY02", bloodGroup: "O +ve" },
  "D26AB59": { dRollNo: "D26AB59", collegeRollNo: "26AB02", name: "ABISHEK S", batch: "B", dob: "2004-11-21", dobPassword: "21NOV04", bloodGroup: "B +ve" },
  "D26AB60": { dRollNo: "D26AB60", collegeRollNo: "26AB52", name: "SASMITA G S", batch: "B", dob: "2005-06-08", dobPassword: "08JUN05", bloodGroup: "B +ve" },
  "D26AB61": { dRollNo: "D26AB61", collegeRollNo: "26AB46", name: "RITHANYA S", batch: "B", dob: "2006-03-17", dobPassword: "17MAR06", bloodGroup: "B -ve" },
  "D26AB62": { dRollNo: "D26AB62", collegeRollNo: "26AB08", name: "ANUSREE O", batch: "B", dob: "2006-09-12", dobPassword: "12SEP06", bloodGroup: "O +ve" },
  "D26AB63": { dRollNo: "D26AB63", collegeRollNo: "26AB09", name: "ARVIND P", batch: "B", dob: "2005-08-31", dobPassword: "31AUG05", bloodGroup: "O +ve" },
  "D26AB64": { dRollNo: "D26AB64", collegeRollNo: "26AB11", name: "AVANTHIKA PRABAKARAN", batch: "B", dob: "2005-06-12", dobPassword: "12JUN05", bloodGroup: "O +ve" },
  // BATCH C (62 Students)
  "D26AC01": { dRollNo: "D26AC01", collegeRollNo: "26AC09", name: "DHARSHINE E H", batch: "C" },
  "D26AC02": { dRollNo: "D26AC02", collegeRollNo: "26AC19", name: "JEGADHARANI A", batch: "C" },
  "D26AC03": { dRollNo: "D26AC03", collegeRollNo: "26AC17", name: "IJAAZ AJMAL F", batch: "C" },
  "D26AC04": { dRollNo: "D26AC04", collegeRollNo: "26AC43", name: "SAI SUBHIKSHA B", batch: "C" },
  "D26AC05": { dRollNo: "D26AC05", collegeRollNo: "26AC28", name: "NADAR AKSHAYA KARTHEESAN ANILVENI", batch: "C" },
  "D26AC06": { dRollNo: "D26AC06", collegeRollNo: "26AC13", name: "DURGESH R S", batch: "C" },
  "D26AC07": { dRollNo: "D26AC07", collegeRollNo: "26AC56", name: "SURYA V S", batch: "C" },
  "D26AC08": { dRollNo: "D26AC08", collegeRollNo: "26AC05", name: "ATHMIKA A", batch: "C" },
  "D26AC09": { dRollNo: "D26AC09", collegeRollNo: "26AC37", name: "R S MAMADHIE SARA", batch: "C" },
  "D26AC10": { dRollNo: "D26AC10", collegeRollNo: "26AC33", name: "PRABODHINI A", batch: "C" },
  "D26AC11": { dRollNo: "D26AC11", collegeRollNo: "26AC18", name: "IRENE THOMAS", batch: "C" },
  "D26AC12": { dRollNo: "D26AC12", collegeRollNo: "26AC22", name: "M DEEKSHITHA", batch: "C" },
  "D26AC13": { dRollNo: "D26AC13", collegeRollNo: "26AC26", name: "MOHANA SHRI R E", batch: "C" },
  "D26AC14": { dRollNo: "D26AC14", collegeRollNo: "26AC34", name: "PRANYASAKTHIVEL K", batch: "C" },
  "D26AC15": { dRollNo: "D26AC15", collegeRollNo: "26AC30", name: "NANDHAKUMAR M", batch: "C" },
  "D26AC16": { dRollNo: "D26AC16", collegeRollNo: "26AC39", name: "RHENIUS A", batch: "C" },
  "D26AC17": { dRollNo: "D26AC17", collegeRollNo: "26AC20", name: "KRISHNAGANTH R", batch: "C" },
  "D26AC18": { dRollNo: "D26AC18", collegeRollNo: "26AC51", name: "SHREEYA R", batch: "C" },
  "D26AC19": { dRollNo: "D26AC19", collegeRollNo: "26AC42", name: "S SWATHI", batch: "C" },
  "D26AC20": { dRollNo: "D26AC20", collegeRollNo: "26AC53", name: "SINDHU S", batch: "C" },
  "D26AC21": { dRollNo: "D26AC21", collegeRollNo: "26AC47", name: "SAMARTH J NAIR", batch: "C" },
  "D26AC22": { dRollNo: "D26AC22", collegeRollNo: "26AC55", name: "SRI KRISHNA KARTHIKEYAN M", batch: "C" },
  "D26AC23": { dRollNo: "D26AC23", collegeRollNo: "26AC52", name: "SHUBHYA KUMARI", batch: "C" },
  "D26AC24": { dRollNo: "D26AC24", collegeRollNo: "26AC40", name: "RITHANYA S", batch: "C" },
  "D26AC25": { dRollNo: "D26AC25", collegeRollNo: "26AC49", name: "SHERIL LINCY V", batch: "C" },
  "D26AC26": { dRollNo: "D26AC26", collegeRollNo: "26AC54", name: "SOUMYA S", batch: "C" },
  "D26AC27": { dRollNo: "D26AC27", collegeRollNo: "26AC59", name: "VINOTH S", batch: "C" },
  "D26AC28": { dRollNo: "D26AC28", collegeRollNo: "26AC58", name: "VAISU SIVAMBIGA R", batch: "C" },
  "D26AC29": { dRollNo: "D26AC29", collegeRollNo: "26AC62", name: "YOGADHARSHINI M", batch: "C" },
  "D26AC30": { dRollNo: "D26AC30", collegeRollNo: "26AC50", name: "SHREE VARSHINII M K", batch: "C" },
  "D26AC31": { dRollNo: "D26AC31", collegeRollNo: "26AC48", name: "SHABNA S", batch: "C" },
  "D26AC32": { dRollNo: "D26AC32", collegeRollNo: "26AC03", name: "ANUSRI A", batch: "C" },
  "D26AC33": { dRollNo: "D26AC33", collegeRollNo: "26AC45", name: "SAKTHIHA SRI V", batch: "C" },
  "D26AC34": { dRollNo: "D26AC34", collegeRollNo: "26AC12", name: "DIVESH S", batch: "C" },
  "D26AC35": { dRollNo: "D26AC35", collegeRollNo: "26AC46", name: "SALOMA JOYCELYN PRINCE", batch: "C" },
  "D26AC36": { dRollNo: "D26AC36", collegeRollNo: "26AC24", name: "MAHALAKSHMI K", batch: "C" },
  "D26AC37": { dRollNo: "D26AC37", collegeRollNo: "26AC08", name: "CHANDRAVEL S", batch: "C" },
  "D26AC38": { dRollNo: "D26AC38", collegeRollNo: "26AC06", name: "BALAJI V", batch: "C" },
  "D26AC39": { dRollNo: "D26AC39", collegeRollNo: "26AC29", name: "NANCY VIDHULA FRED V", batch: "C" },
  "D26AC40": { dRollNo: "D26AC40", collegeRollNo: "26AC44", name: "SAKTHI BALAJI S", batch: "C" },
  "D26AC41": { dRollNo: "D26AC41", collegeRollNo: "26AC61", name: "VISHNU KARTHICK K S", batch: "C" },
  "D26AC42": { dRollNo: "D26AC42", collegeRollNo: "26AC15", name: "HARSHINI A", batch: "C" },
  "D26AC43": { dRollNo: "D26AC43", collegeRollNo: "26AC07", name: "BHARATHRAM S R", batch: "C" },
  "D26AC44": { dRollNo: "D26AC44", collegeRollNo: "26AC32", name: "POOJAA G", batch: "C" },
  "D26AC45": { dRollNo: "D26AC45", collegeRollNo: "26AC38", name: "RAKSATHA K R", batch: "C" },
  "D26AC46": { dRollNo: "D26AC46", collegeRollNo: "26AC31", name: "NAVEEN CHERAN", batch: "C" },
  "D26AC47": { dRollNo: "D26AC47", collegeRollNo: "26AC27", name: "MUKESHKUMAR R", batch: "C" },
  "D26AC48": { dRollNo: "D26AC48", collegeRollNo: "26AC60", name: "VINOTHA S", batch: "C" },
  "D26AC49": { dRollNo: "D26AC49", collegeRollNo: "26AC23", name: "MAANVI VASHISTHA", batch: "C" },
  "D26AC50": { dRollNo: "D26AC50", collegeRollNo: "26AC35", name: "PRAVEENKUMAR P", batch: "C" },
  "D26AC51": { dRollNo: "D26AC51", collegeRollNo: "26AC02", name: "ANUJA T", batch: "C" },
  "D26AC52": { dRollNo: "D26AC52", collegeRollNo: "26AC10", name: "DHARUN ADITYA SENTHILKUMAR", batch: "C" },
  "D26AC54": { dRollNo: "D26AC54", collegeRollNo: "26AC57", name: "SWATHI S", batch: "C" },
  "D26AC55": { dRollNo: "D26AC55", collegeRollNo: "26AC01", name: "ABIKIRUTHIKA D", batch: "C" },
  "D26AC56": { dRollNo: "D26AC56", collegeRollNo: "26AC14", name: "HARISH RAGAVENDRA R", batch: "C" },
  "D26AC57": { dRollNo: "D26AC57", collegeRollNo: "26AC16", name: "HEMNARAYAN B", batch: "C" },
  "D26AC58": { dRollNo: "D26AC58", collegeRollNo: "26AC21", name: "LOKESH KUMAR S", batch: "C" },
  "D26AC59": { dRollNo: "D26AC59", collegeRollNo: "26AC25", name: "MOHAMMED RIFAI A", batch: "C" },
  "D26AC60": { dRollNo: "D26AC60", collegeRollNo: "26AC36", name: "PRITHIKA P J", batch: "C" },
  "D26AC61": { dRollNo: "D26AC61", collegeRollNo: "26AC11", name: "DHIGAMBARI A", batch: "C" },
  "D26AC62": { dRollNo: "D26AC62", collegeRollNo: "26AC41", name: "S KRISHNA KUMAR", batch: "C" },
  "D26AC63": { dRollNo: "D26AC63", collegeRollNo: "26AC04", name: "ARUN VIGNESWAR S K", batch: "C" },
  // BATCH D (65 Students)
  "D26AD01": { dRollNo: "D26AD01", collegeRollNo: "26AD28", name: "LOHIT DEVESHWAR S K", batch: "D" },
  "D26AD02": { dRollNo: "D26AD02", collegeRollNo: "26AD09", name: "ANANYA A", batch: "D" },
  "D26AD03": { dRollNo: "D26AD03", collegeRollNo: "26AD11", name: "ASWANTH RAAJHEN A", batch: "D" },
  "D26AD04": { dRollNo: "D26AD04", collegeRollNo: "26AD21", name: "HARSHINIPRIYA G", batch: "D" },
  "D26AD05": { dRollNo: "D26AD05", collegeRollNo: "26AD15", name: "DHATCHINA MOORTHI T A", batch: "D" },
  "D26AD06": { dRollNo: "D26AD06", collegeRollNo: "26AD14", name: "DHARSHINI V S", batch: "D" },
  "D26AD07": { dRollNo: "D26AD07", collegeRollNo: "26AD33", name: "NIRAIMATHI V", batch: "D" },
  "D26AD08": { dRollNo: "D26AD08", collegeRollNo: "26AD24", name: "KAYAL UDAYAMURUGAN", batch: "D" },
  "D26AD09": { dRollNo: "D26AD09", collegeRollNo: "26AD45", name: "RUPICKA A", batch: "D" },
  "D26AD10": { dRollNo: "D26AD10", collegeRollNo: "26AD19", name: "GURUPRASAD SIVAKUMAR", batch: "D" },
  "D26AD11": { dRollNo: "D26AD11", collegeRollNo: "26AD39", name: "RAHUL MAHADEVAN M", batch: "D" },
  "D26AD12": { dRollNo: "D26AD12", collegeRollNo: "26AD23", name: "KARTHIYAYINI M P", batch: "D" },
  "D26AD13": { dRollNo: "D26AD13", collegeRollNo: "26AD55", name: "SRUTHI B", batch: "D" },
  "D26AD14": { dRollNo: "D26AD14", collegeRollNo: "26AD61", name: "V SHRINIDHI", batch: "D" },
  "D26AD15": { dRollNo: "D26AD15", collegeRollNo: "26AD40", name: "RAMA IYYAPPA M", batch: "D" },
  "D26AD16": { dRollNo: "D26AD16", collegeRollNo: "26AD53", name: "SRINITHI RAVI", batch: "D" },
  "D26AD17": { dRollNo: "D26AD17", collegeRollNo: "26AD48", name: "SANJANA S", batch: "D" },
  "D26AD18": { dRollNo: "D26AD18", collegeRollNo: "26AD42", name: "RIDDHISA R", batch: "D" },
  "D26AD19": { dRollNo: "D26AD19", collegeRollNo: "26AD65", name: "VILASINI S", batch: "D" },
  "D26AD20": { dRollNo: "D26AD20", collegeRollNo: "26AD51", name: "SOBICKA VAIBAVY R S S", batch: "D" },
  "D26AD21": { dRollNo: "D26AD21", collegeRollNo: "26AD50", name: "SATHYA PRIYA R", batch: "D" },
  "D26AD22": { dRollNo: "D26AD22", collegeRollNo: "26AD60", name: "SURYA PRAKASH", batch: "D" },
  "D26AD23": { dRollNo: "D26AD23", collegeRollNo: "26AD46", name: "SAMPAUL VASANTH W", batch: "D" },
  "D26AD24": { dRollNo: "D26AD24", collegeRollNo: "26AD31", name: "MUKUND V", batch: "D" },
  "D26AD25": { dRollNo: "D26AD25", collegeRollNo: "26AD43", name: "RISHABH KUMAR MISHRA", batch: "D" },
  "D26AD26": { dRollNo: "D26AD26", collegeRollNo: "26AD44", name: "ROSHAN KRISHNA A L", batch: "D" },
  "D26AD27": { dRollNo: "D26AD27", collegeRollNo: "26AD02", name: "ABHISNEHA M S", batch: "D" },
  "D26AD28": { dRollNo: "D26AD28", collegeRollNo: "26AD64", name: "VIJAYRAGAVAN S", batch: "D" },
  "D26AD29": { dRollNo: "D26AD29", collegeRollNo: "26AD58", name: "SUBHASHREE T", batch: "D" },
  "D26AD30": { dRollNo: "D26AD30", collegeRollNo: "26AD56", name: "SUBA PRIYA R S", batch: "D" },
  "D26AD31": { dRollNo: "D26AD31", collegeRollNo: "26AD10", name: "ANUSH PRIYA S", batch: "D" },
  "D26AD32": { dRollNo: "D26AD32", collegeRollNo: "26AD57", name: "SUBHA SREE S P", batch: "D" },
  "D26AD33": { dRollNo: "D26AD33", collegeRollNo: "26AD49", name: "SARAN K M", batch: "D" },
  "D26AD34": { dRollNo: "D26AD34", collegeRollNo: "26AD13", name: "CIBI P", batch: "D" },
  "D26AD35": { dRollNo: "D26AD35", collegeRollNo: "26AD17", name: "FARHANA R", batch: "D" },
  "D26AD36": { dRollNo: "D26AD36", collegeRollNo: "26AD12", name: "ATHISH M", batch: "D" },
  "D26AD37": { dRollNo: "D26AD37", collegeRollNo: "26AD63", name: "VIJAY M", batch: "D" },
  "D26AD38": { dRollNo: "D26AD38", collegeRollNo: "26AD03", name: "ABINANDHANA B", batch: "D" },
  "D26AD39": { dRollNo: "D26AD39", collegeRollNo: "26AD06", name: "AISHWARYA R", batch: "D" },
  "D26AD40": { dRollNo: "D26AD40", collegeRollNo: "26AD07", name: "AJAI GOVIND P S", batch: "D" },
  "D26AD41": { dRollNo: "D26AD41", collegeRollNo: "26AD16", name: "EZHILAN O", batch: "D" },
  "D26AD42": { dRollNo: "D26AD42", collegeRollNo: "26AD08", name: "ANAND G", batch: "D" },
  "D26AD43": { dRollNo: "D26AD43", collegeRollNo: "26AD22", name: "JAI SARATH N", batch: "D" },
  "D26AD44": { dRollNo: "D26AD44", collegeRollNo: "26AD04", name: "ABINAYA K S", batch: "D" },
  "D26AD45": { dRollNo: "D26AD45", collegeRollNo: "26AD20", name: "HARINI E", batch: "D" },
  "D26AD46": { dRollNo: "D26AD46", collegeRollNo: "26AD34", name: "NIVETHITHADEVI B", batch: "D" },
  "D26AD47": { dRollNo: "D26AD47", collegeRollNo: "26AD35", name: "POOJITHA J", batch: "D" },
  "D26AD48": { dRollNo: "D26AD48", collegeRollNo: "26AD54", name: "SRIVIKKASH K", batch: "D" },
  "D26AD49": { dRollNo: "D26AD49", collegeRollNo: "26AD36", name: "PRIYANKAA K", batch: "D" },
  "D26AD50": { dRollNo: "D26AD50", collegeRollNo: "26AD38", name: "RAHUL I", batch: "D" },
  "D26AD51": { dRollNo: "D26AD51", collegeRollNo: "26AD29", name: "MAHALAKSHMI S", batch: "D" },
  "D26AD52": { dRollNo: "D26AD52", collegeRollNo: "26AD18", name: "GOKUL V", batch: "D" },
  "D26AD53": { dRollNo: "D26AD53", collegeRollNo: "26AD27", name: "LEKSHMIKAMATHY ARUL", batch: "D" },
  "D26AD54": { dRollNo: "D26AD54", collegeRollNo: "26AD26", name: "KIRUTHIKA N S", batch: "D" },
  "D26AD55": { dRollNo: "D26AD55", collegeRollNo: "26AD62", name: "VENKATESH PRASAD K", batch: "D" },
  "D26AD56": { dRollNo: "D26AD56", collegeRollNo: "26AD59", name: "SURIAYAA G", batch: "D" },
  "D26AD57": { dRollNo: "D26AD57", collegeRollNo: "26AD01", name: "ABDUL KADER AZHAR S", batch: "D" },
  "D26AD58": { dRollNo: "D26AD58", collegeRollNo: "26AD37", name: "RAGHUL GANDHI R", batch: "D" },
  "D26AD59": { dRollNo: "D26AD59", collegeRollNo: "26AD52", name: "SRI YASHWANTH RAGAVENDRA R", batch: "D" },
  "D26AD60": { dRollNo: "D26AD60", collegeRollNo: "26AD32", name: "NAVEENA R R", batch: "D" },
  "D26AD61": { dRollNo: "D26AD61", collegeRollNo: "26AD41", name: "RASHMIKA M", batch: "D" },
  "D26AD62": { dRollNo: "D26AD62", collegeRollNo: "26AD47", name: "SANDHIYA V J", batch: "D" },
  "D26AD63": { dRollNo: "D26AD63", collegeRollNo: "26AD30", name: "MITHILESH P", batch: "D" },
  "D26AD64": { dRollNo: "D26AD64", collegeRollNo: "26AD25", name: "KHAVYA S", batch: "D" },
  "D26AD65": { dRollNo: "D26AD65", collegeRollNo: "26AD05", name: "ABISHREE G", batch: "D" }
};
var STUDENTS_BY_NEW_ROLL = {};
var STUDENTS_BY_OLD_ROLL = PSGIM_MASTER_STUDENTS;
Object.values(PSGIM_MASTER_STUDENTS).forEach((student) => {
  if (student.collegeRollNo) {
    STUDENTS_BY_NEW_ROLL[student.collegeRollNo.toUpperCase()] = student;
  }
});
var ALL_COLLEGE_ROLL_NUMBERS = Object.keys(STUDENTS_BY_NEW_ROLL);
function getStudentByAnyRoll(inputRoll) {
  if (!inputRoll) return null;
  const clean = inputRoll.trim().toUpperCase();
  if (STUDENTS_BY_NEW_ROLL[clean]) {
    return STUDENTS_BY_NEW_ROLL[clean];
  }
  if (STUDENTS_BY_OLD_ROLL[clean]) {
    return STUDENTS_BY_OLD_ROLL[clean];
  }
  if (clean.startsWith("D")) {
    const withoutD = clean.substring(1);
    if (STUDENTS_BY_NEW_ROLL[withoutD]) return STUDENTS_BY_NEW_ROLL[withoutD];
  } else {
    const withD = "D" + clean;
    if (STUDENTS_BY_OLD_ROLL[withD]) return STUDENTS_BY_OLD_ROLL[withD];
  }
  return null;
}
function toNewRollNo(inputRoll) {
  const student = getStudentByAnyRoll(inputRoll);
  return student ? student.collegeRollNo : inputRoll.trim().toUpperCase();
}
function toOldRollNo(inputRoll) {
  const student = getStudentByAnyRoll(inputRoll);
  return student ? student.dRollNo : inputRoll.trim().toUpperCase();
}
function getMasterStudent(rollNo) {
  return getStudentByAnyRoll(rollNo);
}

// src/data/psgimData.ts
var PSGIM_COURSES = {
  MCOB: {
    code: "24GM11",
    title: "Management Concepts and Organizational Behaviour",
    shortForm: "MCOB",
    faculty: {
      1: "Dr. M. Kirupa Priyadarshini",
      2: "Dr. Vijaya Vardhan Manchala",
      3: "Dr. R. Indumathy",
      4: "Dr. N. Udayakumar"
    },
    halls: "101 / 109 / 401 / 405",
    color: "#3B82F6"
  },
  EDM: {
    code: "24GM12",
    title: "Economics for Decision Making",
    shortForm: "EDM",
    faculty: {
      1: "Dr. Sreeanandan",
      2: "Dr. Aiswarya D Pillai",
      3: "Dr. E. Sri Varshini",
      4: "Dr. Sreeanandan"
    },
    halls: "101 / 109 / 401 / 405",
    color: "#10B981"
  },
  ADM: {
    code: "24GM13",
    title: "Accounting for Decision Making",
    shortForm: "ADM",
    faculty: {
      1: "Dr. J. Nancy Christina",
      2: "Dr. D. Kavitha",
      3: "Dr. Nithya",
      4: "Dr. Aiswarya D Pillai"
    },
    halls: "101 / 109 / 401 / 405",
    color: "#3B82F6"
  },
  BS: {
    code: "24GM14",
    title: "Business Statistics",
    shortForm: "BS",
    faculty: {
      1: "Mr. T. Sathish",
      2: "Dr. J. Sekkizhar",
      3: "Dr. Ravi Shankar Jetti",
      4: "Mr. T. Sathish"
    },
    halls: "101 / 109 / 401 / 405",
    color: "#8B5CF6"
  },
  MC: {
    code: "24GM15",
    title: "Managerial Communication",
    shortForm: "MC",
    faculty: {
      1: "Dr. R. Deepa",
      2: "Dr. R. Indumathy",
      3: "Dr. E. Sri Varshini",
      4: "Dr. Chenna Upendra"
    },
    halls: "101 / 109 / 401 / 405",
    color: "#EC4899"
  },
  SSA: {
    code: "24GM16",
    title: "Spreadsheet Applications",
    shortForm: "SSA",
    faculty: {
      1: "Mr. G. Kangasabapathy",
      2: "Mr. Imayavendan",
      3: "Mr. G. Kangasabapathy",
      4: "Mr. Imayavendan"
    },
    halls: "401 / 405 / 101 / 109",
    color: "#06B6D4"
  },
  SSM: {
    code: "24GM18",
    title: "Social Sensitization for Managers",
    shortForm: "SSM",
    faculty: {
      1: "Dr. D. Kavitha",
      2: "Ms. C. Dhanya",
      3: "Ms. Kanagathara",
      4: "Dr. Venkatalakshmi"
    },
    halls: "101 / 109 / 401 / 405",
    color: "#14B8A6"
  },
  LA: {
    code: "24GM19",
    title: "Legal Aspects of Business",
    shortForm: "LA",
    faculty: {
      1: "Ms. C. Dhanya",
      2: "Ms. C. Dhanya",
      3: "Ms. C. Dhanya",
      4: "Dr. Firdaus Bashir"
    },
    halls: "101 / 109 / 401 / 405",
    color: "#6366F1"
  },
  SPORTS: {
    code: "SPORTS",
    title: "Physical Education & Sports (No Attendance)",
    shortForm: "SPORTS",
    faculty: {
      1: "Mr. Zakeer Khan",
      2: "Mr. Zakeer Khan",
      3: "Mr. Zakeer Khan",
      4: "Mr. Zakeer Khan"
    },
    halls: "Sports Ground",
    color: "#6366F1",
    noAttendance: true
  }
};
var MASTER_SCHEDULE = [
  // MONDAY
  { day: "Monday", startTime: "08:30", endTime: "10:20", course: "LA", applicableBatches: ["LA1"], defaultRoom: "LH-101" },
  { day: "Monday", startTime: "08:30", endTime: "10:20", course: "SSA", applicableBatches: ["SSA1", "SSA2"], defaultRoom: "LH-401/405" },
  { day: "Monday", startTime: "10:40", endTime: "12:30", course: "ADM", applicableBatches: ["ADM1", "ADM2", "ADM3", "ADM4"], defaultRoom: "LH-101/109/401/405" },
  { day: "Monday", startTime: "13:40", endTime: "15:30", course: "BS", applicableBatches: ["BS1", "BS2", "BS3"], defaultRoom: "LH-101/109/401" },
  { day: "Monday", startTime: "13:40", endTime: "15:30", course: "EDM", applicableBatches: ["EDM4"], defaultRoom: "LH-405" },
  { day: "Monday", startTime: "15:40", endTime: "16:35", course: "SSM", applicableBatches: ["SSM4"], defaultRoom: "LH-405" },
  { day: "Monday", startTime: "15:40", endTime: "16:35", course: "SPORTS", applicableBatches: ["SPORTS2"], defaultRoom: "Ground" },
  // TUESDAY
  { day: "Tuesday", startTime: "08:30", endTime: "10:20", course: "MCOB", applicableBatches: ["MCOB1", "MCOB2", "MCOB3", "MCOB4"], defaultRoom: "LH-101/109/401/405" },
  { day: "Tuesday", startTime: "10:40", endTime: "12:30", course: "EDM", applicableBatches: ["EDM1", "EDM2", "EDM3"], defaultRoom: "LH-101/109/401" },
  { day: "Tuesday", startTime: "10:40", endTime: "12:30", course: "BS", applicableBatches: ["BS4"], defaultRoom: "LH-405" },
  { day: "Tuesday", startTime: "13:40", endTime: "15:30", course: "MC", applicableBatches: ["MC1", "MC2", "MC3", "MC4"], defaultRoom: "LH-101/109/401/405" },
  { day: "Tuesday", startTime: "15:40", endTime: "16:35", course: "SSM", applicableBatches: ["SSM2"], defaultRoom: "LH-109" },
  { day: "Tuesday", startTime: "15:40", endTime: "16:35", course: "SPORTS", applicableBatches: ["SPORTS4"], defaultRoom: "Ground" },
  // WEDNESDAY
  { day: "Wednesday", startTime: "08:30", endTime: "10:20", course: "BS", applicableBatches: ["BS1", "BS2", "BS3"], defaultRoom: "LH-101/109/401" },
  { day: "Wednesday", startTime: "08:30", endTime: "10:20", course: "EDM", applicableBatches: ["EDM4"], defaultRoom: "LH-405" },
  { day: "Wednesday", startTime: "10:40", endTime: "12:30", course: "MCOB", applicableBatches: ["MCOB1", "MCOB2", "MCOB3", "MCOB4"], defaultRoom: "LH-101/109/401/405" },
  { day: "Wednesday", startTime: "13:40", endTime: "15:30", course: "SSA", applicableBatches: ["SSA3", "SSA4"], defaultRoom: "LH-101/109" },
  { day: "Wednesday", startTime: "15:40", endTime: "16:35", course: "SSM", applicableBatches: ["SSM1"], defaultRoom: "LH-101" },
  { day: "Wednesday", startTime: "15:40", endTime: "16:35", course: "SPORTS", applicableBatches: ["SPORTS3"], defaultRoom: "Ground" },
  // THURSDAY
  { day: "Thursday", startTime: "08:30", endTime: "10:20", course: "MC", applicableBatches: ["MC1", "MC2", "MC3", "MC4"], defaultRoom: "LH-101/109/401/405" },
  { day: "Thursday", startTime: "10:40", endTime: "12:30", course: "ADM", applicableBatches: ["ADM1", "ADM2", "ADM3", "ADM4"], defaultRoom: "LH-101/109/401/405" },
  { day: "Thursday", startTime: "13:40", endTime: "14:35", course: "MC", applicableBatches: ["MC1", "MC2", "MC3", "MC4"], defaultRoom: "LH-101/109/401/405" },
  { day: "Thursday", startTime: "14:35", endTime: "16:35", course: "CLUB", applicableBatches: ["*"], defaultRoom: "Auditorium / Clubs" },
  // FRIDAY
  { day: "Friday", startTime: "08:30", endTime: "10:20", course: "EDM", applicableBatches: ["EDM1", "EDM2", "EDM3"], defaultRoom: "LH-101/109/401" },
  { day: "Friday", startTime: "08:30", endTime: "10:20", course: "BS", applicableBatches: ["BS4"], defaultRoom: "LH-405" },
  { day: "Friday", startTime: "10:40", endTime: "12:30", course: "LA", applicableBatches: ["LA3", "LA4"], defaultRoom: "LH-401/405" },
  { day: "Friday", startTime: "10:40", endTime: "12:30", course: "SSA", applicableBatches: ["SSA3", "SSA4"], defaultRoom: "LH-101/109" },
  { day: "Friday", startTime: "13:40", endTime: "15:30", course: "SSA", applicableBatches: ["SSA1", "SSA2"], defaultRoom: "LH-401/405" },
  { day: "Friday", startTime: "13:40", endTime: "15:30", course: "LA", applicableBatches: ["LA2"], defaultRoom: "LH-109" },
  { day: "Friday", startTime: "15:40", endTime: "16:35", course: "SSM", applicableBatches: ["SSM3"], defaultRoom: "LH-401" },
  { day: "Friday", startTime: "15:40", endTime: "16:35", course: "SPORTS", applicableBatches: ["SPORTS1"], defaultRoom: "Ground" },
  // SATURDAY
  { day: "Saturday", startTime: "08:30", endTime: "12:30", course: "SSM", applicableBatches: ["SSM1", "SSM2", "SSM3", "SSM4"], defaultRoom: "SSM" },
  { day: "Saturday", startTime: "13:40", endTime: "16:35", course: "SSM", applicableBatches: ["SSM1", "SSM2", "SSM3", "SSM4"], defaultRoom: "SSM" }
];
var STUDENT_REGISTRY = {
  "D26AA01": {
    "rollNo": "D26AA01",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA02": {
    "rollNo": "D26AA02",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA03": {
    "rollNo": "D26AA03",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA04": {
    "rollNo": "D26AA04",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA05": {
    "rollNo": "D26AA05",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA06": {
    "rollNo": "D26AA06",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA07": {
    "rollNo": "D26AA07",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA08": {
    "rollNo": "D26AA08",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA09": {
    "rollNo": "D26AA09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA10": {
    "rollNo": "D26AA10",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA11": {
    "rollNo": "D26AA11",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA12": {
    "rollNo": "D26AA12",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA13": {
    "rollNo": "D26AA13",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA14": {
    "rollNo": "D26AA14",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA15": {
    "rollNo": "D26AA15",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA16": {
    "rollNo": "D26AA16",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA17": {
    "rollNo": "D26AA17",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA18": {
    "rollNo": "D26AA18",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA19": {
    "rollNo": "D26AA19",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA20": {
    "rollNo": "D26AA20",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA21": {
    "rollNo": "D26AA21",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA22": {
    "rollNo": "D26AA22",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA23": {
    "rollNo": "D26AA23",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA24": {
    "rollNo": "D26AA24",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA25": {
    "rollNo": "D26AA25",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA26": {
    "rollNo": "D26AA26",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA27": {
    "rollNo": "D26AA27",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA28": {
    "rollNo": "D26AA28",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA29": {
    "rollNo": "D26AA29",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA30": {
    "rollNo": "D26AA30",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA31": {
    "rollNo": "D26AA31",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA32": {
    "rollNo": "D26AA32",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA33": {
    "rollNo": "D26AA33",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA34": {
    "rollNo": "D26AA34",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA35": {
    "rollNo": "D26AA35",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA36": {
    "rollNo": "D26AA36",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA37": {
    "rollNo": "D26AA37",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA38": {
    "rollNo": "D26AA38",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA39": {
    "rollNo": "D26AA39",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA40": {
    "rollNo": "D26AA40",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA41": {
    "rollNo": "D26AA41",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA42": {
    "rollNo": "D26AA42",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA43": {
    "rollNo": "D26AA43",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA44": {
    "rollNo": "D26AA44",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA45": {
    "rollNo": "D26AA45",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA46": {
    "rollNo": "D26AA46",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA47": {
    "rollNo": "D26AA47",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA48": {
    "rollNo": "D26AA48",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA49": {
    "rollNo": "D26AA49",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA50": {
    "rollNo": "D26AA50",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA51": {
    "rollNo": "D26AA51",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA52": {
    "rollNo": "D26AA52",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA53": {
    "rollNo": "D26AA53",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA54": {
    "rollNo": "D26AA54",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA55": {
    "rollNo": "D26AA55",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA56": {
    "rollNo": "D26AA56",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA57": {
    "rollNo": "D26AA57",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA58": {
    "rollNo": "D26AA58",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA59": {
    "rollNo": "D26AA59",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA60": {
    "rollNo": "D26AA60",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM1",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AA62": {
    "rollNo": "D26AA62",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM1",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA2",
      "SPORTS": "SPORTS1"
    }
  },
  "D26AB01": {
    "rollNo": "D26AB01",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB02": {
    "rollNo": "D26AB02",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB03": {
    "rollNo": "D26AB03",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB04": {
    "rollNo": "D26AB04",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB05": {
    "rollNo": "D26AB05",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB06": {
    "rollNo": "D26AB06",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB07": {
    "rollNo": "D26AB07",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB08": {
    "rollNo": "D26AB08",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB09": {
    "rollNo": "D26AB09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB10": {
    "rollNo": "D26AB10",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB11": {
    "rollNo": "D26AB11",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB12": {
    "rollNo": "D26AB12",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB13": {
    "rollNo": "D26AB13",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB14": {
    "rollNo": "D26AB14",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB15": {
    "rollNo": "D26AB15",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB16": {
    "rollNo": "D26AB16",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB17": {
    "rollNo": "D26AB17",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB18": {
    "rollNo": "D26AB18",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB19": {
    "rollNo": "D26AB19",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB20": {
    "rollNo": "D26AB20",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB21": {
    "rollNo": "D26AB21",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB22": {
    "rollNo": "D26AB22",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB23": {
    "rollNo": "D26AB23",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB24": {
    "rollNo": "D26AB24",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB25": {
    "rollNo": "D26AB25",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB26": {
    "rollNo": "D26AB26",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB27": {
    "rollNo": "D26AB27",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB28": {
    "rollNo": "D26AB28",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB29": {
    "rollNo": "D26AB29",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB30": {
    "rollNo": "D26AB30",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB31": {
    "rollNo": "D26AB31",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB32": {
    "rollNo": "D26AB32",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB33": {
    "rollNo": "D26AB33",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB34": {
    "rollNo": "D26AB34",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB35": {
    "rollNo": "D26AB35",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB36": {
    "rollNo": "D26AB36",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB37": {
    "rollNo": "D26AB37",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB38": {
    "rollNo": "D26AB38",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB39": {
    "rollNo": "D26AB39",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB40": {
    "rollNo": "D26AB40",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB41": {
    "rollNo": "D26AB41",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB42": {
    "rollNo": "D26AB42",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB43": {
    "rollNo": "D26AB43",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB44": {
    "rollNo": "D26AB44",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB45": {
    "rollNo": "D26AB45",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB46": {
    "rollNo": "D26AB46",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB47": {
    "rollNo": "D26AB47",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB48": {
    "rollNo": "D26AB48",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB49": {
    "rollNo": "D26AB49",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB50": {
    "rollNo": "D26AB50",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB51": {
    "rollNo": "D26AB51",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB52": {
    "rollNo": "D26AB52",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB53": {
    "rollNo": "D26AB53",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB54": {
    "rollNo": "D26AB54",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB55": {
    "rollNo": "D26AB55",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB56": {
    "rollNo": "D26AB56",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB57": {
    "rollNo": "D26AB57",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB58": {
    "rollNo": "D26AB58",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB59": {
    "rollNo": "D26AB59",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB60": {
    "rollNo": "D26AB60",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB61": {
    "rollNo": "D26AB61",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM2",
      "BS": "BS1",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA1",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB62": {
    "rollNo": "D26AB62",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM2",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA2",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB63": {
    "rollNo": "D26AB63",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM2",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA3",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AB64": {
    "rollNo": "D26AB64",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM2",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA4",
      "SPORTS": "SPORTS2"
    }
  },
  "D26AC01": {
    "rollNo": "D26AC01",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC02": {
    "rollNo": "D26AC02",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC03": {
    "rollNo": "D26AC03",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC04": {
    "rollNo": "D26AC04",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC05": {
    "rollNo": "D26AC05",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC06": {
    "rollNo": "D26AC06",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC07": {
    "rollNo": "D26AC07",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC08": {
    "rollNo": "D26AC08",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC09": {
    "rollNo": "D26AC09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC10": {
    "rollNo": "D26AC10",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC11": {
    "rollNo": "D26AC11",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC12": {
    "rollNo": "D26AC12",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC13": {
    "rollNo": "D26AC13",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC14": {
    "rollNo": "D26AC14",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC15": {
    "rollNo": "D26AC15",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC16": {
    "rollNo": "D26AC16",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC17": {
    "rollNo": "D26AC17",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC18": {
    "rollNo": "D26AC18",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC19": {
    "rollNo": "D26AC19",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC20": {
    "rollNo": "D26AC20",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC21": {
    "rollNo": "D26AC21",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC22": {
    "rollNo": "D26AC22",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC23": {
    "rollNo": "D26AC23",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC24": {
    "rollNo": "D26AC24",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC25": {
    "rollNo": "D26AC25",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC26": {
    "rollNo": "D26AC26",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC27": {
    "rollNo": "D26AC27",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC28": {
    "rollNo": "D26AC28",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC29": {
    "rollNo": "D26AC29",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC30": {
    "rollNo": "D26AC30",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC31": {
    "rollNo": "D26AC31",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC32": {
    "rollNo": "D26AC32",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC33": {
    "rollNo": "D26AC33",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC34": {
    "rollNo": "D26AC34",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC35": {
    "rollNo": "D26AC35",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC36": {
    "rollNo": "D26AC36",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC37": {
    "rollNo": "D26AC37",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC38": {
    "rollNo": "D26AC38",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC39": {
    "rollNo": "D26AC39",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC40": {
    "rollNo": "D26AC40",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC41": {
    "rollNo": "D26AC41",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC42": {
    "rollNo": "D26AC42",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC43": {
    "rollNo": "D26AC43",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC44": {
    "rollNo": "D26AC44",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC45": {
    "rollNo": "D26AC45",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC46": {
    "rollNo": "D26AC46",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC47": {
    "rollNo": "D26AC47",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC48": {
    "rollNo": "D26AC48",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC49": {
    "rollNo": "D26AC49",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC50": {
    "rollNo": "D26AC50",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC51": {
    "rollNo": "D26AC51",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC52": {
    "rollNo": "D26AC52",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC53": {
    "rollNo": "D26AC53",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC54": {
    "rollNo": "D26AC54",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC55": {
    "rollNo": "D26AC55",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC56": {
    "rollNo": "D26AC56",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC57": {
    "rollNo": "D26AC57",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC58": {
    "rollNo": "D26AC58",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC59": {
    "rollNo": "D26AC59",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AC60": {
    "rollNo": "D26AC60",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM3",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS3"
    }
  },
  "D26AD01": {
    "rollNo": "D26AD01",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD02": {
    "rollNo": "D26AD02",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD03": {
    "rollNo": "D26AD03",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD04": {
    "rollNo": "D26AD04",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD05": {
    "rollNo": "D26AD05",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD06": {
    "rollNo": "D26AD06",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD07": {
    "rollNo": "D26AD07",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD08": {
    "rollNo": "D26AD08",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD09": {
    "rollNo": "D26AD09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD10": {
    "rollNo": "D26AD10",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD11": {
    "rollNo": "D26AD11",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD12": {
    "rollNo": "D26AD12",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD13": {
    "rollNo": "D26AD13",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD14": {
    "rollNo": "D26AD14",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD15": {
    "rollNo": "D26AD15",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD16": {
    "rollNo": "D26AD16",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD17": {
    "rollNo": "D26AD17",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD18": {
    "rollNo": "D26AD18",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD19": {
    "rollNo": "D26AD19",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD20": {
    "rollNo": "D26AD20",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD21": {
    "rollNo": "D26AD21",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD22": {
    "rollNo": "D26AD22",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD23": {
    "rollNo": "D26AD23",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD24": {
    "rollNo": "D26AD24",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD25": {
    "rollNo": "D26AD25",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD26": {
    "rollNo": "D26AD26",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD27": {
    "rollNo": "D26AD27",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD28": {
    "rollNo": "D26AD28",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD29": {
    "rollNo": "D26AD29",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD30": {
    "rollNo": "D26AD30",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA4",
      "SSA": "SSA1",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD31": {
    "rollNo": "D26AD31",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD32": {
    "rollNo": "D26AD32",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD33": {
    "rollNo": "D26AD33",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD34": {
    "rollNo": "D26AD34",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD35": {
    "rollNo": "D26AD35",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD36": {
    "rollNo": "D26AD36",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD37": {
    "rollNo": "D26AD37",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD38": {
    "rollNo": "D26AD38",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD39": {
    "rollNo": "D26AD39",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD40": {
    "rollNo": "D26AD40",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD41": {
    "rollNo": "D26AD41",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD42": {
    "rollNo": "D26AD42",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD43": {
    "rollNo": "D26AD43",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD44": {
    "rollNo": "D26AD44",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD45": {
    "rollNo": "D26AD45",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA2",
      "SSA": "SSA3",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD46": {
    "rollNo": "D26AD46",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD47": {
    "rollNo": "D26AD47",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD48": {
    "rollNo": "D26AD48",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD49": {
    "rollNo": "D26AD49",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD50": {
    "rollNo": "D26AD50",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD51": {
    "rollNo": "D26AD51",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD52": {
    "rollNo": "D26AD52",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD53": {
    "rollNo": "D26AD53",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD54": {
    "rollNo": "D26AD54",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD55": {
    "rollNo": "D26AD55",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD56": {
    "rollNo": "D26AD56",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD57": {
    "rollNo": "D26AD57",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD58": {
    "rollNo": "D26AD58",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM4",
      "MC": "MC1",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD59": {
    "rollNo": "D26AD59",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA2",
      "SSA": "SSA4",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AD60": {
    "rollNo": "D26AD60",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM4",
      "MC": "MC4",
      "SSM": "SSM4",
      "BS": "BS4",
      "EDM": "EDM4",
      "LA": "LA4",
      "SSA": "SSA2",
      "SPORTS": "SPORTS4"
    }
  },
  "D26AE01": {
    "rollNo": "D26AE01",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM1",
      "MC": "MC2",
      "SSM": "",
      "BS": "BS1",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": ""
    }
  },
  "D26AE02": {
    "rollNo": "D26AE02",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM1",
      "MC": "MC1",
      "SSM": "",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": ""
    }
  },
  "D26AE03": {
    "rollNo": "D26AE03",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM1",
      "MC": "MC3",
      "SSM": "",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": ""
    }
  },
  "D26AE04": {
    "rollNo": "D26AE04",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM1",
      "MC": "MC4",
      "SSM": "",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": ""
    }
  },
  "D26AE05": {
    "rollNo": "D26AE05",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM2",
      "MC": "MC3",
      "SSM": "",
      "BS": "BS2",
      "EDM": "EDM1",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": ""
    }
  },
  "D26AE06": {
    "rollNo": "D26AE06",
    "batches": {
      "MCOB": "MCOB2",
      "ADM": "ADM2",
      "MC": "MC4",
      "SSM": "",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": ""
    }
  },
  "D26AE07": {
    "rollNo": "D26AE07",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM2",
      "MC": "MC2",
      "SSM": "",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": ""
    }
  },
  "D26AE08": {
    "rollNo": "D26AE08",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM2",
      "MC": "MC1",
      "SSM": "",
      "BS": "BS2",
      "EDM": "EDM3",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": ""
    }
  },
  "D26AE09": {
    "rollNo": "D26AE09",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM3",
      "MC": "MC2",
      "SSM": "",
      "BS": "BS3",
      "EDM": "EDM3",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": ""
    }
  },
  "D26AE11": {
    "rollNo": "D26AE11",
    "batches": {
      "MCOB": "MCOB3",
      "ADM": "ADM3",
      "MC": "MC3",
      "SSM": "",
      "BS": "BS2",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": ""
    }
  },
  "D26AE12": {
    "rollNo": "D26AE12",
    "batches": {
      "MCOB": "MCOB4",
      "ADM": "ADM3",
      "MC": "MC4",
      "SSM": "",
      "BS": "BS3",
      "EDM": "EDM1",
      "LA": "LA3",
      "SSA": "SSA1",
      "SPORTS": ""
    }
  },
  "D26AE13": {
    "rollNo": "D26AE13",
    "batches": {
      "MCOB": "MCOB1",
      "ADM": "ADM4",
      "MC": "MC3",
      "SSM": "",
      "BS": "BS1",
      "EDM": "EDM2",
      "LA": "LA1",
      "SSA": "SSA3",
      "SPORTS": ""
    }
  }
};
var ALL_ROLL_NUMBERS = Object.keys(STUDENT_REGISTRY);
function resolveExactRoom(course, groupNum, defaultRoom) {
  if (course === "SPORTS") return "Sports Ground";
  if (course === "CLUB") return "Auditorium / Clubs";
  if (defaultRoom && (defaultRoom.includes("ALPS") || defaultRoom === "SSM")) return "SSM";
  if (course === "SSA") {
    switch (groupNum) {
      case 1:
        return "LH-401";
      case 2:
        return "LH-405";
      case 3:
        return "LH-101";
      case 4:
        return "LH-109";
      default:
        return defaultRoom && !defaultRoom.includes("/") ? defaultRoom : "LH-101";
    }
  }
  switch (groupNum) {
    case 1:
      return "LH-101";
    case 2:
      return "LH-109";
    case 3:
      return "LH-401";
    case 4:
      return "LH-405";
    default:
      if (defaultRoom && !defaultRoom.includes("/")) return defaultRoom;
      return "LH-101";
  }
}
function getTimetableForStudent(rollNo) {
  const cleanRoll = (rollNo || "").toUpperCase();
  const oldRoll = toOldRollNo(cleanRoll);
  const newRoll = toNewRollNo(cleanRoll);
  const master = getMasterStudent(cleanRoll) || getMasterStudent(newRoll) || getMasterStudent(oldRoll);
  const student = STUDENT_REGISTRY[cleanRoll] || STUDENT_REGISTRY[oldRoll] || STUDENT_REGISTRY[newRoll];
  const batchLetter = master?.batch || (newRoll.length >= 5 ? newRoll.charAt(3) : "A");
  const sectionGroupNum = batchLetter === "B" ? 2 : batchLetter === "C" ? 3 : batchLetter === "D" ? 4 : 1;
  const studentBatches = student ? Object.values(student.batches).filter((b) => b && b.trim() !== "") : null;
  const filtered = MASTER_SCHEDULE.filter((slot) => {
    if (slot.applicableBatches.includes("*")) return true;
    if (studentBatches && studentBatches.length > 0) {
      return slot.applicableBatches.some((b) => studentBatches.includes(b));
    }
    const sectionTargetBatch = `${slot.course}${sectionGroupNum}`;
    return slot.applicableBatches.includes(sectionTargetBatch);
  });
  const seenTimes = /* @__PURE__ */ new Set();
  const uniqueSlots = filtered.filter((slot) => {
    const key = `${slot.day}_${slot.startTime}`;
    if (seenTimes.has(key)) return false;
    seenTimes.add(key);
    return true;
  });
  return uniqueSlots.map((slot, index) => {
    const course = PSGIM_COURSES[slot.course];
    let courseGroupNum = sectionGroupNum;
    if (student?.batches && student.batches[slot.course]) {
      const assignedBatch = student.batches[slot.course];
      const match = assignedBatch.match(/\d+$/);
      if (match) {
        courseGroupNum = parseInt(match[0], 10);
      }
    }
    const studentBatch = `${slot.course}${courseGroupNum}`;
    const facultyName = course?.faculty[courseGroupNum] || course?.faculty[sectionGroupNum] || (course?.faculty[1] || "Faculty");
    const specificRoom = resolveExactRoom(slot.course, courseGroupNum, slot.defaultRoom);
    return {
      id: `slot_${rollNo}_${slot.day}_${index}`,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      courseCode: course?.code || slot.course,
      courseTitle: course?.title || slot.course,
      shortForm: slot.course,
      batch: studentBatch,
      faculty: facultyName,
      room: specificRoom,
      color: course?.color || "#3B82F6"
    };
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ALL_ROLL_NUMBERS,
  MASTER_SCHEDULE,
  PSGIM_COURSES,
  STUDENT_REGISTRY,
  getTimetableForStudent,
  resolveExactRoom
});
