import { WeeklyTimetable, TimetableClass, DayOfWeek, ClassType } from '../types/timetable';
import { AcademicCalendar, CalendarEntry, CalendarEntryType } from '../types/calendar';
import { DateOverride, OverrideType } from '../types/override';

const VALID_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const VALID_TYPES: ClassType[] = ['lecture', 'lab', 'tutorial', 'activity', 'counselling', 'other'];
const VALID_CAL_TYPES: CalendarEntryType[] = ['holiday', 'special_timetable', 'working_day', 'vacation', 'exam', 'other'];
const VALID_OVR_TYPES: OverrideType[] = ['cancel', 'swap', 'extra', 'room_change', 'time_change', 'source_day', 'edit'];

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
}

export function validateTimetable(data: any): ValidationResult<WeeklyTimetable> {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Timetable must be an object'] };
  }

  if (!Array.isArray(data.classes)) {
    return { isValid: false, errors: ['Timetable must contain a "classes" array'] };
  }

  const validClasses: TimetableClass[] = [];
  data.classes.forEach((item: any, idx: number) => {
    if (!item.id || typeof item.id !== 'string') {
      errors.push(`Class #${idx}: Missing or invalid ID`);
      return;
    }
    if (!item.courseName || typeof item.courseName !== 'string') {
      errors.push(`Class #${idx}: Missing courseName`);
      return;
    }
    if (!VALID_DAYS.includes(item.dayOfWeek)) {
      errors.push(`Class #${idx} (${item.courseName}): Invalid dayOfWeek "${item.dayOfWeek}"`);
      return;
    }
    if (!item.startTime || typeof item.startTime !== 'string') {
      errors.push(`Class #${idx} (${item.courseName}): Missing startTime`);
      return;
    }
    if (!item.endTime || typeof item.endTime !== 'string') {
      errors.push(`Class #${idx} (${item.courseName}): Missing endTime`);
      return;
    }

    validClasses.push({
      id: String(item.id),
      courseCode: String(item.courseCode || ''),
      courseName: String(item.courseName),
      faculty: String(item.faculty || ''),
      dayOfWeek: item.dayOfWeek as DayOfWeek,
      startTime: String(item.startTime),
      endTime: String(item.endTime),
      room: String(item.room || 'TBD'),
      type: (VALID_TYPES.includes(item.type) ? item.type : 'lecture') as ClassType,
      slot: item.slot ? String(item.slot) : undefined,
      notes: item.notes ? String(item.notes) : undefined
    });
  });

  return {
    isValid: errors.length === 0,
    data: {
      id: String(data.id || 'imported-timetable'),
      name: String(data.name || 'Imported Timetable'),
      academicTerm: String(data.academicTerm || 'Current Term'),
      classes: validClasses
    },
    errors
  };
}

export function validateCalendar(data: any): ValidationResult<AcademicCalendar> {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Calendar must be an object'] };
  }

  if (!Array.isArray(data.entries)) {
    return { isValid: false, errors: ['Calendar must contain an "entries" array'] };
  }

  const validEntries: CalendarEntry[] = [];
  data.entries.forEach((item: any, idx: number) => {
    if (!item.id || typeof item.id !== 'string') {
      errors.push(`Calendar Entry #${idx}: Missing or invalid ID`);
      return;
    }
    if (!item.date || typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
      errors.push(`Calendar Entry #${idx}: Invalid date format (expected YYYY-MM-DD)`);
      return;
    }
    if (!item.title || typeof item.title !== 'string') {
      errors.push(`Calendar Entry #${idx}: Missing title`);
      return;
    }

    validEntries.push({
      id: String(item.id),
      date: String(item.date),
      title: String(item.title),
      type: (VALID_CAL_TYPES.includes(item.type) ? item.type : 'other') as CalendarEntryType,
      description: item.description ? String(item.description) : undefined,
      timetableSourceDay: VALID_DAYS.includes(item.timetableSourceDay) ? item.timetableSourceDay : undefined,
      notes: item.notes ? String(item.notes) : undefined
    });
  });

  return {
    isValid: errors.length === 0,
    data: {
      id: String(data.id || 'imported-calendar'),
      name: String(data.name || 'Imported Calendar'),
      entries: validEntries
    },
    errors
  };
}

export function validateOverrides(data: any): ValidationResult<DateOverride[]> {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    return { isValid: false, errors: ['Overrides must be an array'] };
  }

  const validOverrides: DateOverride[] = [];
  data.forEach((item: any, idx: number) => {
    if (!item.id || typeof item.id !== 'string') {
      errors.push(`Override #${idx}: Missing or invalid ID`);
      return;
    }
    if (!item.date || typeof item.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
      errors.push(`Override #${idx}: Invalid date format (expected YYYY-MM-DD)`);
      return;
    }
    if (!VALID_OVR_TYPES.includes(item.type)) {
      errors.push(`Override #${idx}: Invalid override type "${item.type}"`);
      return;
    }

    validOverrides.push({
      id: String(item.id),
      date: String(item.date),
      type: item.type as OverrideType,
      targetClassId: item.targetClassId ? String(item.targetClassId) : undefined,
      swapWithClassId: item.swapWithClassId ? String(item.swapWithClassId) : undefined,
      overrideData: item.overrideData && typeof item.overrideData === 'object' ? item.overrideData : undefined,
      timetableSourceDay: VALID_DAYS.includes(item.timetableSourceDay) ? item.timetableSourceDay : undefined,
      notes: item.notes ? String(item.notes) : undefined,
      createdAt: item.createdAt ? String(item.createdAt) : new Date().toISOString()
    });
  });

  return {
    isValid: errors.length === 0,
    data: validOverrides,
    errors
  };
}
