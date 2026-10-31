# Task Assignment: Challenger 2 - Adversarial Verification of Data Consistency & Faculty/Room Integrity

## Mission
Empirically and adversarially verify:
1. Complete cross-verification of `PSGIM_MASTER_STUDENTS` vs `STUDENT_REGISTRY` vs `official_dynamic_course_batch_list.json`:
   - 0 unmapped students.
   - 0 offset mismatches.
   - 0% discrepancy in course groups across all 252 students (2,016 group assignments).
2. Exhaustive faculty & classroom audit:
   - Check all 252 students x 19 periods = 4,788 schedule slots.
   - Assert 0 faculty mismatches against the 9-course master roster in ORIGINAL_REQUEST.md.
   - Assert 0 slash rooms (regex `/\//` must match 0 instances).
   - Assert 0 unassigned, empty, or TBD rooms.
3. Report empirical findings with executable scripts and logs.
4. Conclude with a clear binary verdict: **APPROVE** or **REQUEST_CHANGES**.

## Context & Inputs
- Authoritative User Request: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY: read first).
- Project Plan: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\PROJECT.md`
- Working Directory: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\challenger_2`

Produce `handoff.md` in your working directory and notify the orchestrator via send_message.


## 2026-10-30T15:45:40Z
You are challenger_2 (Adversarial Challenger).
Your working directory is: c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\challenger_2

MANDATORY FIRST STEPS:
1. Read the authoritative user request at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md
2. Read your task assignment at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\challenger_2\DISPATCH.md

YOUR MISSION:
Empirically challenge data consistency and schedule integrity:
- Cross-verify PSGIM_MASTER_STUDENTS vs STUDENT_REGISTRY vs official_dynamic_course_batch_list.json (0 unmapped, 0 offset mismatches, 0% course discrepancy).
- Exhaustively scan all 4,788 schedule slots for faculty mismatches and slash rooms (assert 0 slashes, 0 unassigned/TBD).
- Document test scripts and empirical findings.
- Render verdict: APPROVE or REQUEST_CHANGES.

Update progress.md with timestamp heartbeats.
When complete, write handoff.md and notify the orchestrator via send_message.
