# Handoff Report: Review & Adversarial Audit for College Roll Number Migration

**Author**: `reviewer_m_1` (Role: Reviewer & Adversarial Critic)  
**Date**: 2026-10-31  
**Verdict**: **REQUEST_CHANGES**  

---

## 1. Observation

### Verification Commands & Results
- **E2E Test Suite**: `node tests/e2e_college_roll_audit.cjs` -> Exited 0 (99/99 passed).
- **TypeScript Typecheck**: `npx tsc --noEmit` -> Exited 0 (0 errors).
- **PWA Production Build**: `npm run build:pwa` -> Exited 0 (`[OK] PWA Build Complete! Dist folder ready at: C:\Users\DELL\OneDrive\Documents\attendance-monitor\dist`).

### Devdarshan V Verification (Single Student Focus)
- `getMasterStudent('26AB12')`: Resolves `DEVDARSHAN V`, Batch `B`, College Roll `26AB12`, D-Roll `D26AB05`.
- `toNewRollNo('D26AB05')`: Returns `'26AB12'`.
- `toOldRollNo('26AB12')`: Returns `'D26AB05'`.
- `getTimetableForStudent('26AB12')`: Returns 19 periods with `LA1` -> `LH-101` [Ms. C. Dhanya], `MC3` -> `LH-401` [Dr. E. Sri Varshini], `SSA3` -> `LH-101` [Mr. G. Kangasabapathy]. No slash or unassigned rooms.
- UI Shielding: Dashboard, Timetable, Reconcile, Calendar, and DigitalIdModal display `26AB12`.

### Adversarial Findings & Discrepancies
1. **Critical Integrity Violation / Shortcut in `STUDENT_REGISTRY` (`src/data/psgimData.ts`)**:
   - `STUDENT_REGISTRY` in `src/data/psgimData.ts` contains college roll keys (e.g. `"26AA04"`, `"26AB05"`), but only `"26AB12"` was synchronized with `scripts/excel_mapping.csv`.
   - Cross-checking all 252 students from `scripts/excel_mapping.csv` against `STUDENT_REGISTRY`:
     - **224 out of 252 students have batch mismatches** when looked up by their College Roll Number.
     - **12 students are completely missing** from `STUDENT_REGISTRY` by College Roll Number (`26AA61`, `26AA62`, `26AB61`, `26AB62`, `26AB63`, `26AC61`, `26AC62`, `26AD61`, `26AD62`, `26AD63`, `26AD64`, `26AD65`).
   - Line 7308 in `src/data/psgimData.ts`:
     ```ts
     const student = STUDENT_REGISTRY[cleanRoll] || STUDENT_REGISTRY[oldRoll] || STUDENT_REGISTRY[newRoll];
     ```
     Because `STUDENT_REGISTRY[cleanRoll]` exists, querying with a College Roll Number like `'26AA04'` retrieves `STUDENT_REGISTRY['26AA04']` (which holds DEVIKA BABU `D26AA04`'s batches) rather than AKASH VARDHAMAN (`D26AA01`)'s batches!
   - Verbatim check on `26AA04`:
     - `getTimetableForStudent('26AA04')` returned slots for MCOB4, EDM2, MC4, LA3, SSA1.
     - `getTimetableForStudent('D26AA01')` returned slots for MCOB1, EDM3, MC2, LA1, SSA3.
     - Result: `collegeSlots === dSlots` evaluated to `false`.

2. **Critical Integrity Violation / Hardcoded Alias Hijacking Student AMULYA P (`26AB05`)**:
   - In `src/data/psgimMasterStudents.ts` line 321:
     ```ts
     export function toNewRollNo(inputRoll: string): string {
       if (!inputRoll) return '';
       const clean = inputRoll.trim().toUpperCase();
       if (clean === 'D26AB05' || clean === '26AB05') {
         return '26AB12';
       }
       const student = getStudentByAnyRoll(inputRoll);
       if (student) return student.collegeRollNo;
       return clean.startsWith('D') ? clean.substring(1) : clean;
     }
     ```
   - In `src/data/psgimMasterStudents.ts` lines 298-301:
     ```ts
     if (clean === '26AB05' && PSGIM_MASTER_STUDENTS['D26AB05']) {
       return PSGIM_MASTER_STUDENTS['D26AB05'];
     }
     ```
   - In `scripts/excel_mapping.csv` line 131 and `psgimMasterStudents.ts` line 131:
     `D26AB56,26AB05,AMULYA P`
   - Result: Running `toNewRollNo('26AB05')` returns `'26AB12'` (Devdarshan V) instead of `'26AB05'`! When Amulya P enters her own official College Roll Number `26AB05`, she is hijacked into Devdarshan V.

3. **Policy Violation: Zero Emoji Policy Breaches**:
   - `App.tsx` line 199:
     ```ts
     // ⏱️ Active Foreground Time Tracking (Increments active time per minute while student uses the app)
     ```
     Contains Unicode character `U+23F1` (`⏱`).
   - `src/screens/DashboardScreen.tsx` line 1544:
     ```tsx
     <Text style={styles.reminderModalIcon}>⏰</Text>
     ```
     Contains Unicode character `U+23F0` (`⏰`).

4. **Blind Spot in E2E Test Suite (`tests/e2e_college_roll_audit.cjs`)**:
   - Test `T3.3.4` (line 1071) only asserted `timetableBatchA.length === 19 && studentBatchA?.batch === 'A'`. It never asserted that the courses, batches, or rooms matched Akash Vardhaman's official groups (`D26AA01`).
   - Test `T2.5.2.COHORT` only asserted `toNewRollNo(dRoll) === collegeRoll` and `toOldRollNo(collegeRoll) === dRoll`, failing to assert idempotency `toNewRollNo(collegeRoll) === collegeRoll`, which allowed the `26AB05` hijacking bug to evade detection.

---

## 2. Logic Chain

1. **Premise 1**: ORIGINAL_REQUEST.md (Requirements R1, R2, R3, R4 and Architectural Finding 2026-10-30T16:50:27Z) and PROJECT.md mandate that College Roll Numbers serve as the primary identifier for ALL 252 students without regression, and that every student's timetable resolves to their line-by-line official circular groups with 0% discrepancy.
2. **Premise 2**: Direct observation shows that in `psgimData.ts`, only `26AB12` was updated to reflect Devdarshan's batches. The remaining non-D college roll keys in `STUDENT_REGISTRY` were left in a legacy state where `26AA04` points to `D26AA04` instead of `D26AA01`.
3. **Inference 1**: Because `getTimetableForStudent` prioritizes `STUDENT_REGISTRY[cleanRoll]`, when any student other than Devdarshan calls `getTimetableForStudent` with their college roll number, they receive the wrong student's groups and classrooms (224 mismatches).
4. **Premise 3**: In `psgimMasterStudents.ts`, the obsolete condition `clean === '26AB05'` forces `toNewRollNo` to return `'26AB12'`.
5. **Inference 2**: Because student Amulya P's real college roll number is `26AB05`, she cannot use the app without being converted to Devdarshan V.
6. **Premise 4**: Project policy strictly mandates zero emojis in modified files.
7. **Inference 3**: `App.tsx:199` and `DashboardScreen.tsx:1544` violate the Zero Emoji Policy.
8. **Conclusion**: The current implementation satisfies requirements for Devdarshan V in isolation, but fails requirements R1, R2, R3, R4 for the cohort, contains critical integrity shortcuts/hardcoding, and violates the Zero Emoji Policy.

---

## 3. Caveats

- Isolated Devdarshan V flows (login, timetable, session, network proxy bridging) function as expected when tested in isolation.
- `npx tsc --noEmit` and `npm run build:pwa` compile cleanly.
- The Cloudflare worker and Moodle endpoints were simulated and statically audited; live network reachability depends on network connectivity.

---

## 4. Conclusion

**Verdict: REQUEST_CHANGES**

The work cannot be approved in its current state due to two Critical findings tagged as INTEGRITY VIOLATION (cohort registry shortcut and hardcoded roll hijacking) and one Major policy finding (Unicode emojis in source code).

### Required Changes:
1. **Fix `src/data/psgimMasterStudents.ts`**:
   - In `toNewRollNo` (line 321), change `if (clean === 'D26AB05' || clean === '26AB05')` to `if (clean === 'D26AB05')`.
   - In `getStudentByAnyRoll` (lines 298-301), remove the fallback alias that maps `'26AB05'` to `'D26AB05'`.
2. **Fix `src/data/psgimData.ts`**:
   - In `getTimetableForStudent` (line 7308), ensure the student record is retrieved via the legacy D-Roll:
     ```ts
     const dRoll = toOldRollNo(cleanRoll);
     const student = STUDENT_REGISTRY[dRoll] || STUDENT_REGISTRY[cleanRoll];
     ```
   - Update `STUDENT_REGISTRY` so that for all 252 students in `scripts/excel_mapping.csv`, `STUDENT_REGISTRY[collegeRoll]` references the exact same batches as `STUDENT_REGISTRY[dRoll]`.
3. **Fix Zero Emoji Policy Breaches**:
   - Remove `⏱️` from `App.tsx:199`.
   - Replace `⏰` in `src/screens/DashboardScreen.tsx:1544` with clean ASCII / text (e.g. `[REMINDER]` or `[TIME]`).
4. **Harden `tests/e2e_college_roll_audit.cjs`**:
   - Add assertion for all 252 students: `toNewRollNo(row.collegeRollNo) === row.collegeRollNo`.
   - Add assertion for all 252 students: `getTimetableForStudent(row.collegeRollNo)` matches `getTimetableForStudent(row.dRollNo)`.

---

## 5. Verification Method

To verify whether the issues are present:
1. **Check Amulya P Roll Hijacking**:
   ```bash
   node -e "const { toNewRollNo } = require('./src/data/psgimMasterStudents.ts'); console.log(toNewRollNo('26AB05'));"
   ```
   *Expected if broken*: `'26AB12'`. *Expected if fixed*: `'26AB05'`.
2. **Check Cohort Timetable Discrepancy**:
   ```bash
   node -e "const { getTimetableForStudent } = require('./src/data/psgimData.ts'); const c = getTimetableForStudent('26AA04'); const d = getTimetableForStudent('D26AA01'); console.log('Match:', JSON.stringify(c) === JSON.stringify(d));"
   ```
   *Expected if broken*: `Match: false`. *Expected if fixed*: `Match: true`.
3. **Check Emojis**:
   ```bash
   node -e "const fs = require('fs'); const r = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu; console.log('App.tsx:', (fs.readFileSync('App.tsx','utf8').match(r)||[]).length); console.log('DashboardScreen.tsx:', (fs.readFileSync('src/screens/DashboardScreen.tsx','utf8').match(r)||[]).length);"
   ```
   *Expected if broken*: >0. *Expected if fixed*: 0.
