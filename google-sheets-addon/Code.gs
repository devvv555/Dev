/**
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
    'Current: ' + config.projectId + '\nEnter Project ID (or leave blank to keep current):',
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
      ui.alert('⚠️ Connection Test Notice', 'Received HTTP ' + code + ':\n' + response.getContentText().substring(0, 300), ui.ButtonSet.OK);
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
      'Could not detect standard attendance headers.\nExpected columns like:\n' +
      '• For Hourly: [Roll No, Status, Date, Subject Code]\n' +
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
    msg += '\n\n⚠️ Failed for ' + errorList.length + ' rows:\n' + errorList.slice(0, 5).join(', ') + (errorList.length > 5 ? '...' : '');
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
    var summary = 'Found ' + issues.length + ' issue(s):\n' + issues.slice(0, 8).join('\n');
    if (issues.length > 8) summary += '\n...and ' + (issues.length - 8) + ' more.';
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
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
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
var ALL_STUDENTS = [{"dRollNo":"D26AA01","collegeRollNo":"26AA04","name":"AKASH VARDHAMAN","batch":"A"},{"dRollNo":"D26AA02","collegeRollNo":"26AA27","name":"MITHUN K","batch":"A"},{"dRollNo":"D26AA03","collegeRollNo":"26AA38","name":"R NIVEDA","batch":"A"},{"dRollNo":"D26AA04","collegeRollNo":"26AA08","name":"DEVIKA BABU","batch":"A"},{"dRollNo":"D26AA05","collegeRollNo":"26AA03","name":"AJJAY MARSHAL R","batch":"A"},{"dRollNo":"D26AA06","collegeRollNo":"26AA33","name":"POOJA R","batch":"A"},{"dRollNo":"D26AA07","collegeRollNo":"26AA15","name":"HARISH KAARTHIK C S","batch":"A"},{"dRollNo":"D26AA08","collegeRollNo":"26AA37","name":"PRIYADHARSHCINI L","batch":"A"},{"dRollNo":"D26AA09","collegeRollNo":"26AA22","name":"K RAJESWARI","batch":"A"},{"dRollNo":"D26AA10","collegeRollNo":"26AA24","name":"KANISHKA SUNDARESAN","batch":"A"},{"dRollNo":"D26AA11","collegeRollNo":"26AA39","name":"RAAMPRASANTH R","batch":"A"},{"dRollNo":"D26AA12","collegeRollNo":"26AA10","name":"GOPIKA K","batch":"A"},{"dRollNo":"D26AA13","collegeRollNo":"26AA34","name":"POOJA VARSINEE P","batch":"A"},{"dRollNo":"D26AA14","collegeRollNo":"26AA35","name":"PRAKASH VELLINGIRI G","batch":"A"},{"dRollNo":"D26AA15","collegeRollNo":"26AA36","name":"PRITHIVE RAJ M","batch":"A"},{"dRollNo":"D26AA16","collegeRollNo":"26AA18","name":"HARSHAVARDHAN A","batch":"A"},{"dRollNo":"D26AA17","collegeRollNo":"26AA02","name":"AISWARYA MENON","batch":"A"},{"dRollNo":"D26AA18","collegeRollNo":"26AA46","name":"SANJANA S C","batch":"A"},{"dRollNo":"D26AA19","collegeRollNo":"26AA51","name":"SRIVARSHINI M G","batch":"A"},{"dRollNo":"D26AA20","collegeRollNo":"26AA41","name":"RITIKA S","batch":"A"},{"dRollNo":"D26AA21","collegeRollNo":"26AA53","name":"SUBASH MOHAN B","batch":"A"},{"dRollNo":"D26AA22","collegeRollNo":"26AA47","name":"SANTHOSH SRINIVAS R","batch":"A"},{"dRollNo":"D26AA23","collegeRollNo":"26AA52","name":"SUBA VIDHYUT R","batch":"A"},{"dRollNo":"D26AA24","collegeRollNo":"26AA58","name":"VASANTHAKUMAR R","batch":"A"},{"dRollNo":"D26AA26","collegeRollNo":"26AA23","name":"KAMALISHREE U S","batch":"A"},{"dRollNo":"D26AA27","collegeRollNo":"26AA01","name":"A R SRISHAA","batch":"A"},{"dRollNo":"D26AA28","collegeRollNo":"26AA42","name":"ROSHINI G","batch":"A"},{"dRollNo":"D26AA29","collegeRollNo":"26AA05","name":"ANUSHREE R","batch":"A"},{"dRollNo":"D26AA30","collegeRollNo":"26AA30","name":"NISHAANTH K","batch":"A"},{"dRollNo":"D26AA31","collegeRollNo":"26AA56","name":"SUSHMITHA KUMARESAN","batch":"A"},{"dRollNo":"D26AA32","collegeRollNo":"26AA28","name":"MOHAMMED OMER MUSSARAF R","batch":"A"},{"dRollNo":"D26AA33","collegeRollNo":"26AA13","name":"HARINIKA UDAYAKUMAR","batch":"A"},{"dRollNo":"D26AA34","collegeRollNo":"26AA55","name":"SURYA NARAYANAN R","batch":"A"},{"dRollNo":"D26AA35","collegeRollNo":"26AA16","name":"HARISH RAJ S","batch":"A"},{"dRollNo":"D26AA36","collegeRollNo":"26AA20","name":"ISMAIL R","batch":"A"},{"dRollNo":"D26AA37","collegeRollNo":"26AA54","name":"SUMAA BARATHI M","batch":"A"},{"dRollNo":"D26AA38","collegeRollNo":"26AA57","name":"V NIKETHANA SHRI","batch":"A"},{"dRollNo":"D26AA39","collegeRollNo":"26AA61","name":"VISHAL K S","batch":"A"},{"dRollNo":"D26AA40","collegeRollNo":"26AA59","name":"VIJAY KRISHNARAJ B K","batch":"A"},{"dRollNo":"D26AA41","collegeRollNo":"26AA14","name":"HARISH K","batch":"A"},{"dRollNo":"D26AA42","collegeRollNo":"26AA21","name":"JACKULIN CLARA SUBIKSHA R","batch":"A"},{"dRollNo":"D26AA43","collegeRollNo":"26AA45","name":"SANJAI S","batch":"A"},{"dRollNo":"D26AA44","collegeRollNo":"26AA48","name":"SHALINI K","batch":"A"},{"dRollNo":"D26AA45","collegeRollNo":"26AA06","name":"BARANIDHARAN VA","batch":"A"},{"dRollNo":"D26AA46","collegeRollNo":"26AA60","name":"VISALINI S","batch":"A"},{"dRollNo":"D26AA47","collegeRollNo":"26AA44","name":"SAGARI KRISHNAN","batch":"A"},{"dRollNo":"D26AA48","collegeRollNo":"26AA32","name":"NITHYASHREE G","batch":"A"},{"dRollNo":"D26AA49","collegeRollNo":"26AA19","name":"HARSHAVARDHAN B C","batch":"A"},{"dRollNo":"D26AA50","collegeRollNo":"26AA49","name":"SHARMILA BEGAM A","batch":"A"},{"dRollNo":"D26AA51","collegeRollNo":"26AA31","name":"NITHISH KUMAR R","batch":"A"},{"dRollNo":"D26AA52","collegeRollNo":"26AA29","name":"MUHILAN JEFRYRAJ M","batch":"A"},{"dRollNo":"D26AA53","collegeRollNo":"26AA09","name":"GANESH PRAVEEN V","batch":"A"},{"dRollNo":"D26AA54","collegeRollNo":"26AA11","name":"GOWTHAM S","batch":"A"},{"dRollNo":"D26AA55","collegeRollNo":"26AA25","name":"KANISHKKA R","batch":"A"},{"dRollNo":"D26AA56","collegeRollNo":"26AA26","name":"LINGESH G","batch":"A"},{"dRollNo":"D26AA57","collegeRollNo":"26AA12","name":"HARAN J","batch":"A"},{"dRollNo":"D26AA58","collegeRollNo":"26AA17","name":"HARISHWAR MS","batch":"A"},{"dRollNo":"D26AA59","collegeRollNo":"26AA50","name":"SIVAHARSHINI P","batch":"A"},{"dRollNo":"D26AA60","collegeRollNo":"26AA40","name":"RAKESH R","batch":"A"},{"dRollNo":"D26AA61","collegeRollNo":"26AA62","name":"VISHWADIKA G","batch":"A"},{"dRollNo":"D26AA62","collegeRollNo":"26AA43","name":"SADHIKA MUGUNDAN","batch":"A"},{"dRollNo":"D26AA63","collegeRollNo":"26AA07","name":"DARSHAN M S","batch":"A"},{"dRollNo":"D26AB01","collegeRollNo":"26AB33","name":"MUKTHA MATHI S","batch":"B"},{"dRollNo":"D26AB02","collegeRollNo":"26AB18","name":"GIFTY SHARON K","batch":"B"},{"dRollNo":"D26AB03","collegeRollNo":"26AB19","name":"GOKUL NANDHAN VENUGOPAL","batch":"B"},{"dRollNo":"D26AB04","collegeRollNo":"26AB13","name":"DHAARANI G","batch":"B"},{"dRollNo":"D26AB05","collegeRollNo":"26AB12","name":"DEVDARSHAN V","batch":"B"},{"dRollNo":"D26AB06","collegeRollNo":"26AB30","name":"MIRTHIKA S N","batch":"B"},{"dRollNo":"D26AB07","collegeRollNo":"26AB04","name":"AMRUTHA SIVAANI","batch":"B"},{"dRollNo":"D26AB08","collegeRollNo":"26AB34","name":"NEVEDHA B","batch":"B"},{"dRollNo":"D26AB09","collegeRollNo":"26AB43","name":"RAGHUL K B","batch":"B"},{"dRollNo":"D26AB10","collegeRollNo":"26AB16","name":"FERMI DAVISH J","batch":"B"},{"dRollNo":"D26AB11","collegeRollNo":"26AB28","name":"KRISHNA SUBRAMANIAN","batch":"B"},{"dRollNo":"D26AB12","collegeRollNo":"26AB29","name":"MATHUMITHA M","batch":"B"},{"dRollNo":"D26AB13","collegeRollNo":"26AB24","name":"KARNAM HARISRIYA NAIDU","batch":"B"},{"dRollNo":"D26AB15","collegeRollNo":"26AB39","name":"PRAVEEN J","batch":"B"},{"dRollNo":"D26AB16","collegeRollNo":"26AB48","name":"ROKITH S","batch":"B"},{"dRollNo":"D26AB17","collegeRollNo":"26AB25","name":"KARTHIKEYAN S","batch":"B"},{"dRollNo":"D26AB18","collegeRollNo":"26AB47","name":"RITIKA M","batch":"B"},{"dRollNo":"D26AB19","collegeRollNo":"26AB50","name":"SANJANA K","batch":"B"},{"dRollNo":"D26AB20","collegeRollNo":"26AB57","name":"SRINISAMHITAA V S","batch":"B"},{"dRollNo":"D26AB21","collegeRollNo":"26AB41","name":"PRIYADHARSHAN R","batch":"B"},{"dRollNo":"D26AB22","collegeRollNo":"26AB54","name":"SNIKTHA S","batch":"B"},{"dRollNo":"D26AB23","collegeRollNo":"26AB53","name":"SHASMITHA M R","batch":"B"},{"dRollNo":"D26AB24","collegeRollNo":"26AB56","name":"SRINIDHI R","batch":"B"},{"dRollNo":"D26AB25","collegeRollNo":"26AB36","name":"PRABHAKAR VL","batch":"B"},{"dRollNo":"D26AB26","collegeRollNo":"26AB59","name":"SUWETHA S","batch":"B"},{"dRollNo":"D26AB27","collegeRollNo":"26AB45","name":"RHOSHINIEE R","batch":"B"},{"dRollNo":"D26AB28","collegeRollNo":"26AB51","name":"SARAVANA SELVA P","batch":"B"},{"dRollNo":"D26AB29","collegeRollNo":"26AB49","name":"SANDHYA SREE M","batch":"B"},{"dRollNo":"D26AB30","collegeRollNo":"26AB07","name":"ANJALI V","batch":"B"},{"dRollNo":"D26AB31","collegeRollNo":"26AB55","name":"SREEDARSUNYAA U A","batch":"B"},{"dRollNo":"D26AB32","collegeRollNo":"26AB06","name":"ANEEQUA S","batch":"B"},{"dRollNo":"D26AB33","collegeRollNo":"26AB17","name":"G V JANICE PREETHY","batch":"B"},{"dRollNo":"D26AB34","collegeRollNo":"26AB31","name":"MONIKHA S","batch":"B"},{"dRollNo":"D26AB35","collegeRollNo":"26AB27","name":"KIVAND RAJAN N R","batch":"B"},{"dRollNo":"D26AB36","collegeRollNo":"26AB01","name":"ABINAYA M","batch":"B"},{"dRollNo":"D26AB37","collegeRollNo":"26AB26","name":"KEERTHI VASEN D","batch":"B"},{"dRollNo":"D26AB38","collegeRollNo":"26AB10","name":"ASHITHA SANDRIN A","batch":"B"},{"dRollNo":"D26AB39","collegeRollNo":"26AB22","name":"HARINI V","batch":"B"},{"dRollNo":"D26AB40","collegeRollNo":"26AB37","name":"PRADEEP C M","batch":"B"},{"dRollNo":"D26AB41","collegeRollNo":"26AB20","name":"GOWTHAM S","batch":"B"},{"dRollNo":"D26AB42","collegeRollNo":"26AB63","name":"VISHNU S","batch":"B"},{"dRollNo":"D26AB43","collegeRollNo":"26AB58","name":"SRISWETHA S","batch":"B"},{"dRollNo":"D26AB44","collegeRollNo":"26AB38","name":"PRASANYA A","batch":"B"},{"dRollNo":"D26AB45","collegeRollNo":"26AB42","name":"R KRISHNA","batch":"B"},{"dRollNo":"D26AB46","collegeRollNo":"26AB62","name":"VIKASH KUMAR K S","batch":"B"},{"dRollNo":"D26AB47","collegeRollNo":"26AB61","name":"VAANMUHIL JAYAPRAKASH MANIYAMMAI","batch":"B"},{"dRollNo":"D26AB48","collegeRollNo":"26AB44","name":"RAVICHANDRAN R","batch":"B"},{"dRollNo":"D26AB49","collegeRollNo":"26AB40","name":"PRAVEEN J A","batch":"B"},{"dRollNo":"D26AB50","collegeRollNo":"26AB23","name":"HARISRUTHI J K","batch":"B"},{"dRollNo":"D26AB51","collegeRollNo":"26AB35","name":"PADMINI S J","batch":"B"},{"dRollNo":"D26AB52","collegeRollNo":"26AB21","name":"GOWTHAM S","batch":"B"},{"dRollNo":"D26AB53","collegeRollNo":"26AB32","name":"MUKESH KUMAR S","batch":"B"},{"dRollNo":"D26AB54","collegeRollNo":"26AB14","name":"DIVIT D S","batch":"B"},{"dRollNo":"D26AB55","collegeRollNo":"26AB60","name":"SWETHA K","batch":"B"},{"dRollNo":"D26AB56","collegeRollNo":"26AB05","name":"AMULYA P","batch":"B"},{"dRollNo":"D26AB57","collegeRollNo":"26AB03","name":"AFRIN NIQMATHULLAH A","batch":"B"},{"dRollNo":"D26AB58","collegeRollNo":"26AB15","name":"DIVYABHARATHI P","batch":"B"},{"dRollNo":"D26AB59","collegeRollNo":"26AB02","name":"ABISHEK S","batch":"B"},{"dRollNo":"D26AB60","collegeRollNo":"26AB52","name":"SASMITA G S","batch":"B"},{"dRollNo":"D26AB61","collegeRollNo":"26AB46","name":"RITHANYA S","batch":"B"},{"dRollNo":"D26AB62","collegeRollNo":"26AB08","name":"ANUSREE O","batch":"B"},{"dRollNo":"D26AB63","collegeRollNo":"26AB09","name":"ARVIND P","batch":"B"},{"dRollNo":"D26AB64","collegeRollNo":"26AB11","name":"AVANTHIKA PRABAKARAN","batch":"B"},{"dRollNo":"D26AC01","collegeRollNo":"26AC09","name":"DHARSHINE E H","batch":"C"},{"dRollNo":"D26AC02","collegeRollNo":"26AC19","name":"JEGADHARANI A","batch":"C"},{"dRollNo":"D26AC03","collegeRollNo":"26AC17","name":"IJAAZ AJMAL F","batch":"C"},{"dRollNo":"D26AC04","collegeRollNo":"26AC43","name":"SAI SUBHIKSHA B","batch":"C"},{"dRollNo":"D26AC05","collegeRollNo":"26AC28","name":"NADAR AKSHAYA KARTHEESAN ANILVENI","batch":"C"},{"dRollNo":"D26AC06","collegeRollNo":"26AC13","name":"DURGESH R S","batch":"C"},{"dRollNo":"D26AC07","collegeRollNo":"26AC56","name":"SURYA V S","batch":"C"},{"dRollNo":"D26AC08","collegeRollNo":"26AC05","name":"ATHMIKA A","batch":"C"},{"dRollNo":"D26AC09","collegeRollNo":"26AC37","name":"R S MAMADHIE SARA","batch":"C"},{"dRollNo":"D26AC10","collegeRollNo":"26AC33","name":"PRABODHINI A","batch":"C"},{"dRollNo":"D26AC11","collegeRollNo":"26AC18","name":"IRENE THOMAS","batch":"C"},{"dRollNo":"D26AC12","collegeRollNo":"26AC22","name":"M DEEKSHITHA","batch":"C"},{"dRollNo":"D26AC13","collegeRollNo":"26AC26","name":"MOHANA SHRI R E","batch":"C"},{"dRollNo":"D26AC14","collegeRollNo":"26AC34","name":"PRANYASAKTHIVEL K","batch":"C"},{"dRollNo":"D26AC15","collegeRollNo":"26AC30","name":"NANDHAKUMAR M","batch":"C"},{"dRollNo":"D26AC16","collegeRollNo":"26AC39","name":"RHENIUS A","batch":"C"},{"dRollNo":"D26AC17","collegeRollNo":"26AC20","name":"KRISHNAGANTH R","batch":"C"},{"dRollNo":"D26AC18","collegeRollNo":"26AC51","name":"SHREEYA R","batch":"C"},{"dRollNo":"D26AC19","collegeRollNo":"26AC42","name":"S SWATHI","batch":"C"},{"dRollNo":"D26AC20","collegeRollNo":"26AC53","name":"SINDHU S","batch":"C"},{"dRollNo":"D26AC21","collegeRollNo":"26AC47","name":"SAMARTH J NAIR","batch":"C"},{"dRollNo":"D26AC22","collegeRollNo":"26AC55","name":"SRI KRISHNA KARTHIKEYAN M","batch":"C"},{"dRollNo":"D26AC23","collegeRollNo":"26AC52","name":"SHUBHYA KUMARI","batch":"C"},{"dRollNo":"D26AC24","collegeRollNo":"26AC40","name":"RITHANYA S","batch":"C"},{"dRollNo":"D26AC25","collegeRollNo":"26AC49","name":"SHERIL LINCY V","batch":"C"},{"dRollNo":"D26AC26","collegeRollNo":"26AC54","name":"SOUMYA S","batch":"C"},{"dRollNo":"D26AC27","collegeRollNo":"26AC59","name":"VINOTH S","batch":"C"},{"dRollNo":"D26AC28","collegeRollNo":"26AC58","name":"VAISU SIVAMBIGA R","batch":"C"},{"dRollNo":"D26AC29","collegeRollNo":"26AC62","name":"YOGADHARSHINI M","batch":"C"},{"dRollNo":"D26AC30","collegeRollNo":"26AC50","name":"SHREE VARSHINII M K","batch":"C"},{"dRollNo":"D26AC31","collegeRollNo":"26AC48","name":"SHABNA S","batch":"C"},{"dRollNo":"D26AC32","collegeRollNo":"26AC03","name":"ANUSRI A","batch":"C"},{"dRollNo":"D26AC33","collegeRollNo":"26AC45","name":"SAKTHIHA SRI V","batch":"C"},{"dRollNo":"D26AC34","collegeRollNo":"26AC12","name":"DIVESH S","batch":"C"},{"dRollNo":"D26AC35","collegeRollNo":"26AC46","name":"SALOMA JOYCELYN PRINCE","batch":"C"},{"dRollNo":"D26AC36","collegeRollNo":"26AC24","name":"MAHALAKSHMI K","batch":"C"},{"dRollNo":"D26AC37","collegeRollNo":"26AC08","name":"CHANDRAVEL S","batch":"C"},{"dRollNo":"D26AC38","collegeRollNo":"26AC06","name":"BALAJI V","batch":"C"},{"dRollNo":"D26AC39","collegeRollNo":"26AC29","name":"NANCY VIDHULA FRED V","batch":"C"},{"dRollNo":"D26AC40","collegeRollNo":"26AC44","name":"SAKTHI BALAJI S","batch":"C"},{"dRollNo":"D26AC41","collegeRollNo":"26AC61","name":"VISHNU KARTHICK K S","batch":"C"},{"dRollNo":"D26AC42","collegeRollNo":"26AC15","name":"HARSHINI A","batch":"C"},{"dRollNo":"D26AC43","collegeRollNo":"26AC07","name":"BHARATHRAM S R","batch":"C"},{"dRollNo":"D26AC44","collegeRollNo":"26AC32","name":"POOJAA G","batch":"C"},{"dRollNo":"D26AC45","collegeRollNo":"26AC38","name":"RAKSATHA K R","batch":"C"},{"dRollNo":"D26AC46","collegeRollNo":"26AC31","name":"NAVEEN CHERAN","batch":"C"},{"dRollNo":"D26AC47","collegeRollNo":"26AC27","name":"MUKESHKUMAR R","batch":"C"},{"dRollNo":"D26AC48","collegeRollNo":"26AC60","name":"VINOTHA S","batch":"C"},{"dRollNo":"D26AC49","collegeRollNo":"26AC23","name":"MAANVI VASHISTHA","batch":"C"},{"dRollNo":"D26AC50","collegeRollNo":"26AC35","name":"PRAVEENKUMAR P","batch":"C"},{"dRollNo":"D26AC51","collegeRollNo":"26AC02","name":"ANUJA T","batch":"C"},{"dRollNo":"D26AC52","collegeRollNo":"26AC10","name":"DHARUN ADITYA SENTHILKUMAR","batch":"C"},{"dRollNo":"D26AC54","collegeRollNo":"26AC57","name":"SWATHI S","batch":"C"},{"dRollNo":"D26AC55","collegeRollNo":"26AC01","name":"ABIKIRUTHIKA D","batch":"C"},{"dRollNo":"D26AC56","collegeRollNo":"26AC14","name":"HARISH RAGAVENDRA R","batch":"C"},{"dRollNo":"D26AC57","collegeRollNo":"26AC16","name":"HEMNARAYAN B","batch":"C"},{"dRollNo":"D26AC58","collegeRollNo":"26AC21","name":"LOKESH KUMAR S","batch":"C"},{"dRollNo":"D26AC59","collegeRollNo":"26AC25","name":"MOHAMMED RIFAI A","batch":"C"},{"dRollNo":"D26AC60","collegeRollNo":"26AC36","name":"PRITHIKA P J","batch":"C"},{"dRollNo":"D26AC61","collegeRollNo":"26AC11","name":"DHIGAMBARI A","batch":"C"},{"dRollNo":"D26AC62","collegeRollNo":"26AC41","name":"S KRISHNA KUMAR","batch":"C"},{"dRollNo":"D26AC63","collegeRollNo":"26AC04","name":"ARUN VIGNESWAR S K","batch":"C"},{"dRollNo":"D26AD01","collegeRollNo":"26AD28","name":"LOHIT DEVESHWAR S K","batch":"D"},{"dRollNo":"D26AD02","collegeRollNo":"26AD09","name":"ANANYA A","batch":"D"},{"dRollNo":"D26AD03","collegeRollNo":"26AD11","name":"ASWANTH RAAJHEN A","batch":"D"},{"dRollNo":"D26AD04","collegeRollNo":"26AD21","name":"HARSHINIPRIYA G","batch":"D"},{"dRollNo":"D26AD05","collegeRollNo":"26AD15","name":"DHATCHINA MOORTHI T A","batch":"D"},{"dRollNo":"D26AD06","collegeRollNo":"26AD14","name":"DHARSHINI V S","batch":"D"},{"dRollNo":"D26AD07","collegeRollNo":"26AD33","name":"NIRAIMATHI V","batch":"D"},{"dRollNo":"D26AD08","collegeRollNo":"26AD24","name":"KAYAL UDAYAMURUGAN","batch":"D"},{"dRollNo":"D26AD09","collegeRollNo":"26AD45","name":"RUPICKA A","batch":"D"},{"dRollNo":"D26AD10","collegeRollNo":"26AD19","name":"GURUPRASAD SIVAKUMAR","batch":"D"},{"dRollNo":"D26AD11","collegeRollNo":"26AD39","name":"RAHUL MAHADEVAN M","batch":"D"},{"dRollNo":"D26AD12","collegeRollNo":"26AD23","name":"KARTHIYAYINI M P","batch":"D"},{"dRollNo":"D26AD13","collegeRollNo":"26AD55","name":"SRUTHI B","batch":"D"},{"dRollNo":"D26AD14","collegeRollNo":"26AD61","name":"V SHRINIDHI","batch":"D"},{"dRollNo":"D26AD15","collegeRollNo":"26AD40","name":"RAMA IYYAPPA M","batch":"D"},{"dRollNo":"D26AD16","collegeRollNo":"26AD53","name":"SRINITHI RAVI","batch":"D"},{"dRollNo":"D26AD17","collegeRollNo":"26AD48","name":"SANJANA S","batch":"D"},{"dRollNo":"D26AD18","collegeRollNo":"26AD42","name":"RIDDHISA R","batch":"D"},{"dRollNo":"D26AD19","collegeRollNo":"26AD65","name":"VILASINI S","batch":"D"},{"dRollNo":"D26AD20","collegeRollNo":"26AD51","name":"SOBICKA VAIBAVY R S S","batch":"D"},{"dRollNo":"D26AD21","collegeRollNo":"26AD50","name":"SATHYA PRIYA R","batch":"D"},{"dRollNo":"D26AD22","collegeRollNo":"26AD60","name":"SURYA PRAKASH","batch":"D"},{"dRollNo":"D26AD23","collegeRollNo":"26AD46","name":"SAMPAUL VASANTH W","batch":"D"},{"dRollNo":"D26AD24","collegeRollNo":"26AD31","name":"MUKUND V","batch":"D"},{"dRollNo":"D26AD25","collegeRollNo":"26AD43","name":"RISHABH KUMAR MISHRA","batch":"D"},{"dRollNo":"D26AD26","collegeRollNo":"26AD44","name":"ROSHAN KRISHNA A L","batch":"D"},{"dRollNo":"D26AD27","collegeRollNo":"26AD02","name":"ABHISNEHA M S","batch":"D"},{"dRollNo":"D26AD28","collegeRollNo":"26AD64","name":"VIJAYRAGAVAN S","batch":"D"},{"dRollNo":"D26AD29","collegeRollNo":"26AD58","name":"SUBHASHREE T","batch":"D"},{"dRollNo":"D26AD30","collegeRollNo":"26AD56","name":"SUBA PRIYA R S","batch":"D"},{"dRollNo":"D26AD31","collegeRollNo":"26AD10","name":"ANUSH PRIYA S","batch":"D"},{"dRollNo":"D26AD32","collegeRollNo":"26AD57","name":"SUBHA SREE S P","batch":"D"},{"dRollNo":"D26AD33","collegeRollNo":"26AD49","name":"SARAN K M","batch":"D"},{"dRollNo":"D26AD34","collegeRollNo":"26AD13","name":"CIBI P","batch":"D"},{"dRollNo":"D26AD35","collegeRollNo":"26AD17","name":"FARHANA R","batch":"D"},{"dRollNo":"D26AD36","collegeRollNo":"26AD12","name":"ATHISH M","batch":"D"},{"dRollNo":"D26AD37","collegeRollNo":"26AD63","name":"VIJAY M","batch":"D"},{"dRollNo":"D26AD38","collegeRollNo":"26AD03","name":"ABINANDHANA B","batch":"D"},{"dRollNo":"D26AD39","collegeRollNo":"26AD06","name":"AISHWARYA R","batch":"D"},{"dRollNo":"D26AD40","collegeRollNo":"26AD07","name":"AJAI GOVIND P S","batch":"D"},{"dRollNo":"D26AD41","collegeRollNo":"26AD16","name":"EZHILAN O","batch":"D"},{"dRollNo":"D26AD42","collegeRollNo":"26AD08","name":"ANAND G","batch":"D"},{"dRollNo":"D26AD43","collegeRollNo":"26AD22","name":"JAI SARATH N","batch":"D"},{"dRollNo":"D26AD44","collegeRollNo":"26AD04","name":"ABINAYA K S","batch":"D"},{"dRollNo":"D26AD45","collegeRollNo":"26AD20","name":"HARINI E","batch":"D"},{"dRollNo":"D26AD46","collegeRollNo":"26AD34","name":"NIVETHITHADEVI B","batch":"D"},{"dRollNo":"D26AD47","collegeRollNo":"26AD35","name":"POOJITHA J","batch":"D"},{"dRollNo":"D26AD48","collegeRollNo":"26AD54","name":"SRIVIKKASH K","batch":"D"},{"dRollNo":"D26AD49","collegeRollNo":"26AD36","name":"PRIYANKAA K","batch":"D"},{"dRollNo":"D26AD50","collegeRollNo":"26AD38","name":"RAHUL I","batch":"D"},{"dRollNo":"D26AD51","collegeRollNo":"26AD29","name":"MAHALAKSHMI S","batch":"D"},{"dRollNo":"D26AD52","collegeRollNo":"26AD18","name":"GOKUL V","batch":"D"},{"dRollNo":"D26AD53","collegeRollNo":"26AD27","name":"LEKSHMIKAMATHY ARUL","batch":"D"},{"dRollNo":"D26AD54","collegeRollNo":"26AD26","name":"KIRUTHIKA N S","batch":"D"},{"dRollNo":"D26AD55","collegeRollNo":"26AD62","name":"VENKATESH PRASAD K","batch":"D"},{"dRollNo":"D26AD56","collegeRollNo":"26AD59","name":"SURIAYAA G","batch":"D"},{"dRollNo":"D26AD57","collegeRollNo":"26AD01","name":"ABDUL KADER AZHAR S","batch":"D"},{"dRollNo":"D26AD58","collegeRollNo":"26AD37","name":"RAGHUL GANDHI R","batch":"D"},{"dRollNo":"D26AD59","collegeRollNo":"26AD52","name":"SRI YASHWANTH RAGAVENDRA R","batch":"D"},{"dRollNo":"D26AD60","collegeRollNo":"26AD32","name":"NAVEENA R R","batch":"D"},{"dRollNo":"D26AD61","collegeRollNo":"26AD41","name":"RASHMIKA M","batch":"D"},{"dRollNo":"D26AD62","collegeRollNo":"26AD47","name":"SANDHIYA V J","batch":"D"},{"dRollNo":"D26AD63","collegeRollNo":"26AD30","name":"MITHILESH P","batch":"D"},{"dRollNo":"D26AD64","collegeRollNo":"26AD25","name":"KHAVYA S","batch":"D"},{"dRollNo":"D26AD65","collegeRollNo":"26AD05","name":"ABISHREE G","batch":"D"}];
