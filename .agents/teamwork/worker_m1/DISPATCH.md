## 2026-10-30T16:58:02Z

You are a Worker subagent for Milestone M1 of the College Roll Number migration project.

Your working directory is:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\worker_m1

Read the authoritative project request file at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md
and the project architecture document at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\PROJECT.md

Read the survey reports for complete guidance:
- c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\explorer_survey_auth\handoff.md
- c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\explorer_survey_engine\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Milestone M1 Scope:
1. Sync `src/data/psgimMasterStudents.ts` with `scripts/excel_mapping.csv`:
   - Map `D26AB05` to `collegeRollNo: "26AB12"` (DEVDARSHAN V, Batch B, password `13DEC05` / `13AUG05`).
   - Ensure all 252 students have their true official college roll numbers from `scripts/excel_mapping.csv`.
   - Verify `toNewRollNo("D26AB05") === "26AB12"`, `toOldRollNo("26AB12") === "D26AB05"`, `getMasterStudent("26AB12").name === "DEVDARSHAN V"`.
2. Sync `src/data/psgimData.ts`:
   - Ensure `STUDENT_REGISTRY["26AB12"]` contains Devdarshan V's dynamic batches:
     `MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3, SPORTS2`.
   - Keep `STUDENT_REGISTRY["D26AB05"]` and `STUDENT_REGISTRY["26AB05"]` mapped to Devdarshan V as backward-compatible aliases.
   - Verify `getTimetableForStudent("26AB12")` returns 19 weekly periods with:
     `LA1` -> `LH-101`, `MC3` -> `LH-401`, `SSA3` -> `LH-101`.
3. Update `src/screens/AuthScreen.tsx`:
   - Accepts College Roll Numbers (e.g. `26AB12`) as standard input.
   - Entering legacy `D26AB05` automatically normalizes to `26AB12` via `toNewRollNo(cleanRollNo)`.
   - Active session roll stored and passed to callback is `26AB12`.
4. Update `App.tsx`:
   - Active session state `activeRollNo` stores `26AB12`.
   - On startup, read `@attendance_monitor_roll_no` (with fallback to legacy `@attendance_monitor_auth_user`), normalize via `toNewRollNo`, and set `activeRollNo`.
   - On login, save `@attendance_monitor_roll_no`.
5. Update `src/services/storageService.ts`:
   - Add `@attendance_monitor_roll_no` key.
   - Add transparent fallback and key migration in `getPeriodRecords` and related getters.
   - Add `migrateStudentData(oldRoll, newRoll)` to migrate period record keys (`replace(oldRoll, newRoll)`).
6. Update `src/services/studzoneService.ts` & `src/services/lmsService.ts`:
   - On outgoing HTTP requests to legacy college servers (`ecampus.psgtech.ac.in`, `lms.psgim.ac.in`), bridge `cleanRollNo` using `toOldRollNo(cleanRollNo)` (`D26AB05`).
   - Store and return College Roll Numbers (`26AB12`) in local storage and result objects.
7. Update `src/services/psgimService.ts`:
   - Line 159: prioritize `slot.faculty` over section default.
8. Maintain strict adherence to the project-wide Zero Emoji Policy across all updated files.
9. Verify changes with `npx tsc --noEmit` and node verification scripts.

Files exclusively owned by you:
- `src/data/psgimMasterStudents.ts`
- `src/data/psgimData.ts`
- `src/screens/AuthScreen.tsx`
- `App.tsx`
- `src/services/storageService.ts`
- `src/services/studzoneService.ts`
- `src/services/lmsService.ts`
- `src/services/psgimService.ts`

When complete, write your handoff report to:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\worker_m1\handoff.md
and notify me via send_message.
