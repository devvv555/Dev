# Task Assignment: Reviewer 1 - Verification of Student Registry & Master Roster Sync

## Mission
Independently review and verify the implementation delivered by `worker_impl_1`:
1. Check `src/data/psgimData.ts` and `src/data/psgimMasterStudents.ts` against `ORIGINAL_REQUEST.md` and `.agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json`.
2. Verify all 252 official students are present and accurately mapped.
3. Verify test cases:
   - `26AA01 / D26AA01` resolves to: `MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3`
   - `26AB05` resolves to: `MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3`
4. Verify bidirectional accessibility (with/without leading 'D', case sensitivity).
5. Run the test suite: `node tests/e2e_comprehensive_audit.js` and `npm test`.
6. Run `npx tsc --noEmit` and `npm run build:pwa`.
7. Conclude with a clear binary verdict: **APPROVE** or **REQUEST_CHANGES**.

## Context & Inputs
- Authoritative User Request: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY: read first).
- Project Plan: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\PROJECT.md`
- Test Readiness: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\TEST_READY.md`
- Worker Handoff: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\worker_impl_1\handoff.md`
- Working Directory: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\reviewer_1`

Produce `handoff.md` in your working directory and notify the orchestrator via send_message.


## 2026-10-30T15:45:40Z
You are reviewer_1 (Independent Reviewer).
Your working directory is: c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\reviewer_1

MANDATORY FIRST STEPS:
1. Read the authoritative user request at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md
2. Read your task assignment at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\reviewer_1\DISPATCH.md
3. Read the worker handoff report at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\worker_impl_1\handoff.md

YOUR MISSION:
Review src/data/psgimData.ts and src/data/psgimMasterStudents.ts:
- Verify all 252 official students from .agents/teamwork/spec_miner_survey_1/official_dynamic_course_batch_list.json are correctly keyed and have accurate courses.
- Verify bidirectional roll accessibility (both college roll and D-roll formats).
- Verify test cases (26AA01/D26AA01, 26AB05).
- Run tests: node tests/e2e_comprehensive_audit.js, npm test, npx tsc --noEmit, npm run build:pwa.
- Render verdict: APPROVE or REQUEST_CHANGES.

Update progress.md with timestamp heartbeats.
When complete, write handoff.md and notify the orchestrator via send_message.
