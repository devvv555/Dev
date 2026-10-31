# E2E Test Infra: PSGIM Attendance Monitor Dynamic Course Auditing

## Test Philosophy
- Opaque-box, requirement-driven testing. Derived strictly from `ORIGINAL_REQUEST.md` and official 6-page PDF circular.
- Pass/Fail semantics: exit code 0 on all tests passing, exit code 1 on any discrepancy.

## Feature Inventory & Test Coverage
| # | Feature | Requirement | Tier 1 (Isolated) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Workload) |
|---|---------|-------------|:-----------------:|:-----------------:|:-----------------:|:-----------------:|
| 1 | Dynamic Course Groups (252 students) | R1 | >=5 cases | >=5 cases | Covered | Full cohort |
| 2 | Batch AE SSM Groups (12 students) | R1 | >=5 cases | All 12 cases | Covered | Full cohort |
| 3 | Bidirectional Accessibility | R1 | 26AA01, D26AA01, 26AB05, D26AB05 | Case insensitivity, missing rolls | Cross-mapping | Cohort queries |
| 4 | Master Students Roster Sync | R2 | Exact count 252 | Missing/skipped rolls (AE10) | Alignment | Zero unmapped |
| 5 | Master Faculty Roster Adherence | R3 | 9 subjects | Group 1-4 bounds | Teacher conflict | All slots |
| 6 | Classroom Allocation & Zero Slash | R3 | All courses | CLUB Thursday 14:35 | Lab/Hall overlap | Zero slashes |
| 7 | Full-Week 19 Periods | R3 | All days Mon-Sat | AE schedule completeness | Dedup collisions | 252 x 19 slots |
| 8 | Zero Emoji Policy | R4 | src/data files | Scripts and components | All source files | Whole repo |
| 9 | Build & TypeScript | R4 | tsc --noEmit | npm run build:pwa | Build outputs | PWA package |

## Test Architecture
- Test Suite Runner: `tests/e2e_comprehensive_audit.js`
- Ground Truth Specification: `.agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json`
- Verification Commands:
  - `node tests/e2e_comprehensive_audit.js`
  - `npx tsc --noEmit`
  - `npm run build:pwa`
