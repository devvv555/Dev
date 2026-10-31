# Task Assignment: Challenger 1 - Adversarial Stress-Testing of Roll Resolution & Timetable

## Mission
Adversarially challenge and stress-test the implementation:
1. Write stress harnesses and oracles to test edge cases:
   - Malformed, whitespace-padded, mixed-case, and boundary roll numbers (e.g. `d26aa01`, `  26AA01  `, `D26AE10` [must return null/undefined, not crash], `D26AA00`, `D26AD65`, `26ZZ99`).
   - Check every single student across the entire 252 cohort: assert that `getTimetableForStudent(roll)` returns exactly 19 slots with valid faculty and non-slash rooms.
   - Test collision deduplication: verify no two slots have the same day and start time.
2. Report empirical findings with concrete test scripts and execution logs.
3. Conclude with a clear binary verdict: **APPROVE** or **REQUEST_CHANGES**.

## Context & Inputs
- Authoritative User Request: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY: read first).
- Project Plan: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\PROJECT.md`
- Working Directory: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\challenger_1`

Produce `handoff.md` in your working directory and notify the orchestrator via send_message.

## 2026-10-30T15:45:40Z
[Message] timestamp=2026-10-30T15:45:40Z sender=ff16fdf2-4881-4afa-8bc3-56dd95cdb37d priority=MESSAGE_PRIORITY_HIGH content=You are challenger_1 (Adversarial Challenger).
Your working directory is: c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\challenger_1

MANDATORY FIRST STEPS:
1. Read the authoritative user request at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md
2. Read your task assignment at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\challenger_1\DISPATCH.md

YOUR MISSION:
Adversarially challenge and stress-test the implementation:
- Test edge cases in roll resolution: whitespace, mixed case, non-existent rolls (D26AE10, D26AA00, 26ZZ99).
- Check full cohort timetable generation (252 students x 19 slots) for collision deduplication, valid rooms, and faculty.
- Document test scripts and empirical findings.
- Render verdict: APPROVE or REQUEST_CHANGES.

Update progress.md with timestamp heartbeats.
When complete, write handoff.md and notify the orchestrator via send_message.
