import { DayOfWeek } from './timetable';

export type CalendarEntryType = 
  | 'holiday' 
  | 'special_timetable' 
  | 'working_day' 
  | 'vacation' 
  | 'exam' 
  | 'other';

export interface CalendarEntry {
  id: string;
  date: string; // ISO format 'YYYY-MM-DD'
  startDate?: string;
  endDate?: string;
  title: string;
  type: CalendarEntryType;
  description?: string;
  timetableSourceDay?: DayOfWeek; // For special timetable days e.g. "Monday"
  notes?: string;
}

export interface AcademicCalendar {
  id: string;
  name: string;
  entries: CalendarEntry[];
}
