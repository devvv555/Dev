# E2E Test Infrastructure: PSGIM College Roll Number Migration Audit

## 1. Test Philosophy
- **Opaque-Box & Requirement-Driven**: Tests are designed strictly against the authoritative requirements documented in `ORIGINAL_REQUEST.md`, `PROJECT.md`, and the official 1:1 mapping spreadsheet (`scripts/excel_mapping.csv`). The tests treat the system as a black box, interacting only through public interfaces and persistent storage contracts.
- **Strict Pass/Fail Semantics**: Process exits with code `0` only when 100% of all test assertions across Tiers 1-4 pass without discrepancy. Any failure results in exit code `1` and detailed failure logs.
- **Zero Emoji Policy**: Zero unicode emoji characters are permitted anywhere within test scripts, assertions, logs, or reports. All status markers are rendered in clean standard ASCII text (e.g. `[PASS]`, `[FAIL]`, `[INFO]`).
- **Progressive Testability & Isolation**: Tests run in an isolated in-memory environment with local storage polyfills and on-the-fly TypeScript transpilation, requiring no external server dependencies or emulator environments.

---

## 2. Feature Inventory & Coverage Matrix

| # | Feature Area | Requirement | Tier 1 (Isolated) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Real-World) |
|---|--------------|-------------|:-----------------:|:-----------------:|:----------------------:|:-------------------:|
| 1 | Direct College Roll Login | R1 | >=5 cases (`26AB12`, `26AA04`, `26AB33`) | Case insensitivity, whitespace trimming | Auth normalization in multi-layer flow | Simulated user login step |
| 2 | Devdarshan V Identity Resolution | R1, R2 | Name, Batch B, all 9 dynamic courses | Case/whitespace on legacy & new roll | Identity check in pipeline flow | Profile banner resolution |
| 3 | Active Session Storage Key | R1, R3 | `@attendance_monitor_roll_no` | Precedence over legacy, backward fallback | Storage key + period key translation | Session persistence verification |
| 4 | Timetable Resolution & Rooms | R3 | 19 periods, `LA1`->`LH-101`, `MC3`->`LH-401`, `SSA3`->`LH-101` | Zero slashes, zero unassigned/TBD | Timetable engine in pipeline flow | Full-week schedule audit |
| 5 | Studzone & Moodle Proxy Bridging | R3 | `toOldRollNo('26AB12')`->`D26AB05`, LMS username | Outgoing payload translation | Outbound request proxy bridging | End-to-end portal call check |
| 6 | Master Cohort Consistency | R2 | Batch A-D samples | Full 252 student scan from Excel mapping | Batch AE & diverse batch students | Cohort continuity |

---

## 3. Test Architecture

### 3.1 Test Runner & Environment
- **Runner Script**: `tests/e2e_college_roll_audit.cjs`
- **Execution Command**: `node tests/e2e_college_roll_audit.cjs`
- **Language & Runtime**: Node.js CommonJS (`.cjs`) with `typescript.transpileModule` compilation hook for transparently importing `.ts` source modules.
- **Storage Emulation**: High-fidelity in-memory `window.localStorage` polyfill allowing `@react-native-async-storage/async-storage` and `StorageService` to operate reliably in Node.js.

### 3.2 Authoritative Ground Truth Sources
1. `scripts/excel_mapping.csv`: Authoritative 1:1 mapping between legacy internal D-Roll numbers (`D26AB05`) and official College Roll Numbers (`26AB12`) for all 252 students.
2. `PROJECT.md`: Module architecture, interface contracts, and storage key specifications.
3. `ORIGINAL_REQUEST.md`: Acceptance criteria and specific verified test cases.

---

## 4. Test Tiers & Acceptance Thresholds

### Tier 1: Feature Coverage (Isolated)
- **Threshold**: 100% Pass (0 discrepancies allowed across 41 assertions).
- **Core Checks**:
  - Direct College Roll login (`26AB12`) resolves without requiring 'D' prefix.
  - Identity resolution verifies `DEVDARSHAN V`, Section `B`, and all 9 dynamic course groups: `MCOB1`, `ADM2`, `MC3`, `SSM2`, `BS2`, `EDM1`, `LA1`, `SSA3`, `SPORTS2`.
  - Canonical storage key `@attendance_monitor_roll_no` stores and retrieves `26AB12`.
  - Schedule engine returns exactly 19 weekly periods with verified classrooms: `LA1` -> `LH-101`, `MC3` -> `LH-401`, `SSA3` -> `LH-101`, `MCOB1` -> `LH-101`, `ADM2` -> `LH-109`, `BS2` -> `LH-109`, `EDM1` -> `LH-101`. Zero slash rooms, zero unassigned rooms.
  - Proxy bridging verifies `toOldRollNo('26AB12')` returns `'D26AB05'`, `toOldRollNo('26AA04')` returns `'D26AA01'`, and `LmsService.resolveMoodleUsername('26AB12')` returns `'D26AB05'`.

### Tier 2: Boundary & Corner Cases
- **Threshold**: 100% Pass (0 discrepancies allowed across 38 assertions).
- **Core Checks**:
  - Legacy input normalization: `D26AB05` -> `26AB12`, `D26AA01` -> `26AA04`, `D26AB01` -> `26AB33`, `D26AE01` -> `26AE01`.
  - Case insensitivity: `26ab12`, `d26ab05` correctly resolve name, timetable, and roll conversions.
  - Whitespace handling: `  26AB12  `, `\t26AB12\n`, `   D26AB05   ` trimmed cleanly.
  - Unmapped and invalid inputs (`INVALID_ROLL_999`, ``, `null`, `undefined`) handled gracefully without uncaught exceptions or crashes.
  - Full cohort bidirectional consistency: 100% of the 252 students in `scripts/excel_mapping.csv` verify `toNewRollNo(dRoll) === collegeRoll` and `toOldRollNo(collegeRoll) === dRoll`.

### Tier 3: Cross-Feature Combinations
- **Threshold**: 100% Pass (0 discrepancies allowed across 13 assertions).
- **Core Checks**:
  - Storage key migration combined with slot key translation: legacy records under `@attendance_monitor_period_records_D26AB05` with keys `slot_D26AB05_...` are safely migrated to `@attendance_monitor_period_records_26AB12` with keys translated to `slot_26AB12_...`, preserving all status and metadata.
  - Multi-layer pipeline flow: Login as `D26AB05` -> normalized to `26AB12` -> stored in `@attendance_monitor_roll_no` -> identity resolved as `DEVDARSHAN V` -> timetable resolved as `26AB12` (19 periods, exact rooms) -> proxy translated to `D26AB05` for outgoing network payloads -> zero `D26AB05` exposed in UI state.
  - Batch AE student resolution (`26AE01`) with 19 periods, dynamic courses, and proxy bridging to `D26AE01`.

### Tier 4: Real-World Application Scenarios
- **Threshold**: 100% Pass (0 discrepancies allowed across 7 assertions).
- **Core Checks**:
  - Full end-to-end user journey simulation: user logs in with `26AB12`, active session established in storage, student profile resolved, full-week timetable loaded (19 periods), every period classroom verified against master circular, attendance record saved and reloaded with continuity, and outbound network sync requests verified to transmit `D26AB05` while frontend remains purely on `26AB12`.

---

## 5. Verification Commands
- **Execute E2E Audit Suite**:
  ```bash
  node tests/e2e_college_roll_audit.cjs
  ```
- **TypeScript Static Verification**:
  ```bash
  npx tsc --noEmit
  ```
- **Production PWA Build**:
  ```bash
  npm run build:pwa
  ```
