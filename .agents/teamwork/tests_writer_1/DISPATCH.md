# Task Assignment: E2E Test Suite Writer

## Mission
Design and implement a comprehensive, requirement-driven, opaque-box E2E test suite in `tests/e2e_comprehensive_audit.js` based on `TEST_INFRA.md` and `ORIGINAL_REQUEST.md`.
The test suite must verify:
1. **Tier 1 - Feature Coverage (>=5 cases per feature)**:
   - All 8 dynamic course groups: MCOB, ADM, MC, SSM & Sports, BS, EDM, LA, SSA.
   - Verified test cases:
     - `26AA01` / `D26AA01` resolves to: `MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3`.
     - `26AB05` resolves to: `MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3`.
   - Master faculty assignments: 100% adherence to the 9-course faculty roster.
   - Classroom allocations: verify LH-101, LH-109, LH-401, LH-405, Sports Ground, SSM, Auditorium.
2. **Tier 2 - Boundary & Corner Cases (>=5 cases per feature)**:
   - All 12 Batch AE students (`D26AE01` through `D26AE13`, with `D26AE10` non-existent).
   - Roll number resolution edge cases: queries with leading `D` (`D26AA01`), without leading `D` (`26AA01`), lowercase (`d26aa01`, `26aa01`), invalid roll numbers.
   - Zero slash rooms: verify NO slot in generated timetables across all students contains a slash (`/`), e.g., NO `LH-101/109` or `Auditorium / Clubs`.
   - Zero unassigned / TBD / empty rooms.
3. **Tier 3 - Cross-Feature Combinations**:
   - Timetable resolution (`getTimetableForStudent`) across all enrolled students: 19 periods Monday through Saturday.
   - Schedule collision check: 0 duplicate time slots per student.
4. **Tier 4 - Real-World Cohort Workload Testing**:
   - Bulk resolution across all 252 official students from `.agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json`.
   - Cross-check `PSGIM_MASTER_STUDENTS` resolution to `STUDENT_REGISTRY`: 0 unmapped, 0 offset mismatches, 0% discrepancy.
   - Zero Emoji Policy verification across codebase.

When the test suite is ready and functioning, publish:
`c:\Users\DELL\OneDrive\Documents\attendance-monitor\TEST_READY.md`
following the format in `PROJECT.md § TEST_READY.md`.

## Context & Inputs
- Authoritative User Request: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY: read first).
- Project Plan: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\PROJECT.md`
- Test Infrastructure Plan: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\TEST_INFRA.md`
- Official Ground Truth JSON: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\spec_miner_survey_1\official_dynamic_course_batch_list.json`
- Working Directory: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\tests_writer_1`

## Scope Boundaries
- Do NOT modify application source code in `src/`. Only create/modify files under `tests/` and write `TEST_READY.md`.
- Produce `handoff.md` upon completion and report back via send_message.


## 2026-10-30T15:23:56Z
You are tests_writer_1 (E2E Test Suite Writer).
Your working directory is: c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\tests_writer_1

MANDATORY FIRST STEPS:
1. Read the authoritative user request at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md
2. Read your task assignment at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\tests_writer_1\DISPATCH.md
3. Read the test infra plan at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\TEST_INFRA.md

YOUR MISSION:
Design and implement tests/e2e_comprehensive_audit.js covering Tiers 1-4:
- Tier 1: Feature Coverage (>=5 cases per feature across all 8 dynamic courses, faculty roster, classrooms).
  Verified test cases:
  - 26AA01 / D26AA01: MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3.
  - 26AB05: MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3.
- Tier 2: Boundary & Corner Cases (All 12 Batch AE students, missing AE10, roll format variations with/without D, case insensitivity, zero slash rooms, zero unassigned/TBD rooms).
- Tier 3: Cross-Feature Combinations (19 periods Mon-Sat for all students, collision deduplication).
- Tier 4: Real-World Cohort Workload (all 252 official students from .agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json, 0 unmapped, 0 offset mismatches, 0% discrepancy with psgimMasterStudents.ts, zero emoji check).

When the test suite is ready and functioning, publish:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\TEST_READY.md
(per PROJECT.md format).

Update progress.md with timestamp heartbeats.
When complete, write handoff.md and notify the orchestrator via send_message.
Do NOT modify application code in src/.
