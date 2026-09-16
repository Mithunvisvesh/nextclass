# AGENTS.md — Instructions for Future Coding Agents

Welcome to **NextClass** ("Know what's next."). This document defines the engineering standards, architecture rules, and non-negotiable invariants for any AI agent or software engineer maintaining or extending this codebase.

---

## 1. Project Purpose & Scope

NextClass is a generic, local-first academic schedule application designed for college and university students. Its mission is to solve the daily scheduling friction caused by:
1. Recurring weekly classes (theory lectures, tutorials, lab blocks).
2. Institutional academic calendar events (national/regional holidays, vacations, exam periods).
3. Official special timetable days (e.g. "Thursday follows Monday's timetable").
4. Real-time temporary student overrides (faculty leaves, class cancellations, swapped hours, room shifts, extra revision classes).

---

## 2. Core Invariants — NEVER VIOLATE

### ⚠️ RULE 1: The Recurring Baseline Must NEVER Be Mutated by Date-Specific Changes
The recurring weekly timetable is the immutable baseline for the semester.
- If a class is swapped, cancelled, or relocated on `2026-09-21`, that change applies strictly to `2026-09-21`.
- Looking ahead to `2026-09-28` (the following Monday) MUST yield the pristine, unmodified baseline.
- **Never** write code that alters `timetable.classes` when processing a date override.
- Always clone or derive date-specific schedules inside the pure schedule engine (`getScheduleForDate`).

### ⚠️ RULE 2: Official Special Timetable Days Are Date-Specific
- When the academic calendar specifies "October 1 follows Monday Timetable", only October 1 adopts Monday's baseline.
- The standard Thursday recurring timetable remains completely unchanged for all subsequent Thursdays.

### ⚠️ RULE 3: Centralized Schedule Engine
- Do **NOT** duplicate schedule calculation logic across UI screens or components.
- `TodayView`, `TomorrowPreview`, `CalendarView`, and date modals MUST all call `getScheduleForDate(date, timetable, calendar, overrides, currentTime)`.

### ⚠️ RULE 4: Completely Generic Architecture
- Do **NOT** hardcode specific universities, departments, degrees, or course codes (e.g. `Amrita`, `23CSE301`, `C404`) in application logic or conditionals.
- All institutions, courses, faculty, and room numbers must be dynamic properties loaded into the generic data model.
- Demo datasets exist solely as sample fixtures in `src/data/`.

### ⚠️ RULE 5: Zero Unnecessary Backend Dependencies
- NextClass is architected as a reliable, local-first web application.
- Do not introduce server infrastructure, cloud databases (Firebase, Supabase, etc.), user accounts, or authentication unless explicitly requested.

---

## 3. Architecture Overview

```
src/
├── types/          # Strict TypeScript domain interfaces
│   ├── timetable.ts
│   ├── calendar.ts
│   ├── override.ts
│   └── schedule.ts
├── core/           # Pure domain logic (100% side-effect free)
│   ├── scheduleEngine.ts   # getScheduleForDate calculation engine
│   ├── timeUtils.ts        # Date/time formatting & arithmetic
│   └── validator.ts        # Schema validation for JSON import/export
├── data/           # Generic demo fixtures (from supplied PDFs)
│   ├── demoTimetable.ts
│   └── demoCalendar.ts
├── storage/        # LocalStorage repository & JSON backup
│   └── localStorage.ts
├── context/        # React Context providing synchronized state
│   └── ScheduleContext.tsx
├── components/     # UI presentation components
│   ├── layout/     # Header, navigation, time simulator banner
│   ├── today/      # Hero card, timeline cards, free period pill, tomorrow preview
│   ├── calendar/   # Monthly grid, day badges, date inspector drawer
│   ├── timetable/  # Recurring baseline matrix and class editor
│   ├── changes/    # Override manager and modal
│   └── settings/   # Profile settings, demo loader, JSON import/export
└── tests/          # Vitest automated test suite (22+ edge cases)
```

---

## 4. Schedule Engine Specification

The primary domain function is:

```typescript
function getScheduleForDate(
  date: string,               // 'YYYY-MM-DD'
  timetable: WeeklyTimetable,
  calendar: AcademicCalendar,
  overrides: DateOverride[],
  currentTime?: string        // 'HH:mm' (optional for time simulation)
): DailySchedule;
```

### Execution Order:
1. **Calendar Status Check**:
   - Check if date has a `holiday` or `vacation` entry.
   - If holiday/vacation, return early with zero baseline classes (and holiday title).
2. **Determine Effective Source Day**:
   - Priority 1: User date-specific `source_day` override.
   - Priority 2: Calendar official `special_timetable` entry with `timetableSourceDay`.
   - Priority 3: Actual natural day of week (`getDayOfWeek(date)`).
3. **Load Baseline Classes**:
   - Filter `timetable.classes` where `c.dayOfWeek === effectiveSourceDay`.
   - Clone objects to prevent memory mutations.
4. **Apply Date-Specific Overrides**:
   - `cancel`: Filter out `targetClassId`.
   - `swap`: Swap start/end times and slots between `targetClassId` and `swapWithClassId`.
   - `room_change`: Update `c.room` to `overrideData.room`.
   - `time_change`: Update `c.startTime` and `c.endTime`.
   - `edit`: Apply partial overrides to title, faculty, etc.
   - `extra`: Append new class instance for this date.
5. **Sort Chronologically**:
   - Sort by start time in minutes.
6. **Class Status Calculation**:
   - Based on `currentTime`: marks classes as `completed`, `happening`, or `upcoming`.
   - Computes `progressPercent` for active classes.
7. **Compute Free Periods**:
   - Detects gaps $\ge 15$ mins between classes, labeling lunch and recess breaks.
8. **Identify Current & Next Class**:
   - Returns single references to `currentClass` and `nextClass`.

---

## 5. Testing Expectations

Before committing changes, future agents MUST run:
```bash
npm.cmd test
npm.cmd run build
```
- Vitest must pass all 22 test cases without regression.
- TypeScript compiler (`tsc`) and Vite must bundle with zero errors.

---

## 6. Git & Commit Guidelines

- Write concise, conventional commit messages:
  - `feat: ...` for features
  - `fix: ...` for bug fixes
  - `test: ...` for test suites
  - `docs: ...` for documentation updates
- Never commit `.env`, node_modules, build artifacts, or personal secrets.
