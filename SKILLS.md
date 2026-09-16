# SKILLS.md — Technical Skills & Competencies Reference

This document highlights the domain concepts, technical patterns, and engineering skills utilized in the development and maintenance of **NextClass**.

---

## 1. Application & Frontend Development
- **React 18/19 Single Page Architecture**: Composing stateful applications using React Functional Components, Custom Hooks (`useSchedule`), Context API, and `useMemo` for derived schedule computations.
- **TypeScript Strict Typing**: End-to-end type safety avoiding runtime type errors via dedicated interfaces for timetables, calendar entries, overrides, and schedules.

## 2. Responsive & Mobile-First UI/UX Design
- **Tailwind CSS Grid & Flexbox**: Mobile-first design that adapts seamlessly from 360px smartphone screens (iPhone/Android) up to 4K desktop viewports.
- **Touch-Friendly Controls**: Touch targets sized $\ge 44\text{px}$, visual feedback states (`active:scale-95`), floating navigation bar on mobile, and sticky top header.
- **Micro-Interactions & Status Badges**: Live pulsing dots for happening classes, progress bars, and high-contrast alert callouts for holidays and special timetables.

## 3. Timetable & Academic Calendar Modeling
- **Recurring Baseline Modeling**: Abstracting academic weeks into standardized daily slots supporting multiple lecture types (lectures, tutorials, 2-3 hour lab sessions, activities, counselling).
- **Date-Specific Event Modeling**: Representing non-recurring calendar anomalies (national holidays, festival leaves, institutional holidays, multi-day examination blocks).
- **Special Timetable Day Mapping**: Decoupling calendar weekdays from instruction schedules (e.g. mapping Thursday to execute Monday's syllabus/timetable).

## 4. Pure Schedule Engine Design
- **Functional Architecture**: Designing `getScheduleForDate` as a deterministic, pure function with zero side-effects.
- **Precedence Hierarchy**:
  $$\text{User Source Day Override} \succ \text{Official Special Timetable} \succ \text{Natural Calendar Weekday}$$
  $$\text{Holiday Status} \implies \text{Suppress Regular Baseline}$$
- **Time Complexity**: $O(N \log N)$ where $N$ is the number of classes on a given date (typically $\le 10$), executing in $< 1\text{ms}$.

## 5. Chronological Date & Time Arithmetic
- **24-Hour Time Parsing**: Safe conversion of `"HH:mm"` strings into minutes since midnight for arithmetic operations, delta comparisons, and sorting.
- **Free Period & Break Detection**: Algorithmic gap detection identifying recesses and lunch breaks between consecutive classes.
- **Time-Travel Simulation**: Allowing simulation of arbitrary dates and times for rapid validation and presentation without altering local clock hardware.

## 6. Local-First Persistence & Storage
- **Browser LocalStorage**: Type-safe serializing and deserializing of user datasets with fallback defaults.
- **Zero Cloud Latency**: Instantaneous loading with offline functionality.

## 7. Data Validation & Import/Export
- **Defensive JSON Schema Validation**: Ingesting user-provided JSON files with structural validation against schema rules before committing to storage.
- **Data Portability**: Full backup export and restore capability via browser Blob downloads.

## 8. PDF Text Extraction & Data Parsing
- **Document Ingestion**: Parsing structured academic timetables and calendar PDFs using PyPDF to synthesize realistic demo fixtures without hardcoding university logic into core engines.

## 9. Automated Testing & Verification
- **Vitest Unit Testing**: High-speed unit testing suite covering 22 critical schedule scenarios including holidays, swaps, cancellations, edge times, and invariant preservation.

## 10. Deployment & Version Control
- **Vite Static Bundling**: Tree-shaken production bundles with relative asset paths for flexible hosting (GitHub Pages, Vercel, Netlify).
- **Git Hygiene**: Clean commit history following Conventional Commits, maintaining clean `.gitignore` without sensitive artifacts.
