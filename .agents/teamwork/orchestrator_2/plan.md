# Implementation & Verification Plan: College Roll Number Migration

## Objective
Migrate primary student identification, authentication, and display throughout the application from legacy internal D-Roll numbers (e.g. D26AB05) to official College Roll Numbers (e.g. 26AB12), while preserving seamless backward compatibility, storage continuity, timetable resolution, and proxy bridging to external college servers.

## Phase 0: Survey & Technical Investigation (3 Explorers in Parallel)
- **Explorer 1 (Auth & Session)**:
  - Focus: `src/screens/AuthScreen.tsx`, `App.tsx`, session management, `@attendance_monitor_roll_no`.
  - Goal: Map login validation, normalization from `D26AB05` to `26AB12`, session storage keys, and authentication state transitions.
- **Explorer 2 (UI Display & Student Badges)**:
  - Focus: `DashboardScreen.tsx`, `TimetableScreen.tsx`, `ReconcileScreen.tsx`, `CalendarScreen.tsx`, `AdminDashboardScreen.tsx`, `DigitalIdModal.tsx`, and modal components.
  - Goal: Map every place where roll numbers and student names are displayed, ensuring official College Roll Number (`26AB12`) is prominently shown and Devdarshan V displays `26AB12`.
- **Explorer 3 (Timetable, Storage & Proxy Integration)**:
  - Focus: `getTimetableForStudent`, Studzone & Moodle integration services, attendance/period log storage migrations (`src/data/`, `src/services/`).
  - Goal: Map timetable resolution for `26AB12`, bridging translation to `D26AB05` for external legacy requests, and migration of existing saved data.

## Phase 1: Synthesis & Project Architecture
- Consolidate findings into `PROJECT.md` Feature Inventory, Milestones, and Interface Contracts.
- Define Dual Track structure: Implementation Track + Opaque-box E2E Testing Track.

## Phase 2: Implementation & E2E Test Suite Creation (Dual Track)
- **Track A (Implementation)**:
  - Implement R1 (Auth & Session Primary Identifier Migration)
  - Implement R2 (UI Display & Profile Normalization)
  - Implement R3 (Storage, Attendance & Timetable Continuity)
- **Track B (E2E Testing)**:
  - Write multi-tier E2E tests (Tier 1-4) verifying login, normalization, timetable resolution, proxy bridging, and storage migration.

## Phase 3: Comprehensive Verification & Gating
- Reviewers: Code quality, regression checks, UI conformance, contract compliance.
- Challengers: Empirical verification of login permutations (`26AB12`, `D26AB05`, invalid rolls), timetable slot counts (19 periods), room assignments.
- Forensic Auditor: Authenticity check, zero hardcoding/facades, zero emoji check.
- System verification: `npx tsc --noEmit` and `npm run build:pwa`.

## Phase 4: Final Synthesis & Handoff
- Update `GATE_STATUS.md`, `progress.md`, `BRIEFING.md`.
- Deliver comprehensive handoff report to parent orchestrator.
