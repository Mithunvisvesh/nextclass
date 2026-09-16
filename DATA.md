# DATA.md — Data Model & Schema Specification

This document details the data structures, schemas, entity relationships, and storage design for **NextClass**.

---

## 1. Recurring Timetable vs. Date-Specific Override

A foundational concept of NextClass is the strict separation between baseline recurring timetables and date-specific overrides:

$$\text{Recurring Weekly Baseline} \quad \ne \quad \text{Date-Specific Overrides}$$

- **Recurring Timetable**: Defines the master weekly routine (e.g. Monday has Machine Learning at 09:00). It applies cyclically every week throughout the academic semester.
- **Date-Specific Overrides**: Records localized deviations that apply **only** to a specific calendar date (e.g. on `2026-09-21`, Machine Learning is cancelled).
- **Core Principle**: A date override modifies the *calculated daily projection*, but **never modifies the stored baseline record**.

---

## 2. Entity Schemas

### 2.1 TimetableClass
Represents a scheduled instructional session in the weekly routine.

```typescript
interface TimetableClass {
  id: string;                 // Unique identifier e.g. "mon-1"
  courseCode: string;         // e.g. "23CSE301"
  courseName: string;         // e.g. "Machine Learning"
  faculty: string;            // e.g. "Dr. Debanjali"
  dayOfWeek: DayOfWeek;       // 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  startTime: string;          // 24-hr format "09:00"
  endTime: string;            // 24-hr format "09:50"
  room: string;               // e.g. "C404", "Lab AS"
  type: ClassType;            // 'lecture' | 'lab' | 'tutorial' | 'activity' | 'counselling' | 'other'
  slot?: string;              // e.g. "A", "PE I"
  notes?: string;             // Optional remarks
}

interface WeeklyTimetable {
  id: string;
  name: string;
  academicTerm: string;
  classes: TimetableClass[];
}
```

### 2.2 CalendarEntry
Represents an academic calendar milestone or non-routine date.

```typescript
type CalendarEntryType = 'holiday' | 'special_timetable' | 'working_day' | 'vacation' | 'exam' | 'other';

interface CalendarEntry {
  id: string;                         // e.g. "cal-12"
  date: string;                       // ISO date "YYYY-MM-DD" e.g. "2026-10-01"
  title: string;                      // e.g. "Monday Timetable for all"
  type: CalendarEntryType;            // e.g. "special_timetable"
  description?: string;               // Detailed explanation
  timetableSourceDay?: DayOfWeek;     // Day whose timetable applies e.g. "Monday"
  notes?: string;
}

interface AcademicCalendar {
  id: string;
  name: string;
  entries: CalendarEntry[];
}
```

### 2.3 DateOverride
Represents a student's temporary schedule modification on a particular date.

```typescript
type OverrideType = 
  | 'cancel'        // Suppress target class
  | 'swap'          // Swap times between two classes
  | 'extra'         // Insert an extra session
  | 'room_change'   // Relocate class to another room
  | 'time_change'   // Reschedule class hours
  | 'source_day'    // Force date to follow another weekday's timetable
  | 'edit';         // Generic field override

interface DateOverride {
  id: string;
  date: string;                       // ISO "YYYY-MM-DD"
  type: OverrideType;
  targetClassId?: string;             // ID of the primary affected class
  swapWithClassId?: string;           // ID of the counterpart class (for 'swap')
  overrideData?: Partial<TimetableClass>; // Custom properties (room, time, title)
  timetableSourceDay?: DayOfWeek;     // (for 'source_day')
  notes?: string;
  createdAt: string;                  // ISO timestamp
}
```

### 2.4 AppSettings
Application metadata and simulation settings.

```typescript
interface AppSettings {
  institutionName: string;
  programName: string;
  semesterName: string;
  sectionName: string;
  simulatedDateTime?: string; // e.g. "2026-09-21T09:15:00"
  isSimulationActive: boolean;
}
```

---

## 3. Storage Architecture (LocalStorage)

NextClass stores source records in separate LocalStorage keys:

| Key Name | Type | Purpose |
|---|---|---|
| `nextclass_timetable_v1` | `WeeklyTimetable` | Baseline weekly classes |
| `nextclass_calendar_v1` | `AcademicCalendar` | Calendar events & special days |
| `nextclass_overrides_v1` | `DateOverride[]` | Array of date-specific overrides |
| `nextclass_settings_v1` | `AppSettings` | Institution info & simulation state |
| `nextclass_has_seeded_v1` | `string ('true')` | Initialization seed flag |

---

## 4. Example Payloads

### Example 1: Swapped Classes Override
```json
{
  "id": "ovr-1",
  "date": "2026-09-21",
  "type": "swap",
  "targetClassId": "mon-2",
  "swapWithClassId": "mon-3",
  "notes": "Swap NLP and Computer Networks for laboratory preparation",
  "createdAt": "2026-09-16T10:00:00.000Z"
}
```

### Example 2: Official Special Timetable Entry
```json
{
  "id": "cal-12",
  "date": "2026-10-01",
  "title": "Monday Timetable for all",
  "type": "special_timetable",
  "timetableSourceDay": "Monday",
  "description": "Official academic adjustment: follows Monday timetable"
}
```
