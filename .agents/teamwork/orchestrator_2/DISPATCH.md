## 2026-10-30T16:37:18Z

You are the Project Orchestrator for the College Roll Number migration project.

Your working directory is:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\orchestrator_2

The authoritative project request is at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md

User Request Summary:
"one team will update the app to use college roll numbers as primary identifier and login, and another team will verify all screens, storage, and timetable resolution work seamlessly with college roll numbers."

Migrate primary student identification, authentication, and display throughout the entire application from legacy internal D-Roll numbers (e.g. D26AB05) to official College Roll Numbers (e.g. 26AB12).

Working directory: c:\Users\DELL\OneDrive\Documents\attendance-monitor
Integrity mode: development

Requirements:
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

Acceptance Criteria:
- Login screen accepts College Roll Numbers (`26AB12`) as standard login.
- Entering `26AB12` logs in as DEVDARSHAN V (Batch B).
- Entering legacy `D26AB05` normalizes and logs in as `26AB12`.
- Active session roll number in session state is `26AB12`.
- Dashboard header, digital ID, attendance summary, profile modals display `26AB12`. Zero screens default to showing `D26AB05` as primary roll number for Devdarshan V.
- `getTimetableForStudent('26AB12')` returns 19 weekly periods with correct classrooms (`LA1` -> `LH-101`, `MC3` -> `LH-401`, `SSA3` -> `LH-101`).
- Studzone and Moodle proxy calls transparently bridge to `D26AB05` without exposing D-Roll numbers in UI.
- `npx tsc --noEmit` exits with 0 errors.
- `npm run build:pwa` completes with exit code 0.
- Zero emojis present in modified files.

## 2026-10-30T16:50:42Z

[CRITICAL ARCHITECTURAL FINDING - ATTENTION ORCHESTRATOR]
The user previously uploaded the official college roster spreadsheet `.user_uploaded/media_1793378014668_90fa750e.xlsx` containing the true 1:1 mapping between D-Roll Numbers and College Roll Numbers for all 252 students.

In this official Excel sheet:
`D26AB05` = College Roll No `26AB12` (DEVDARSHAN V)
`D26AA01` = College Roll No `26AA04` (AKASH VARDHAMAN)
`D26AA02` = College Roll No `26AA27` (MITHUN K)
`D26AB01` = College Roll No `26AB33` (MUKTHA MATHI S)
`D26AB12` = College Roll No `26AB29` (MATHUMITHA M)

Currently in `src/data/psgimMasterStudents.ts`, the mapping was naively assuming `D26AB05` -> `26AB05` (with `collegeRollNo: "26AB05"`), which is why Devdarshan was previously mapped to `26AB05` instead of his actual College Roll No `26AB12`!
The full dump of 252 students is now exported to `scripts/excel_mapping.csv`.

Ensure your implementation and verification sub-teams update `psgimMasterStudents.ts` and `psgimData.ts` using `scripts/excel_mapping.csv` so the true 1:1 mapping is applied across all 252 students.

## 2026-10-30T17:35:00Z

User Request: "change to claude model then" / "now start working"
Instruction: Resume work on Milestone M2 and the verification pipeline.
