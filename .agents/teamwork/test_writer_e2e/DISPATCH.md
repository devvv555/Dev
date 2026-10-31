## 2026-10-30T16:58:02Z
You are an E2E Test Writer subagent for the College Roll Number migration project.

Your working directory is:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\test_writer_e2e

Read the authoritative project request file at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md
and the project architecture document at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\PROJECT.md

Your role is to design and implement an independent, opaque-box E2E test suite covering Tiers 1-4 for the College Roll Number migration.
Do NOT modify any source code files in `src/`. Only create or update test scripts in `tests/`.

Requirements to test:
- **Tier 1 - Feature Coverage (>=5 test cases per feature)**:
  - Direct College Roll login (`26AB12`).
  - Devdarshan V identity resolution (Name, Batch B, dynamic courses).
  - Active session storage key `@attendance_monitor_roll_no`.
  - Timetable slot count (19 weekly periods) and classrooms (`LA1` -> `LH-101`, `MC3` -> `LH-401`, `SSA3` -> `LH-101`).
  - Studzone & Moodle proxy bridging (`toOldRollNo`).
- **Tier 2 - Boundary & Corner Cases (>=5 test cases per feature)**:
  - Legacy `D26AB05` input normalization to `26AB12`.
  - Case insensitivity (`26ab12`, `d26ab05`).
  - Whitespace handling (` 26AB12 `, `  D26AB05 `).
  - Unmapped / invalid roll number handling (graceful error/undefined, no crash).
  - Master student bidirectional lookup consistency across multiple cohort students.
- **Tier 3 - Cross-Feature Combinations**:
  - Legacy storage key migration combined with period key translation (`slot_D26AB05_...` to `slot_26AB12_...`).
  - Login as `D26AB05` -> session established as `26AB12` -> timetable resolved as `26AB12` -> proxy translated to `D26AB05`.
  - Batch AE students and diverse batch students under new roll mapping.
- **Tier 4 - Real-World Application Scenarios**:
  - End-to-end user journey simulation: user logs in with `26AB12`, loads full-week timetable, verifies every period classroom, checks attendance storage continuity, and validates external portal proxy calls without any D-Roll exposure.

Create:
1. `tests/e2e_college_roll_audit.cjs` (executable via `node tests/e2e_college_roll_audit.cjs`). Ensure 0 emoji characters in the test script.
2. `TEST_INFRA.md` at project root (`c:\Users\DELL\OneDrive\Documents\attendance-monitor\TEST_INFRA.md`) documenting test philosophy, feature inventory coverage, test architecture, and tier thresholds.
3. `TEST_READY.md` at project root (`c:\Users\DELL\OneDrive\Documents\attendance-monitor\TEST_READY.md`) with coverage summary and test runner command.
4. Your handoff report at `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\test_writer_e2e\handoff.md`.

When complete, notify me via send_message.
