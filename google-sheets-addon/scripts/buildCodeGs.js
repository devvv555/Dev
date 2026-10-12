const fs = require('fs');
const path = require('path');

const students = JSON.parse(fs.readFileSync(path.join(__dirname, '../all_students.json'), 'utf8'));

const codeGsHead = `/**
 * ==============================================================================
 * ATTENDANCE MONITOR - GOOGLE SHEETS SYNC ADD-ON
 * ==============================================================================
 * Allows teachers and faculty to mark student attendance directly in Google Sheets
 * and upload the records directly into Firebase Firestore for the mobile app.
 *
 * Covers all 9 Semester 1 MBA Courses & all 4 Batches (A, B, C, D - 252 Students).
 * ==============================================================================
 */

// Default Firebase Configuration matching the Attendance Monitor App
var DEFAULT_FIREBASE_CONFIG = {
  projectId: "attendance-tracker-9e4f7",
  apiKey: "AIzaSyCTPCcfWLudZt_hEo1kH_esXsNw3p83zBk"
};

var COURSES = [
  { short: 'MCOB', code: '24GM11', title: 'Management Concepts and Organizational Behaviour' },
  { short: 'EDM', code: '24GM12', title: 'Economics for Decision Making' },
  { short: 'ADM', code: '24GM13', title: 'Accounting for Decision Making' },
  { short: 'BS', code: '24GM14', title: 'Business Statistics' },
  { short: 'MC', code: '24GM15', title: 'Managerial Communication' },
  { short: 'SSA', code: '24GM16', title: 'Spreadsheet Applications' },
  { short: 'SSM', code: '24GM18', title: 'Social Sensitization for Managers' },
  { short: 'LA', code: '24GM19', title: 'Legal Aspects of Business' },
  { short: 'SPORTS', code: 'SPORTS', title: 'Physical Education & Sports' }
];

/**
 * Creates custom menu when spreadsheet is opened
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📱 Attendance Monitor')
    .addItem('🚀 Upload Current Sheet to App', 'syncActiveSheetToFirebase')
    .addItem('🔍 Validate Attendance Data', 'validateActiveSheet')
    .addSeparator()
    .addSubMenu(ui.createMenu('📑 Generate Class Sheet')
      .addItem('Batch A - All 9 Courses', 'generateAllCoursesBatchA')
      .addItem('Batch B - All 9 Courses', 'generateAllCoursesBatchB')
      .addItem('Batch C - All 9 Courses', 'generateAllCoursesBatchC')
      .addItem('Batch D - All 9 Courses', 'generateAllCoursesBatchD')
      .addSeparator()
      .addItem('Quick Master Sheet (Batch A)', 'generateBatchAMaster')
      .addItem('Quick Master Sheet (Batch B)', 'generateBatchBMaster')
      .addItem('Quick Master Sheet (Batch C)', 'generateBatchCMaster')
      .addItem('Quick Master Sheet (Batch D)', 'generateBatchDMaster')
      .addItem('Cumulative Subject Totals Template', 'generateSubjectTotalsTemplate')
    )
    .addSeparator()
    .addItem('🧪 Test Firebase Connection', 'testFirebaseConnection')
    .addItem('⚙️ Configure Firebase Settings', 'configureFirebasePrompt')
    .addToUi();
}

function getFirebaseConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    projectId: props.getProperty('FIREBASE_PROJECT_ID') || DEFAULT_FIREBASE_CONFIG.projectId,
    apiKey: props.getProperty('FIREBASE_API_KEY') || DEFAULT_FIREBASE_CONFIG.apiKey
  };
}

function configureFirebasePrompt() {
  var ui = SpreadsheetApp.getUi();
  var config = getFirebaseConfig();

  var pResponse = ui.prompt(
    'Firebase Project ID',
    'Current: ' + config.projectId + '\\nEnter Project ID (or leave blank to keep current):',
    ui.ButtonSet.OK_CANCEL
  );
  if (pResponse.getSelectedButton() !== ui.Button.OK) return;
  var newProjectId = pResponse.getResponseText().trim() || config.projectId;

  var kResponse = ui.prompt(
    'Firebase Web API Key',
    'Enter API Key (or leave blank to keep current):',
    ui.ButtonSet.OK_CANCEL
  );
  if (kResponse.getSelectedButton() !== ui.Button.OK) return;
  var newApiKey = kResponse.getResponseText().trim() || config.apiKey;

  PropertiesService.getScriptProperties().setProperties({
    'FIREBASE_PROJECT_ID': newProjectId,
    'FIREBASE_API_KEY': newApiKey
  });

  ui.alert('✅ Configuration Saved', 'Firebase Project: ' + newProjectId, ui.ButtonSet.OK);
}

function testFirebaseConnection() {
  var ui = SpreadsheetApp.getUi();
  var config = getFirebaseConfig();
  var url = 'https://firestore.googleapis.com/v1/projects/' + config.projectId + '/databases/(default)/documents/students?pageSize=1&key=' + config.apiKey;

  try {
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var code = response.getResponseCode();
    if (code === 200) {
      ui.alert('✅ Connection Successful!', 'Connected to Firebase Project: ' + config.projectId, ui.ButtonSet.OK);
    } else {
      ui.alert('⚠️ Connection Test Notice', 'Received HTTP ' + code + ':\\n' + response.getContentText().substring(0, 300), ui.ButtonSet.OK);
    }
  } catch (err) {
    ui.alert('❌ Connection Failed', err.toString(), ui.ButtonSet.OK);
  }
}

function syncActiveSheetToFirebase() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var sheetName = sheet.getName();

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    ui.alert('Empty Sheet', 'No data found in sheet "' + sheetName + '". Please enter attendance records.', ui.ButtonSet.OK);
    return;
  }

  var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });

  var isCumulative = headers.indexOf('attended classes') !== -1 || headers.indexOf('attended') !== -1;
  var isPeriodSheet = headers.indexOf('status') !== -1 || headers.indexOf('attendance') !== -1 || headers.indexOf('status (p/a/od)') !== -1;

  if (isCumulative) {
    syncCumulativeTotals(sheet, data, headers);
  } else if (isPeriodSheet) {
    syncPeriodAttendance(sheet, data, headers);
  } else {
    ui.alert(
      'Unknown Format',
      'Could not detect standard attendance headers.\\nExpected columns like:\\n' +
      '• For Hourly: [Roll No, Status, Date, Subject Code]\\n' +
      '• For Subject Totals: [Roll No, Subject Code, Attended, Total]',
      ui.ButtonSet.OK
    );
  }
}

function syncPeriodAttendance(sheet, data, headers) {
  var ui = SpreadsheetApp.getUi();
  var colRoll = findHeaderIndex(headers, ['roll no', 'rollno', 'roll_no', 'student id', 'reg no']);
  var colStatus = findHeaderIndex(headers, ['status', 'attendance', 'present/absent', 'p/a', 'mark']);
  var colDate = findHeaderIndex(headers, ['date', 'class date']);
  var colSubject = findHeaderIndex(headers, ['subject code', 'subject', 'course code', 'course']);
  var colSlot = findHeaderIndex(headers, ['slot', 'slot id', 'period', 'period id', 'hour']);

  if (colRoll === -1 || colStatus === -1) {
    ui.alert('Missing Required Headers', 'Sheet must have at least "Roll No" and "Status" columns.', ui.ButtonSet.OK);
    return;
  }

  var config = getFirebaseConfig();
  var todayStr = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
  var successCount = 0;
  var errorList = [];

  SpreadsheetApp.getActiveSpreadsheet().toast('Starting sync to Firebase...', 'Attendance Sync', 5);

  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var rollNo = String(row[colRoll] || '').trim().toUpperCase();
    if (!rollNo) continue;

    var rawStatus = String(row[colStatus] || '').trim();
    var status = normalizeStatus(rawStatus);
    if (!status) continue;

    var rowDate = (colDate !== -1 && row[colDate]) ? formatCellDate(row[colDate]) : todayStr;
    var subjectCode = (colSubject !== -1 && row[colSubject]) ? String(row[colSubject]).trim() : '24GM11';
    var slotId = (colSlot !== -1 && row[colSlot]) ? String(row[colSlot]).trim() : 'period_1';

    var periodKey = rowDate + '_' + slotId + '_' + subjectCode;

    var recordPayload = {
      periodKey: periodKey,
      date: rowDate,
      slotId: slotId,
      subjectId: subjectCode,
      status: status,
      markedBy: 'teacher_google_sheet',
      recordedAt: new Date().getTime(),
      sheetSource: sheet.getName(),
      rowNumber: r + 1
    };

    var docPath = 'students/' + encodeURIComponent(rollNo) + '/periods/' + encodeURIComponent(periodKey);
    var ok = firestoreSetDoc(config, docPath, recordPayload);

    if (ok) {
      successCount++;
    } else {
      errorList.push('Row ' + (r + 1) + ' (' + rollNo + ')');
    }
  }

  firestoreCreateTeacherLog(config, {
    sheetName: sheet.getName(),
    type: 'PERIOD_ATTENDANCE',
    syncedRows: successCount,
    syncedAt: new Date().toISOString()
  });

  SpreadsheetApp.getActiveSpreadsheet().toast('Sync completed! ' + successCount + ' records uploaded.', 'Success', 6);

  var msg = '✅ Successfully synced ' + successCount + ' attendance records to the app!';
  if (errorList.length > 0) {
    msg += '\\n\\n⚠️ Failed for ' + errorList.length + ' rows:\\n' + errorList.slice(0, 5).join(', ') + (errorList.length > 5 ? '...' : '');
  }
  ui.alert('Sync Finished', msg, ui.ButtonSet.OK);
}

function syncCumulativeTotals(sheet, data, headers) {
  var ui = SpreadsheetApp.getUi();
  var colRoll = findHeaderIndex(headers, ['roll no', 'rollno', 'roll_no', 'student id']);
  var colSubject = findHeaderIndex(headers, ['subject code', 'subject', 'course code', 'course']);
  var colAttended = findHeaderIndex(headers, ['attended classes', 'attended', 'official attended', 'classes attended']);
  var colTotal = findHeaderIndex(headers, ['total classes', 'total', 'official total', 'classes conducted']);

  if (colRoll === -1 || colAttended === -1 || colTotal === -1) {
    ui.alert('Missing Headers', 'Sheet must have "Roll No", "Attended", and "Total" columns.', ui.ButtonSet.OK);
    return;
  }

  var config = getFirebaseConfig();
  var studentSubjectsMap = {};
  var successCount = 0;

  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var rollNo = String(row[colRoll] || '').trim().toUpperCase();
    if (!rollNo) continue;

    var subjectCode = (colSubject !== -1 && row[colSubject]) ? String(row[colSubject]).trim() : 'DEFAULT';
    var attended = Number(row[colAttended]) || 0;
    var total = Number(row[colTotal]) || 0;

    if (!studentSubjectsMap[rollNo]) {
      studentSubjectsMap[rollNo] = [];
    }

    studentSubjectsMap[rollNo].push({
      id: subjectCode,
      code: subjectCode,
      name: subjectCode,
      officialAttended: attended,
      officialTotal: total,
      attended: attended,
      total: total,
      lastOfficialUpdate: Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss')
    });
  }

  var rollKeys = Object.keys(studentSubjectsMap);
  for (var k = 0; k < rollKeys.length; k++) {
    var roll = rollKeys[k];
    var updatedSubjects = studentSubjectsMap[roll];
    var docPath = 'attendance/' + encodeURIComponent(roll);

    var ok = firestoreSetDoc(config, docPath, {
      rollNo: roll,
      subjects: updatedSubjects,
      syncedAt: new Date().toISOString(),
      updatedBy: 'teacher_google_sheet'
    });

    if (ok) successCount++;
  }

  ui.alert('✅ Official Totals Synced', 'Updated official attendance for ' + successCount + ' students.', ui.ButtonSet.OK);
}

function validateActiveSheet() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    ui.alert('Validation Notice', 'Sheet contains no rows to validate.', ui.ButtonSet.OK);
    return;
  }

  var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var colRoll = findHeaderIndex(headers, ['roll no', 'rollno', 'roll_no', 'student id']);
  var colStatus = findHeaderIndex(headers, ['status', 'attendance', 'present/absent', 'p/a']);

  var issues = [];
  var validRows = 0;

  for (var r = 1; r < data.length; r++) {
    var roll = String(data[r][colRoll] || '').trim();
    if (!roll) {
      issues.push('Row ' + (r + 1) + ': Empty Roll Number');
      continue;
    }
    if (colStatus !== -1) {
      var stat = normalizeStatus(data[r][colStatus]);
      if (!stat) {
        issues.push('Row ' + (r + 1) + ' (' + roll + '): Invalid status "' + data[r][colStatus] + '" (Use P, A, or OD)');
        continue;
      }
    }
    validRows++;
  }

  if (issues.length === 0) {
    ui.alert('✅ Data Validation Passed', 'All ' + validRows + ' rows are valid and ready to sync to the app!', ui.ButtonSet.OK);
  } else {
    var summary = 'Found ' + issues.length + ' issue(s):\\n' + issues.slice(0, 8).join('\\n');
    if (issues.length > 8) summary += '\\n...and ' + (issues.length - 8) + ' more.';
    ui.alert('⚠️ Validation Warnings', summary, ui.ButtonSet.OK);
  }
}

function normalizeStatus(val) {
  if (val === true || val === 1) return 'attended';
  if (val === false || val === 0) return 'bunked';
  var s = String(val).trim().toUpperCase();
  if (s === 'P' || s === 'PRESENT' || s === 'YES' || s === '1' || s === 'ATTENDED' || s === 'OD' || s === 'ON DUTY') {
    return 'attended';
  }
  if (s === 'A' || s === 'ABSENT' || s === 'NO' || s === '0' || s === 'BUNKED' || s === 'BUNK') {
    return 'bunked';
  }
  if (s === 'C' || s === 'CANCELLED' || s === 'HOLIDAY') {
    return 'cancelled';
  }
  return null;
}

function findHeaderIndex(headers, candidates) {
  for (var i = 0; i < headers.length; i++) {
    for (var j = 0; j < candidates.length; j++) {
      if (headers[i] === candidates[j] || headers[i].indexOf(candidates[j]) !== -1) {
        return i;
      }
    }
  }
  return -1;
}

function formatCellDate(cellVal) {
  if (cellVal instanceof Date) {
    return Utilities.formatDate(cellVal, 'Asia/Kolkata', 'yyyy-MM-dd');
  }
  var str = String(cellVal).trim();
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(str)) return str;
  return Utilities.formatDate(new Date(str), 'Asia/Kolkata', 'yyyy-MM-dd');
}

function toFirestoreFields(obj) {
  var fields = {};
  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    var val = obj[key];
    if (val === null || val === undefined) continue;

    if (typeof val === 'string') {
      fields[key] = { stringValue: val };
    } else if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        fields[key] = { integerValue: String(val) };
      } else {
        fields[key] = { doubleValue: val };
      }
    } else if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map(function(item) {
            if (typeof item === 'object') {
              return { mapValue: { fields: toFirestoreFields(item) } };
            }
            return { stringValue: String(item) };
          })
        }
      };
    } else if (typeof val === 'object') {
      fields[key] = { mapValue: { fields: toFirestoreFields(val) } };
    }
  }
  return fields;
}

function firestoreSetDoc(config, documentPath, data) {
  var url = 'https://firestore.googleapis.com/v1/projects/' + config.projectId + '/databases/(default)/documents/' + documentPath + '?key=' + config.apiKey;
  var payload = { fields: toFirestoreFields(data) };
  var options = {
    method: 'patch',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  try {
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    return (code >= 200 && code < 300);
  } catch (e) {
    Logger.log('Firestore write error: ' + e);
    return false;
  }
}

function firestoreCreateTeacherLog(config, logData) {
  var url = 'https://firestore.googleapis.com/v1/projects/' + config.projectId + '/databases/(default)/documents/teacher_sheet_logs?key=' + config.apiKey;
  var payload = { fields: toFirestoreFields(logData) };
  try {
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (e) {
    Logger.log('Teacher log write error: ' + e);
  }
}

// ==============================================================================
// CLASS GENERATORS
// ==============================================================================

function generateAllCoursesBatchA() { generateAllCoursesForBatch('A'); }
function generateAllCoursesBatchB() { generateAllCoursesForBatch('B'); }
function generateAllCoursesBatchC() { generateAllCoursesForBatch('C'); }
function generateAllCoursesBatchD() { generateAllCoursesForBatch('D'); }

function generateAllCoursesForBatch(batchLetter) {
  var batchStudents = ALL_STUDENTS.filter(function(s) { return s.batch === batchLetter; });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var todayStr = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');

  for (var c = 0; c < COURSES.length; c++) {
    var course = COURSES[c];
    var sheetName = 'Batch_' + batchLetter + '_' + course.short;
    var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    sheet.clear();

    var headers = ['Roll No', 'College Roll No', 'Student Name', 'Status (P/A/OD)', 'Date', 'Subject Code', 'Subject Title', 'Slot ID'];
    sheet.appendRow(headers);

    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0284C7');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');

    var rows = batchStudents.map(function(s) {
      return [s.dRollNo, s.collegeRollNo, s.name, 'P', todayStr, course.code, course.title, 'period_1'];
    });

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['P', 'A', 'OD', 'C'], true)
        .setAllowInvalid(false)
        .build();
      sheet.getRange(2, 4, rows.length, 1).setDataValidation(rule);
    }
    sheet.autoResizeColumns(1, headers.length);
  }

  SpreadsheetApp.getUi().alert(
    '✅ Generated Sheets',
    'Created all 9 course sheets for Batch ' + batchLetter + ' with ' + batchStudents.length + ' students!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function generateBatchAMaster() { createSingleBatchMaster('A'); }
function generateBatchBMaster() { createSingleBatchMaster('B'); }
function generateBatchCMaster() { createSingleBatchMaster('C'); }
function generateBatchDMaster() { createSingleBatchMaster('D'); }

function createSingleBatchMaster(batchLetter) {
  var batchStudents = ALL_STUDENTS.filter(function(s) { return s.batch === batchLetter; });
  var sheetTitle = 'Batch ' + batchLetter + ' - Master';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetTitle) || ss.insertSheet(sheetTitle);
  sheet.clear();

  var headers = ['Roll No', 'College Roll No', 'Student Name', 'Status (P/A/OD)', 'Date', 'Subject Code', 'Slot ID'];
  sheet.appendRow(headers);

  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#0369A1');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');

  var todayStr = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
  var rows = batchStudents.map(function(s) {
    return [s.dRollNo, s.collegeRollNo, s.name, 'P', todayStr, '24GM11', 'period_1'];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['P', 'A', 'OD', 'C'], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, 4, rows.length, 1).setDataValidation(rule);
  }
  sheet.autoResizeColumns(1, headers.length);
  SpreadsheetApp.getUi().alert('✅ Master Sheet Created', 'Batch ' + batchLetter + ' sheet ready with ' + batchStudents.length + ' students.', SpreadsheetApp.getUi().ButtonSet.OK);
}

function generateSubjectTotalsTemplate() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetTitle = 'Subject Totals - Official Sync';
  var sheet = ss.getSheetByName(sheetTitle) || ss.insertSheet(sheetTitle);
  sheet.clear();

  var headers = ['Roll No', 'College Roll No', 'Student Name', 'Subject Code', 'Attended Classes', 'Total Classes'];
  sheet.appendRow(headers);

  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#10B981');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');

  var sampleRows = ALL_STUDENTS.slice(0, 10).map(function(s) {
    return [s.dRollNo, s.collegeRollNo, s.name, '24GM11', 32, 35];
  });
  sheet.getRange(2, 1, sampleRows.length, headers.length).setValues(sampleRows);
  sheet.autoResizeColumns(1, headers.length);
}

// Master Directory of all 252 Students
var ALL_STUDENTS = ${JSON.stringify(students)};
`;

fs.writeFileSync(path.join(__dirname, '../Code.gs'), codeGsHead, 'utf8');
console.log('Updated Code.gs with full 252 students and all 9 course generators.');
