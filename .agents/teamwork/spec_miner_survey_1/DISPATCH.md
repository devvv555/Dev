# Task Assignment: Specification Miner - Dynamic Course Batch List Survey

## Mission
Investigate and locate the official 6-page "Dynamic Course Batch List" document and any related circulars/data in the workspace (`c:\Users\DELL\OneDrive\Documents\attendance-monitor`).
Extract all student records from D26AA01 through D26AE13 across all batches (A, B, C, D, AE). Document the exact course groups for each student:
- MCOB (Group 1, 2, 3, or 4)
- ADM (Group 1, 2, 3, or 4)
- MC (Group 1, 2, 3, or 4)
- SSM & Sports (SSM 1, 2, 3, or 4 & Sports Group)
- BS (Group 1, 2, 3, or 4)
- EDM (Group 1, 2, 3, or 4)
- LA (Group 1, 2, 3, or 4)
- SSA (Group 1, 2, 3, or 4)

Check for test cases specified in ORIGINAL_REQUEST.md:
- 26AA01 / D26AA01: MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3.
- 26AB05: MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3.

## Context & Inputs
- Authoritative User Request: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md` (You MUST read this first).
- Project Workspace: `c:\Users\DELL\OneDrive\Documents\attendance-monitor`
- Working Directory: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\spec_miner_survey_1`

## Scope Boundaries
- Read-only exploration. DO NOT modify any code or data files.
- Produce a structured handoff report in your working directory at `handoff.md`.

## 2026-10-30T15:00:31Z
You are spec_miner_survey_1 (Specification Miner).
Your working directory is: c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\spec_miner_survey_1

MANDATORY FIRST STEPS:
1. Read the authoritative user request at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md
2. Read your task assignment at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\spec_miner_survey_1\DISPATCH.md

YOUR MISSION:
Locate the official 6-page "Dynamic Course Batch List" document and any related circulars/data files in the workspace (c:\Users\DELL\OneDrive\Documents\attendance-monitor).
Inspect and extract all student records from D26AA01 through D26AE13 across all batches (A, B, C, D, AE).
Document the exact course groups for each student:
- MCOB (Group 1, 2, 3, or 4)
- ADM (Group 1, 2, 3, or 4)
- MC (Group 1, 2, 3, or 4)
- SSM & Sports (SSM 1, 2, 3, or 4 & Sports Group)
- BS (Group 1, 2, 3, or 4)
- EDM (Group 1, 2, 3, or 4)
- LA (Group 1, 2, 3, or 4)
- SSA (Group 1, 2, 3, or 4)

Verify test cases:
- 26AA01 / D26AA01: MCOB1, ADM1, MC2, SSM1, BS1, EDM3, LA1, SSA3.
- 26AB05: MCOB1, ADM2, MC3, SSM2, BS2, EDM1, LA1, SSA3.

Document total student count, batch boundaries, and file locations.
Maintain your progress.md with timestamp heartbeats.
When finished, write a comprehensive handoff.md in your working directory and notify the orchestrator via send_message.
Do NOT modify any source code files.
