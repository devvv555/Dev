# Original User Request

## 2026-10-30T14:57:13Z

Requested team: "one team will update the list, and other team will check whether the students are assigned are correct are not, by cross verficating the list in the program with list i have provided. and also. one team willl check with the assigned classes are correct assigned with correct teacher or not. one team will monitor whether everyone is doing correct or not."

Systematic batch updating and multi-layered auditing of the PSGIM MBA student dynamic course registry, ensuring every student has 100% accurate subject groups, classrooms, and teacher assignments matching official college circulars.

Working directory: c:\Users\DELL\OneDrive\Documents\attendance-monitor
Integrity mode: development

## Requirements

### R1. Dynamic Course Batch List Parsing & Registry Update
Extract and parse all student records from the official 6-page "Dynamic Course Batch List" document (covering D26AA01 through D26AE13). Update the student course registry dictionary in `src/data/psgimData.ts` so that every student's record reflects the exact course groups from the official document:
- MCOB (Group 1, 2, 3, or 4)
- ADM (Group 1, 2, 3, or 4)
- MC (Group 1, 2, 3, or 4)
- SSM & Sports (SSM 1, 2, 3, or 4 & Sports Group)
- BS (Group 1, 2, 3, or 4)
- EDM (Group 1, 2, 3, or 4)
- LA (Group 1, 2, 3, or 4)
- SSA (Group 1, 2, 3, or 4)

Ensure bidirectional accessibility so students can be retrieved either by their official College Roll Number (e.g. `26AA01`) or their internal D-Roll Number (e.g. `D26AA01` / `D26AA27`).

### R2. Roll Number & Registry Cross-Verification
An independent verification pipeline must validate that:
1. Every student in `PSGIM_MASTER_STUDENTS` (`src/data/psgimMasterStudents.ts`) correctly resolves to their exact record in `STUDENT_REGISTRY` (`src/data/psgimData.ts`).
2. There are zero unmapped students or mismatch offsets between college roll numbers and internal D-Roll numbers.
3. Every student's assigned batch groups match the provided official document line-by-line with 0% discrepancy.

### R3. Timetable, Faculty & Classroom Assignment Verification
An independent auditing pipeline must verify the schedule resolution engine (`getTimetableForStudent`):
1. Every period across Monday through Saturday maps to the exact designated faculty member based on the master faculty roster:
   - **MCOB**: 1: Dr. M. Kirupa Priyadarshini (LH-101) | 2: Dr. Vijaya Vardhan Manchala (LH-109) | 3: Dr. R. Indumathy (LH-401) | 4: Dr. N. Udayakumar (LH-405)
   - **EDM**: 1: Dr. Sreeanandan (LH-101) | 2: Dr. Aiswarya D Pillai (LH-109) | 3: Dr. E. Sri Varshini (LH-401) | 4: Dr. Sreeanandan (LH-405)
   - **ADM**: 1: Dr. J. Nancy Christina (LH-101) | 2: Dr. D. Kavitha (LH-109) | 3: Dr. Nithya (LH-401) | 4: Dr. Aiswarya D Pillai (LH-405)
   - **BS**: 1: Mr. T. Sathish (LH-101) | 2: Dr. J. Sekkizhar (LH-109) | 3: Dr. Ravi Shankar Jetti (LH-401) | 4: Mr. T. Sathish (LH-405)
   - **MC**: 1: Dr. R. Deepa (LH-101) | 2: Dr. R. Indumathy (LH-109) | 3: Dr. E. Sri Varshini (LH-401) | 4: Dr. Chenna Upendra (LH-405)
   - **SSA Lab**: 1: Mr. G. Kangasabapathy (LH-401) | 2: Mr. Imayavendan (LH-405) | 3: Mr. G. Kangasabapathy (LH-101) | 4: Mr. Imayavendan (LH-109)
   - **SSM**: 1: Dr. D. Kavitha | 2: Ms. C. Dhanya | 3: Ms. Kanagathara | 4: Dr. Venkatalakshmi
   - **LA**: 1, 2, 3: Ms. C. Dhanya (LH-101/109/401) | 4: Dr. Firdaus Bashir (LH-405)
   - **Sports**: Mr. Zakeer Khan (Sports Ground)
2. No student has unassigned, generic (`TBD`, empty string), or unresolved slash (`/`) rooms.

### R4. Supervisor / Oversight Monitoring
A dedicated supervisory monitoring audit must inspect the outputs of both the update team and the audit teams:
- Confirm that no regression occurs in the codebase.
- Verify TypeScript compilation without errors (`tsc --noEmit`).
- Verify production build completion (`npm run build:pwa`).
- Ensure the project-wide Zero Emoji Policy is maintained.

## Acceptance Criteria

### Data Completeness & Accuracy
- [ ] 100% of students in the official 6-page Dynamic Course Batch List are accurately keyed and present in `STUDENT_REGISTRY`.
- [ ] Verified test cases:
  - `26AA01` / `D26AA01` resolves to: MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3.
  - `26AB05` resolves to: MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3.
- [ ] Zero missing student registry records across all batches (A, B, C, D, and AE).

### Faculty & Classroom Resolution
- [ ] Automated verification script executes over all enrolled students and reports 0 faculty mismatches.
- [ ] Automated verification script reports 0 classroom allocation mismatches.
- [ ] Zero unassigned or slash-separated rooms (e.g. `LH-101/109`) in generated timetables.

### Build & Code Quality
- [ ] `npm run build:pwa` completes with exit code 0.
- [ ] Zero emojis introduced across all updated files.


## 2026-10-30T16:35:41Z

Requested team: "one team will update the app to use college roll numbers as primary identifier and login, and another team will verify all screens, storage, and timetable resolution work seamlessly with college roll numbers."

Migrate primary student identification, authentication, and display throughout the entire application from legacy internal D-Roll numbers (e.g. D26AB05) to official College Roll Numbers (e.g. 26AB12).

Working directory: c:\Users\DELL\OneDrive\Documents\attendance-monitor
Integrity mode: development

## Requirements

### R1. Authentication & Session Primary Identifier Migration
Update the login and authentication workflows (`src/screens/AuthScreen.tsx`, `App.tsx`, and session services) so that:
1. Students log in directly using their official College Roll Number (e.g. `26AB12`).
2. The active session roll number stored in memory and local storage (`@attendance_monitor_roll_no`) is the College Roll Number (`26AB12`).
3. For backward compatibility, entering a D-Roll number (e.g. `D26AB05`) during login automatically maps and normalizes to the student's official College Roll Number (`26AB12`).

### R2. UI Display & Profile Normalization
Update all screens, banners, headers, modals, and profile displays so that:
1. The student's official College Roll Number is displayed prominently (e.g. "Roll No: 26AB12") instead of the D-Roll number across:
   - `DashboardScreen.tsx` (Welcome banner, student badge, profile header)
   - `TimetableScreen.tsx`
   - `ReconcileScreen.tsx` (Portals, Studzone & Moodle cards)
   - `CalendarScreen.tsx`
   - `AdminDashboardScreen.tsx`
   - `DigitalIdModal.tsx` and all student card modals.
2. The user's specific test case is fully verified: Devdarshan V's primary display and login roll number is `26AB12`.

### R3. Storage, Attendance & Timetable Continuity
Ensure seamless data continuity across all student engines:
1. `getTimetableForStudent`: When called with a College Roll Number (e.g. `26AB12`), returns the student's personalized schedule and classrooms without requiring D-Roll translation by the caller.
2. Studzone & Moodle integration: Automatically translates `26AB12` to `D26AB05` under the hood only when communicating with external legacy college servers that require D-Roll numbers, keeping the app UI and storage purely on `26AB12`.
3. Storage migrations: Existing attendance records, period logs, and custom settings previously saved under D-Roll keys are safely migrated or accessible via the College Roll Number.

### R4. Verification, Build Integrity & Zero Emoji Policy
1. Execute comprehensive regression tests confirming that logging in as `26AB12` loads Devdarshan V with accurate attendance, timetable, and profile.
2. Confirm TypeScript typecheck passes with 0 errors (`npx tsc --noEmit`).
3. Confirm production PWA build completes with exit code 0 (`npm run build:pwa`).
4. Maintain strict adherence to the project-wide Zero Emoji Policy across all updated files.

## Acceptance Criteria

### Primary Identifier & Authentication
- [ ] Login screen accepts College Roll Numbers (e.g. `26AB12`) as the standard login input.
- [ ] Entering `26AB12` logs in as DEVDARSHAN V (Batch B).
- [ ] Entering legacy `D26AB05` automatically normalizes and logs in as `26AB12`.
- [ ] Stored active roll number in session state is `26AB12`.

### Display & UI Uniformity
- [ ] Dashboard header displays `26AB12` as the student's roll number.
- [ ] Digital ID, attendance summary, and profile modals show `26AB12`.
- [ ] Zero screens default to showing `D26AB05` as the primary roll number for Devdarshan V.

### Timetable & Engine Compatibility
- [ ] `getTimetableForStudent('26AB12')` returns the 19 weekly periods with correct classrooms (e.g. `LA1` -> `LH-101`, `MC3` -> `LH-401`, `SSA3` -> `LH-101`).
- [ ] Studzone and Moodle proxy calls transparently bridge to `D26AB05` without exposing D-Roll numbers in the UI.

### Build & Code Quality
- [ ] `npx tsc --noEmit` exits with 0 errors.
- [ ] `npm run build:pwa` completes with exit code 0.
- [ ] Zero emojis present in modified files.


## 2026-10-30T16:50:27Z

CRITICAL ARCHITECTURAL FINDING:
The user previously uploaded the official college roster spreadsheet `.user_uploaded/media_1793378014668_90fa750e.xlsx` containing the true 1:1 mapping between D-Roll Numbers and College Roll Numbers for all 252 students.

In this official Excel sheet:
`D26AB05` = College Roll No `26AB12` (DEVDARSHAN V)
`D26AA01` = College Roll No `26AA04` (AKASH VARDHAMAN)
`D26AA02` = College Roll No `26AA27` (MITHUN K)
`D26AB01` = College Roll No `26AB33` (MUKTHA MATHI S)
`D26AB12` = College Roll No `26AB29` (MATHUMITHA M)

Currently in `src/data/psgimMasterStudents.ts`, the mapping was naively assuming `D26AB05` -> `26AB05` (with `collegeRollNo: "26AB05"`), which is why Devdarshan was previously mapped to `26AB05` instead of his actual College Roll No `26AB12`!
The full dump of 252 students is now exported to `scripts/excel_mapping.csv`.

Ensure your orchestrator and workers update `psgimMasterStudents.ts` and `psgimData.ts` accordingly.
