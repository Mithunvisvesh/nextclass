import { WeeklyTimetable } from '../types/timetable';
import { AcademicCalendar } from '../types/calendar';
import { DateOverride } from '../types/override';
import { AppSettings } from '../types/schedule';
import { DEMO_TIMETABLE } from '../data/demoTimetable';
import { DEMO_CALENDAR, DEMO_OVERRIDES } from '../data/demoCalendar';
import { validateTimetable, validateCalendar, validateOverrides } from '../core/validator';

const STORAGE_KEYS = {
  TIMETABLE: 'nextclass_timetable_v1',
  CALENDAR: 'nextclass_calendar_v1',
  OVERRIDES: 'nextclass_overrides_v1',
  SETTINGS: 'nextclass_settings_v1',
  HAS_SEEDED: 'nextclass_has_seeded_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  institutionName: 'Amrita Vishwa Vidyapeetham',
  programName: 'B.Tech Computer Science & Engineering',
  semesterName: 'Semester 5',
  sectionName: 'Section C',
  isSimulationActive: false,
  simulatedDateTime: '2026-09-16T09:15:00'
};

export const localStorageService = {
  // Check if initial data has seeded; if not, seeds demo data
  initializeStorage(): {
    timetable: WeeklyTimetable;
    calendar: AcademicCalendar;
    overrides: DateOverride[];
    settings: AppSettings;
  } {
    const hasSeeded = localStorage.getItem(STORAGE_KEYS.HAS_SEEDED);

    if (!hasSeeded) {
      this.saveTimetable(DEMO_TIMETABLE);
      this.saveCalendar(DEMO_CALENDAR);
      this.saveOverrides(DEMO_OVERRIDES);
      this.saveSettings(DEFAULT_SETTINGS);
      localStorage.setItem(STORAGE_KEYS.HAS_SEEDED, 'true');

      return {
        timetable: DEMO_TIMETABLE,
        calendar: DEMO_CALENDAR,
        overrides: DEMO_OVERRIDES,
        settings: DEFAULT_SETTINGS
      };
    }

    return {
      timetable: this.loadTimetable(),
      calendar: this.loadCalendar(),
      overrides: this.loadOverrides(),
      settings: this.loadSettings()
    };
  },

  loadTimetable(): WeeklyTimetable {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
      if (!raw) return DEMO_TIMETABLE;
      const parsed = JSON.parse(raw);
      const validation = validateTimetable(parsed);
      return validation.isValid && validation.data ? validation.data : DEMO_TIMETABLE;
    } catch {
      return DEMO_TIMETABLE;
    }
  },

  saveTimetable(timetable: WeeklyTimetable): void {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
  },

  loadCalendar(): AcademicCalendar {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      if (!raw) return DEMO_CALENDAR;
      const parsed = JSON.parse(raw);
      const validation = validateCalendar(parsed);
      return validation.isValid && validation.data ? validation.data : DEMO_CALENDAR;
    } catch {
      return DEMO_CALENDAR;
    }
  },

  saveCalendar(calendar: AcademicCalendar): void {
    localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(calendar));
  },

  loadOverrides(): DateOverride[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
      if (!raw) return DEMO_OVERRIDES;
      const parsed = JSON.parse(raw);
      const validation = validateOverrides(parsed);
      return validation.isValid && validation.data ? validation.data : DEMO_OVERRIDES;
    } catch {
      return DEMO_OVERRIDES;
    }
  },

  saveOverrides(overrides: DateOverride[]): void {
    localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(overrides));
  },

  loadSettings(): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  resetToDemo(): {
    timetable: WeeklyTimetable;
    calendar: AcademicCalendar;
    overrides: DateOverride[];
    settings: AppSettings;
  } {
    this.saveTimetable(DEMO_TIMETABLE);
    this.saveCalendar(DEMO_CALENDAR);
    this.saveOverrides(DEMO_OVERRIDES);
    this.saveSettings(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEYS.HAS_SEEDED, 'true');

    return {
      timetable: DEMO_TIMETABLE,
      calendar: DEMO_CALENDAR,
      overrides: DEMO_OVERRIDES,
      settings: DEFAULT_SETTINGS
    };
  },

  clearAllData(): void {
    const emptyTimetable: WeeklyTimetable = {
      id: 'empty-timetable',
      name: 'My Timetable',
      academicTerm: 'Current Semester',
      classes: []
    };
    const emptyCalendar: AcademicCalendar = {
      id: 'empty-calendar',
      name: 'My Academic Calendar',
      entries: []
    };
    const emptyOverrides: DateOverride[] = [];

    this.saveTimetable(emptyTimetable);
    this.saveCalendar(emptyCalendar);
    this.saveOverrides(emptyOverrides);
  },

  exportFullBackup(): string {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      timetable: this.loadTimetable(),
      calendar: this.loadCalendar(),
      overrides: this.loadOverrides(),
      settings: this.loadSettings()
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): {
    success: boolean;
    errors: string[];
    imported?: {
      timetable: WeeklyTimetable;
      calendar: AcademicCalendar;
      overrides: DateOverride[];
      settings: AppSettings;
    };
  } {
    const allErrors: string[] = [];
    try {
      const parsed = JSON.parse(jsonString);

      const timetableVal = validateTimetable(parsed.timetable);
      if (!timetableVal.isValid) allErrors.push(...timetableVal.errors);

      const calendarVal = validateCalendar(parsed.calendar);
      if (!calendarVal.isValid) allErrors.push(...calendarVal.errors);

      const overridesVal = validateOverrides(parsed.overrides || []);
      if (!overridesVal.isValid) allErrors.push(...overridesVal.errors);

      if (allErrors.length > 0) {
        return { success: false, errors: allErrors };
      }

      const timetable = timetableVal.data!;
      const calendar = calendarVal.data!;
      const overrides = overridesVal.data!;
      const settings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };

      this.saveTimetable(timetable);
      this.saveCalendar(calendar);
      this.saveOverrides(overrides);
      this.saveSettings(settings);

      return {
        success: true,
        errors: [],
        imported: { timetable, calendar, overrides, settings }
      };
    } catch (err: any) {
      return {
        success: false,
        errors: [`Invalid JSON file: ${err.message}`]
      };
    }
  }
};
