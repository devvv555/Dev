// PSG Institute of Management - Empirical Challenger Verification Harness
// Iteration 2 Recheck
// Strictly compliant with project-wide Zero Emoji Policy (0 emojis).

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('typescript');

// 1. In-memory LocalStorage polyfill
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

// 2. TypeScript on-the-fly compiler
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

// 3. Load project files
const ROOT_DIR = path.resolve(__dirname, '..');
const psgimData = require(path.join(ROOT_DIR, 'src', 'data', 'psgimData.ts'));
const psgimMaster = require(path.join(ROOT_DIR, 'src', 'data', 'psgimMasterStudents.ts'));
const storageServiceModule = require(path.join(ROOT_DIR, 'src', 'services', 'storageService.ts'));
const StorageService = storageServiceModule.StorageService;
const lmsServiceModule = require(path.join(ROOT_DIR, 'src', 'services', 'lmsService.ts'));
const LmsService = lmsServiceModule.LmsService;
const studzoneServiceModule = require(path.join(ROOT_DIR, 'src', 'services', 'studzoneService.ts'));
const StudzoneService = studzoneServiceModule.StudzoneService;

// 4. Load CSV mapping
const rawCsv = fs.readFileSync(path.join(ROOT_DIR, 'scripts', 'excel_mapping.csv'), 'utf8');
const excelRows = rawCsv
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l.length > 0 && !l.startsWith('#'))
  .map((l) => {
    const parts = l.split(',');
    return {
      dRollNo: parts[0]?.trim() || '',
      collegeRollNo: parts[1]?.trim() || '',
      name: parts[2]?.trim() || '',
    };
  })
  .filter((r) => r.dRollNo && r.collegeRollNo);

console.log('Authoritative cohort students loaded from CSV:', excelRows.length);

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failureDetails = [];

function check(testName, condition, actual, expected) {
  totalChecks++;
  if (condition) {
    passedChecks++;
  } else {
    failedChecks++;
    failureDetails.push({ testName, actual, expected });
    console.error(`[FAIL] ${testName}`);
    if (actual !== undefined || expected !== undefined) {
      console.error(`       Actual:   ${JSON.stringify(actual)}`);
      console.error(`       Expected: ${JSON.stringify(expected)}`);
    }
  }
}

async function runEmpiricalAudit() {
  console.log('\n================================================================');
  console.log('1. 252-STUDENT COHORT PARITY AUDIT');
  console.log('================================================================');

  let batchMismatchCount = 0;
  let missingKeyCount = 0;
  let timetableMismatchCount = 0;
  let totalPeriodCount = 0;

  for (const s of excelRows) {
    const dRec = psgimData.STUDENT_REGISTRY[s.dRollNo];
    const colRec = psgimData.STUDENT_REGISTRY[s.collegeRollNo];

    if (!dRec) {
      missingKeyCount++;
      console.error(`Missing dRoll in registry: ${s.dRollNo}`);
    }
    if (!colRec) {
      missingKeyCount++;
      console.error(`Missing collegeRoll in registry: ${s.collegeRollNo}`);
    }

    if (dRec && colRec) {
      // Compare dynamic course batches
      const dKeys = Object.keys(dRec.batches).sort();
      const colKeys = Object.keys(colRec.batches).sort();
      let batchesEqual = dKeys.length === colKeys.length;
      if (batchesEqual) {
        for (const k of dKeys) {
          if (dRec.batches[k] !== colRec.batches[k]) {
            batchesEqual = false;
            break;
          }
        }
      }
      if (!batchesEqual) {
        batchMismatchCount++;
        console.error(`Batch mismatch for ${s.name} (${s.dRollNo} vs ${s.collegeRollNo}):`, dRec.batches, colRec.batches);
      }
    }

    // Compare timetable resolution
    const ttCol = psgimData.getTimetableForStudent(s.collegeRollNo);
    const ttD = psgimData.getTimetableForStudent(s.dRollNo);

    totalPeriodCount += (ttCol ? ttCol.length : 0);

    if (!ttCol || !ttD || ttCol.length !== ttD.length) {
      timetableMismatchCount++;
    } else {
      for (let i = 0; i < ttCol.length; i++) {
        const slotC = ttCol[i];
        const slotD = ttD[i];
        if (
          slotC.day !== slotD.day ||
          slotC.time !== slotD.time ||
          slotC.subject !== slotD.subject ||
          slotC.room !== slotD.room ||
          slotC.faculty !== slotD.faculty ||
          slotC.batch !== slotD.batch
        ) {
          timetableMismatchCount++;
          break;
        }
      }
    }
  }

  check('Cohort size is exactly 252', excelRows.length === 252, excelRows.length, 252);
  check('STUDENT_REGISTRY missing key count is 0', missingKeyCount === 0, missingKeyCount, 0);
  check('STUDENT_REGISTRY[colRoll].batches === STUDENT_REGISTRY[dRoll].batches for all 252', batchMismatchCount === 0, batchMismatchCount, 0);
  check('getTimetableForStudent(colRoll) matches getTimetableForStudent(dRoll) for all 252', timetableMismatchCount === 0, timetableMismatchCount, 0);
  check('Total resolved periods across 252 students equals 4,773', totalPeriodCount === 4773, totalPeriodCount, 4773);

  console.log(`Cohort parity results: ${passedChecks}/${totalChecks} checks passed (Total periods verified: ${totalPeriodCount})`);

  console.log('\n================================================================');
  console.log('2. IDEMPOTENCY & DISAMBIGUATION AUDIT');
  console.log('================================================================');

  let idempotencyFails = 0;
  for (const s of excelRows) {
    const res = psgimMaster.toNewRollNo(s.collegeRollNo);
    if (res !== s.collegeRollNo) {
      idempotencyFails++;
      console.error(`Idempotency fail: toNewRollNo(${s.collegeRollNo}) returned ${res}`);
    }
  }

  check('toNewRollNo(colRoll) === colRoll for all 252 students', idempotencyFails === 0, idempotencyFails, 0);
  check('toNewRollNo("26AB05") === "26AB05"', psgimMaster.toNewRollNo('26AB05') === '26AB05', psgimMaster.toNewRollNo('26AB05'), '26AB05');
  check('toNewRollNo("D26AB05") === "26AB12"', psgimMaster.toNewRollNo('D26AB05') === '26AB12', psgimMaster.toNewRollNo('D26AB05'), '26AB12');
  check('toOldRollNo("26AB05") === "D26AB56"', psgimMaster.toOldRollNo('26AB05') === 'D26AB56', psgimMaster.toOldRollNo('26AB05'), 'D26AB56');
  check('toOldRollNo("26AB12") === "D26AB05"', psgimMaster.toOldRollNo('26AB12') === 'D26AB05', psgimMaster.toOldRollNo('26AB12'), 'D26AB05');
  check('toOldRollNo("D26AB05") === "D26AB05"', psgimMaster.toOldRollNo('D26AB05') === 'D26AB05', psgimMaster.toOldRollNo('D26AB05'), 'D26AB05');
  check('toOldRollNo("D26AB56") === "D26AB56"', psgimMaster.toOldRollNo('D26AB56') === 'D26AB56', psgimMaster.toOldRollNo('D26AB56'), 'D26AB56');

  // Verify student identity resolution
  const studAmulya = psgimMaster.getMasterStudent('26AB05');
  check('getMasterStudent("26AB05") resolves to AMULYA P', studAmulya?.name === 'AMULYA P', studAmulya?.name, 'AMULYA P');
  check('getMasterStudent("26AB05") has dRollNo D26AB56', studAmulya?.dRollNo === 'D26AB56', studAmulya?.dRollNo, 'D26AB56');

  const studDevdarshan = psgimMaster.getMasterStudent('26AB12');
  check('getMasterStudent("26AB12") resolves to DEVDARSHAN V', studDevdarshan?.name === 'DEVDARSHAN V', studDevdarshan?.name, 'DEVDARSHAN V');
  check('getMasterStudent("26AB12") has dRollNo D26AB05', studDevdarshan?.dRollNo === 'D26AB05', studDevdarshan?.dRollNo, 'D26AB05');

  console.log('\n================================================================');
  console.log('3. DEVDARSHAN V SPECIFICS AUDIT');
  console.log('================================================================');

  const devTt = psgimData.getTimetableForStudent('26AB12');
  check('getTimetableForStudent("26AB12") returns 19 periods', devTt.length === 19, devTt.length, 19);

  const laSlots = devTt.filter((s) => s.shortForm === 'LA');
  check('LA slots count > 0', laSlots.length > 0, laSlots.length, '>0');
  check('LA1 resolves to LH-101 for all periods', laSlots.every((s) => s.room === 'LH-101'), laSlots.map((s) => s.room), ['LH-101']);

  const mcSlots = devTt.filter((s) => s.shortForm === 'MC');
  check('MC slots count > 0', mcSlots.length > 0, mcSlots.length, '>0');
  check('MC3 resolves to LH-401 for all periods', mcSlots.every((s) => s.room === 'LH-401'), mcSlots.map((s) => s.room), ['LH-401']);

  const ssaSlots = devTt.filter((s) => s.shortForm === 'SSA');
  check('SSA slots count > 0', ssaSlots.length > 0, ssaSlots.length, '>0');
  check('SSA3 resolves to LH-101 for all periods', ssaSlots.every((s) => s.room === 'LH-101'), ssaSlots.map((s) => s.room), ['LH-101']);

  // Offline login checks with 13DEC05 and 13AUG05
  // Simulate network offline by ensuring fetch will fail or testing StudzoneService.verifyLogin directly
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error('Network offline (simulated)');
  };

  try {
    const authDec = await StudzoneService.verifyLogin('26AB12', '13DEC05');
    check('Offline login 26AB12 with 13DEC05 succeeds', authDec.success === true && authDec.rollNo === '26AB12', authDec, { success: true, rollNo: '26AB12' });

    const authAug = await StudzoneService.verifyLogin('26AB12', '13AUG05');
    check('Offline login 26AB12 with 13AUG05 succeeds', authAug.success === true && authAug.rollNo === '26AB12', authAug, { success: true, rollNo: '26AB12' });

    const authLegacyDec = await StudzoneService.verifyLogin('D26AB05', '13DEC05');
    check('Offline login D26AB05 with 13DEC05 normalizes to 26AB12', authLegacyDec.success === true && authLegacyDec.rollNo === '26AB12', authLegacyDec, { success: true, rollNo: '26AB12' });

    const authLegacyAug = await StudzoneService.verifyLogin('D26AB05', '13AUG05');
    check('Offline login D26AB05 with 13AUG05 normalizes to 26AB12', authLegacyAug.success === true && authLegacyAug.rollNo === '26AB12', authLegacyAug, { success: true, rollNo: '26AB12' });

    const authWrong = await StudzoneService.verifyLogin('26AB12', '01JAN05');
    check('Offline login 26AB12 with wrong password 01JAN05 fails', authWrong.success === false, authWrong.success, false);
  } finally {
    global.fetch = originalFetch;
  }

  // Proxy bridging: verify outgoing payload uses D26AB05 and never exposes D26AB05 to UI
  let capturedPayload = null;
  global.fetch = async (url, options) => {
    capturedPayload = { url, options };
    return {
      ok: true,
      json: async () => ({ success: true, records: [{ semester: 1 }] }),
      text: async () => 'mock response',
    };
  };

  try {
    const proxyResult = await StudzoneService.verifyLogin('26AB12', '13DEC05');
    check('Proxy verifyLogin returns college roll 26AB12 to UI', proxyResult.rollNo === '26AB12', proxyResult.rollNo, '26AB12');
    const sentBody = capturedPayload?.options?.body ? JSON.parse(capturedPayload.options.body) : null;
    check('Proxy bridging translates outgoing body rollNo to D26AB05', sentBody?.rollNo === 'D26AB05', sentBody?.rollNo, 'D26AB05');

    // LMS proxy bridging
    const moodleUser = LmsService.resolveMoodleUsername('26AB12');
    check('LmsService translates 26AB12 to D26AB05 for Moodle authentication', moodleUser === 'D26AB05', moodleUser, 'D26AB05');
  } finally {
    global.fetch = originalFetch;
  }

  console.log('\n================================================================');
  console.log('4. ZERO EMOJI POLICY AUDIT (MIGRATION SCOPE)');
  console.log('================================================================');

  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2300}-\u{23FF}\u{2B50}]|\p{Extended_Pictographic}/gu;

  const migrationTargetFiles = [
    'App.tsx',
    'scripts/buildPwa.js',
    'src/components/AttendanceDisputeModal.tsx',
    'src/components/CoursePlanModal.tsx',
    'src/components/DigitalIdModal.tsx',
    'src/components/LmsAssignmentCard.tsx',
    'src/components/LmsQuizCard.tsx',
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
    'tests/adversarial_roll_migration_audit.cjs',
    'tests/e2e_college_roll_audit.cjs',
  ];

  let migrationEmojiViolations = 0;
  for (const f of migrationTargetFiles) {
    const full = path.join(ROOT_DIR, f);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      const match = line.match(emojiRegex);
      if (match) {
        migrationEmojiViolations++;
        console.error(`Emoji violation in ${f}:${idx + 1}: ${match.join(',')} | ${line.trim()}`);
      }
    });
  }

  check('Zero emojis found across all 24 migration files', migrationEmojiViolations === 0, migrationEmojiViolations, 0);

  console.log('\n================================================================');
  console.log('SUMMARY AUDIT RESULTS');
  console.log('================================================================');
  console.log(`Total checks:  ${totalChecks}`);
  console.log(`Passed checks: ${passedChecks}`);
  console.log(`Failed checks: ${failedChecks}`);

  if (failedChecks === 0) {
    console.log('\nEMPIRICAL VERDICT: CONFIRM CORRECTNESS (100% PASS)');
    process.exit(0);
  } else {
    console.error(`\nEMPIRICAL VERDICT: REJECT (${failedChecks} FAILURES DETECTED)`);
    process.exit(1);
  }
}

runEmpiricalAudit().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
