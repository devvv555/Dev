## 2026-10-31T05:08:31Z
You are a Worker subagent for Iteration 2 of the College Roll Number migration project.

Your working directory is:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\worker_fix_1

Read the authoritative project request file at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md
and the project architecture document at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\PROJECT.md

Read the complete remediation plan and handoff reports:
- c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\explorer_fix_1\handoff.md
- c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\explorer_fix_1\analysis.md
- c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\explorer_fix_1\rekeyed_student_registry.ts (Pre-generated verified drop-in registry)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Tasks:
1. Re-key `STUDENT_REGISTRY` in `src/data/psgimData.ts`:
   - Replace the `STUDENT_REGISTRY` object in `src/data/psgimData.ts` with the pre-generated verified registry in `.agents/teamwork/explorer_fix_1/rekeyed_student_registry.ts` (contains all 252 students from `scripts/excel_mapping.csv`, matching each student's `collegeRoll` batches to their `dRoll` batches with 0% discrepancy).
   - Verify `getTimetableForStudent` resolves dynamic course groups accurately for every student.
2. Fix `src/data/psgimMasterStudents.ts`:
   - In `toNewRollNo` (line 321): remove `|| clean === '26AB05'`. Do NOT map `26AB05` to `26AB12` (Amulya P is `26AB05`).
   - Remove lines 298-301 (`if (clean === '26AB05' && PSGIM_MASTER_STUDENTS['D26AB05']) return PSGIM_MASTER_STUDENTS['D26AB05'];`).
   - Ensure `toNewRollNo('26AB05') === '26AB05'` and `toNewRollNo('D26AB05') === '26AB12'`.
3. Fix `src/screens/AuthScreen.tsx`:
   - Lines 108-112: remove `isDevdarshanMatch` bypass logic. Ensure login genuinely resolves via `getMasterStudent(roll).dobPassword`.
4. Zero Emoji Policy Compliance:
   - `App.tsx`: line 199, replace `⏱️` with `[TIMER]` or remove.
   - `src/screens/DashboardScreen.tsx`: line 1544, replace `⏰` with `[ALERT]`.
   - `src/services/disputeReportService.ts`: lines 210-225, remove all emojis (`👤`, `🏫`, `📅`, `🕒`, `⚠️`, `ℹ️`, `✓`).
   - `src/components/CoursePlanModal.tsx`: line 297, remove `💡`.
   - `src/components/LmsAssignmentCard.tsx`: lines 39-175, remove all emojis (`✅`, `⚠️`, `🔥`, `⏳`, `📅`, `🚀`, `🎉`, `📄`, `🔄`, `📎`, `🌐`).
   - `src/components/LmsQuizCard.tsx`: lines 34-67, remove all emojis (`🔴`, `⏳`, `⏱️`, `🎯`, `🚀`).
5. Update `tests/e2e_college_roll_audit.cjs`:
   - Add explicit assertions verifying `STUDENT_REGISTRY[colRoll].batches === STUDENT_REGISTRY[dRoll].batches` across all 252 students from `scripts/excel_mapping.csv`.
6. Run and verify all verification suites:
   - `node tests/adversarial_roll_migration_audit.cjs`
   - `node tests/e2e_college_roll_audit.cjs`
   - `npx tsc --noEmit`
   - `npm run build:pwa`
   - Zero emoji scan across the entire project.

When complete, write your handoff report to:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\worker_fix_1\handoff.md
and notify me via send_message.
