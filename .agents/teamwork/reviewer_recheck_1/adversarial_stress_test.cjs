const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Hook TypeScript
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

const ROOT = path.resolve(__dirname, '../../..');

// In-memory LocalStorage polyfill for Node.js
const memoryStorage = {};
global.window = {
  localStorage: {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(memoryStorage, key) ? memoryStorage[key] : null),
    setItem: (key, value) => { memoryStorage[key] = String(value); },
    removeItem: (key) => { delete memoryStorage[key]; },
    clear: () => { Object.keys(memoryStorage).forEach((key) => delete memoryStorage[key]); },
  },
};

const psgimData = require(path.join(ROOT, 'src/data/psgimData.ts'));
const psgimMaster = require(path.join(ROOT, 'src/data/psgimMasterStudents.ts'));
const { StorageService } = require(path.join(ROOT, 'src/services/storageService.ts'));
const { StudzoneService } = require(path.join(ROOT, 'src/services/studzoneService.ts'));

let failures = [];
function assert(name, cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${name} -> ${msg}`);
    failures.push(`${name}: ${msg}`);
  } else {
    console.log(`PASS: ${name}`);
  }
}

async function run() {
  // 1. ADVERSARIAL AUTH LOGIC SIMULATION
  console.log('\n--- 1. AUTH LOGIC ATTACK SIMULATION ---');
  function simulateAuth(rollInput, passInput) {
    const cleanRoll = rollInput.trim().toUpperCase().replace(/\s+/g, '');
    const rawPass = passInput.trim();
    const officialRoll = psgimMaster.toNewRollNo(cleanRoll) || cleanRoll;

    const student = psgimMaster.getMasterStudent(cleanRoll) || psgimMaster.getMasterStudent(officialRoll);
    if (student && student.dobPassword && student.dobPassword.toUpperCase() === rawPass.toUpperCase()) {
      return { success: true, rollNo: officialRoll, student };
    }
    return { success: false, error: 'Invalid credentials.' };
  }

  // Devdarshan correct
  let res = simulateAuth('26AB12', '13DEC05');
  assert('Devdarshan college roll login with correct pass', res.success && res.rollNo === '26AB12', JSON.stringify(res));

  res = simulateAuth('26ab12', '13dec05');
  assert('Devdarshan lowercase input & pass', res.success && res.rollNo === '26AB12', JSON.stringify(res));

  res = simulateAuth('D26AB05', '13DEC05');
  assert('Devdarshan legacy D-roll input auto-normalizes to 26AB12', res.success && res.rollNo === '26AB12', JSON.stringify(res));

  // Devdarshan wrong pass
  res = simulateAuth('26AB12', 'WRONGPASS');
  assert('Devdarshan rejected on wrong password', !res.success, 'should have failed');

  res = simulateAuth('D26AB05', '01JAN00');
  assert('Devdarshan rejected on bogus password via D-roll', !res.success, 'should have failed');

  // Cross-account attack: Devdarshan password for Amulya
  res = simulateAuth('26AB05', '13DEC05');
  assert('Amulya P rejects Devdarshan password', !res.success, 'should have failed');

  // Cross-account attack: Amulya password for Devdarshan
  res = simulateAuth('26AB12', '08NOV00');
  assert('Devdarshan rejects Amulya password', !res.success, 'should have failed');

  // Amulya valid login
  res = simulateAuth('26AB05', '08NOV00');
  assert('Amulya P college roll login', res.success && res.rollNo === '26AB05' && res.student.name === 'AMULYA P', JSON.stringify(res));

  res = simulateAuth('D26AB56', '08nov00');
  assert('Amulya P legacy D-roll login normalizes to 26AB05', res.success && res.rollNo === '26AB05' && res.student.name === 'AMULYA P', JSON.stringify(res));

  // Nonexistent student
  res = simulateAuth('99ZZ99', '13DEC05');
  assert('Nonexistent roll number rejected', !res.success, 'should have failed');

  // Empty inputs
  res = simulateAuth('', '');
  assert('Empty credentials rejected', !res.success, 'should have failed');


  // 2. TIMETABLE INTEGRITY FOR DEVDARSHAN
  console.log('\n--- 2. TIMETABLE INTEGRITY FOR DEVDARSHAN V ---');
  const ttDev = psgimData.getTimetableForStudent('26AB12');
  assert('Devdarshan timetable returns 19 periods', ttDev.length === 19, `Got ${ttDev.length}`);

  // Check specific key course assignments
  const laSlot = ttDev.find(s => s.shortForm === 'LA');
  assert('LA slot room is LH-101 and batch is LA1', laSlot && laSlot.room === 'LH-101' && laSlot.batch === 'LA1', JSON.stringify(laSlot));

  const mcSlot = ttDev.find(s => s.shortForm === 'MC');
  assert('MC slot room is LH-401 and batch is MC3', mcSlot && mcSlot.room === 'LH-401' && mcSlot.batch === 'MC3', JSON.stringify(mcSlot));

  const ssaSlot = ttDev.find(s => s.shortForm === 'SSA');
  assert('SSA slot room is LH-101 and batch is SSA3', ssaSlot && ssaSlot.room === 'LH-101' && ssaSlot.batch === 'SSA3', JSON.stringify(ssaSlot));

  // Check zero slash rooms across all Devdarshan slots
  const hasSlashDev = ttDev.some(s => s.room.includes('/'));
  assert('Zero slash rooms in Devdarshan timetable', !hasSlashDev, 'Found slash room');


  // 3. STORAGE MIGRATION ADVERSARIAL TEST
  console.log('\n--- 3. STORAGE MIGRATION ADVERSARIAL TEST ---');
  global.window.localStorage.clear();
  const legacyKey = '@attendance_monitor_period_records_D26AB05';
  const legacyData = {
    'slot_D26AB05_Monday_0': { slotId: 'slot_D26AB05_Monday_0', subject: 'LA', status: 'present' }
  };
  global.window.localStorage.setItem(legacyKey, JSON.stringify(legacyData));

  // Fetch using college roll number 26AB12 via async getPeriodRecords
  const fetched = await StorageService.getPeriodRecords('26AB12');
  assert('StorageService migrates and returns legacy period records under 26AB12',
    fetched && fetched['slot_26AB12_Monday_0'] && fetched['slot_26AB12_Monday_0'].subject === 'LA',
    JSON.stringify(fetched)
  );

  // Verify canonical key in localStorage
  const canonicalKey = '@attendance_monitor_period_records_26AB12';
  const rawCanonical = global.window.localStorage.getItem(canonicalKey);
  assert('Canonical storage key created after migration', rawCanonical !== null, 'Canonical key missing');


  // 4. SUMMARY
  console.log('\n======================================================');
  if (failures.length === 0) {
    console.log('ALL ADVERSARIAL TESTS AND STRESS SCENARIOS PASSED (0 FAILURES)');
    process.exit(0);
  } else {
    console.error(`COMPLETED WITH ${failures.length} FAILURES`);
    process.exit(1);
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
