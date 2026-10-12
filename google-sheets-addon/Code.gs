/**
 * ==============================================================================
 * ATTENDANCE MONITOR - GOOGLE SHEETS SYNC ADD-ON
 * ==============================================================================
 * Allows teachers and faculty to mark student attendance directly in Google Sheets
 * and upload the records directly into Firebase Firestore for the mobile app.
 *
 * Supported Modes:
 * 1. PERIOD ATTENDANCE (Hourly / Slot Marking):
 *    Columns: [Roll No | Student Name | Status (P/A/OD) | Date | Subject Code | Slot ID]
 * 2. CUMULATIVE SUBJECT TOTALS (Official Reconciliation):
 *    Columns: [Roll No | Student Name | Subject Code | Attended Classes | Total Classes]
 * ==============================================================================
 */

// Default Firebase Configuration matching the Attendance Monitor App
var DEFAULT_FIREBASE_CONFIG = {
  projectId: "attendance-tracker-9e4f7",
  apiKey: "AIzaSyCTPCcfWLudZt_hEo1kH_esXsNw3p83zBk"
};

/**
 * Creates custom menu when spreadsheet is opened
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📱 Attendance Monitor')
    .addItem('🚀 Upload Current Sheet to App', 'syncActiveSheetToFirebase')
    .addItem('🔍 Validate Attendance Data', 'validateActiveSheet')
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Generate Batch Roster Template')
      .addItem('Batch A (62 Students)', 'generateBatchATemplate')
      .addItem('Batch B (64 Students)', 'generateBatchBTemplate')
      .addItem('Batch C (63 Students)', 'generateBatchCTemplate')
      .addItem('Batch D (63 Students)', 'generateBatchDTemplate')
      .addItem('Custom Subject Totals Template', 'generateSubjectTotalsTemplate')
    )
    .addSeparator()
    .addItem('🧪 Test Firebase Connection', 'testFirebaseConnection')
    .addItem('⚙️ Configure Firebase Settings', 'configureFirebasePrompt')
    .addToUi();
}

/**
 * Retrieves Firebase credentials from Script Properties or defaults
 */
function getFirebaseConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    projectId: props.getProperty('FIREBASE_PROJECT_ID') || DEFAULT_FIREBASE_CONFIG.projectId,
    apiKey: props.getProperty('FIREBASE_API_KEY') || DEFAULT_FIREBASE_CONFIG.apiKey
  };
}

/**
 * Prompts teacher/admin to customize Firebase credentials if needed
 */
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

/**
 * Tests connection to Firestore
 */
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

/**
 * Automatically detects sheet type and syncs data to Firebase Firestore
 */
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

  // Check which mode the sheet matches
  var isCumulative = headers.indexOf('attended classes') !== -1 || headers.indexOf('attended') !== -1;
  var isPeriodSheet = headers.indexOf('status') !== -1 || headers.indexOf('attendance') !== -1 || headers.indexOf('present') !== -1;

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

/**
 * Syncs Period / Hourly Attendance (P = Present, A = Absent/Bunk, OD = On Duty, Cancelled)
 */
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
    if (!status) continue; // Skip blank or invalid

    var rowDate = (colDate !== -1 && row[colDate]) ? formatCellDate(row[colDate]) : todayStr;
    var subjectCode = (colSubject !== -1 && row[colSubject]) ? String(row[colSubject]).trim() : 'GENERAL';
    var slotId = (colSlot !== -1 && row[colSlot]) ? String(row[colSlot]).trim() : 'period_1';

    var periodKey = rowDate + '_' + slotId + '_' + subjectCode;

    var recordPayload = {
      periodKey: periodKey,
      date: rowDate,
      slotId: slotId,
      subjectId: subjectCode,
      status: status, // 'attended' | 'bunked' | 'cancelled'
      markedBy: 'teacher_google_sheet',
      recordedAt: new Date().getTime(),
      sheetSource: sheet.getName(),
      rowNumber: r + 1
    };

    // Document Path: students/{rollNo}/periods/{periodKey}
    var docPath = 'students/' + encodeURIComponent(rollNo) + '/periods/' + encodeURIComponent(periodKey);
    var ok = firestoreSetDoc(config, docPath, recordPayload);

    if (ok) {
      successCount++;
    } else {
      errorList.push('Row ' + (r + 1) + ' (' + rollNo + ')');
    }
  }

  // Also record a batch log for teachers
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

/**
 * Syncs Cumulative Subject Totals (Official Attendance reconciliation)
 */
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

  // Upload each student's updated subjects into Firestore 'attendance/{rollNo}'
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

/**
 * Validates active sheet before syncing
 */
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

/**
 * Converts user input (P, Present, true, A, Absent, OD) to standard app status
 */
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

/**
 * Searches headers array for matches
 */
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

/**
 * Formats spreadsheet date cell to YYYY-MM-DD
 */
function formatCellDate(cellVal) {
  if (cellVal instanceof Date) {
    return Utilities.formatDate(cellVal, 'Asia/Kolkata', 'yyyy-MM-dd');
  }
  var str = String(cellVal).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  return Utilities.formatDate(new Date(str), 'Asia/Kolkata', 'yyyy-MM-dd');
}

/**
 * Converts JS Object into Firestore REST Document Fields
 */
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

/**
 * Writes or updates document in Firestore using REST API
 */
function firestoreSetDoc(config, documentPath, data) {
  var url = 'https://firestore.googleapis.com/v1/projects/' + config.projectId + '/databases/(default)/documents/' + documentPath + '?key=' + config.apiKey;
  var payload = {
    fields: toFirestoreFields(data)
  };

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

/**
 * Creates teacher activity log entry in Firestore
 */
function firestoreCreateTeacherLog(config, logData) {
  var url = 'https://firestore.googleapis.com/v1/projects/' + config.projectId + '/databases/(default)/documents/teacher_sheet_logs?key=' + config.apiKey;
  var payload = {
    fields: toFirestoreFields(logData)
  };
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
// TEMPLATE ROSTER GENERATORS FOR TEACHERS
// ==============================================================================

function generateBatchATemplate() {
  createRosterSheet('Batch A - Attendance', BATCH_A_STUDENTS);
}

function generateBatchBTemplate() {
  createRosterSheet('Batch B - Attendance', BATCH_B_STUDENTS);
}

function generateBatchCTemplate() {
  createRosterSheet('Batch C - Attendance', BATCH_C_STUDENTS);
}

function generateBatchDTemplate() {
  createRosterSheet('Batch D - Attendance', BATCH_D_STUDENTS);
}

function createRosterSheet(sheetTitle, studentList) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetTitle);
  if (sheet) {
    sheet.activate();
  } else {
    sheet = ss.insertSheet(sheetTitle);
  }

  sheet.clear();

  // Set Headers
  var headers = ['Roll No', 'College Roll No', 'Student Name', 'Status (P/A/OD)', 'Date', 'Subject Code', 'Slot ID'];
  sheet.appendRow(headers);

  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#0284C7');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  var todayStr = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');

  var rows = studentList.map(function(s) {
    return [s.dRollNo, s.collegeRollNo, s.name, 'P', todayStr, '26MBA101', 'period_1'];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  // Format Status Column with Data Validation (P, A, OD, C)
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['P', 'A', 'OD', 'C'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 4, rows.length, 1).setDataValidation(rule);

  sheet.autoResizeColumns(1, headers.length);
  SpreadsheetApp.getUi().alert('✅ Template Created', 'Created "' + sheetTitle + '" with ' + studentList.length + ' students pre-filled.\nMark P/A and click "Attendance Monitor > Upload Current Sheet to App"!', SpreadsheetApp.getUi().ButtonSet.OK);
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

  // Insert sample rows
  var sampleRows = [
    ['D26AA01', '26AA04', 'AKASH VARDHAMAN', '26MBA101', 32, 35],
    ['D26AA02', '26AA27', 'MITHUN K', '26MBA101', 30, 35],
    ['D26AA03', '26AA38', 'R NIVEDA', '26MBA101', 34, 35]
  ];
  sheet.getRange(2, 1, sampleRows.length, headers.length).setValues(sampleRows);
  sheet.autoResizeColumns(1, headers.length);
}

// Pre-defined student rosters matching PSGIM Master Directory
var BATCH_A_STUDENTS = [
  { dRollNo: "D26AA01", collegeRollNo: "26AA04", name: "AKASH VARDHAMAN" },
  { dRollNo: "D26AA02", collegeRollNo: "26AA27", name: "MITHUN K" },
  { dRollNo: "D26AA03", collegeRollNo: "26AA38", name: "R NIVEDA" },
  { dRollNo: "D26AA04", collegeRollNo: "26AA08", name: "DEVIKA BABU" },
  { dRollNo: "D26AA05", collegeRollNo: "26AA03", name: "AJJAY MARSHAL R" },
  { dRollNo: "D26AA06", collegeRollNo: "26AA33", name: "POOJA R" },
  { dRollNo: "D26AA07", collegeRollNo: "26AA15", name: "HARISH KAARTHIK C S" },
  { dRollNo: "D26AA08", collegeRollNo: "26AA37", name: "PRIYADHARSHCINI L" },
  { dRollNo: "D26AA09", collegeRollNo: "26AA22", name: "K RAJESWARI" },
  { dRollNo: "D26AA10", collegeRollNo: "26AA24", name: "KANISHKA SUNDARESAN" },
  { dRollNo: "D26AA11", collegeRollNo: "26AA39", name: "RAAMPRASANTH R" },
  { dRollNo: "D26AA12", collegeRollNo: "26AA10", name: "GOPIKA K" },
  { dRollNo: "D26AA13", collegeRollNo: "26AA34", name: "POOJA VARSINEE P" },
  { dRollNo: "D26AA14", collegeRollNo: "26AA35", name: "PRAKASH VELLINGIRI G" },
  { dRollNo: "D26AA15", collegeRollNo: "26AA36", name: "PRITHIVE RAJ M" },
  { dRollNo: "D26AA16", collegeRollNo: "26AA18", name: "HARSHAVARDHAN A" },
  { dRollNo: "D26AA17", collegeRollNo: "26AA02", name: "AISWARYA MENON" },
  { dRollNo: "D26AA18", collegeRollNo: "26AA46", name: "SANJANA S C" },
  { dRollNo: "D26AA19", collegeRollNo: "26AA51", name: "SRIVARSHINI M G" },
  { dRollNo: "D26AA20", collegeRollNo: "26AA41", name: "RITIKA S" },
  { dRollNo: "D26AA21", collegeRollNo: "26AA53", name: "SUBASH MOHAN B" },
  { dRollNo: "D26AA22", collegeRollNo: "26AA47", name: "SANTHOSH SRINIVAS R" },
  { dRollNo: "D26AA23", collegeRollNo: "26AA52", name: "SUBA VIDHYUT R" },
  { dRollNo: "D26AA24", collegeRollNo: "26AA58", name: "VASANTHAKUMAR R" },
  { dRollNo: "D26AA26", collegeRollNo: "26AA23", name: "KAMALISHREE U S" },
  { dRollNo: "D26AA27", collegeRollNo: "26AA01", name: "A R SRISHAA" },
  { dRollNo: "D26AA28", collegeRollNo: "26AA42", name: "ROSHINI G" },
  { dRollNo: "D26AA29", collegeRollNo: "26AA05", name: "ANUSHREE R" }
];

var BATCH_B_STUDENTS = [
  { dRollNo: "D26BA01", collegeRollNo: "26BA01", name: "AARYAN V" },
  { dRollNo: "D26BA02", collegeRollNo: "26BA02", name: "ABHIJITH S" },
  { dRollNo: "D26BA03", collegeRollNo: "26BA03", name: "AKASH R" },
  { dRollNo: "D26BA04", collegeRollNo: "26BA04", name: "ANANYA K" },
  { dRollNo: "D26BA05", collegeRollNo: "26BA05", name: "BHARATH S" }
];

var BATCH_C_STUDENTS = [
  { dRollNo: "D26CA01", collegeRollNo: "26CA01", name: "CHETHAN M" },
  { dRollNo: "D26CA02", collegeRollNo: "26CA02", name: "DEEPAK R" },
  { dRollNo: "D26CA03", collegeRollNo: "26CA03", name: "DIVYA P" }
];

var BATCH_D_STUDENTS = [
  { dRollNo: "D26DA01", collegeRollNo: "26DA01", name: "DINESH K" },
  { dRollNo: "D26DA02", collegeRollNo: "26DA02", name: "GOKUL N" },
  { dRollNo: "D26DA03", collegeRollNo: "26DA03", name: "HARIHARAN S" }
];
