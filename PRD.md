# PRD.md — Product Requirements Document

## 1. Problem Statement
Every semester, college and university students face daily schedule confusion:
- Academic calendars frequently modify schedules (e.g. "Tomorrow will follow Monday's timetable").
- Institutional and national holidays interrupt routine classes.
- Professors regularly swap lecture hours, cancel classes due to conferences, shift lecture halls, or schedule extra evening review sessions.
- Existing static timetables (printed sheets, PDF screenshots, photo gallery images) cannot adapt dynamically to these date-specific variations, leading students to miss classes or wait outside the wrong lecture hall.

## 2. Target Users
- **Primary User**: University and college students needing an immediate, reliable answer to: *"What class do I have right now, where is it, and what comes next?"*
- **Evaluator / Professor**: Faculty reviewing the project who require a zero-installation, fast-loading, mobile-friendly application with realistic sample data pre-loaded.

## 3. Product Vision & Tagline
**NextClass** — *"Know what's next."*  
NextClass is an intelligent, local-first academic schedule companion that synthesizes recurring weekly timetables, institutional academic calendars, and date-specific temporary modifications into a unified, accurate daily timeline.

## 4. Goals & Non-Goals

### Goals
- **Instant Clarity**: Show today's schedule, current ongoing class, upcoming class, and tomorrow's forecast on the home screen.
- **Support Calendar Anomalies**: Explicitly distinguish natural calendar days from instructional source days (e.g. "Today is Thursday, but follows Monday's timetable").
- **Date-Specific Overrides**: Allow students to record swapped classes, cancellations, room changes, and extra lectures without corrupting the recurring weekly baseline.
- **Local-First & Frictionless**: Work offline via LocalStorage, zero backend server requirement, and no app store installation.
- **Generic & Extensible**: Completely independent of any single university or department.

### Non-Goals
- User accounts and login credentials.
- Cloud database synchronization (Firebase, Supabase).
- External integrations (WhatsApp bots, Google Calendar API, Microsoft Outlook).
- Grading/GPA calculations or attendance tracking.
- Social networking or chat features.

## 5. Core Features & Functional Requirements

| ID | Feature | Description | Priority |
|---|---|---|---|
| **FR-1** | Recurring Timetable | Define master weekly timetable with slots, rooms, faculty, and course codes. | P0 |
| **FR-2** | Academic Calendar | Track institutional holidays, vacations, and special timetable days. | P0 |
| **FR-3** | Schedule Engine | Pure function calculating actual daily schedule with precedence rules. | P0 |
| **FR-4** | Today Screen | Hero view showing happening class with progress bar, next class, and timeline. | P0 |
| **FR-5** | Tomorrow Preview | Integrated forecast showing tomorrow's classes or holiday alert. | P0 |
| **FR-6** | Calendar Grid | Month view with status indicator dots (Holiday, Special, Override, Regular). | P0 |
| **FR-7** | Date Overrides | Support Swap, Cancel, Room Change, Time Change, and Extra Class for specific dates. | P0 |
| **FR-8** | Baseline Invariant | Ensure date-specific changes never mutate the recurring timetable. | P0 |
| **FR-9** | Time Simulator | Interactive tool allowing simulation of any date/time for grading. | P0 |
| **FR-10** | Demo Data | Built-in sample dataset from verified college PDF files. | P0 |
| **FR-11** | Backup (Import/Export) | Full JSON export and schema-validated import. | P1 |

## 6. User Flows

### Flow 1: Daily Quick Check
1. Student opens NextClass.
2. The **Today View** opens immediately.
3. If a class is ongoing, the **Happening Now** banner highlights the room number, professor, and remaining minutes.
4. The timeline displays today's remaining lectures and free break periods.
5. A bottom card provides a preview of tomorrow's schedule.

### Flow 2: Recording a Swapped Lecture
1. Student learns that on Sep 21, NLP (9:50 AM) and Computer Networks (11:00 AM) are swapped.
2. Navigates to **Changes** $\to$ **New Schedule Change**.
3. Selects Date (`2026-09-21`), Type (`Swap`), Class A (`NLP`), Class B (`CN`), and clicks **Apply Change**.
4. The schedule for Sep 21 reflects the swap. The recurring Monday baseline remains unchanged.

### Flow 3: Special Timetable Day
1. Academic calendar designates Oct 1 as "Monday Timetable for all".
2. On Oct 1, the schedule engine detects the special timetable directive and loads Monday's classes instead of Thursday's.
3. The UI presents an alert: *"Special Timetable Day: Follows Monday Schedule"*.

## 7. UX & Accessibility Requirements
- Clean, uncluttered modern aesthetic using Plus Jakarta Sans typography.
- High contrast status indicators (emerald for holidays, amber for special timetables, purple for user overrides).
- Touch target minimum size $44 \times 44\text{px}$.
- No horizontal scrolling required on mobile viewports.

## 8. Technical Requirements
- **Framework**: React 18/19 with TypeScript.
- **Build System**: Vite 6.
- **Styling**: Tailwind CSS.
- **Testing**: Vitest with $\ge 20$ unit test scenarios.
- **Persistence**: Browser LocalStorage.
- **Hosting**: Static distribution (`dist/`).
