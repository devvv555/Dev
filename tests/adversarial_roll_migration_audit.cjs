// PSG Institute of Management - College Roll Number Migration Adversarial Audit
// Empirical Challenger Verification Harness
// Strictly compliant with project-wide Zero Emoji Policy (0 emojis).

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// 1. In-memory LocalStorage polyfill for Node.js environment
const memoryStorage = {};
global.window = {
  localStorage: {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(memoryStorage, key) ? memoryStorage[key] : null),
    setItem: (key, value) => {
      memoryStorage[key] = String(value);
    },
    removeItem: (key) => {
      delete memoryStorage[key];
    },
    clear: () => {
      Object.keys(memoryStorage).forEach((key) => delete memoryStorage[key]);
    },
  },
};

// 2. Transparent TypeScript on-the-fly compiler hook for Node.js
require.extensions['.ts'] = function (module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      skipLibCheck: true,
    },
  });
  module._compile(compiled.outputText, filename);
};

// 3. File paths
const ROOT_DIR = path.resolve(__dirname, '..');
const psgimDataPath = path.join(ROOT_DIR, 'src', 'data', 'psgimData.ts');
const psgimMasterPath = path.join(ROOT_DIR, 'src', 'data', 'psgimMasterStudents.ts');
const storageServicePath = path.join(ROOT_DIR, 'src', 'services', 'storageService.ts');
const studzoneServicePath = path.join(ROOT_DIR, 'src', 'services', 'studzoneService.ts');
const lmsServicePath = path.join(ROOT_DIR, 'src', 'services', 'lmsService.ts');
const excelMappingPath = path.join(ROOT_DIR, 'scripts', 'excel_mapping.csv');

// 4. Load modules
const psgimData = require(psgimDataPath);
const psgimMaster = require(psgimMasterPath);
const storageServiceModule = require(storageServicePath);
const StorageService = storageServiceModule.StorageService;
const lmsServiceModule = require(lmsServicePath);
const LmsService = lmsServiceModule.LmsService;
const studzoneServiceModule = require(studzoneServicePath);
const StudzoneService = studzoneServiceModule.StudzoneService;

// 5. Load authoritative ground truth from scripts/excel_mapping.csv
const rawCsv = fs.readFileSync(excelMappingPath, 'utf8');
const excelRows = rawCsv
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith('#'))
  .map((line) => {
    const parts = line.split(',');
    return {
      dRollNo: parts[0] ? parts[0].trim() : '',
      collegeRollNo: parts[1] ? parts[1].trim() : '',
      name: parts[2] ? parts[2].trim() : '',
    };
  })
  .filter((r) => r.dRollNo && r.collegeRollNo);

// 6. Test Tracker
let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failures = [];

function assertTest(section, testId, description, condition, actualVal, expectedVal) {
  totalChecks++;
  if (condition) {
    passedChecks++;
  } else {
    failedChecks++;
    failures.push({ section, testId, description, actualVal, expectedVal });
    console.error(`[FAIL] ${section} | ${testId}: ${description}`);
    if (actualVal !== undefined || expectedVal !== undefined) {
      console.error(`       Actual:   ${JSON.stringify(actualVal)}`);
      console.error(`       Expected: ${JSON.stringify(expectedVal)}`);
    }
  }
}

async function runAdversarialSuite() {
  console.log('================================================================================');
  console.log('EMPIRICAL CHALLENGER: ADVERSARIAL STRESS-TEST SUITE');
  console.log('College Roll Number Migration Verification');
  console.log('================================================================================\n');

  // ===========================================================================
  // SECTION 1: LOGIN PERMUTATIONS & NORMALIZATION IDEMPOTENCY
  // ===========================================================================
  console.log('--- SECTION 1: LOGIN PERMUTATIONS & NORMALIZATION IDEMPOTENCY ---');

  // 1.1 Direct Login
  assertTest('1. Login Permutations', '1.1.1', 'toNewRollNo("26AB12") returns "26AB12"',
    psgimMaster.toNewRollNo('26AB12') === '26AB12', psgimMaster.toNewRollNo('26AB12'), '26AB12');

  assertTest('1. Login Permutations', '1.1.2', 'toNewRollNo("26ab12") returns "26AB12" (lowercase)',
    psgimMaster.toNewRollNo('26ab12') === '26AB12', psgimMaster.toNewRollNo('26ab12'), '26AB12');

  assertTest('1. Login Permutations', '1.1.3', 'toNewRollNo("  26AB12  ") returns "26AB12" (spaces)',
    psgimMaster.toNewRollNo('  26AB12  ') === '26AB12', psgimMaster.toNewRollNo('  26AB12  '), '26AB12');

  assertTest('1. Login Permutations', '1.1.4', 'toNewRollNo("\\t 26ab12 \\n") returns "26AB12" (tabs/newlines)',
    psgimMaster.toNewRollNo('\t 26ab12 \n') === '26AB12', psgimMaster.toNewRollNo('\t 26ab12 \n'), '26AB12');

  // 1.2 Legacy Login
  assertTest('1. Login Permutations', '1.2.1', 'toNewRollNo("D26AB05") returns "26AB12"',
    psgimMaster.toNewRollNo('D26AB05') === '26AB12', psgimMaster.toNewRollNo('D26AB05'), '26AB12');

  assertTest('1. Login Permutations', '1.2.2', 'toNewRollNo("d26ab05") returns "26AB12" (lowercase)',
    psgimMaster.toNewRollNo('d26ab05') === '26AB12', psgimMaster.toNewRollNo('d26ab05'), '26AB12');

  assertTest('1. Login Permutations', '1.2.3', 'toNewRollNo("  D26AB05  ") returns "26AB12" (spaces)',
    psgimMaster.toNewRollNo('  D26AB05  ') === '26AB12', psgimMaster.toNewRollNo('  D26AB05  '), '26AB12');

  assertTest('1. Login Permutations', '1.2.4', 'toNewRollNo("\\t  d26ab05  \\n") returns "26AB12" (tabs/newlines)',
    psgimMaster.toNewRollNo('\t  d26ab05  \n') === '26AB12', psgimMaster.toNewRollNo('\t  d26ab05  \n'), '26AB12');

  // 1.3 Normalization Idempotency
  assertTest('1. Login Permutations', '1.3.1', 'Idempotency: toNewRollNo(toNewRollNo("D26AB05")) === "26AB12"',
    psgimMaster.toNewRollNo(psgimMaster.toNewRollNo('D26AB05')) === '26AB12',
    psgimMaster.toNewRollNo(psgimMaster.toNewRollNo('D26AB05')), '26AB12');

  assertTest('1. Login Permutations', '1.3.2', 'Idempotency: toNewRollNo(toNewRollNo("26AB12")) === "26AB12"',
    psgimMaster.toNewRollNo(psgimMaster.toNewRollNo('26AB12')) === '26AB12',
    psgimMaster.toNewRollNo(psgimMaster.toNewRollNo('26AB12')), '26AB12');

  assertTest('1. Login Permutations', '1.3.3', 'Triple Idempotency: toNewRollNo(toNewRollNo(toNewRollNo("d26ab05"))) === "26AB12"',
    psgimMaster.toNewRollNo(psgimMaster.toNewRollNo(psgimMaster.toNewRollNo('d26ab05'))) === '26AB12',
    psgimMaster.toNewRollNo(psgimMaster.toNewRollNo(psgimMaster.toNewRollNo('d26ab05'))), '26AB12');

  // Amulya P (D26AB56) official college roll number 26AB05 idempotency
  assertTest('1. Login Permutations', '1.3.4', 'toNewRollNo("26AB05") maps to "26AB05" (Amulya P)',
    psgimMaster.toNewRollNo('26AB05') === '26AB05', psgimMaster.toNewRollNo('26AB05'), '26AB05');

  // 1.4 Invalid and Adversarial Rolls
  assertTest('1. Login Permutations', '1.4.1', 'toNewRollNo("INVALID_ROLL") does not throw and returns clean string',
    psgimMaster.toNewRollNo('INVALID_ROLL') === 'INVALID_ROLL', psgimMaster.toNewRollNo('INVALID_ROLL'), 'INVALID_ROLL');

  assertTest('1. Login Permutations', '1.4.2', 'toNewRollNo("") returns ""',
    psgimMaster.toNewRollNo('') === '', psgimMaster.toNewRollNo(''), '');

  assertTest('1. Login Permutations', '1.4.3', 'toNewRollNo(undefined) returns ""',
    psgimMaster.toNewRollNo(undefined) === '', psgimMaster.toNewRollNo(undefined), '');

  assertTest('1. Login Permutations', '1.4.4', 'toNewRollNo(null) returns ""',
    psgimMaster.toNewRollNo(null) === '', psgimMaster.toNewRollNo(null), '');

  assertTest('1. Login Permutations', '1.4.5', 'toNewRollNo("   ") returns ""',
    psgimMaster.toNewRollNo('   ') === '', psgimMaster.toNewRollNo('   '), '');

  assertTest('1. Login Permutations', '1.4.6', 'getMasterStudent("INVALID_ROLL") returns null without throwing',
    psgimMaster.getMasterStudent('INVALID_ROLL') === null, psgimMaster.getMasterStudent('INVALID_ROLL'), null);

  assertTest('1. Login Permutations', '1.4.7', 'getMasterStudent("") returns null without throwing',
    psgimMaster.getMasterStudent('') === null, psgimMaster.getMasterStudent(''), null);

  assertTest('1. Login Permutations', '1.4.8', 'getMasterStudent(undefined) returns null without throwing',
    psgimMaster.getMasterStudent(undefined) === null, psgimMaster.getMasterStudent(undefined), null);

  assertTest('1. Login Permutations', '1.4.9', 'getMasterStudent(null) returns null without throwing',
    psgimMaster.getMasterStudent(null) === null, psgimMaster.getMasterStudent(null), null);

  assertTest('1. Login Permutations', '1.4.10', 'getMasterStudent("26AB12") resolves DEVDARSHAN V',
    psgimMaster.getMasterStudent('26AB12')?.name === 'DEVDARSHAN V',
    psgimMaster.getMasterStudent('26AB12')?.name, 'DEVDARSHAN V');

  assertTest('1. Login Permutations', '1.4.11', 'getMasterStudent("D26AB05") resolves DEVDARSHAN V',
    psgimMaster.getMasterStudent('D26AB05')?.name === 'DEVDARSHAN V',
    psgimMaster.getMasterStudent('D26AB05')?.name, 'DEVDARSHAN V');

  // Exhaustive check across all 252 cohort students for bidirectional normalization
  let cohortNormalizationMismatches = 0;
  for (const s of excelRows) {
    const toNewFromD = psgimMaster.toNewRollNo(s.dRollNo);
    const toNewFromCollege = psgimMaster.toNewRollNo(s.collegeRollNo);
    const toOldFromCollege = psgimMaster.toOldRollNo(s.collegeRollNo);
    const toOldFromD = psgimMaster.toOldRollNo(s.dRollNo);

    if (toNewFromD !== s.collegeRollNo || toNewFromCollege !== s.collegeRollNo ||
        toOldFromCollege !== s.dRollNo || toOldFromD !== s.dRollNo) {
      cohortNormalizationMismatches++;
    }
  }
  assertTest('1. Login Permutations', '1.5.1', 'Exhaustive 252 students bidirectional normalization passes 100%',
    cohortNormalizationMismatches === 0, cohortNormalizationMismatches, 0);

  // ===========================================================================
  // SECTION 2: TIMETABLE RESOLUTION & CLASSROOM ALLOCATIONS
  // ===========================================================================
  console.log('\n--- SECTION 2: TIMETABLE RESOLUTION & CLASSROOM ALLOCATIONS ---');

  const devdarshanTimetable = psgimData.getTimetableForStudent('26AB12');

  // 2.1 Verify 19 weekly periods
  assertTest('2. Timetable Resolution', '2.1.1', 'getTimetableForStudent("26AB12") returns exactly 19 periods',
    devdarshanTimetable && devdarshanTimetable.length === 19, devdarshanTimetable?.length, 19);

  // 2.2 Verify specific classrooms
  // LA1 -> LH-101
  const laSlots = devdarshanTimetable.filter((s) => s.shortForm === 'LA');
  const laRooms = laSlots.map((s) => s.room);
  const allLaLH101 = laSlots.length > 0 && laSlots.every((s) => s.room === 'LH-101');
  assertTest('2. Timetable Resolution', '2.2.1', 'LA1 resolves to LH-101 across all periods',
    allLaLH101, laRooms, ['LH-101']);

  // MC3 -> LH-401
  const mcSlots = devdarshanTimetable.filter((s) => s.shortForm === 'MC');
  const mcRooms = mcSlots.map((s) => s.room);
  const allMcLH401 = mcSlots.length > 0 && mcSlots.every((s) => s.room === 'LH-401');
  assertTest('2. Timetable Resolution', '2.2.2', 'MC3 resolves to LH-401 across all periods',
    allMcLH401, mcRooms, ['LH-401']);

  // SSA3 -> LH-101
  const ssaSlots = devdarshanTimetable.filter((s) => s.shortForm === 'SSA');
  const ssaRooms = ssaSlots.map((s) => s.room);
  const allSsaLH101 = ssaSlots.length > 0 && ssaSlots.every((s) => s.room === 'LH-101');
  assertTest('2. Timetable Resolution', '2.2.3', 'SSA3 resolves to LH-101 across all periods',
    allSsaLH101, ssaRooms, ['LH-101']);

  // Other verified classrooms for Devdarshan
  const mcobSlots = devdarshanTimetable.filter((s) => s.shortForm === 'MCOB');
  assertTest('2. Timetable Resolution', '2.2.4', 'MCOB1 resolves to LH-101',
    mcobSlots.length > 0 && mcobSlots.every((s) => s.room === 'LH-101'), mcobSlots.map((s) => s.room), ['LH-101']);

  const admSlots = devdarshanTimetable.filter((s) => s.shortForm === 'ADM');
  assertTest('2. Timetable Resolution', '2.2.5', 'ADM2 resolves to LH-109',
    admSlots.length > 0 && admSlots.every((s) => s.room === 'LH-109'), admSlots.map((s) => s.room), ['LH-109']);

  const bsSlots = devdarshanTimetable.filter((s) => s.shortForm === 'BS');
  assertTest('2. Timetable Resolution', '2.2.6', 'BS2 resolves to LH-109',
    bsSlots.length > 0 && bsSlots.every((s) => s.room === 'LH-109'), bsSlots.map((s) => s.room), ['LH-109']);

  const edmSlots = devdarshanTimetable.filter((s) => s.shortForm === 'EDM');
  assertTest('2. Timetable Resolution', '2.2.7', 'EDM1 resolves to LH-101',
    edmSlots.length > 0 && edmSlots.every((s) => s.room === 'LH-101'), edmSlots.map((s) => s.room), ['LH-101']);

  // 2.3 Verify 0 slash rooms and 0 unassigned rooms
  const slashSlots = devdarshanTimetable.filter((s) => s.room && s.room.includes('/'));
  assertTest('2. Timetable Resolution', '2.3.1', 'Zero slash rooms in 26AB12 timetable',
    slashSlots.length === 0, slashSlots.length, 0);

  const unassignedSlots = devdarshanTimetable.filter(
    (s) => !s.room || s.room.trim() === '' || s.room.includes('TBD') || s.room.includes('undefined')
  );
  assertTest('2. Timetable Resolution', '2.3.2', 'Zero unassigned/TBD rooms in 26AB12 timetable',
    unassignedSlots.length === 0, unassignedSlots.length, 0);

  // 2.4 Verify identical resolution with legacy roll D26AB05, lowercase, whitespace
  const legacyTimetable = psgimData.getTimetableForStudent('D26AB05');
  assertTest('2. Timetable Resolution', '2.4.1', 'getTimetableForStudent("D26AB05") yields 19 periods',
    legacyTimetable && legacyTimetable.length === 19, legacyTimetable?.length, 19);

  const lowerTimetable = psgimData.getTimetableForStudent('26ab12');
  assertTest('2. Timetable Resolution', '2.4.2', 'getTimetableForStudent("26ab12") yields 19 periods',
    lowerTimetable && lowerTimetable.length === 19, lowerTimetable?.length, 19);

  const spaceTimetable = psgimData.getTimetableForStudent('  26AB12  ');
  assertTest('2. Timetable Resolution', '2.4.3', 'getTimetableForStudent("  26AB12  ") yields 19 periods',
    spaceTimetable && spaceTimetable.length === 19, spaceTimetable?.length, 19);

  // 2.5 Invalid input handling
  const emptyTimetable = psgimData.getTimetableForStudent('');
  assertTest('2. Timetable Resolution', '2.5.1', 'getTimetableForStudent("") returns array without throwing',
    Array.isArray(emptyTimetable), Array.isArray(emptyTimetable), true);

  const invalidTimetable = psgimData.getTimetableForStudent('INVALID_ROLL');
  assertTest('2. Timetable Resolution', '2.5.2', 'getTimetableForStudent("INVALID_ROLL") returns array without throwing',
    Array.isArray(invalidTimetable), Array.isArray(invalidTimetable), true);

  // 2.6 Cohort-wide sweep for room validity and zero slashes
  let cohortSlashCount = 0;
  let cohortUnassignedCount = 0;
  for (const s of excelRows) {
    const tt = psgimData.getTimetableForStudent(s.collegeRollNo);
    if (!tt || tt.length === 0) continue;
    for (const slot of tt) {
      if (slot.room && slot.room.includes('/')) cohortSlashCount++;
      if (!slot.room || slot.room.trim() === '' || slot.room.includes('TBD') || slot.room.includes('undefined')) {
        cohortUnassignedCount++;
      }
    }
  }
  assertTest('2. Timetable Resolution', '2.6.1', 'Exhaustive cohort sweep: 0 slash rooms across all 252 students',
    cohortSlashCount === 0, cohortSlashCount, 0);

  assertTest('2. Timetable Resolution', '2.6.2', 'Exhaustive cohort sweep: 0 unassigned rooms across all 252 students',
    cohortUnassignedCount === 0, cohortUnassignedCount, 0);

  // 2.7 Cohort Timetable Cross-Check: Querying by College Roll vs D-Roll
  let cohortTimetableMismatches = 0;
  const sampleMismatches = [];
  for (const s of excelRows) {
    const ttC = psgimData.getTimetableForStudent(s.collegeRollNo);
    const ttD = psgimData.getTimetableForStudent(s.dRollNo);
    const batchesC = ttC.map((slot) => slot.batch).sort().join(',');
    const batchesD = ttD.map((slot) => slot.batch).sort().join(',');
    if (batchesC !== batchesD) {
      cohortTimetableMismatches++;
      if (sampleMismatches.length < 3) {
        sampleMismatches.push({
          dRoll: s.dRollNo,
          collegeRoll: s.collegeRollNo,
          name: s.name,
          batchesByCollegeRoll: batchesC,
          batchesByDRoll: batchesD,
        });
      }
    }
  }
  assertTest('2. Timetable Resolution', '2.6.3', 'Cohort sweep: getTimetableForStudent(collegeRoll) matches getTimetableForStudent(dRoll)',
    cohortTimetableMismatches === 0,
    cohortTimetableMismatches === 0 ? 0 : { totalMismatches: cohortTimetableMismatches, samples: sampleMismatches },
    0);

  // ===========================================================================
  // SECTION 3: STORAGE MIGRATION
  // ===========================================================================
  console.log('\n--- SECTION 3: STORAGE MIGRATION & PERIOD KEY TRANSFORMATION ---');

  // Clear memory storage
  window.localStorage.clear();

  // Populate legacy storage for D26AB05
  const legacyPeriodRecords = {
    'slot_D26AB05_Monday_0': {
      slotId: 'slot_D26AB05_Monday_0',
      status: 'PRESENT',
      timestamp: 1730000000,
      topic: 'Dynamic Management',
    },
    'slot_D26AB05_Tuesday_1': {
      slotId: 'slot_D26AB05_Tuesday_1',
      status: 'ABSENT',
      timestamp: 1730086400,
      topic: 'Managerial Accounting',
    },
    'slot_D26AB05_Wednesday_2': {
      slotId: 'slot_D26AB05_Wednesday_2',
      status: 'OD',
      timestamp: 1730172800,
      topic: 'Sports Meet',
    },
  };

  const legacyPeriodReminders = [
    { slotId: 'slot_D26AB05_Monday_0', reminderMinutes: 10, enabled: true },
    { slotId: 'slot_D26AB05_Tuesday_1', reminderMinutes: 15, enabled: false },
  ];

  const legacySurplusAlerts = JSON.stringify({ dismissed: ['slot_D26AB05_Monday_0'] });

  window.localStorage.setItem('@attendance_monitor_period_records_D26AB05', JSON.stringify(legacyPeriodRecords));
  window.localStorage.setItem('@attendance_monitor_period_reminders_D26AB05', JSON.stringify(legacyPeriodReminders));
  window.localStorage.setItem('@attendance_monitor_surplus_alerts_D26AB05', legacySurplusAlerts);

  // Execute migrateStudentData
  await StorageService.migrateStudentData('D26AB05', '26AB12');

  // Verify new storage keys exist
  const migratedRecordsRaw = window.localStorage.getItem('@attendance_monitor_period_records_26AB12');
  assertTest('3. Storage Migration', '3.1.1', '@attendance_monitor_period_records_26AB12 populated',
    migratedRecordsRaw !== null, migratedRecordsRaw !== null, true);

  const migratedRecords = migratedRecordsRaw ? JSON.parse(migratedRecordsRaw) : {};

  // Verify dictionary key renaming
  assertTest('3. Storage Migration', '3.1.2', 'Key slot_26AB12_Monday_0 exists in migrated records',
    Object.prototype.hasOwnProperty.call(migratedRecords, 'slot_26AB12_Monday_0'),
    Object.keys(migratedRecords), ['slot_26AB12_Monday_0', 'slot_26AB12_Tuesday_1', 'slot_26AB12_Wednesday_2']);

  assertTest('3. Storage Migration', '3.1.3', 'Key slot_26AB12_Tuesday_1 exists in migrated records',
    Object.prototype.hasOwnProperty.call(migratedRecords, 'slot_26AB12_Tuesday_1'), true, true);

  assertTest('3. Storage Migration', '3.1.4', 'Legacy key slot_D26AB05_Monday_0 absent from migrated records',
    !Object.prototype.hasOwnProperty.call(migratedRecords, 'slot_D26AB05_Monday_0'), true, true);

  // Verify internal slotId rewrite
  assertTest('3. Storage Migration', '3.1.5', 'Internal slotId transformed to slot_26AB12_Monday_0',
    migratedRecords['slot_26AB12_Monday_0']?.slotId === 'slot_26AB12_Monday_0',
    migratedRecords['slot_26AB12_Monday_0']?.slotId, 'slot_26AB12_Monday_0');

  assertTest('3. Storage Migration', '3.1.6', 'Internal slotId transformed to slot_26AB12_Tuesday_1',
    migratedRecords['slot_26AB12_Tuesday_1']?.slotId === 'slot_26AB12_Tuesday_1',
    migratedRecords['slot_26AB12_Tuesday_1']?.slotId, 'slot_26AB12_Tuesday_1');

  // Verify metadata preservation
  assertTest('3. Storage Migration', '3.1.7', 'Record status preserved across migration (PRESENT)',
    migratedRecords['slot_26AB12_Monday_0']?.status === 'PRESENT',
    migratedRecords['slot_26AB12_Monday_0']?.status, 'PRESENT');

  assertTest('3. Storage Migration', '3.1.8', 'Record topic preserved across migration (Dynamic Management)',
    migratedRecords['slot_26AB12_Monday_0']?.topic === 'Dynamic Management',
    migratedRecords['slot_26AB12_Monday_0']?.topic, 'Dynamic Management');

  assertTest('3. Storage Migration', '3.1.9', 'Record timestamp preserved across migration',
    migratedRecords['slot_26AB12_Monday_0']?.timestamp === 1730000000,
    migratedRecords['slot_26AB12_Monday_0']?.timestamp, 1730000000);

  // Verify reminders migration
  const migratedRemindersRaw = window.localStorage.getItem('@attendance_monitor_period_reminders_26AB12');
  const migratedReminders = migratedRemindersRaw ? JSON.parse(migratedRemindersRaw) : [];
  assertTest('3. Storage Migration', '3.1.10', 'Reminders migrated with transformed slotId',
    migratedReminders.length === 2 && migratedReminders[0].slotId === 'slot_26AB12_Monday_0',
    migratedReminders[0]?.slotId, 'slot_26AB12_Monday_0');

  // Verify surplus alerts migration
  const migratedAlertsRaw = window.localStorage.getItem('@attendance_monitor_surplus_alerts_26AB12');
  assertTest('3. Storage Migration', '3.1.11', 'Surplus alerts migrated to new key',
    migratedAlertsRaw === legacySurplusAlerts, true, true);

  // Test getPeriodRecords auto-migration behavior
  window.localStorage.removeItem('@attendance_monitor_period_records_26AB12');
  const autoMigrated = await StorageService.getPeriodRecords('26AB12');
  assertTest('3. Storage Migration', '3.2.1', 'StorageService.getPeriodRecords("26AB12") auto-migrates from D26AB05',
    autoMigrated && autoMigrated['slot_26AB12_Monday_0']?.status === 'PRESENT',
    autoMigrated['slot_26AB12_Monday_0']?.status, 'PRESENT');

  // Storage Migration Edge cases
  let edgeCaseError = false;
  try {
    await StorageService.migrateStudentData('', '26AB12');
    await StorageService.migrateStudentData('D26AB05', '');
    await StorageService.migrateStudentData('26AB12', '26AB12');
    await StorageService.migrateStudentData(null, undefined);
    await StorageService.migrateStudentData('NON_EXISTENT_ROLL', '26AB12');
  } catch (err) {
    edgeCaseError = true;
  }
  assertTest('3. Storage Migration', '3.3.1', 'migrateStudentData handles invalid/null/self inputs without throwing',
    edgeCaseError === false, edgeCaseError, false);

  // ===========================================================================
  // SECTION 4: PROXY BRIDGING
  // ===========================================================================
  console.log('\n--- SECTION 4: PROXY BRIDGING FOR OUTGOING NETWORK REQUESTS ---');

  // 4.1 toOldRollNo conversion
  assertTest('4. Proxy Bridging', '4.1.1', 'toOldRollNo("26AB12") returns "D26AB05"',
    psgimMaster.toOldRollNo('26AB12') === 'D26AB05', psgimMaster.toOldRollNo('26AB12'), 'D26AB05');

  assertTest('4. Proxy Bridging', '4.1.2', 'toOldRollNo("26ab12") returns "D26AB05" (lowercase)',
    psgimMaster.toOldRollNo('26ab12') === 'D26AB05', psgimMaster.toOldRollNo('26ab12'), 'D26AB05');

  assertTest('4. Proxy Bridging', '4.1.3', 'toOldRollNo("  26AB12  ") returns "D26AB05" (spaces)',
    psgimMaster.toOldRollNo('  26AB12  ') === 'D26AB05', psgimMaster.toOldRollNo('  26AB12  '), 'D26AB05');

  assertTest('4. Proxy Bridging', '4.1.4', 'toOldRollNo("D26AB05") returns "D26AB05" (idempotent)',
    psgimMaster.toOldRollNo('D26AB05') === 'D26AB05', psgimMaster.toOldRollNo('D26AB05'), 'D26AB05');

  // 4.2 Additional Cohort Proxy Mapping
  assertTest('4. Proxy Bridging', '4.2.1', 'toOldRollNo("26AA04") returns "D26AA01" (Akash Vardhaman)',
    psgimMaster.toOldRollNo('26AA04') === 'D26AA01', psgimMaster.toOldRollNo('26AA04'), 'D26AA01');

  assertTest('4. Proxy Bridging', '4.2.2', 'toOldRollNo("26AA27") returns "D26AA02" (Mithun K)',
    psgimMaster.toOldRollNo('26AA27') === 'D26AA02', psgimMaster.toOldRollNo('26AA27'), 'D26AA02');

  assertTest('4. Proxy Bridging', '4.2.3', 'toOldRollNo("26AB33") returns "D26AB01" (Muktha Mathi S)',
    psgimMaster.toOldRollNo('26AB33') === 'D26AB01', psgimMaster.toOldRollNo('26AB33'), 'D26AB01');

  assertTest('4. Proxy Bridging', '4.2.4', 'toOldRollNo("26AB29") returns "D26AB12" (Mathumitha M)',
    psgimMaster.toOldRollNo('26AB29') === 'D26AB12', psgimMaster.toOldRollNo('26AB29'), 'D26AB12');

  // 4.3 Moodle / LMS Username Bridging
  assertTest('4. Proxy Bridging', '4.3.1', 'LmsService.resolveMoodleUsername("26AB12") returns "D26AB05"',
    LmsService.resolveMoodleUsername('26AB12') === 'D26AB05',
    LmsService.resolveMoodleUsername('26AB12'), 'D26AB05');

  assertTest('4. Proxy Bridging', '4.3.2', 'LmsService.resolveMoodleUsername("26ab12") returns "D26AB05" (case insensitive)',
    LmsService.resolveMoodleUsername('26ab12') === 'D26AB05',
    LmsService.resolveMoodleUsername('26ab12'), 'D26AB05');

  assertTest('4. Proxy Bridging', '4.3.3', 'LmsService.resolveMoodleUsername("  26AB12  ") returns "D26AB05" (whitespace)',
    LmsService.resolveMoodleUsername('  26AB12  ') === 'D26AB05',
    LmsService.resolveMoodleUsername('  26AB12  '), 'D26AB05');

  // ===========================================================================
  // SECTION 5: ZERO EMOJI POLICY AUDIT
  // ===========================================================================
  console.log('\n--- SECTION 5: ZERO EMOJI POLICY AUDIT ---');

  // Comprehensive Unicode Emoji regular expression
  const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

  const filesToScan = [
    'App.tsx',
    'scripts/buildPwa.js',
    'src/components/AttendanceDisputeModal.tsx',
    'src/components/DigitalIdModal.tsx',
    'src/data/psgimData.ts',
    'src/data/psgimMasterStudents.ts',
    'src/screens/AdminDashboardScreen.tsx',
    'src/screens/AuthScreen.tsx',
    'src/screens/CalendarScreen.tsx',
    'src/screens/DashboardScreen.tsx',
    'src/screens/ReconcileScreen.tsx',
    'src/screens/TimetableScreen.tsx',
    'src/services/disputeReportService.ts',
    'src/services/lmsService.ts',
    'src/services/psgimService.ts',
    'src/services/storageService.ts',
    'src/services/studzoneService.ts',
    'TEST_INFRA.md',
    'TEST_READY.md',
    'tests/e2e_college_roll_audit.cjs',
  ];

  let totalEmojiViolations = 0;
  const emojiViolationDetails = [];

  for (const relPath of filesToScan) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      const match = line.match(emojiRegex);
      if (match) {
        totalEmojiViolations++;
        emojiViolationDetails.push({ file: relPath, line: idx + 1, char: match[0] });
      }
    });
  }

  assertTest('5. Zero Emoji Policy', '5.1.1', 'Zero emojis detected across all updated project files',
    totalEmojiViolations === 0,
    totalEmojiViolations === 0 ? 0 : emojiViolationDetails,
    0);

  // ===========================================================================
  // REPORT & SUMMARY
  // ===========================================================================
  console.log('\n================================================================================');
  console.log('ADVERSARIAL STRESS-TEST AUDIT SUMMARY');
  console.log('================================================================================');
  console.log(`Total Checks Executed:  ${totalChecks}`);
  console.log(`Passed Checks:          ${passedChecks}`);
  console.log(`Failed Checks:          ${failedChecks}`);
  console.log(`Success Rate:           ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
  console.log('================================================================================');

  if (failedChecks > 0) {
    console.error('\nFAILURES DETECTED:');
    failures.forEach((f) => {
      console.error(`- [${f.section}] ${f.testId}: ${f.description}`);
    });
    process.exit(1);
  } else {
    console.log('\nVERDICT: CONFIRM CORRECTNESS');
    console.log('All adversarial stress tests passed with 0 failures.');
    process.exit(0);
  }
}

runAdversarialSuite().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
