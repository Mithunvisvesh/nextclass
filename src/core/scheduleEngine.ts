import { WeeklyTimetable, TimetableClass, DayOfWeek } from '../types/timetable';
import { AcademicCalendar, CalendarEntry } from '../types/calendar';
import { DateOverride } from '../types/override';
import { DailySchedule, ProcessedClass, FreePeriod, ClassStatus } from '../types/schedule';
import { 
  getDayOfWeek, 
  parseTimeToMinutes, 
  getCurrentTimeIso 
} from './timeUtils';

/**
 * PURE SCHEDULE ENGINE
 * Core Invariant: The recurring weekly timetable is NEVER mutated.
 * Formula:
 *   Recurring Timetable
 *   + Academic Calendar
 *   + Official Special Timetable
 *   + User Date-Specific Overrides
 *   = Actual Schedule for a Date
 */
export function getScheduleForDate(
  date: string,
  timetable: WeeklyTimetable,
  calendar: AcademicCalendar,
  overrides: DateOverride[] = [],
  currentTime?: string
): DailySchedule {
  const actualDayOfWeek = getDayOfWeek(date);
  const effectiveTime = currentTime || getCurrentTimeIso();
  const currentMinutes = parseTimeToMinutes(effectiveTime);

  // 1. Inspect Academic Calendar for this date
  const calendarEntries = calendar?.entries?.filter(e => e.date === date) || [];
  
  const holidayEntry = calendarEntries.find(e => e.type === 'holiday');
  const vacationEntry = calendarEntries.find(e => e.type === 'vacation');
  const specialTimetableEntry = calendarEntries.find(
    e => e.type === 'special_timetable' && e.timetableSourceDay
  );

  const isHoliday = !!holidayEntry;
  const holidayTitle = holidayEntry?.title;
  const isVacation = !!vacationEntry;
  const vacationTitle = vacationEntry?.title;

  // 2. Determine Effective Source Day
  // Priority: User date-specific source_day override > Calendar special timetable > actual natural day
  const userSourceDayOverride = overrides.find(
    o => o.date === date && o.type === 'source_day' && o.timetableSourceDay
  );

  let effectiveSourceDay: DayOfWeek = actualDayOfWeek;
  let isSpecialTimetable = false;
  let specialTimetableNote: string | undefined = undefined;

  if (userSourceDayOverride && userSourceDayOverride.timetableSourceDay) {
    effectiveSourceDay = userSourceDayOverride.timetableSourceDay;
    isSpecialTimetable = true;
    specialTimetableNote = `User Override: Follows ${effectiveSourceDay} Timetable`;
  } else if (specialTimetableEntry && specialTimetableEntry.timetableSourceDay) {
    effectiveSourceDay = specialTimetableEntry.timetableSourceDay;
    isSpecialTimetable = true;
    specialTimetableNote = specialTimetableEntry.title;
  }

  // 3. Load baseline classes for the effective source day
  // CLONE them so baseline is never mutated
  let classesForDay: ProcessedClass[] = [];

  if (!isHoliday && !isVacation) {
    const baseline = timetable?.classes || [];
    classesForDay = baseline
      .filter(c => c.dayOfWeek === effectiveSourceDay)
      .map(c => ({
        ...c,
        status: 'upcoming' as ClassStatus
      }));
  }

  // 4. Find user overrides for this specific date
  const dateOverrides = overrides.filter(o => o.date === date);

  // Apply overrides in order
  for (const override of dateOverrides) {
    switch (override.type) {
      case 'cancel': {
        if (override.targetClassId) {
          classesForDay = classesForDay.filter(c => c.id !== override.targetClassId);
        }
        break;
      }

      case 'swap': {
        if (override.targetClassId && override.swapWithClassId) {
          const indexA = classesForDay.findIndex(c => c.id === override.targetClassId);
          const indexB = classesForDay.findIndex(c => c.id === override.swapWithClassId);

          if (indexA !== -1 && indexB !== -1) {
            const classA = classesForDay[indexA];
            const classB = classesForDay[indexB];

            const timeAStart = classA.startTime;
            const timeAEnd = classA.endTime;
            const slotA = classA.slot;

            const timeBStart = classB.startTime;
            const timeBEnd = classB.endTime;
            const slotB = classB.slot;

            classesForDay[indexA] = {
              ...classA,
              startTime: timeBStart,
              endTime: timeBEnd,
              slot: slotB,
              isOverride: true,
              overrideType: 'swap',
              originalValues: {
                ...classA.originalValues,
                startTime: timeAStart,
                endTime: timeAEnd
              },
              overrideNote: override.notes || `Swapped with ${classB.courseName}`
            };

            classesForDay[indexB] = {
              ...classB,
              startTime: timeAStart,
              endTime: timeAEnd,
              slot: slotA,
              isOverride: true,
              overrideType: 'swap',
              originalValues: {
                ...classB.originalValues,
                startTime: timeBStart,
                endTime: timeBEnd
              },
              overrideNote: override.notes || `Swapped with ${classA.courseName}`
            };
          }
        }
        break;
      }

      case 'room_change': {
        if (override.targetClassId && override.overrideData?.room) {
          const idx = classesForDay.findIndex(c => c.id === override.targetClassId);
          if (idx !== -1) {
            const target = classesForDay[idx];
            classesForDay[idx] = {
              ...target,
              room: override.overrideData.room,
              isOverride: true,
              overrideType: 'room_change',
              originalValues: {
                ...target.originalValues,
                room: target.room
              },
              overrideNote: override.notes || `Room changed to ${override.overrideData.room}`
            };
          }
        }
        break;
      }

      case 'time_change': {
        if (override.targetClassId && override.overrideData) {
          const idx = classesForDay.findIndex(c => c.id === override.targetClassId);
          if (idx !== -1) {
            const target = classesForDay[idx];
            classesForDay[idx] = {
              ...target,
              startTime: override.overrideData.startTime || target.startTime,
              endTime: override.overrideData.endTime || target.endTime,
              isOverride: true,
              overrideType: 'time_change',
              originalValues: {
                ...target.originalValues,
                startTime: target.startTime,
                endTime: target.endTime
              },
              overrideNote: override.notes || 'Class time modified'
            };
          }
        }
        break;
      }

      case 'edit': {
        if (override.targetClassId && override.overrideData) {
          const idx = classesForDay.findIndex(c => c.id === override.targetClassId);
          if (idx !== -1) {
            const target = classesForDay[idx];
            classesForDay[idx] = {
              ...target,
              ...override.overrideData,
              isOverride: true,
              overrideType: 'edit',
              originalValues: {
                ...target.originalValues,
                courseName: target.courseName,
                room: target.room,
                startTime: target.startTime,
                endTime: target.endTime
              },
              overrideNote: override.notes || 'Class details modified'
            };
          }
        }
        break;
      }

      case 'extra': {
        if (override.overrideData) {
          const extra = override.overrideData;
          const newClass: ProcessedClass = {
            id: extra.id || `extra-${override.id}`,
            courseCode: extra.courseCode || 'EXTRA',
            courseName: extra.courseName || 'Special Session',
            faculty: extra.faculty || 'Guest / Faculty',
            dayOfWeek: actualDayOfWeek,
            startTime: extra.startTime || '16:30',
            endTime: extra.endTime || '17:30',
            room: extra.room || 'TBD',
            type: extra.type || 'lecture',
            slot: extra.slot,
            notes: extra.notes,
            isOverride: true,
            overrideType: 'extra',
            overrideNote: override.notes || 'Extra class scheduled for today',
            status: 'upcoming'
          };
          classesForDay.push(newClass);
        }
        break;
      }

      default:
        break;
    }
  }

  // 5. Sort chronologically by start time
  classesForDay.sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  // 6. Calculate status (completed, happening, upcoming) and progress
  for (const c of classesForDay) {
    const startM = parseTimeToMinutes(c.startTime);
    const endM = parseTimeToMinutes(c.endTime);

    if (currentMinutes < startM) {
      c.status = 'upcoming';
    } else if (currentMinutes >= startM && currentMinutes < endM) {
      c.status = 'happening';
      const duration = endM - startM;
      if (duration > 0) {
        c.progressPercent = Math.min(100, Math.max(0, Math.round(((currentMinutes - startM) / duration) * 100)));
      }
    } else {
      c.status = 'completed';
    }
  }

  // 7. Find current and next classes
  const currentClass = classesForDay.find(c => c.status === 'happening') || null;
  const nextClass = classesForDay.find(c => c.status === 'upcoming') || null;

  // 8. Compute Free Periods
  const freePeriods: FreePeriod[] = [];
  for (let i = 0; i < classesForDay.length - 1; i++) {
    const currentEnd = parseTimeToMinutes(classesForDay[i].endTime);
    const nextStart = parseTimeToMinutes(classesForDay[i + 1].startTime);
    const gap = nextStart - currentEnd;

    // Report gaps of 15 minutes or more
    if (gap >= 15) {
      let label = 'Free Period';
      if (gap >= 40 && currentEnd >= parseTimeToMinutes('12:00') && currentEnd <= parseTimeToMinutes('13:30')) {
        label = 'Lunch Break';
      } else if (gap >= 20) {
        label = 'Tea / Recess Break';
      }

      freePeriods.push({
        startTime: classesForDay[i].endTime,
        endTime: classesForDay[i + 1].startTime,
        durationMinutes: gap,
        label: `${label} (${gap} mins)`
      });
    }
  }

  return {
    date,
    actualDayOfWeek,
    effectiveSourceDay,
    isSpecialTimetable,
    specialTimetableNote,
    isHoliday,
    holidayTitle,
    isVacation,
    vacationTitle,
    classes: classesForDay,
    freePeriods,
    currentClass,
    nextClass,
    hasClasses: classesForDay.length > 0,
    appliedOverrides: dateOverrides
  };
}
