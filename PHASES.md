# PHASES.md — Project Roadmap & Progress Tracker

This document tracks the phased development lifecycle of **NextClass**.

---

## Progress Overview

| Phase | Description | Status | Completion Note |
|---|---|:---:|---|
| **Phase 0** | Workspace & Planning | ✅ Completed | Analyzed requirements, selected React + Vite + TS + Tailwind stack. |
| **Phase 1** | Project Setup | ✅ Completed | Configured Vite, Tailwind CSS, Lucide icons, Vitest, and package scripts. |
| **Phase 2** | Data Model & Demo Data | ✅ Completed | Extracted sample timetable & calendar from PDFs; created domain types. |
| **Phase 3** | Schedule Engine | ✅ Completed | Implemented pure `getScheduleForDate` with precedence rules and breaks. |
| **Phase 4** | Today & Tomorrow | ✅ Completed | Built TodayHero, ClassCard, FreePeriodCard, and TomorrowPreview. |
| **Phase 5** | Calendar Navigation | ✅ Completed | Built monthly grid with status indicator dots and date schedule drawer. |
| **Phase 6** | Weekly Timetable Baseline | ✅ Completed | Built recurring timetable view with invariant protection & class editor. |
| **Phase 7** | Date-Specific Overrides | ✅ Completed | Built ChangesManager and ChangeModal (Swap, Cancel, Room, Time, Extra). |
| **Phase 8** | Setup & JSON Import/Export | ✅ Completed | Built SettingsModal, JSON schema validation, and seed mechanisms. |
| **Phase 9** | UI Polish & Responsiveness | ✅ Completed | Added Plus Jakarta Sans font, smooth transitions, and mobile bottom bar. |
| **Phase 10** | Automated & Edge Testing | ✅ Completed | 22/22 unit tests passing in Vitest covering all required scenarios. |
| **Phase 11** | Production Build & Deploy | ✅ Completed | `dist/` production bundle compiled with zero errors; relative base configured. |
| **Phase 12** | GitHub & Final Documentation | ✅ Completed | All 8 documentation files created, Git repository published, and GitHub Pages enabled. |

---

## Detailed Phase Breakdown

### Phase 0: Workspace & Planning
- Examined project constraints ($\approx 4\text{ hours}$ budget).
- Evaluated options: Decided on a client-only, zero-backend Responsive React SPA with LocalStorage.
- Verified absence of unnecessary complexity (no cloud databases, no user logins).

### Phase 1: Project Setup
- Initialized npm project.
- Installed React 18, Vite 6, Tailwind CSS 3.4, Lucide React, and Vitest 3.
- Created `tsconfig.json`, `tailwind.config.js`, and `vite.config.ts`.

### Phase 2: Data Model & Demo Data
- Extracted PDF text from `Timetable_Sem5_CSE_C.pdf` and `Academic_Calendar_2026_27_Odd.pdf`.
- Defined schemas for `TimetableClass`, `CalendarEntry`, `DateOverride`, and `DailySchedule`.
- Created structured demo fixtures in `src/data/`.

### Phase 3: Central Schedule Engine
- Implemented pure deterministic logic in `src/core/scheduleEngine.ts`.
- Integrated holiday checks, official special timetable mapping, and user override modifications.
- Computed active/upcoming class statuses and detected free periods.

### Phase 4: Today & Tomorrow Views
- Hero card showing happening class with progress bar or next class countdown.
- Chronological timeline combining classes and free periods.
- Tomorrow preview preventing screen switching.

### Phase 5: Calendar
- Interactive month grid with color-coded dot badges.
- Date detail card showing complete calculated schedule for any selected day.

### Phase 6: Weekly Timetable Baseline
- Dedicated weekly routine view representing the immutable master baseline.
- Clear callout indicating baseline is untouched by date-specific overrides.
- In-place modal editor for baseline classes.

### Phase 7: Date-Specific Overrides
- Management screen for all student overrides (Swaps, Cancellations, Relocations).
- Categorization into Upcoming and Past events.

### Phase 8: Setup & Persistence
- LocalStorage repository with auto-seeding.
- JSON backup export and schema-validated import.
- Institution profile configuration.

### Phase 9: UI Polish
- Mobile-first bottom navigation.
- Time-travel simulator for rapid professor grading.

### Phase 10: Automated Testing
- 22 comprehensive Vitest unit tests covering all core edge cases.

### Phase 11: Deployment Preparation
- Executed `npm run build` producing optimized production build in `dist/`.

### Phase 12: GitHub Delivery & Documentation
- Authoring all 8 mandatory documentation markdown files.
- Initializing Git, committing milestones, and publishing to GitHub.
