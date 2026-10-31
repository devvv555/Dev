# Challenger Audit Report: College Roll Number Migration Verification

**Auditor**: Challenger Subagent (`challenger_m_1`)  
**Date**: 2026-10-31  
**Target Milestone**: College Roll Primary Identifier Migration & Full Uniformity  
**Verdict**: **REJECT** (Critical Cohort Desynchronization, Identity Collision, and Emoji Violations)

---

## 1. Observation

### 1.1 Empirical Test Execution Results
Executed test suite: `node tests/adversarial_roll_migration_audit.cjs`
```
================================================================================
EMPIRICAL CHALLENGER: ADVERSARIAL STRESS-TEST SUITE
College Roll Number Migration Verification
================================================================================

--- SECTION 1: LOGIN PERMUTATIONS & NORMALIZATION IDEMPOTENCY ---
[FAIL] 1. Login Permutations | 1.5.1: Exhaustive 252 students bidirectional normalization passes 100%
       Actual:   1
       Expected: 0

--- SECTION 2: TIMETABLE RESOLUTION & CLASSROOM ALLOCATIONS ---
[FAIL] 2. Timetable Resolution | 2.6.3: Cohort sweep: getTimetableForStudent(collegeRoll) matches getTimetableForStudent(dRoll)
       Actual:   {"totalMismatches":224,"samples":[{"dRoll":"D26AA01","collegeRoll":"26AA04","name":"AKASH VARDHAMAN","batchesByCollegeRoll":"ADM1,ADM1,BS1,BS1,CLUB1,EDM2,EDM2,LA3,MC4,MC4,MC4,MCOB4,MCOB4,SPORTS1,SSA1,SSA1,SSM1,SSM1,SSM1","batchesByDRoll":"ADM1,ADM1,BS1,BS1,CLUB1,EDM3,EDM3,LA1,MC2,MC2,MC2,MCOB1,MCOB1,SPORTS1,SSA3,SSA3,SSM1,SSM1,SSM1"},{"dRoll":"D26AA02","collegeRoll":"26AA27","name":"MITHUN K","batchesByCollegeRoll":"ADM3,ADM3,BS3,BS3,CLUB1,EDM3,EDM3,LA1,MC3,MC3,MC3,MCOB3,MCOB3,SPORTS1,SSA4,SSA4,SSM1,SSM1,SSM1","batchesByDRoll":"ADM1,ADM1,BS2,BS2,CLUB1,EDM2,EDM2,LA3,MC1,MC1,MC1,MCOB2,MCOB2,SPORTS1,SSA1,SSA1,SSM1,SSM1,SSM1"},{"dRoll":"D26AA03","collegeRoll":"26AA38","name":"R NIVEDA","batchesByCollegeRoll":"ADM2,ADM2,BS2,BS2,CLUB1,EDM2,EDM2,LA3,MC4,MC4,MC4,MCOB2,MCOB2,SPORTS1,SSA2,SSA2,SSM1,SSM1,SSM1","batchesByDRoll":"ADM1,ADM1,BS3,BS3,CLUB1,EDM1,EDM1,LA1,MC3,MC3,MC3,MCOB3,MCOB3,SPORTS1,SSA3,SSA3,SSM1,SSM1,SSM1"}]}
       Expected: 0

--- SECTION 3: STORAGE MIGRATION & PERIOD KEY TRANSFORMATION ---

--- SECTION 4: PROXY BRIDGING FOR OUTGOING NETWORK REQUESTS ---

--- SECTION 5: ZERO EMOJI POLICY AUDIT ---
[FAIL] 5. Zero Emoji Policy | 5.1.1: Zero emojis detected across all updated project files
       Actual:   [{"file":"src/services/disputeReportService.ts","line":210,"char":"👤"},{"file":"src/services/disputeReportService.ts","line":211,"char":"🏫"},{"file":"src/services/disputeReportService.ts","line":212,"char":"📅"},{"file":"src/services/disputeReportService.ts","line":213,"char":"🕒"},{"file":"src/services/disputeReportService.ts","line":221,"char":"⚠"},{"file":"src/services/disputeReportService.ts","line":225,"char":"✓"}]
       Expected: 0

================================================================================
ADVERSARIAL STRESS-TEST AUDIT SUMMARY
================================================================================
Total Checks Executed:  67
Passed Checks:          64
Failed Checks:          3
Success Rate:           95.5%
================================================================================
```

### 1.2 Devdarshan V Isolated Verification (PASSED)
- Direct Login `26AB12`, `26ab12`, `  26AB12  `: All return `26AB12`.
- Legacy Login `D26AB05`, `d26ab05`, `  D26AB05  `: All normalize to `26AB12`.
- Normalization Idempotency: `toNewRollNo(toNewRollNo('D26AB05')) === '26AB12'`.
- Timetable Resolution: `getTimetableForStudent('26AB12')` returns exactly 19 weekly periods.
- Specific Classrooms:
  - `LA1` -> `LH-101`
  - `MC3` -> `LH-401`
  - `SSA3` -> `LH-101`
  - `MCOB1` -> `LH-101`
  - `ADM2` -> `LH-109`
  - `BS2` -> `LH-109`
  - `EDM1` -> `LH-101`
- 0 slash rooms and 0 unassigned rooms for Devdarshan V.
- Storage Migration: `migrateStudentData('D26AB05', '26AB12')` successfully renames keys from `slot_D26AB05_...` to `slot_26AB12_...` and updates internal `slotId`.
- Proxy Bridging: `toOldRollNo('26AB12') === 'D26AB05'` and `LmsService.resolveMoodleUsername('26AB12') === 'D26AB05'`.

### 1.3 Finding 1: Identity Collision & Normalization Bug for Student AMULYA P (`26AB05` / `D26AB56`)
In `scripts/excel_mapping.csv`, line 118:
```csv
D26AB56, 26AB05, AMULYA P
```
In `src/data/psgimMasterStudents.ts`, lines 320-323:
```typescript
320:   const clean = inputRoll.trim().toUpperCase();
321:   if (clean === 'D26AB05' || clean === '26AB05') {
322:     return '26AB12';
323:   }
```
And lines 298-301:
```typescript
298:   // 3. Backward compatibility alias: if someone queries "26AB05", map to Devdarshan V
299:   if (clean === '26AB05' && PSGIM_MASTER_STUDENTS['D26AB05']) {
300:     return PSGIM_MASTER_STUDENTS['D26AB05'];
301:   }
```
Empirical output when testing `toNewRollNo('26AB05')`:
```javascript
toNewRollNo('26AB05') === '26AB12'  // Expected '26AB05'
toNewRollNo(toOldRollNo('26AB05')) === '26AB05' // Discrepancy!
```

### 1.4 Finding 2: Cohort Timetable Desynchronization (224 / 252 Students Affected)
In `src/data/psgimData.ts`, line 7308:
```typescript
7308:   const student = STUDENT_REGISTRY[cleanRoll] || STUDENT_REGISTRY[oldRoll] || STUDENT_REGISTRY[newRoll];
```
In `STUDENT_REGISTRY`:
`STUDENT_REGISTRY['26AA01']` contains Akash Vardhaman's (`D26AA01`) batches (`MCOB1`, `ADM1`, `BS1`).
However, in `scripts/excel_mapping.csv`, `26AA01` is A R SRISHAA (`D26AA27`), whose actual batches in `STUDENT_REGISTRY['D26AA27']` are (`MCOB3`, `ADM3`, `BS3`).
Empirical test result:
```javascript
getTimetableForStudent('26AA01'): [ 'LA1', 'ADM1', 'BS1', 'MCOB1', 'EDM3' ]  // Akash Vardhaman
getTimetableForStudent('D26AA27'): [ 'LA1', 'ADM3', 'BS3', 'MCOB3', 'EDM3' ]  // A R Srishaa
```
Total students with mismatched schedules between College Roll and D-Roll: **224 out of 252 students**.

### 1.5 Finding 3: Zero Emoji Policy Violations in Modified Code
`git status` reports `M src/services/disputeReportService.ts`.
In `src/services/disputeReportService.ts`, lines 210-225:
```typescript
210:     summaryText += `👤 Student: ${studentName} (${collegeRoll})\n`;
211:     summaryText += `🏫 Class: I MBA (2026–28) • ${section}\n`;
212:     summaryText += `📅 Official Portal Period: ${portalFromDate} to ${portalToDate}\n`;
213:     summaryText += `🕒 Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n`;
...
221:         summaryText += `   ⚠️ Discrepancy: +${item.deltaAttended} hrs marked present in class but missing on portal.\n`;
...
225:         summaryText += `   ✓ Records Match (100% Reconciled)\n`;
```

---

## 2. Logic Chain

1. **Premise 1 (Roster Ground Truth)**: `scripts/excel_mapping.csv` is the authoritative 1:1 ground truth establishing College Roll Numbers and D-Roll Numbers for all 252 students (e.g. `D26AB56` -> `26AB05`, `D26AA27` -> `26AA01`).
2. **Step 2 (Identity Collision Inference)**: In `psgimMasterStudents.ts`, the hardcoded legacy shortcut `clean === '26AB05' => '26AB12'` was left in place from an earlier draft when Devdarshan V was mistakenly believed to be `26AB05`. Because `clean === '26AB05'` intercepts queries before registry resolution, any student authenticating with `26AB05` (AMULYA P) is forcibly mapped to Devdarshan V (`26AB12`), breaking login, session persistence, and normalization idempotency.
3. **Step 3 (Timetable Resolution Inference)**: In `psgimData.ts`, `STUDENT_REGISTRY` contains keys populated under the naive assumption that `D26AAxx` maps to `26AAxx`. When `getTimetableForStudent` is invoked with a student's College Roll Number (e.g. `26AA01`), it checks `STUDENT_REGISTRY[cleanRoll]` first. Because the key exists with another student's courses, 224 students receive the wrong student's schedule. The schedule only resolves correctly if queried with `D26AA27` or if `oldRoll` is prioritized over stale naive college roll keys.
4. **Step 4 (Policy Compliance Inference)**: `ORIGINAL_REQUEST.md` (R4) and `PROJECT.md` strictly mandate zero emojis across all updated files. `src/services/disputeReportService.ts` was updated during this migration to use `toNewRollNo`, but retains 6 unicode emojis (`👤`, `🏫`, `📅`, `🕒`, `⚠️`, `✓`).
5. **Deduction**: Because the implementation produces wrong timetable data for 88.8% of the cohort, hijacks student `26AB05`'s identity, and violates the Zero Emoji Policy, the migration cannot be accepted as correct in its current state.

---

## 3. Caveats

- **Devdarshan V Isolated Flow**: The isolated user journey for Devdarshan V (`26AB12` / `D26AB05`) works correctly (19 periods, exact classrooms `LH-101`, `LH-401`, `LH-109`, proxy bridging to `D26AB05`, and local storage migration).
- **TypeScript & Build**: `npx tsc --noEmit` and `node scripts/buildPwa.js` compile with exit code 0.
- **Scope of Review**: This audit operated under review-only constraints and did NOT edit implementation files.

---

## 4. Conclusion

**Verdict: REJECT**

The College Roll Number migration is **REJECTED** due to three blocking defects:
1. **Critical Defect**: In `src/data/psgimMasterStudents.ts` line 321, `toNewRollNo('26AB05')` returns `'26AB12'` (Devdarshan V), preventing official student AMULYA P (`26AB05`) from accessing her account and violating normalization idempotency.
2. **Critical Defect**: In `src/data/psgimData.ts` line 7308, `STUDENT_REGISTRY` is desynchronized with `scripts/excel_mapping.csv`, causing 224 out of 252 students to receive incorrect timetable slots when querying by their official College Roll Number.
3. **Compliance Defect**: In `src/services/disputeReportService.ts`, lines 210-225 contain 6 unicode emojis, violating the Zero Emoji Policy.

---

## 5. Verification Method

### How to Independently Reproduce

1. **Execute Empirical Adversarial Test Harness**:
   ```bash
   node tests/adversarial_roll_migration_audit.cjs
   ```
   *Expected outcome*: Exits with code 1, reporting failures in `1.5.1`, `2.6.3`, and `5.1.1`.

2. **Verify Amulya P Identity Collision**:
   ```bash
   node -e "const m = require('./src/data/psgimMasterStudents.ts'); console.log('toNewRollNo(26AB05):', m.toNewRollNo('26AB05'));"
   ```
   *Observation*: Prints `26AB12` instead of `26AB05`.

3. **Verify Cohort Timetable Desynchronization**:
   ```bash
   node -e "const d = require('./src/data/psgimData.ts'); console.log('26AA01 schedule:', d.getTimetableForStudent('26AA01').map(s=>s.batch).slice(0,3)); console.log('D26AA27 schedule:', d.getTimetableForStudent('D26AA27').map(s=>s.batch).slice(0,3));"
   ```
   *Observation*: `26AA01` returns `LA1, ADM1, BS1` (Akash Vardhaman) while `D26AA27` returns `LA1, ADM3, BS3` (A R Srishaa).

4. **Verify Emoji Policy Violations**:
   ```bash
   node -e "const fs = require('fs'); const content = fs.readFileSync('src/services/disputeReportService.ts', 'utf8'); const m = content.match(/[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u); console.log('Found emoji:', m ? m[0] : 'None');"
   ```
   *Observation*: Reports presence of emojis (`👤`, `🏫`, etc.).
