# Handoff Report: Student Registry & Data Model Survey

**Core Finding**: `STUDENT_REGISTRY` in `src/data/psgimData.ts` contains 257 students (all keyed with internal `D26...` prefixes, including 5 extra synthetic entries and 12 Batch AE entries with empty SSM/Sports groups), whereas the official 6-page Dynamic Course Batch List PDF defines exactly 252 students (60 A + 60 B + 60 C + 60 D + 12 AE) with fully assigned SSM groups. Meanwhile, `PSGIM_MASTER_STUDENTS` in `src/data/psgimMasterStudents.ts` contains 252 students across Batches A-D only (0 in Batch AE, 3 internal gaps, and 10 high-numbered students absent from the registry), causing bidirectional roll resolution failures when querying college roll numbers or Batch AE records.

---

## 1. Observation

### 1.1 Data Structures & Source Code Locations

#### `src/data/psgimData.ts`
- **`StudentRecord` Interface** (Lines 193-206):
  ```typescript
  export interface StudentRecord {
    rollNo: string;
    batches: {
      MCOB: string;
      ADM: string;
      MC: string;
      SSM: string;
      BS: string;
      EDM: string;
      LA: string;
      SSA: string;
      SPORTS: string;
    };
  }
  ```
- **`STUDENT_REGISTRY` Dictionary** (Lines 208-3807):
  - Starts at line 208: `export const STUDENT_REGISTRY: Record<string, StudentRecord> = {`
  - First entry (Line 209): `"D26AA01": { "rollNo": "D26AA01", "batches": { ... } }`
  - Last entry (Line 3793): `"D26AE13": { "rollNo": "D26AE13", "batches": { ... } }`
  - Ends at line 3807.
- **Roll Number Array** (Line 3809):
  `export const ALL_ROLL_NUMBERS = Object.keys(STUDENT_REGISTRY);` (contains 257 keys).
- **Classroom Resolution Engine** (Lines 3814-3840):
  `export function resolveExactRoom(course: string, groupNum: number, defaultRoom: string): string`
- **Timetable Resolution Engine** (Lines 3845-3910):
  ```typescript
  export function getTimetableForStudent(rollNo: string) {
    const cleanRoll = (rollNo || '').toUpperCase();
    const oldRoll = toOldRollNo(cleanRoll);
    const newRoll = toNewRollNo(cleanRoll);
    const master = getMasterStudent(cleanRoll) || getMasterStudent(newRoll) || getMasterStudent(oldRoll);
    const student = STUDENT_REGISTRY[cleanRoll] || STUDENT_REGISTRY[oldRoll] || STUDENT_REGISTRY[newRoll];
  ```

#### `src/data/psgimMasterStudents.ts`
- **`PsgimStudentInfo` Interface** (Lines 4-12):
  ```typescript
  export interface PsgimStudentInfo {
    dRollNo: string;
    collegeRollNo: string;
    name: string;
    batch: 'A' | 'B' | 'C' | 'D';
    dob?: string;
    dobPassword?: string;
    bloodGroup?: string;
  }
  ```
- **`PSGIM_MASTER_STUDENTS` Dictionary** (Lines 14-274):
  - Starts at line 14: `export const PSGIM_MASTER_STUDENTS: Record<string, PsgimStudentInfo> = {`
  - First entry (Line 16): `"D26AA01": { dRollNo: "D26AA01", collegeRollNo: "26AA04", name: "AKASH VARDHAMAN", batch: "A" },`
  - Last entry (Line 273): `"D26AD65": { dRollNo: "D26AD65", collegeRollNo: "26AD05", name: "ABISHREE G", batch: "D" },`
  - Ends at line 274. Total entries: 252.
- **Lookup Maps & Helpers** (Lines 276-335):
  - Line 276: `export const STUDENTS_BY_NEW_ROLL: Record<string, PsgimStudentInfo> = {};`
  - Line 277: `export const STUDENTS_BY_OLD_ROLL: Record<string, PsgimStudentInfo> = PSGIM_MASTER_STUDENTS;`
  - Line 280-284: Builds `STUDENTS_BY_NEW_ROLL` by indexing `student.collegeRollNo.toUpperCase()`.
  - Line 286: `export const ALL_COLLEGE_ROLL_NUMBERS = Object.keys(STUDENTS_BY_NEW_ROLL);` (252 keys).
  - Lines 291-315: `getStudentByAnyRoll(inputRoll: string): PsgimStudentInfo | null`
  - Lines 320-323: `toNewRollNo(inputRoll: string): string`
  - Lines 328-331: `toOldRollNo(inputRoll: string): string`
  - Lines 333-335: `getMasterStudent(rollNo: string): PsgimStudentInfo | null`

#### `src/services/psgimService.ts`
- Lines 23-27:
  ```typescript
  getStudent(rollNo: string) {
    if (!rollNo) return null;
    const oldRoll = toOldRollNo(rollNo);
    return STUDENT_REGISTRY[oldRoll] || STUDENT_REGISTRY[rollNo.toUpperCase()] || null;
  },
  ```

---

### 1.2 Quantitative Distribution & Counts Comparison

| Dataset | Total Count | Batch A | Batch B | Batch C | Batch D | Batch AE | Format of Keys |
|---|---|---|---|---|---|---|---|
| **Official 6-Page PDF** | 252 | 60 (`D26AA01`-`60`) | 60 (`D26AB01`-`60`) | 60 (`D26AC01`-`60`) | 60 (`D26AD01`-`60`) | 12 (`D26AE01`-`13`*) | `D26...` |
| **`STUDENT_REGISTRY` (`psgimData.ts`)** | 257 | 61 (`D26AA01`-`60`, `62`) | 64 (`D26AB01`-`60`, `61`-`64`) | 60 (`D26AC01`-`60`) | 60 (`D26AD01`-`60`) | 12 (`D26AE01`-`13`*) | 100% `D26...` (0 without D) |
| **`PSGIM_MASTER_STUDENTS` (`psgimMasterStudents.ts`)** | 252 | 62 (`D26AA01`-`63`*) | 63 (`D26AB01`-`64`*) | 62 (`D26AC01`-`63`*) | 65 (`D26AD01`-`65`) | 0 (None) | `D26...` mapped to `26...` |

*\*Notes on missing/skipped numbers:*
- In Official PDF and `STUDENT_REGISTRY`: Batch AE excludes `D26AE10` (12 students: `D26AE01`-`D26AE09`, `D26AE11`-`D26AE13`).
- In `PSGIM_MASTER_STUDENTS`:
  - Batch A skips `D26AA25` (62 students).
  - Batch B skips `D26AB14` (63 students).
  - Batch C skips `D26AC53` (62 students).

---

### 1.3 Key Discrepancies Observed

#### A. Extra Keys in `STUDENT_REGISTRY`
`STUDENT_REGISTRY` contains 5 extra entries not found in the official PDF:
1. `D26AA62` (Line 1049 in `src/data/psgimData.ts`)
2. `D26AB61` (Line 1903 in `src/data/psgimData.ts`)
3. `D26AB62` (Line 1917 in `src/data/psgimData.ts`)
4. `D26AB63` (Line 1931 in `src/data/psgimData.ts`)
5. `D26AB64` (Line 1945 in `src/data/psgimData.ts`)

#### B. Batch AE Subject Blanking in `STUDENT_REGISTRY`
In `src/data/psgimData.ts` (Lines 3639-3806), all 12 Batch AE records have empty strings for `SSM` and `SPORTS`:
```typescript
3639:   "D26AE01": {
3640:     "rollNo": "D26AE01",
3641:     "batches": {
3642:       "MCOB": "MCOB1",
3643:       "ADM": "ADM1",
3644:       "MC": "MC2",
3645:       "SSM": "",
3646:       "BS": "BS1",
3647:       "EDM": "EDM3",
3648:       "LA": "LA1",
3649:       "SSA": "SSA3",
3650:       "SPORTS": ""
3651:     }
3652:   },
```
However, the official PDF assigns explicit SSM groups to all 12 Batch AE students:
- `D26AE01` -> `SSM1`
- `D26AE02` -> `SSM2`
- `D26AE03` -> `SSM3`
- `D26AE04` -> `SSM4`
- `D26AE05` -> `SSM2`
- `D26AE06` -> `SSM3`
- `D26AE07` -> `SSM4`
- `D26AE08` -> `SSM1`
- `D26AE09` -> `SSM4`
- `D26AE11` -> `SSM3`
- `D26AE12` -> `SSM3`
- `D26AE13` -> `SSM2`

This was caused by hardcoded logic in `scripts/generatePsgimData.js` (lines 281-285):
```javascript
// For Section AE: No permanent class for SSM and Sports, leave blank
ssmBatch = '';
sportsBatch = '';
```

#### C. Discrepancies between `PSGIM_MASTER_STUDENTS` and `STUDENT_REGISTRY`
1. **Missing from `PSGIM_MASTER_STUDENTS`** (15 students):
   - `D26AA25` (Present in PDF Batch A line 25, present in `STUDENT_REGISTRY` line 545)
   - `D26AB14` (Present in PDF Batch B line 14, present in `STUDENT_REGISTRY` line 1245)
   - `D26AC53` (Present in PDF Batch C line 53, present in `STUDENT_REGISTRY` line 2687)
   - All 12 Batch AE students: `D26AE01`, `D26AE02`, `D26AE03`, `D26AE04`, `D26AE05`, `D26AE06`, `D26AE07`, `D26AE08`, `D26AE09`, `D26AE11`, `D26AE12`, `D26AE13`.
2. **Present in `PSGIM_MASTER_STUDENTS` but missing from `STUDENT_REGISTRY`** (10 students):
   - `D26AA61` (Vishal K S, collegeRollNo: `26AA61`)
   - `D26AA63` (Darshan M S, collegeRollNo: `26AA07`)
   - `D26AC61` (Dhigambari A, collegeRollNo: `26AC11`)
   - `D26AC62` (S Krishna Kumar, collegeRollNo: `26AC41`)
   - `D26AC63` (Arun Vigneswar S K, collegeRollNo: `26AC04`)
   - `D26AD61` (Rashmika M, collegeRollNo: `26AD41`)
   - `D26AD62` (Sandhiya V J, collegeRollNo: `26AD47`)
   - `D26AD63` (Mithilesh P, collegeRollNo: `26AD30`)
   - `D26AD64` (Khavya S, collegeRollNo: `26AD25`)
   - `D26AD65` (Abishree G, collegeRollNo: `26AD05`)

---

## 2. Logic Chain

### Step 1: Mapping Duality Between College Roll Numbers and D-Roll Numbers
- **Observation**:
  In `src/data/psgimMasterStudents.ts`:
  - Line 16: `"D26AA01": { dRollNo: "D26AA01", collegeRollNo: "26AA04", name: "AKASH VARDHAMAN", batch: "A" }`
  - Line 41: `"D26AA27": { dRollNo: "D26AA27", collegeRollNo: "26AA01", name: "A R SRISHAA", batch: "A" }`
  - Line 84: `"D26AB05": { dRollNo: "D26AB05", collegeRollNo: "26AB12", name: "DEVDARSHAN V", batch: "B" }`
  - Line 134: `"D26AB56": { dRollNo: "D26AB56", collegeRollNo: "26AB05", name: "AMULYA P", batch: "B" }`
- **Logic**:
  Official college roll numbers (`26AA01`, `26AA02`, etc.) are assigned alphabetically by student name (A R Srishaa comes before Akash Vardhaman).
  Conversely, internal D-Roll numbers (`D26AA01`, `D26AA02`, etc.) were assigned in a different sequence (e.g. registration order).
  Therefore, stripping the leading `D` from `D26AA01` produces `26AA01`, but `26AA01` in the official college directory belongs to `D26AA27` (A R Srishaa), NOT `D26AA01` (Akash Vardhaman).

### Step 2: Resolution Divergence in Acceptance Criteria
- **Observation**:
  `ORIGINAL_REQUEST.md` Acceptance Criteria specifies:
  - `26AA01` / `D26AA01` resolves to: `MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3`.
  - `26AB05` resolves to: `MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3`.
- **Logic**:
  In `src/data/psgimData.ts` (lines 209-221):
  `D26AA01` has batches: `MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3`.
  In `src/data/psgimData.ts` (lines 1119-1131):
  `D26AB05` has batches: `MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3`.
  The acceptance criteria explicitly equates `26AA01` with `D26AA01`, and `26AB05` with `D26AB05` (interpreting the roll number without `D` as directly referencing `D26...`).
  However, `toOldRollNo('26AA01')` currently maps `26AA01` to `D26AA27` via `STUDENTS_BY_NEW_ROLL`.
  Consequently, `getTimetableForStudent('26AA01')` retrieves `D26AA27` (`MCOB3, ADM3, MC3, SSM1, BS3, EDM3, LA1, SSA4`), causing an immediate acceptance test failure.

### Step 3: Failure of Bidirectional Lookup for Batch AE
- **Observation**:
  `PSGIM_MASTER_STUDENTS` does not contain any entries for Batch AE (`D26AE01` through `D26AE13`).
- **Logic**:
  When a user or test queries an AE student using their college roll format (e.g. `26AE01`), `getStudentByAnyRoll('26AE01')` returns `null`.
  `toOldRollNo('26AE01')` returns `'26AE01'` as fallback.
  Because `STUDENT_REGISTRY` only has keys starting with `D` (`D26AE01`), `STUDENT_REGISTRY['26AE01']` evaluates to `undefined`.
  Therefore, any lookup without a leading `D` for Section AE fails completely.

### Step 4: Registry Size Discrepancy
- **Observation**:
  The official 6-page PDF has 252 student rows.
  `STUDENT_REGISTRY` has 257 keys due to the inclusion of 5 extra keys (`D26AA62`, `D26AB61`-`D26AB64`).
- **Logic**:
  These 5 extra entries are not part of the official dynamic batch list circular.
  At the same time, 10 students from `PSGIM_MASTER_STUDENTS` have no entries in `STUDENT_REGISTRY`.
  If the goal is 100% alignment with the official circular, the registry must contain all 252 official students with exact group allocations, and any additional enrolled students in `PSGIM_MASTER_STUDENTS` must have valid timetable fallbacks.

---

## 3. Caveats

1. **Dual Meaning of Non-D Roll Numbers**:
   In the college database, `26AA01` is A R Srishaa (`D26AA27`), whereas in the acceptance criteria prompt, `26AA01` is used as shorthand for `D26AA01` (Akash Vardhaman).
   Any implementation must decide whether:
   - `STUDENT_REGISTRY` contains dual keys for both official college roll numbers (`26AA04` -> Akash Vardhaman, `26AA01` -> A R Srishaa) AND prefix-stripped aliases (`26AA01` -> `D26AA01`).
   - OR the resolution logic prioritizes `toOldRollNo` while preserving exact test case compatibility.
2. **Master Students Batch AE Records**:
   The official PDF contains roll numbers, subject groups, and SSM groups for Section AE (`D26AE01` to `D26AE13`), but does not provide student names, date-of-birth, or blood groups for Batch AE.
3. **High-Numbered Master Students**:
   The 10 students with D-Roll numbers above 60 in `PSGIM_MASTER_STUDENTS` (`D26AA61`, `D26AA63`, `D26AC61-63`, `D26AD61-65`) are not listed in the 6-page dynamic course list. Their course groups are undefined in official circulars.

---

## 4. Conclusion

1. **STUDENT_REGISTRY Structure**:
   `STUDENT_REGISTRY` is currently keyed exclusively by D-Roll numbers (`D26...`). It contains 257 records.
   To match official requirements, it must:
   - Provide accurate course groups matching the 252 students in the official PDF.
   - Populate SSM groups (SSM1 to SSM4) for all 12 Batch AE students instead of empty strings.
   - Reconcile the 5 extra keys (`D26AA62`, `D26AB61-64`).
2. **Bidirectional Accessibility**:
   Both `STUDENT_REGISTRY` direct indexing and resolution helper functions (`getStudentByAnyRoll`, `toOldRollNo`, `toNewRollNo`, `getStudent`, `getTimetableForStudent`) must be made robust to support:
   - Lookup by `D26AA01` and `26AA01`.
   - Lookup by `D26AB05` and `26AB05`.
   - Lookup for all Batch AE students with or without leading `D`.
   - Seamless resolution between college roll numbers and internal D-roll numbers.
3. **Data Model Synchronization**:
   `src/data/psgimMasterStudents.ts` must be updated to include Batch AE students (`D26AE01` to `D26AE13`) and fill the gaps for `D26AA25`, `D26AB14`, and `D26AC53` to prevent `null` pointer lookups.

---

## 5. Verification Method

### Independent Verification Commands

1. **Verify Official PDF Student Extraction vs Registry Keys**:
   ```powershell
   node tests/compare_pdf_registry.js
   ```
   *Expected Output*: Reports matches, differences (currently 12 SSM differences in AE), and missing keys.

2. **Verify STUDENT_REGISTRY Keys & Master Gaps**:
   ```powershell
   node .agents/teamwork/explorer_survey_1_rep1/analyze_keys.js
   ```
   *Expected Output*:
   - Registry D-roll count: 257
   - Master D-roll count: 252
   - In Registry NOT Master: 15 (AE01-13, AA25, AB14, AC53)
   - In Master NOT Registry: 10 (AA61, AA63, AC61-63, AD61-65)

3. **Verify Acceptance Criteria Test Cases**:
   Run the following node script:
   ```powershell
   node -e "
   const data = require('./tests/bundle_data.js');
   ['26AA01', 'D26AA01', '26AB05', 'D26AB05'].forEach(roll => {
     const tt = data.getTimetableForStudent(roll);
     const batches = Array.from(new Set(tt.map(s => s.batch))).sort();
     console.log(roll, batches.join(', '));
   });
   "
   ```
   *Invalidation Condition*: If `26AA01` and `D26AA01` resolve to different batch groups, or `26AB05` does not include `MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3`, the acceptance criteria is not met.

4. **Verify TypeScript Compilation**:
   ```powershell
   npx tsc --noEmit
   ```
   *Expected Output*: Exit code 0, zero errors.
