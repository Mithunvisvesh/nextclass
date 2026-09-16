# API.md — Internal Application Interface Documentation

**Notice**: No backend API is required. NextClass is a local-first, client-side web application operating entirely within the browser.

This document specifies the internal application interfaces, domain modules, and service APIs powering NextClass.

---

## 1. Schedule Engine Interface

Module: `src/core/scheduleEngine.ts`

### `getScheduleForDate`
Computes the complete, final schedule for a specified calendar date by synthesizing the weekly baseline, calendar rules, and temporary overrides.

```typescript
function getScheduleForDate(
  date: string,               // Format: "YYYY-MM-DD"
  timetable: WeeklyTimetable, // Recurring weekly baseline
  calendar: AcademicCalendar, // Academic events & special days
  overrides?: DateOverride[], // Active date-specific overrides
  currentTime?: string        // Optional time: "HH:mm" (24-hr)
): DailySchedule;
```

#### Returns: `DailySchedule`
- `date`: string ("YYYY-MM-DD")
- `actualDayOfWeek`: DayOfWeek ("Monday"..."Sunday")
- `effectiveSourceDay`: DayOfWeek (baseline day whose schedule was adopted)
- `isSpecialTimetable`: boolean (true if date adopted another weekday's timetable)
- `specialTimetableNote`: string | undefined
- `isHoliday`: boolean (true if date is a designated holiday)
- `holidayTitle`: string | undefined
- `isVacation`: boolean
- `classes`: `ProcessedClass[]` (chronologically sorted classes with active statuses and override notes)
- `freePeriods`: `FreePeriod[]` (free gaps $\ge 15\text{ mins}$ between consecutive classes)
- `currentClass`: `ProcessedClass | null` (ongoing class at `currentTime`)
- `nextClass`: `ProcessedClass | null` (first upcoming class)
- `hasClasses`: boolean
- `appliedOverrides`: `DateOverride[]` (overrides applied on this date)

---

## 2. Timetable Management Operations

Accessible via `useSchedule()` hook from `src/context/ScheduleContext.tsx`:

### `addTimetableClass`
Adds a recurring class to the master weekly timetable.
```typescript
addTimetableClass(c: Omit<TimetableClass, 'id'>): void;
```

### `updateTimetableClass`
Modifies an existing class in the master weekly timetable.
```typescript
updateTimetableClass(c: TimetableClass): void;
```

### `deleteTimetableClass`
Removes a class from the master weekly timetable.
```typescript
deleteTimetableClass(id: string): void;
```

---

## 3. Academic Calendar Operations

Accessible via `useSchedule()` hook:

### `addCalendarEntry`
Creates a new calendar event, holiday, or special timetable instruction.
```typescript
addCalendarEntry(entry: Omit<CalendarEntry, 'id'>): void;
```

### `deleteCalendarEntry`
Removes an entry from the academic calendar.
```typescript
deleteCalendarEntry(id: string): void;
```

---

## 4. Date-Specific Override Operations

Accessible via `useSchedule()` hook:

### `addOverride`
Registers a temporary date-specific change (swap, cancellation, room change, etc.).
```typescript
addOverride(override: Omit<DateOverride, 'id' | 'createdAt'>): void;
```

### `updateOverride`
Updates an existing temporary override.
```typescript
updateOverride(override: DateOverride): void;
```

### `deleteOverride`
Deletes a temporary override, instantly reverting the target date back to its calendar/baseline default.
```typescript
deleteOverride(id: string): void;
```

---

## 5. Storage & Persistence Service

Module: `src/storage/localStorage.ts`

### `localStorageService.initializeStorage()`
Seeds demo data if first load; otherwise retrieves persisted records.
```typescript
initializeStorage(): {
  timetable: WeeklyTimetable;
  calendar: AcademicCalendar;
  overrides: DateOverride[];
  settings: AppSettings;
};
```

### `localStorageService.resetToDemo()`
Restores bundled sample timetable and calendar fixtures.

### `localStorageService.clearAllData()`
Clears all classes, calendar entries, and overrides to a blank canvas.

---

## 6. Backup Import / Export Operations

Module: `src/storage/localStorage.ts` & `src/core/validator.ts`

### `localStorageService.exportFullBackup()`
Serializes all stored records into a formatted JSON backup string.
```typescript
exportFullBackup(): string;
```

### `localStorageService.importBackup(jsonString)`
Validates and imports a JSON backup string.
```typescript
importBackup(jsonString: string): {
  success: boolean;
  errors: string[];
  imported?: {
    timetable: WeeklyTimetable;
    calendar: AcademicCalendar;
    overrides: DateOverride[];
    settings: AppSettings;
  };
};
```

### `validateTimetable(data)` / `validateCalendar(data)` / `validateOverrides(data)`
Type-safe defensive validators verifying structure and preventing malformed inputs.
