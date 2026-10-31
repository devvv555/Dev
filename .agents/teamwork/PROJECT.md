# Project: College Roll Number Migration & Full Uniformity

## Architecture
- **Master Roster & Student Registry Layer (`src/data/psgimMasterStudents.ts`, `src/data/psgimData.ts`)**:
  - Authoritative 1:1 bidirectional mapping between legacy internal D-Roll numbers (`D26AB05`) and official College Roll Numbers (`26AB12`) synchronized with `scripts/excel_mapping.csv`.
  - Bidirectional indexing in `STUDENT_REGISTRY` accessible directly via College Roll Number (`26AB12`) and legacy D-Roll (`D26AB05`).
  - Helper functions: `toOldRollNo`, `toNewRollNo`, `getMasterStudent`, `getStudentByAnyRoll`.
- **Schedule Resolution Engine Layer (`src/data/psgimData.ts`, `src/services/psgimService.ts`)**:
  - `getTimetableForStudent(rollNo)`: Directly resolves College Roll Numbers (e.g. `26AB12`) to 19 weekly periods with exact classrooms (`LA1` -> `LH-101`, `MC3` -> `LH-401`, `SSA3` -> `LH-101`).
  - `psgimService.ts`: Preserves dynamic group faculty from timetable slots over static section defaults.
- **Authentication & Session Storage Layer (`src/screens/AuthScreen.tsx`, `App.tsx`, `src/services/storageService.ts`)**:
  - Primary login input accepts College Roll Numbers (`26AB12`). Legacy D-Roll inputs (`D26AB05`) automatically normalize to `26AB12`.
  - Canonical session storage key `@attendance_monitor_roll_no` stores `26AB12`. Backward compatibility fallback to `@attendance_monitor_auth_user`.
  - Storage migration service migrates existing period records and settings saved under D-Roll keys.
- **Network Proxy Bridging Layer (`src/services/studzoneService.ts`, `src/services/lmsService.ts`)**:
  - External legacy endpoints (`ecampus.psgtech.ac.in`, `lms.psgim.ac.in`) require D-Roll numbers.
  - Transparent bridging on outgoing network payloads (`toOldRollNo(rollNo)`) while keeping all application state, UI, and storage purely on College Roll Numbers.
- **UI & Display Uniformity Layer (`src/screens/`, `src/components/`)**:
  - Prominent display of official College Roll Numbers across Dashboard, Timetable, Reconcile, Calendar, AdminDashboard, and DigitalIdModal.
  - Devdarshan V displays `26AB12` across all screens; zero screens default to `D26AB05`.
  - Zero Emoji Policy compliance across all updated files.
- **Dual Track E2E Testing Layer (`tests/`)**:
  - Comprehensive opaque-box test suite verifying Tiers 1-4.
  - Adversarial hardening (Tier 5).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Roster & Registry Mapping Sync | Synchronize psgimMasterStudents.ts and psgimData.ts using scripts/excel_mapping.csv so D26AB05 maps to 26AB12 (Devdarshan V) | M1 | ORIGINAL_REQUEST R1, R2, Circular |
| 2 | Direct College Roll & Legacy Normalization Login | AuthScreen accepts 26AB12 as standard login; entering D26AB05 auto-normalizes to 26AB12 | M1 | ORIGINAL_REQUEST R1 |
| 3 | Session State & Storage Migration | @attendance_monitor_roll_no stores 26AB12 in memory & storage; migrate legacy D-roll records | M1 | ORIGINAL_REQUEST R1, R3 |
| 4 | Timetable Resolution for College Roll | getTimetableForStudent('26AB12') returns 19 periods (LA1->LH-101, MC3->LH-401, SSA3->LH-101) | M1 | ORIGINAL_REQUEST R3 |
| 5 | Studzone & Moodle Proxy Bridging | Transparently bridge 26AB12 to D26AB05 in external network payloads with zero UI exposure | M1 | ORIGINAL_REQUEST R3 |
| 6 | Dashboard & Banner UI Uniformity | Display College Roll No prominently in Welcome banner, student badge, profile header | M2 | ORIGINAL_REQUEST R2 |
| 7 | Timetable, Calendar & Reconcile UI Uniformity | Timetable header, Calendar header, and Reconcile Moodle/Studzone cards display 26AB12 | M2 | ORIGINAL_REQUEST R2 |
| 8 | Digital ID, Admin & Student Modals Uniformity | DigitalIdModal, AdminDashboard cards, dispute modals format and display 26AB12 | M2 | ORIGINAL_REQUEST R2 |
| 9 | Devdarshan V Zero D-Roll Exposure | Devdarshan V primary display is 26AB12; zero screens default to D26AB05 | M2 | ORIGINAL_REQUEST R2 |
| 10| Zero Emoji Policy Enforcement | Replace all emoji characters in updated screens and services with clean ASCII text | M2 | ORIGINAL_REQUEST R4 |
| 11| TypeScript Check & Production PWA Build | npx tsc --noEmit passes with 0 errors; npm run build:pwa succeeds with exit code 0 | M3 | ORIGINAL_REQUEST R4 |
| 12| E2E Test Suite Creation (Tiers 1-4) | Comprehensive opaque-box test suite covering login, normalization, timetable, storage, proxies | M-E2E | ORIGINAL_REQUEST R1-R4 |
| 13| Final E2E Pass & Adversarial Hardening | Pass 100% of E2E tests + Tier 5 adversarial verification + Forensic Integrity Audit | M-FINAL | Orchestration Plan |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Roster, Auth, Session & Engine Migration | Sync psgimMasterStudents.ts & psgimData.ts from scripts/excel_mapping.csv, update AuthScreen, App.tsx, storageService, studzoneService, lmsService | none | DONE |
| M2 | UI Display Uniformity & Zero Emoji Compliance | Update DashboardScreen, TimetableScreen, ReconcileScreen, CalendarScreen, AdminDashboardScreen, DigitalIdModal, and eliminate emojis | M1 | DONE |
| M-E2E | E2E Testing Suite Track | Design and implement opaque-box test suite for Tiers 1-4, publish TEST_READY.md | none | DONE |
| M-FINAL | Final Verification & Hardening | Pass 100% of E2E tests, run Reviewers, Challengers, and Forensic Auditor gate checks | M1, M2, M-E2E | DONE |

## Interface Contracts
### `psgimMasterStudents.ts` Contract
- `toNewRollNo(rollNo: string): string`: Maps `D26AB05` -> `26AB12`. If passed `26AB12`, returns `26AB12`.
- `toOldRollNo(rollNo: string): string`: Maps `26AB12` -> `D26AB05`. If passed `D26AB05`, returns `D26AB05`.
- `getMasterStudent(rollNo: string): MasterStudentRecord | undefined`: Querying either `26AB12` or `D26AB05` returns Devdarshan V (`dRollNo: "D26AB05"`, `collegeRollNo: "26AB12"`, `batch: "B"`, `name: "DEVDARSHAN V"`).

### `psgimData.ts` & `getTimetableForStudent` Contract
- `STUDENT_REGISTRY["26AB12"]` and `STUDENT_REGISTRY["D26AB05"]` both point to Devdarshan V's dynamic batches:
  `MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3, SPORTS2`.
- `getTimetableForStudent("26AB12")`:
  - Returns exactly 19 periods across Monday through Saturday.
  - `LA1` slot is in `LH-101`.
  - `MC3` slot is in `LH-401`.
  - `SSA3` slot is in `LH-101`.
  - Zero slash rooms, zero unassigned rooms.

### `StorageService` Contract
- Key `@attendance_monitor_roll_no`: Stores official College Roll Number (e.g. `26AB12`).
- Backward compatibility: If `@attendance_monitor_roll_no` is absent, reads `@attendance_monitor_auth_user` and normalizes via `toNewRollNo`.
- `getPeriodRecords(rollNo)`: Checks `@attendance_monitor_period_records_${toNewRollNo(rollNo)}`. If not found, checks `@attendance_monitor_period_records_${toOldRollNo(rollNo)}` and migrates internal keys.

### External Proxy Contract (`studzoneService.ts`, `lmsService.ts`)
- UI and app callers invoke methods passing `26AB12`.
- Network request payload to college servers transparently substitutes `toOldRollNo(rollNo)` (`D26AB05`).
- Results and UI displays retain the College Roll Number (`26AB12`).

## Code Layout
- `src/data/psgimMasterStudents.ts`: Master student mapping and roll conversion helpers. (Owned by M1 Worker)
- `src/data/psgimData.ts`: Student registry and schedule resolution engine. (Owned by M1 Worker)
- `src/screens/AuthScreen.tsx`: Login UI, input validation, and normalization. (Owned by M1 Worker)
- `App.tsx`: Root state, active session roll number, header badge. (Owned by M1 & M2 Worker)
- `src/services/storageService.ts`: Session and record persistence. (Owned by M1 Worker)
- `src/services/studzoneService.ts`: Studzone portal integration and proxy bridging. (Owned by M1 Worker)
- `src/services/lmsService.ts`: Moodle portal integration and proxy bridging. (Owned by M1 Worker)
- `src/services/psgimService.ts`: Dynamic group faculty preservation. (Owned by M1 Worker)
- `src/screens/DashboardScreen.tsx`: Dashboard UI and welcome banner. (Owned by M2 Worker)
- `src/screens/TimetableScreen.tsx`: Timetable screen UI. (Owned by M2 Worker)
- `src/screens/ReconcileScreen.tsx`: Portals and reconciliation screen UI. (Owned by M2 Worker)
- `src/screens/CalendarScreen.tsx`: Calendar screen UI. (Owned by M2 Worker)
- `src/screens/AdminDashboardScreen.tsx`: Admin dashboard student cards. (Owned by M2 Worker)
- `src/components/DigitalIdModal.tsx`: Digital student ID card modal. (Owned by M2 Worker)
- `src/components/AttendanceDisputeModal.tsx`: Attendance dispute modal. (Owned by M2 Worker)
- `tests/`: Opaque-box E2E test suite. (Owned by M-E2E Test Writer)
