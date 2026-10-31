# Comprehensive Investigation & Survey Report: Timetable Engine, Faculty Roster, Classroom Resolution, Build Pipeline & Zero Emoji Policy

**Author**: `explorer_survey_2`  
**Date**: 2026-10-30T15:15:00Z  
**Working Directory**: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\explorer_survey_2`  
**Target Project**: `attendance-monitor`  

---

## 1. Observation

### 1.1 `getTimetableForStudent` Resolution Engine
- **File Location**: `src/data/psgimData.ts`, lines 3845–3910.
- **Function Signature**: `export function getTimetableForStudent(rollNo: string)`
- **Slot Count**:
  - Regular enrolled students (Batches A, B, C, D) resolve to **19 periods** across Monday through Saturday.
  - Batch AE students (`D26AE01` through `D26AE13`) resolve to only **15 periods** because their `SSM` and `SPORTS` fields in `STUDENT_REGISTRY` were initialized to empty strings `""` (lines 3757, 3762 in `src/data/psgimData.ts`), omitting the 3 SSM slots (including Saturday full-day) and 1 sports slot.
- **Slot Filtering Logic**:
  - `cleanRoll` is converted to `oldRoll` (`toOldRollNo`) and `newRoll` (`toNewRollNo`).
  - `studentBatches` extracts non-empty string values from `student.batches`.
  - Filters `MASTER_SCHEDULE` where `slot.applicableBatches.includes('*')` OR `slot.applicableBatches.some((b) => studentBatches.includes(b))`.
  - Collision Guard (lines 3871–3877): deduplicates by `${slot.day}_${slot.startTime}` using a `Set<string>`.
  - Mapping (lines 3879–3909): extracts group number from student batch string using regex `/\d+$/`, fetches `facultyName` from `course.faculty[courseGroupNum]`, and resolves room using `resolveExactRoom(slot.course, courseGroupNum, slot.defaultRoom)`.

### 1.2 Master Faculty Roster Verification
In `src/data/psgimData.ts` (lines 16–135), `PSGIM_COURSES` defines the master faculty roster. Comparing line-by-line against `ORIGINAL_REQUEST.md`:

| Course | Group | Expected Faculty (ORIGINAL_REQUEST.md) | Actual in `PSGIM_COURSES` | Status |
|---|---|---|---|---|
| **MCOB** | 1 | Dr. M. Kirupa Priyadarshini | Dr. M. Kirupa Priyadarshini (line 22) | MATCH |
| | 2 | Dr. Vijaya Vardhan Manchala | Dr. Vijaya Vardhan Manchala (line 23) | MATCH |
| | 3 | Dr. R. Indumathy | Dr. R. Indumathy (line 24) | MATCH |
| | 4 | Dr. N. Udayakumar | Dr. N. Udayakumar (line 25) | MATCH |
| **EDM** | 1 | Dr. Sreeanandan | Dr. Sreeanandan (line 35) | MATCH |
| | 2 | Dr. Aiswarya D Pillai | Dr. Aiswarya D Pillai (line 36) | MATCH |
| | 3 | Dr. E. Sri Varshini | Dr. E. Sri Varshini (line 37) | MATCH |
| | 4 | Dr. Sreeanandan | Dr. Sreeanandan (line 38) | MATCH |
| **ADM** | 1 | Dr. J. Nancy Christina | Dr. J. Nancy Christina (line 48) | MATCH |
| | 2 | Dr. D. Kavitha | Dr. D. Kavitha (line 49) | MATCH |
| | 3 | Dr. Nithya | Dr. Nithya (line 50) | MATCH |
| | 4 | Dr. Aiswarya D Pillai | Dr. Aiswarya D Pillai (line 51) | MATCH |
| **BS** | 1 | Mr. T. Sathish | Mr. T. Sathish (line 61) | MATCH |
| | 2 | Dr. J. Sekkizhar | Dr. J. Sekkizhar (line 62) | MATCH |
| | 3 | Dr. Ravi Shankar Jetti | Dr. Ravi Shankar Jetti (line 63) | MATCH |
| | 4 | Mr. T. Sathish | Mr. T. Sathish (line 64) | MATCH |
| **MC** | 1 | Dr. R. Deepa | Dr. R. Deepa (line 74) | MATCH |
| | 2 | Dr. R. Indumathy | Dr. R. Indumathy (line 75) | MATCH |
| | 3 | Dr. E. Sri Varshini | Dr. E. Sri Varshini (line 76) | MATCH |
| | 4 | Dr. Chenna Upendra | Dr. Chenna Upendra (line 77) | MATCH |
| **SSA Lab** | 1 | Mr. G. Kangasabapathy | Mr. G. Kangasabapathy (line 87) | MATCH |
| | 2 | Mr. Imayavendan | Mr. Imayavendan (line 88) | MATCH |
| | 3 | Mr. G. Kangasabapathy | Mr. G. Kangasabapathy (line 89) | MATCH |
| | 4 | Mr. Imayavendan | Mr. Imayavendan (line 90) | MATCH |
| **SSM** | 1 | Dr. D. Kavitha | Dr. D. Kavitha (line 100) | MATCH |
| | 2 | Ms. C. Dhanya | Ms. C. Dhanya (line 101) | MATCH |
| | 3 | Ms. Kanagathara | Ms. Kanagathara (line 102) | MATCH |
| | 4 | Dr. Venkatalakshmi | Dr. Venkatalakshmi (line 103) | MATCH |
| **LA** | 1 | Ms. C. Dhanya | Ms. C. Dhanya (line 113) | MATCH |
| | 2 | Ms. C. Dhanya | Ms. C. Dhanya (line 114) | MATCH |
| | 3 | Ms. C. Dhanya | Ms. C. Dhanya (line 115) | MATCH |
| | 4 | Dr. Firdaus Bashir | Dr. Firdaus Bashir (line 116) | MATCH |
| **Sports** | 1, 2, 3, 4 | Mr. Zakeer Khan | Mr. Zakeer Khan (lines 126–129) | MATCH |

- **Faculty Roster Audit Result**: Automated test across all 257 enrolled students against expected faculties yielded **0 mismatches**.
- **Special Period Note**: Thursday 14:35 slot is `CLUB` (`applicableBatches: ['*']`). `CLUB` is not in `PSGIM_COURSES`, so `course?.faculty` is undefined and falls back to `'Faculty'` (line 3893).

### 1.3 Classroom Mappings & Slash Rooms (`LH-101/109/401/405`)
- **File Location**: `src/data/psgimData.ts`, `resolveExactRoom` (lines 3814–3840):
  ```typescript
  export function resolveExactRoom(course: string, groupNum: number, defaultRoom: string): string {
    if (course === 'SPORTS') return 'Sports Ground';
    if (course === 'CLUB') return 'Auditorium / Clubs';
    if (defaultRoom && (defaultRoom.includes('ALPS') || defaultRoom === 'SSM')) return 'SSM';

    // Spreadsheet Applications (SSA) Lab / Hall mappings
    if (course === 'SSA') {
      switch (groupNum) {
        case 1: return 'LH-401';
        case 2: return 'LH-405';
        case 3: return 'LH-101';
        case 4: return 'LH-109';
        default: return defaultRoom && !defaultRoom.includes('/') ? defaultRoom : 'LH-101';
      }
    }

    // Standard courses: MCOB, EDM, ADM, BS, MC, SSM, LA
    switch (groupNum) {
      case 1: return 'LH-101';
      case 2: return 'LH-109';
      case 3: return 'LH-401';
      case 4: return 'LH-405';
      default:
        if (defaultRoom && !defaultRoom.includes('/')) return defaultRoom;
        return 'LH-101';
    }
  }
  ```

- **Origin of Slash Rooms in `MASTER_SCHEDULE`**:
  `MASTER_SCHEDULE` (lines 146–191) contains multiple simultaneous lecture hall slots where the circular listed combined rooms in the `defaultRoom` field:
  - Monday 08:30 SSA: `defaultRoom: 'LH-401/405'`
  - Monday 10:40 ADM: `defaultRoom: 'LH-101/109/401/405'`
  - Monday 13:40 BS: `defaultRoom: 'LH-101/109/401'`
  - Tuesday 08:30 MCOB: `defaultRoom: 'LH-101/109/401/405'`
  - Tuesday 10:40 EDM: `defaultRoom: 'LH-101/109/401'`
  - Tuesday 13:40 MC: `defaultRoom: 'LH-101/109/401/405'`
  - Wednesday 08:30 BS: `defaultRoom: 'LH-101/109/401'`
  - Wednesday 10:40 MCOB: `defaultRoom: 'LH-101/109/401/405'`
  - Wednesday 13:40 SSA: `defaultRoom: 'LH-101/109'`
  - Thursday 08:30 MC: `defaultRoom: 'LH-101/109/401/405'`
  - Thursday 10:40 ADM: `defaultRoom: 'LH-101/109/401/405'`
  - Thursday 13:40 MC: `defaultRoom: 'LH-101/109/401/405'`
  - Thursday 14:35 CLUB: `defaultRoom: 'Auditorium / Clubs'`
  - Friday 08:30 EDM: `defaultRoom: 'LH-101/109/401'`
  - Friday 10:40 LA: `defaultRoom: 'LH-401/405'`
  - Friday 10:40 SSA: `defaultRoom: 'LH-101/109'`
  - Friday 13:40 SSA: `defaultRoom: 'LH-401/405'`

- **Resolution Outcome**:
  - When `getTimetableForStudent` runs, `resolveExactRoom` executes for every slot.
  - For MCOB, EDM, ADM, BS, MC, SSM, LA: mapped deterministically to single LH rooms (`LH-101`, `LH-109`, `LH-401`, `LH-405`).
  - For SSA: mapped to SSA Lab rooms (1 -> `LH-401`, 2 -> `LH-405`, 3 -> `LH-101`, 4 -> `LH-109`).
  - For SPORTS: mapped to `'Sports Ground'`.
  - For Saturday SSM: mapped to `'SSM'`.
  - **UNRESOLVED SLASH ROOM OCCURRENCE**:
    Every single student has slot Thursday 14:35 with room `'Auditorium / Clubs'`. This contains a slash (`/`), directly triggering the violation in Acceptance Criteria ("Zero unassigned or slash-separated rooms (e.g. LH-101/109) in generated timetables").

### 1.4 Build Scripts, TypeScript Config & Test Setups
- **`package.json`**:
  ```json
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:web": "npx expo export -p web",
    "build:pwa": "node scripts/buildPwa.js",
    "test": "node tests/attendanceEngine.test.js",
    "eas-build-pre-install": "npm config set legacy-peer-deps true"
  }
  ```
- **TypeScript Configuration (`tsconfig.json`)**:
  ```json
  {
    "extends": "expo/tsconfig.base",
    "compilerOptions": {
      "target": "es2020",
      "module": "esnext",
      "moduleResolution": "bundler",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true
    }
  }
  ```
- **`tsc --noEmit` Verification**:
  - Executed command: `npx tsc --noEmit` in root directory.
  - Result: **Exit Code 0** (No compile or type errors detected).
- **`npm run build:pwa` Verification**:
  - Executed command: `npm run build:pwa` in root directory.
  - Exported Metro Web bundle (`_expo/static/js/web/index-*.js`, 2MB).
  - Injected PWA assets and HTML script tags into `dist/`.
  - Result: **Exit Code 0**.

### 1.5 Zero Emoji Policy Audit
- **Project Rule Defined in `.cursorrules`**:
  ```markdown
  ## 1. Zero Emoji Policy (Strict)
  - Never use emojis anywhere in the app UI, text labels, alerts, button titles, logs, modals, cards, banners, or headers.
  - Always use clean, professional typography, icons (e.g. Ionicons, MaterialIcons, Feather), or standard text indicators (e.g. [OK], [Warning], [Notice], [Live], bullet points) instead of emojis.
  - This rule applies universally across all .tsx, .ts, .html, and metadata files.
  ```
- **Data File Audit**:
  - `src/data/psgimData.ts`: **0 emojis** detected.
  - `src/data/psgimMasterStudents.ts`: **0 emojis** detected.
- **Existing Emoji Violations in Repo (Pre-existing)**:
  - `scripts/buildPwa.js` (lines 10, 13, 63): `🚀`, `📦`, `✅`.
  - `App.tsx` (lines 140, 887, 898, 912, 923): `🌟`, `⚡`, `🗂️`, `🗓️`, `🌐`.
  - `src/screens/ReconcileScreen.tsx` (50+ occurrences in text labels, alert titles, modal buttons).
  - `src/screens/MedicalVaultScreen.tsx` (lines 408, 420, 457): `📅`.
  - `src/services/coursePlanService.ts` (lines 114, 123, 131): `🎉`, `⚠️`, `🎯`.
  - `src/services/disputeReportService.ts` (lines 208–219): `👤`, `🏫`, `📅`, `🕒`, `⚠️`, `✓`.

### 1.6 Roll Number Resolution & Registry Discrepancy
- **Internal D-Roll Numbers vs College Roll Numbers**:
  - In `src/data/psgimMasterStudents.ts`, PSGIM assigns internal admission D-Rolls (`D26AA01` through `D26AD65`, 252 students) in admission order, whereas official college roll numbers (`26AA01` through `26AD65`) are re-sorted alphabetically by student name.
  - Example:
    - `D26AA01` = AKASH VARDHAMAN -> College Roll No: `26AA04`
    - `D26AA27` = A R SRISHAA -> College Roll No: `26AA01`
    - `D26AB05` = DEVDARSHAN V -> College Roll No: `26AB12`
    - `D26AB56` = AMULYA P -> College Roll No: `26AB05`
- **Observations on Acceptance Criteria Requirements**:
  `ORIGINAL_REQUEST.md` line 59 states:
  ```markdown
  - 26AA01 / D26AA01 resolves to: MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3.
  - 26AB05 resolves to: MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3.
  ```
  - In the official 6-page Dynamic Course Batch List, row `D26AA01` has: `MCOB1 ADM1 MC2 SSM1 BS1 EDM3 LA1 SSA3`.
  - Row `D26AB05` has: `MCOB1 ADM2 MC3 SSM2 BS2 EDM1 LA1 SSA3`.
  - This indicates that user queries may supply either `26AA01` or `D26AA01` expecting it to match the batch assignment of row `D26AA01`, OR `STUDENT_REGISTRY` needs dual keys (with and without `D`, as well as mapping the official college roll number).

---

## 2. Logic Chain

1. **Premise 1 (R3 Requirement)**: Every period in `getTimetableForStudent` must map to the designated faculty member, and no period may have an unresolved slash room (`/`).
2. **Step 2 (Faculty Evaluation)**:
   - Automated check against the 9 course keys in `PSGIM_COURSES` matched all faculty names verbatim.
   - For regular periods, `course.faculty[groupNum]` correctly returns the professor designated in `ORIGINAL_REQUEST.md`.
3. **Step 3 (Slash Room Evaluation)**:
   - For all 8 standard academic subjects plus SSA, `resolveExactRoom` transforms the slash-separated `defaultRoom` (`LH-101/109/401/405`) into a single lecture hall based on `groupNum`.
   - However, for `CLUB` (Thursday 14:35), `resolveExactRoom` explicitly returns `'Auditorium / Clubs'`, which contains a slash.
   - Therefore, the timetable resolution engine emits a slash room for every student on Thursday afternoon unless `resolveExactRoom` is amended to return `'Auditorium'` or similar single venue.
4. **Premise 4 (Completeness Requirement R1 & Acceptance Criteria)**:
   - 100% of students across Batches A, B, C, D, and AE must be in `STUDENT_REGISTRY` with non-empty course groups.
5. **Step 5 (Batch AE Gap Evaluation)**:
   - In `scripts/generatePsgimData.js`, lines 269–285 explicitly overwrote `ssmBatch` and `sportsBatch` to `''` for Section AE, ignoring the valid SSM values present in `rawLines` (e.g. `SSM1` for `D26AE01`, `SSM2` for `D26AE02`).
   - Consequently, `src/data/psgimData.ts` contains `SSM: ""` and `SPORTS: ""` for `D26AE01` through `D26AE13`.
   - When `getTimetableForStudent` runs for `D26AE01` through `D26AE13`, `slot.applicableBatches.some(b => studentBatches.includes(b))` evaluates to `false` for Saturday SSM and weekday sports, cutting their schedule from 19 to 15 slots.
6. **Premise 6 (Build & Quality Requirement R4)**:
   - `tsc --noEmit` and `npm run build:pwa` must pass with exit code 0, and Zero Emoji Policy must be upheld.
7. **Step 7 (Build Pipeline Evaluation)**:
   - Direct execution proved `tsc --noEmit` exits with 0 and `npm run build:pwa` exits with 0.
   - However, `scripts/buildPwa.js` logs emojis (`🚀`, `📦`, `✅`), violating `.cursorrules`.

---

## 3. Caveats

1. **Official PDF Document Access**:
   The uploaded PDF files in `.user_uploaded` are scanned images without raw text streams. The parsed records in `scripts/generatePsgimData.js` (`rawLines`) serve as the source of truth for dynamic batch assignments across 252 lines (`D26AA01` through `D26AE13`).
2. **Missing Roll Numbers in Batch AE**:
   In `rawLines`, `D26AE10` is skipped (goes from `D26AE09` to `D26AE11`). This matches the official 6-page circular structure where student numbers may have gaps.
3. **Saturday SSM Venue**:
   `resolveExactRoom` maps Saturday SSM to `'SSM'`. If the audit requires Saturday SSM to map to individual lecture halls (`LH-101`, `LH-109`, `LH-401`, `LH-405`) based on `groupNum`, `resolveExactRoom` should be adjusted.
4. **Read-Only Constraint**:
   In strict adherence to Explorer protocol, no source files were modified.

---

## 4. Conclusion

1. **Faculty Roster**: **100% compliant**. All 9 subjects map to the exact professors required by `ORIGINAL_REQUEST.md`.
2. **Classroom Resolution**:
   - Academic subjects (MCOB, EDM, ADM, BS, MC, SSA, SSM, LA) and Sports correctly resolve to individual rooms.
   - **Defect Identified**: Thursday 14:35 `CLUB` returns `'Auditorium / Clubs'`, causing an unresolved slash room in every student's timetable.
3. **Batch AE Defect Identified**:
   - `D26AE01` through `D26AE13` have `SSM: ""` and `SPORTS: ""` in `STUDENT_REGISTRY`, omitting Saturday SSM and sports periods.
4. **Roll Number Mapping**:
   - `STUDENT_REGISTRY` currently only indexes by `D`-prefixed roll numbers (`D26AA01`).
   - If a student looks up via `26AA01` or `26AB05`, `STUDENT_REGISTRY` must either be keyed bidirectionally (both with and without `D`, and via `collegeRollNo`), or `getTimetableForStudent` should resolve direct key fallbacks.
5. **Build & Quality**:
   - `tsc --noEmit`: **Passes (exit code 0)**.
   - `npm run build:pwa`: **Passes (exit code 0)**.
   - `Zero Emoji Policy`: Maintained in data files, but emoji cleanup is required in `scripts/buildPwa.js` console output.

---

## 5. Verification Method

To independently verify all findings in this report, execute the following commands in powershell at `c:\Users\DELL\OneDrive\Documents\attendance-monitor`:

1. **Verify TypeScript Compilation**:
   ```powershell
   npx tsc --noEmit
   ```
   *Expected outcome*: Exit code 0, no output.

2. **Verify Production PWA Build**:
   ```powershell
   npm run build:pwa
   ```
   *Expected outcome*: Exit code 0, dist bundle generated.

3. **Verify Slash Rooms & Faculty Engine via Survey Script**:
   ```powershell
   node .agents/teamwork/explorer_survey_2/survey_analysis.js
   ```
   *Expected outcome*:
   - Errors: 0
   - Slash room: Exactly `CLUB on Thursday 14:35 has room: "Auditorium / Clubs"`
   - Faculty mismatches: 0
   - College roll lookup: 252/252

4. **Verify Zero Emojis in Data Files**:
   ```powershell
   node -e "const fs = require('fs'); const regex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u; ['src/data/psgimData.ts', 'src/data/psgimMasterStudents.ts'].forEach(f => { const lines = fs.readFileSync(f, 'utf8').split('\n'); lines.forEach((l, i) => { if (regex.test(l)) console.log(f + ':' + (i+1)); }); }); console.log('Data files emoji check clean');"
   ```
