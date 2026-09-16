import { DayOfWeek, TimetableClass } from './timetable';
import { DateOverride } from './override';

export type ClassStatus = 'happening' | 'upcoming' | 'completed';

export interface ProcessedClass extends TimetableClass {
  isOverride?: boolean;
  overrideType?: string;
  originalValues?: {
    room?: string;
    startTime?: string;
    endTime?: string;
    courseName?: string;
  };
  overrideNote?: string;
  status: ClassStatus;
  progressPercent?: number; // 0 to 100 if happening
}

export interface FreePeriod {
  startTime: string; // 'HH:mm'
  endTime: string;   // 'HH:mm'
  durationMinutes: number;
  label: string;
}

export interface DailySchedule {
  date: string; // 'YYYY-MM-DD'
  actualDayOfWeek: DayOfWeek;
  effectiveSourceDay: DayOfWeek;
  isSpecialTimetable: boolean;
  specialTimetableNote?: string;
  isHoliday: boolean;
  holidayTitle?: string;
  isVacation: boolean;
  vacationTitle?: string;
  classes: ProcessedClass[];
  freePeriods: FreePeriod[];
  currentClass: ProcessedClass | null;
  nextClass: ProcessedClass | null;
  hasClasses: boolean;
  appliedOverrides: DateOverride[];
}

export interface AppSettings {
  institutionName: string;
  programName: string;
  semesterName: string;
  sectionName: string;
  simulatedDateTime?: string; // Optional simulation override: ISO string 'YYYY-MM-DDTHH:mm:ss'
  isSimulationActive: boolean;
}
