# Task Assignment: Implementation Worker - Registry, Master Roster, Classroom Resolution & Emoji Cleanup

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mission
Implement the required updates across `src/data/psgimData.ts`, `src/data/psgimMasterStudents.ts`, and `scripts/buildPwa.js` to fulfill Milestones 1, 2, and 3:

1. **`src/data/psgimData.ts`**:
   - Update `STUDENT_REGISTRY` using the authoritative dataset in `.agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json` so that all 252 official students have 100% accurate dynamic course groups.
   - For Batch AE students (`D26AE01` through `D26AE13`, skipping `D26AE10`), populate their explicit SSM groups (`SSM1` to `SSM4`) and SPORTS group from the official circular.
   - Ensure bidirectional accessibility:
     Support direct lookup in `STUDENT_REGISTRY` via both college roll number (e.g. `26AA01`, `26AB05`) and D-roll number (e.g. `D26AA01`, `D26AB05`), ensuring:
     - `26AA01` / `D26AA01` resolves to: `MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3`.
     - `26AB05` resolves to: `MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3`.
   - Update `resolveExactRoom`:
     For `CLUB` (Thursday 14:35), return `'Auditorium'` instead of `'Auditorium / Clubs'`, ensuring ZERO slash-separated rooms anywhere in timetable outputs.
   - Ensure `getTimetableForStudent`:
     Resolves 19 periods Monday-Saturday for all enrolled students (including Batch AE).
     Guarantee 0 unassigned, 0 empty, 0 TBD, and 0 slash rooms.

2. **`src/data/psgimMasterStudents.ts`**:
   - Synchronize `PSGIM_MASTER_STUDENTS` with all 252 official students, adding Batch AE (`D26AE01` through `D26AE13`, omitting `D26AE10`) and ensuring `D26AA25`, `D26AB14`, `D26AC53` are present.
   - Ensure `toOldRollNo`, `toNewRollNo`, and `getStudentByAnyRoll` resolve seamlessly.

3. **`scripts/buildPwa.js`**:
   - Clean up emojis (`🚀`, `📦`, `✅`) from console log messages to adhere strictly to the project-wide Zero Emoji Policy.

4. **Build & Type Verification**:
   - Run `npx tsc --noEmit` and ensure exit code 0 with zero errors.
   - Run `npm run build:pwa` and ensure exit code 0.

## Write Ownership
You have exclusive write ownership of:
- `src/data/psgimData.ts`
- `src/data/psgimMasterStudents.ts`
- `scripts/buildPwa.js`
Do NOT modify files outside your ownership scope.

## Context & Inputs
- Authoritative User Request: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY: read first).
- Project Plan: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\PROJECT.md`
- Official Ground Truth JSON: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\spec_miner_survey_1\official_dynamic_course_batch_list.json`
- Spec Miner Survey Report: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\spec_miner_survey_1\handoff.md`
- Data Registry Explorer Report: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\explorer_survey_1_rep1\handoff.md`
- Timetable & Build Explorer Report: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\explorer_survey_2\handoff.md`
- Working Directory: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\worker_impl_1`

Produce `handoff.md` in your working directory documenting all changes, build results, and verification commands, then report back via send_message.


## 2026-10-30T15:23:56Z
[Message] timestamp=2026-10-30T15:23:56Z sender=ff16fdf2-4881-4afa-8bc3-56dd95cdb37d priority=MESSAGE_PRIORITY_HIGH content=You are worker_impl_1 (Implementation Worker).
Your working directory is: c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\worker_impl_1

MANDATORY FIRST STEPS:
1. Read the authoritative user request at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md
2. Read your task assignment at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\worker_impl_1\DISPATCH.md
3. Read PROJECT.md at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

YOUR MISSION:
Update src/data/psgimData.ts, src/data/psgimMasterStudents.ts, and scripts/buildPwa.js:
1. STUDENT_REGISTRY in psgimData.ts:
   - Ensure all 252 official students from .agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json are registered with 100% exact course groups.
   - For Batch AE students (D26AE01 to D26AE13, excluding D26AE10), set explicit SSM groups (SSM1-SSM4) and SPORTS.
   - Bidirectional accessibility: Ensure both college roll numbers (e.g. 26AA01, 26AB05) and D-roll numbers (D26AA01, D26AB05) resolve to the student's dynamic course groups and schedule.
     Verify test cases:
     - 26AA01 / D26AA01 resolves to: MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3.
     - 26AB05 resolves to: MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3.
2. Classroom Resolution:
   - In resolveExactRoom, update CLUB (Thursday 14:35) to return 'Auditorium' (NOT 'Auditorium / Clubs').
   - Ensure getTimetableForStudent produces ZERO slash rooms across all 252 students and all periods.
3. PSGIM_MASTER_STUDENTS in psgimMasterStudents.ts:
   - Add all 12 Batch AE students and missing students (D26AA25, D26AB14, D26AC53).
   - Ensure helpers (toOldRollNo, toNewRollNo, getStudentByAnyRoll) resolve accurately without offset mismatches or unmapped gaps.
4. Clean Emojis:
   - Remove emojis from scripts/buildPwa.js console logs to uphold Zero Emoji Policy.
5. Verification:
   - Run npx tsc --noEmit (must pass with 0 errors).
   - Run npm run build:pwa (must succeed with exit code 0).

Update progress.md with timestamp heartbeats.
When complete, write handoff.md in your working directory and notify the orchestrator via send_message.
