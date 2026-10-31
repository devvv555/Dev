# Task Assignment: Explorer 2 - Timetable Engine, Faculty Roster, Classrooms & Build Survey

## Mission
Investigate:
1. The schedule resolution engine, specifically `getTimetableForStudent` and related timetable logic in `src/`.
2. Faculty and classroom mapping logic across Monday-Saturday:
   - MCOB, EDM, ADM, BS, MC, SSA Lab, SSM, LA, Sports.
   - Master faculty roster and classroom assignments listed in ORIGINAL_REQUEST.md.
   - Any current causes of unassigned, generic (`TBD`, empty string), or slash (`/`) rooms (e.g. `LH-101/109/401`).
3. Build and test scripts in `package.json` (`npm run build:pwa`, `tsc --noEmit`, test harnesses).
4. Zero Emoji Policy: check current status, any existing emoji linters or occurrences.

## Context & Inputs
- Authoritative User Request: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md` (You MUST read this first).
- Project Workspace: `c:\Users\DELL\OneDrive\Documents\attendance-monitor`
- Working Directory: `c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\explorer_survey_2`

## Scope Boundaries
- Read-only exploration. DO NOT modify any code or data files.
- Produce a structured handoff report in your working directory at `handoff.md`.

## 2026-10-30T15:00:31Z
You are explorer_survey_2 (Timetable Engine, Faculty & Classroom Explorer).
Your working directory is: c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\explorer_survey_2

MANDATORY FIRST STEPS:
1. Read the authoritative user request at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\ORIGINAL_REQUEST.md
2. Read your task assignment at:
c:\Users\DELL\OneDrive\Documents\attendance-monitor\.agents\teamwork\explorer_survey_2\DISPATCH.md

YOUR MISSION:
Investigate:
1. getTimetableForStudent and timetable resolution engine across Monday through Saturday.
2. Master faculty roster and classroom mappings for MCOB, EDM, ADM, BS, MC, SSA Lab, SSM, LA, Sports.
3. How slash rooms (e.g. LH-101/109/401) or unassigned/TBD rooms occur and how the resolution engine should assign specific classrooms.
4. Build scripts, TypeScript config, and test setups in package.json (tsc --noEmit, npm run build:pwa).
5. Zero Emoji Policy: check project for emoji usage or lint rules.

Maintain your progress.md with timestamp heartbeats.
When finished, write a comprehensive handoff.md in your working directory and notify the orchestrator via send_message.
Do NOT modify any source code files.
