import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeeklyTimetable } from '../types/timetable';
import { AcademicCalendar } from '../types/calendar';
import { DateOverride } from '../types/override';
import { DEMO_TIMETABLE } from '../data/demoTimetable';
import { DEMO_CALENDAR, DEMO_OVERRIDES } from '../data/demoCalendar';
import { validateTimetable, validateCalendar, validateOverrides } from '../core/validator';

export interface UserProfile {
  name: string;
  institution: string;
  course: string;
  department?: string;
  semester: string;
  section: string;
  studentId?: string;
  createdAt: string;
}

export type ThemePreference = 'light' | 'dark' | 'system';
export type AppMode = 'user' | 'demo';

export interface AppStateData {
  profile: UserProfile;
  timetable: WeeklyTimetable;
  calendar: AcademicCalendar;
  overrides: DateOverride[];
}

export const EMPTY_PROFILE: UserProfile = {
  name: '',
  institution: '',
  course: '',
  semester: '',
  section: '',
  createdAt: new Date().toISOString()
};

export const DEMO_PROFILE: UserProfile = {
  name: 'Alex Student',
  institution: 'Amrita School of Computing',
  course: 'B.Tech Computer Science & Engineering',
  semester: 'Semester 5 (Odd 2026-27)',
  section: 'Section C',
  studentId: 'BL.EN.U4CSE23000',
  createdAt: '2026-07-27T08:00:00Z'
};

const STORAGE_KEYS = {
  ACTIVE_MODE: 'nextclass_active_mode',
  HAS_ONBOARDED: 'nextclass_has_onboarded',
  THEME_PREFERENCE: 'nextclass_theme_preference',
  USER_PROFILE: 'nextclass_user_profile',
  USER_TIMETABLE: 'nextclass_user_timetable',
  USER_CALENDAR: 'nextclass_user_calendar',
  USER_OVERRIDES: 'nextclass_user_overrides',
  DEMO_PROFILE: 'nextclass_demo_profile',
  DEMO_TIMETABLE: 'nextclass_demo_timetable',
  DEMO_CALENDAR: 'nextclass_demo_calendar',
  DEMO_OVERRIDES: 'nextclass_demo_overrides',
};

// Universal storage adapter helper (async / sync / in-memory test fallback)
const inMemoryStore = new Map<string, string>();

const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof AsyncStorage !== 'undefined' && AsyncStorage.getItem) {
        const item = await AsyncStorage.getItem(key);
        if (item !== null) return item;
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item !== null) return item;
      }
      return inMemoryStore.get(key) || null;
    } catch {
      return inMemoryStore.get(key) || null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof AsyncStorage !== 'undefined' && AsyncStorage.setItem) {
        await AsyncStorage.setItem(key, value);
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      inMemoryStore.set(key, value);
    } catch {
      inMemoryStore.set(key, value);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      if (typeof AsyncStorage !== 'undefined' && AsyncStorage.removeItem) {
        await AsyncStorage.removeItem(key);
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      inMemoryStore.delete(key);
    } catch {
      inMemoryStore.delete(key);
    }
  }
};

export const mobileStorageService = {
  async getHasOnboarded(): Promise<boolean> {
    const val = await storage.getItem(STORAGE_KEYS.HAS_ONBOARDED);
    return val === 'true';
  },

  async setHasOnboarded(value: boolean): Promise<void> {
    await storage.setItem(STORAGE_KEYS.HAS_ONBOARDED, value ? 'true' : 'false');
  },

  async getActiveMode(): Promise<AppMode> {
    const val = await storage.getItem(STORAGE_KEYS.ACTIVE_MODE);
    return val === 'demo' ? 'demo' : 'user';
  },

  async setActiveMode(mode: AppMode): Promise<void> {
    await storage.setItem(STORAGE_KEYS.ACTIVE_MODE, mode);
  },

  async getThemePreference(): Promise<ThemePreference> {
    const val = await storage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
    if (val === 'light' || val === 'dark' || val === 'system') return val;
    return 'system';
  },

  async setThemePreference(theme: ThemePreference): Promise<void> {
    await storage.setItem(STORAGE_KEYS.THEME_PREFERENCE, theme);
  },

  // --- USER DATA NAMESPACE (Pristine, never overwritten by Demo Mode) ---
  async loadUserData(): Promise<AppStateData> {
    let profile = EMPTY_PROFILE;
    let timetable: WeeklyTimetable = { id: 'user-timetable', name: 'My Timetable', academicTerm: 'Current Term', classes: [] };
    let calendar: AcademicCalendar = { id: 'user-calendar', name: 'My Calendar', entries: [] };
    let overrides: DateOverride[] = [];

    try {
      const rawProfile = await storage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (rawProfile) profile = JSON.parse(rawProfile);
    } catch {}

    try {
      const rawTimetable = await storage.getItem(STORAGE_KEYS.USER_TIMETABLE);
      if (rawTimetable) {
        const parsed = JSON.parse(rawTimetable);
        const v = validateTimetable(parsed);
        if (v.isValid && v.data) timetable = v.data;
      }
    } catch {}

    try {
      const rawCalendar = await storage.getItem(STORAGE_KEYS.USER_CALENDAR);
      if (rawCalendar) {
        const parsed = JSON.parse(rawCalendar);
        const v = validateCalendar(parsed);
        if (v.isValid && v.data) calendar = v.data;
      }
    } catch {}

    try {
      const rawOverrides = await storage.getItem(STORAGE_KEYS.USER_OVERRIDES);
      if (rawOverrides) {
        const parsed = JSON.parse(rawOverrides);
        const v = validateOverrides(parsed);
        if (v.isValid && v.data) overrides = v.data;
      }
    } catch {}

    return { profile, timetable, calendar, overrides };
  },

  async saveUserData(data: AppStateData): Promise<void> {
    await storage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.profile));
    await storage.setItem(STORAGE_KEYS.USER_TIMETABLE, JSON.stringify(data.timetable));
    await storage.setItem(STORAGE_KEYS.USER_CALENDAR, JSON.stringify(data.calendar));
    await storage.setItem(STORAGE_KEYS.USER_OVERRIDES, JSON.stringify(data.overrides));
  },

  // --- DEMO DATA NAMESPACE (Strictly isolated) ---
  async loadDemoData(): Promise<AppStateData> {
    let profile = DEMO_PROFILE;
    let timetable = DEMO_TIMETABLE;
    let calendar = DEMO_CALENDAR;
    let overrides = DEMO_OVERRIDES;

    try {
      const rawTimetable = await storage.getItem(STORAGE_KEYS.DEMO_TIMETABLE);
      if (rawTimetable) timetable = JSON.parse(rawTimetable);
    } catch {}

    try {
      const rawCalendar = await storage.getItem(STORAGE_KEYS.DEMO_CALENDAR);
      if (rawCalendar) calendar = JSON.parse(rawCalendar);
    } catch {}

    try {
      const rawOverrides = await storage.getItem(STORAGE_KEYS.DEMO_OVERRIDES);
      if (rawOverrides) overrides = JSON.parse(rawOverrides);
    } catch {}

    return { profile, timetable, calendar, overrides };
  },

  async saveDemoData(data: AppStateData): Promise<void> {
    await storage.setItem(STORAGE_KEYS.DEMO_TIMETABLE, JSON.stringify(data.timetable));
    await storage.setItem(STORAGE_KEYS.DEMO_CALENDAR, JSON.stringify(data.calendar));
    await storage.setItem(STORAGE_KEYS.DEMO_OVERRIDES, JSON.stringify(data.overrides));
  },

  async resetDemoDataToDefaults(): Promise<AppStateData> {
    await storage.setItem(STORAGE_KEYS.DEMO_TIMETABLE, JSON.stringify(DEMO_TIMETABLE));
    await storage.setItem(STORAGE_KEYS.DEMO_CALENDAR, JSON.stringify(DEMO_CALENDAR));
    await storage.setItem(STORAGE_KEYS.DEMO_OVERRIDES, JSON.stringify(DEMO_OVERRIDES));
    return {
      profile: DEMO_PROFILE,
      timetable: DEMO_TIMETABLE,
      calendar: DEMO_CALENDAR,
      overrides: DEMO_OVERRIDES
    };
  },

  async resetDemoData(): Promise<AppStateData> {
    return this.resetDemoDataToDefaults();
  },

  // --- BACKUP JSON EXPORT / IMPORT ---
  exportBackup(modeData: AppStateData): string {
    const payload = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      ...modeData
    };
    return JSON.stringify(payload, null, 2);
  },

  validateAndParseBackup(jsonStr: string): { success: boolean; data?: AppStateData; errors: string[] } {
    try {
      const parsed = JSON.parse(jsonStr);
      const errors: string[] = [];

      const timetableVal = validateTimetable(parsed.timetable);
      if (!timetableVal.isValid) errors.push(...timetableVal.errors);

      const calendarVal = validateCalendar(parsed.calendar);
      if (!calendarVal.isValid) errors.push(...calendarVal.errors);

      const overridesVal = validateOverrides(parsed.overrides || []);
      if (!overridesVal.isValid) errors.push(...overridesVal.errors);

      if (errors.length > 0) {
        return { success: false, errors };
      }

      return {
        success: true,
        data: {
          profile: parsed.profile || EMPTY_PROFILE,
          timetable: timetableVal.data!,
          calendar: calendarVal.data!,
          overrides: overridesVal.data!
        },
        errors: []
      };
    } catch (e: any) {
      return { success: false, errors: [`JSON Parse Error: ${e.message}`] };
    }
  }
};
