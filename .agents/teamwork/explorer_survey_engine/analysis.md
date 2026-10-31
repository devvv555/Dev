# Requirement R3 Analysis: Storage, Attendance & Timetable Continuity

## Executive Summary

This investigation provides the authoritative technical analysis for Requirement R3 (Storage, Attendance & Timetable Continuity) and related Acceptance Criteria for migrating the attendance-monitor application to College Roll Numbers.

### Core Discoveries
1. **Student Identifier Discrepancy & Schedule Resolution**:
   - Devdarshan V's official College Roll Number assigned by the college is **26AB12** (alphabetical position #12 in Section B).
   - His legacy internal roll number in college ERP systems (Studzone and Moodle) is **D26AB05**.
   - In the existing codebase, `26AB12` was mistakenly assigned to Mathumitha M in `psgimMasterStudents.ts` and `psgimData.ts`. Consequently, calling `getTimetableForStudent('26AB12')` currently returns Mathumitha M's schedule (`LA3` -> `LH-401`, `MC4` -> `LH-405`, `SSA1` -> `LH-401`) instead of Devdarshan V's schedule (`LA1` -> `LH-101`, `MC3` -> `LH-401`, `SSA3` -> `LH-101`).
   - Aligning `26AB12` to Devdarshan V in `STUDENT_REGISTRY` and `PSGIM_MASTER_STUDENTS` resolves this discrepancy immediately and ensures `getTimetableForStudent('26AB12')` returns all 19 weekly periods with 100% correct classrooms.
2. **Studzone & Moodle Proxy Bridging**:
   - The external college endpoints (Cloudflare Worker proxy and direct PSG portal) require the legacy internal roll number `D26AB05`.
   - By encapsulating `toOldRollNo(rollNo)` inside `StudzoneService.verifyLogin`, `StudzoneService.loginAndExtractAttendance`, and `LmsService.syncWithMoodle`, the entire UI, state, and storage remain purely on `26AB12` while the external HTTP requests transparently bridge to `D26AB05`.
3. **Storage Continuity & Migration**:
   - An inventory of 14 storage keys across AsyncStorage was conducted.
   - Student period records (`@attendance_monitor_period_records_${rollNo}`), period reminders, surplus alerts, LMS assignments, and custom settings must be migrated.
   - Crucial finding: Inside `PeriodAttendanceRecord`, the dictionary keys and `slotId` contain the roll number (e.g. `2026-10-30_slot_D26AB05_Monday_0`). A robust migration must transform the dictionary keys to `_slot_26AB12_` to match the newly generated slot IDs in the active timetable.

---

## 1. Timetable & Schedule Engine Investigation

### 1.1 `getTimetableForStudent` Call Chain & Current Behavior
In `src/data/psgimData.ts` (lines 7303-7368):
```typescript
export function getTimetableForStudent(rollNo: string) {
  const cleanRoll = (rollNo || '').toUpperCase();
  const oldRoll = toOldRollNo(cleanRoll);
  const newRoll = toNewRollNo(cleanRoll);
  const master = getMasterStudent(cleanRoll) || getMasterStudent(oldRoll) || getMasterStudent(newRoll);
  const student = STUDENT_REGISTRY[cleanRoll] || STUDENT_REGISTRY[oldRoll] || STUDENT_REGISTRY[newRoll];
  ...
```

**Live Test Execution (Baseline Code)**:
Running `getTimetableForStudent` in Node.js revealed:
- `getTimetableForStudent('D26AB05')`:
  - Total slots: 19 periods
  - LA: `LA1`, Room: `LH-101`, Faculty: `Ms. C. Dhanya`
  - MC: `MC3`, Room: `LH-401`, Faculty: `Dr. E. Sri Varshini`
  - SSA: `SSA3`, Room: `LH-101`, Faculty: `Mr. G. Kangasabapathy`
- `getTimetableForStudent('26AB12')`:
  - Total slots: 19 periods
  - LA: `LA3`, Room: `LH-401`, Faculty: `Ms. C. Dhanya`
  - MC: `MC4`, Room: `LH-405`, Faculty: `Dr. Chenna Upendra`
  - SSA: `SSA1`, Room: `LH-401`, Faculty: `Mr. G. Kangasabapathy`

**Root Cause**:
In `src/data/psgimMasterStudents.ts`:
- Line 81: `"D26AB05": { dRollNo: "D26AB05", collegeRollNo: "26AB05", name: "DEVDARSHAN V", batch: "B" }`
- Line 88: `"D26AB12": { dRollNo: "D26AB12", collegeRollNo: "26AB12", name: "MATHUMITHA M", batch: "B" }`
In `src/data/psgimData.ts`:
- Lines 1105-1117: `"D26AB05"` has Devdarshan V's dynamic batches (`MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3, SPORTS2`).
- Lines 4731-4743: `"26AB12"` has Mathumitha M's dynamic batches (`MCOB4, ADM3, MC4, SSM2, BS3, EDM1, LA3, SSA1, SPORTS2`).

**Solution**:
1. In `src/data/psgimMasterStudents.ts`:
   - Set Devdarshan V's `collegeRollNo: "26AB12"` and `dobPassword: "13AUG05"`.
   - Update `STUDENTS_BY_NEW_ROLL["26AB12"]` to point to Devdarshan V.
   - Retain alias/fallback mapping for `26AB05` pointing to Devdarshan V to maintain backwards compatibility with existing test suites.
2. In `src/data/psgimData.ts`:
   - Set `STUDENT_REGISTRY["26AB12"]` to Devdarshan V's exact dynamic batch groups:
     ```json
     "26AB12": {
       "rollNo": "26AB12",
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
     }
     ```
   - Keep `STUDENT_REGISTRY["D26AB05"]` and `STUDENT_REGISTRY["26AB05"]` identical to ensure complete bidirectional accessibility.

**Verified Test Simulation**:
With this mapping applied:
- `toOldRollNo('26AB12')` -> `'D26AB05'`
- `toNewRollNo('D26AB05')` -> `'26AB12'`
- `getMasterStudent('26AB12')` -> `DEVDARSHAN V`
- `getTimetableForStudent('26AB12')`:
  - 19 weekly periods
  - `LA1` -> `LH-101`
  - `MC3` -> `LH-401`
  - `SSA3` -> `LH-101`

### 1.2 `resolveExactRoom` Engine Inspection
In `src/data/psgimData.ts` (lines 7270-7298):
- `resolveExactRoom('LA', 1, 'LH-101/109/401')`: Case 1 returns `'LH-101'`.
- `resolveExactRoom('MC', 3, 'LH-401')`: Case 3 returns `'LH-401'`.
- `resolveExactRoom('SSA', 3, 'LH-101/401')`: SSA Case 3 returns `'LH-101'`.
- `resolveExactRoom('ADM', 2, 'LH-109')`: Case 2 returns `'LH-109'`.
- `resolveExactRoom('BS', 2, 'LH-109')`: Case 2 returns `'LH-109'`.
- `resolveExactRoom('EDM', 1, 'LH-101')`: Case 1 returns `'LH-101'`.
- `resolveExactRoom('MCOB', 1, 'LH-101')`: Case 1 returns `'LH-101'`.
- `resolveExactRoom('SSM', 2, 'SSM')`: Returns `'SSM'`.
- `resolveExactRoom('SPORTS', 2, 'Sports Ground')`: Returns `'Sports Ground'`.
Zero slashes, zero generic 'TBD' or unassigned rooms are returned.

### 1.3 `psgimService.ts` Faculty Resolution Defect
In `src/services/psgimService.ts` line 159:
```typescript
const faculty = course?.faculty[sectionGroupNum] || slot.faculty || 'Faculty';
```
`slot.faculty` was already calculated in `getTimetableForStudent` based on the student's dynamic course group (`courseGroupNum`). In line 159, if `course?.faculty[sectionGroupNum]` is evaluated first, Batch B students (`sectionGroupNum: 2`) with `MC3` (group 3) would be assigned faculty for group 2 (`Dr. R. Indumathy`) instead of group 3 (`Dr. E. Sri Varshini`).
**Recommendation**: Change line 159 to prioritize `slot.faculty`:
```typescript
const faculty = slot.faculty || course?.faculty[sectionGroupNum] || 'Faculty';
```

---

## 2. Studzone & Moodle Proxy Integration & Encapsulation

### 2.1 External API Endpoints Audit

| Service | Target URL | HTTP Method | Payload Roll Field | Expected External Format |
|---|---|---|---|---|
| Studzone (Cloudflare Worker) | `${CLOUDFLARE_WORKER_URL}/api/studzone/attendance` | POST | `body: JSON.stringify({ rollNo, password })` | Legacy D-Roll (e.g. `D26AB05`) |
| Studzone (Direct Portal) | `https://ecampus.psgtech.ac.in/studzone` | POST | `formData.append('rollno', rollNo)` | Legacy D-Roll (e.g. `D26AB05`) |
| Moodle (Cloudflare Worker) | `${CLOUDFLARE_WORKER_URL}/api/moodle/deadlines` | POST | `body: JSON.stringify({ rollNo, password })` | Legacy D-Roll (e.g. `D26AB05`) |

### 2.2 Clean Encapsulation Architecture
To keep the application UI and storage 100% on the College Roll Number (`26AB12`), all bridging must occur inside the service layer immediately before dispatching network requests.

#### `StudzoneService` (`src/services/studzoneService.ts`)
1. **`verifyLogin(rollNo: string, dobPassword: string)`**:
   - Normalize input: `const officialRoll = toNewRollNo(rollNo);`
   - Translate for network: `const legacyRoll = toOldRollNo(officialRoll);`
   - When calling Cloudflare Worker or direct Studzone POST:
     Pass `legacyRoll` (e.g. `D26AB05`).
   - When returning results or fallback checking:
     Return `{ success: true, rollNo: officialRoll }` (e.g. `26AB12`).
   - Never expose `legacyRoll` in error messages or return objects.
2. **`loginAndExtractAttendance(rollNo: string, dobPassword: string)`**:
   - Translate: `const legacyRoll = toOldRollNo(rollNo);`
   - Pass `legacyRoll` to Cloudflare Worker and direct POST form data.
   - When persisting `setLastSyncInfo`:
     Save `rollNo: toNewRollNo(rollNo)` (`26AB12`).
3. **`saveCredentials` / `getSavedCredentials`**:
   - Normalize stored roll number to `toNewRollNo(creds.rollNo)` (`26AB12`).
   - Ensures login screen pre-fill displays `26AB12`.

#### `LmsService` (`src/services/lmsService.ts`)
1. **`resolveMoodleUsername(rollNo: string): string`**:
   - Looks up `getMasterStudent(rollNo)?.dRollNo || toOldRollNo(rollNo)`.
   - For `26AB12`, returns `D26AB05`.
2. **`syncWithMoodle(rollNo: string, password: string)`**:
   - Dispatches `moodleUser` (`D26AB05`) to Cloudflare Worker.
   - Saves assignments in local storage under `rollNo` (`26AB12`).
   - Sanitizes toast/status message to reference `rollNo` (`26AB12`) rather than `moodleUser`.

---

## 3. Storage Keys & Migration Strategy

### 3.1 Inventory of Storage Keys

| Key / Pattern | File | Description | Legacy Value | Migrated Value |
|---|---|---|---|---|
| `@attendance_monitor_auth_user` | `storageService.ts` | Active session roll number | `D26AB05` | `26AB12` |
| `@attendance_monitor_period_records_<ROLL>` | `storageService.ts` | Period attendance records | Key with `D26AB05` | Key with `26AB12` (and inner keys mapped) |
| `@attendance_monitor_period_reminders_<ROLL>` | `storageService.ts` | Period reminders list | Key with `D26AB05` | Key with `26AB12` |
| `@attendance_monitor_surplus_alerts_<ROLL>` | `storageService.ts` | Surplus attendance alerts | Key with `D26AB05` | Key with `26AB12` |
| `@user_faculty_override_<ROLL>_<SUB_ID>` | `App.tsx` | Custom faculty overrides | Key with `D26AB05` | Key with `26AB12` |
| `@student_blood_group_<ROLL>` | `DigitalIdModal.tsx` | Student blood group | Key with `D26AB05` | Key with `26AB12` |
| `@student_emergency_phone_<ROLL>` | `DigitalIdModal.tsx` | Emergency contact phone | Key with `D26AB05` | Key with `26AB12` |
| `@psgim_ca_marks_<ROLL>_<SUB_CODE>` | `coursePlanService.ts` | Continuous assessment marks | Key with `D26AB05` | Key with `26AB12` |
| `@attendance_monitor_lms_creds_<ROLL>` | `lmsService.ts` | Moodle credentials | Key with `D26AB05` | Key with `26AB12` |
| `@attendance_monitor_lms_assignments_<ROLL>` | `lmsService.ts` | Cached assignments | Key with `D26AB05` | Key with `26AB12` |
| `@attendance_monitor_lms_quizzes_<ROLL>` | `lmsService.ts` | Cached quizzes | Key with `D26AB05` | Key with `26AB12` |
| `@stark_timesheet_punches_<ROLL>` | `timesheetEngine.ts` | Geofenced punches | Key with `D26AB05` | Key with `26AB12` |
| `@psgim_connect_credentials_<ROLL>` | `psgimConnectService.ts` | Register number credentials | Key with `D26AB05` | Key with `26AB12` |
| `@attendance_monitor_studzone_credentials` | `studzoneService.ts` | Saved login credentials | Creds with `D26AB05` | Creds with `26AB12` |

### 3.2 Internal Record Key Transformation (`PeriodAttendanceRecord`)
A critical finding during code investigation is how `PeriodAttendanceRecord` is stored:
```typescript
export interface PeriodAttendanceRecord {
  periodKey: string; // e.g. "2026-10-30_slot_D26AB05_Monday_0"
  slotId: string;    // e.g. "slot_D26AB05_Monday_0"
  date: string;
  subjectId: string;
  status: AttendanceStatus;
  ...
}
```
In `DashboardScreen.tsx` line 443:
```typescript
const currentPeriodKey = currentSlot ? `${todayDate}_${currentSlot.id}` : null;
const currentRecord = currentPeriodKey ? periodRecords[currentPeriodKey] : undefined;
```
When `currentSlot` is generated for `26AB12`, `currentSlot.id` is `slot_26AB12_Monday_0`.
If the stored record dictionary still holds keys formatted as `2026-10-30_slot_D26AB05_Monday_0`, direct lookup `periodRecords[currentPeriodKey]` will fail to match.

**Migration Transformation Rule**:
When migrating `Record<string, PeriodAttendanceRecord>` from `D26AB05` to `26AB12`:
1. For every entry `[oldKey, record]`:
   - `const newKey = oldKey.replace(new RegExp(oldRoll, 'gi'), newRoll);`
   - `const newSlotId = record.slotId.replace(new RegExp(oldRoll, 'gi'), newRoll);`
   - `const newPeriodKey = record.periodKey.replace(new RegExp(oldRoll, 'gi'), newRoll);`
   - Store under `newKey` with updated `slotId` and `periodKey`.
2. Keep both the old entries and new entries in the dictionary so that legacy references continue to resolve.

### 3.3 Two-Layer Migration Strategy
To ensure 100% resilience against data loss or race conditions:

#### Layer 1: Proactive Bulk Migration on Login / Boot
In `src/services/storageService.ts`, introduce:
```typescript
async migrateStudentData(oldRoll: string, newRoll: string): Promise<void>
```
Called in `App.tsx` during session initialization (`initSession`) and upon login (`handleLoginSuccess`).
This routine:
1. Migrates `@attendance_monitor_period_records_<OLD>` to `@attendance_monitor_period_records_<NEW>` with key transformation.
2. Migrates `@attendance_monitor_period_reminders_<OLD>` to `<NEW>`.
3. Migrates `@attendance_monitor_surplus_alerts_<OLD>` to `<NEW>`.
4. Migrates `@student_blood_group_<OLD>` and `@student_emergency_phone_<OLD>` to `<NEW>`.
5. Migrates `@attendance_monitor_lms_creds_<OLD>`, assignments, and quizzes.
6. Migrates `@stark_timesheet_punches_<OLD>` to `<NEW>`.
7. Updates `@attendance_monitor_auth_user` to `<NEW>`.

#### Layer 2: Just-in-Time Fallback & Auto-Migrate in Service Getters
Each storage getter function provides backwards compatibility:
- If primary key `<NEW>` has data: return it.
- If primary key `<NEW>` is missing or empty: check legacy key `<OLD>`.
- If legacy key `<OLD>` exists: parse, migrate to `<NEW>`, and return data.

---

## 4. Concrete Recommendations for Implementation Worker

1. **`src/data/psgimMasterStudents.ts`**:
   - Update `D26AB05` entry:
     ```typescript
     "D26AB05": { dRollNo: "D26AB05", collegeRollNo: "26AB12", name: "DEVDARSHAN V", batch: "B", dobPassword: "13AUG05" },
     ```
   - Update `STUDENTS_BY_NEW_ROLL["26AB12"]` to point to Devdarshan V.
   - Add alias for `26AB05` in `getStudentByAnyRoll` so legacy test queries resolve cleanly to Devdarshan V.
2. **`src/data/psgimData.ts`**:
   - Update `STUDENT_REGISTRY["26AB12"]` with Devdarshan V's exact course batches (`MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3, SPORTS2`).
   - Retain `STUDENT_REGISTRY["D26AB05"]` and `STUDENT_REGISTRY["26AB05"]` with the same batches.
3. **`src/services/psgimService.ts`**:
   - Fix line 159 in `generateTimetableForStudent`:
     ```typescript
     const faculty = slot.faculty || course?.faculty[sectionGroupNum] || 'Faculty';
     ```
   - In `getStudentProfile(rollNo)`: ensure `profile.rollNo` and `profile.collegeRollNo` return `toNewRollNo(rollNo)`.
4. **`src/services/storageService.ts`**:
   - Implement fallback and migration in `getPeriodRecords`, `getPeriodReminders`, and `getSurplusAlerts`.
   - Implement `migrateStudentData(oldRoll: string, newRoll: string)`.
5. **`src/services/studzoneService.ts`**:
   - In `verifyLogin` and `loginAndExtractAttendance`: translate input `rollNo` to `toOldRollNo(rollNo)` before making network calls.
   - Return `toNewRollNo(rollNo)` in `verifyLogin` result object.
   - In `saveCredentials`: normalize `creds.rollNo` with `toNewRollNo`.
6. **`src/services/lmsService.ts`**:
   - Ensure `resolveMoodleUsername` returns `toOldRollNo(rollNo)`.
   - Add fallback reading in `getCredentials`, `getAssignments`, and `getQuizzes`.
   - Sanitize UI messages in `syncWithMoodle` so that D-roll numbers are not displayed in toasts.
7. **`App.tsx` & `src/screens/AuthScreen.tsx`**:
   - In `AuthScreen.tsx`: normalize input with `toNewRollNo` before invoking `onLoginSuccess`.
   - In `App.tsx`: upon session init, normalize `savedRollNo`, invoke `StorageService.migrateStudentData`, and save back normalized `officialRoll` to `StorageService.setAuthUser`.
   - Update faculty override checks to check both new and old roll numbers.
