import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { 
  mobileStorageService, 
  UserProfile, 
  AppStateData, 
  ThemePreference, 
  AppMode, 
  EMPTY_PROFILE, 
  DEMO_PROFILE 
} from '../storage/mobileStorage';
import { lightTheme, darkTheme, AppThemeColors, ThemeContext } from '../theme/theme';
import { WeeklyTimetable, TimetableClass } from '../types/timetable';
import { AcademicCalendar, CalendarEntry } from '../types/calendar';
import { DateOverride } from '../types/override';
import { DailySchedule } from '../types/schedule';
import { getScheduleForDate } from '../core/scheduleEngine';
import { getTodayIsoString, addDays, getCurrentTimeIso } from '../core/timeUtils';

export type MobileTab = 'today' | 'tomorrow' | 'timetable' | 'calendar' | 'changes' | 'settings';

interface MobileScheduleContextType {
  // Mode & Onboarding
  hasOnboarded: boolean;
  activeMode: AppMode;
  isLoading: boolean;
  completeOnboarding: (userProfile?: Partial<UserProfile>) => Promise<void>;
  enterDemoMode: () => Promise<void>;
  exitDemoMode: () => Promise<void>;
  resetDemoData: () => Promise<void>;

  // Theme
  themePreference: ThemePreference;
  theme: AppThemeColors;
  setThemePreference: (pref: ThemePreference) => Promise<void>;

  // Active Navigation Tab
  activeTab: MobileTab;
  setActiveTab: (tab: MobileTab) => void;

  // Active Data (derived from activeMode)
  profile: UserProfile;
  timetable: WeeklyTimetable;
  calendar: AcademicCalendar;
  overrides: DateOverride[];

  // Time & Simulation
  activeDate: string;
  setActiveDate: (date: string) => void;
  isSimulationActive: boolean;
  simulatedDate?: string;
  simulatedTime?: string;
  setSimulatedDateTime: (date: string, time?: string) => void;
  clearSimulation: () => void;

  // Computed Schedules
  todaySchedule: DailySchedule;
  tomorrowSchedule: DailySchedule;
  getSchedule: (date: string) => DailySchedule;

  // CRUD for active data
  saveProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addTimetableClass: (c: Omit<TimetableClass, 'id'>) => Promise<void>;
  updateTimetableClass: (c: TimetableClass) => Promise<void>;
  deleteTimetableClass: (id: string) => Promise<void>;
  addCalendarEntry: (entry: Omit<CalendarEntry, 'id'>) => Promise<void>;
  deleteCalendarEntry: (id: string) => Promise<void>;
  addOverride: (override: Omit<DateOverride, 'id' | 'createdAt'>) => Promise<void>;
  updateOverride: (override: DateOverride) => Promise<void>;
  deleteOverride: (id: string) => Promise<void>;
  exportBackupJson: () => string;
  importBackupJson: (json: string) => Promise<{ success: boolean; errors: string[] }>;
  clearActiveData: () => Promise<void>;
}

const MobileScheduleContext = createContext<MobileScheduleContextType | undefined>(undefined);

export const MobileScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();

  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [activeMode, setActiveMode] = useState<AppMode>('user');
  const [themePref, setThemePref] = useState<ThemePreference>('system');
  const [activeTab, setActiveTab] = useState<MobileTab>('today');

  // Datasets
  const [userData, setUserData] = useState<AppStateData>({
    profile: EMPTY_PROFILE,
    timetable: { id: 'usr-tt', name: 'My Schedule', academicTerm: '', classes: [] },
    calendar: { id: 'usr-cal', name: 'My Calendar', entries: [] },
    overrides: []
  });

  const [demoData, setDemoData] = useState<AppStateData>({
    profile: DEMO_PROFILE,
    timetable: { id: 'demo-tt', name: 'Sample', academicTerm: '', classes: [] },
    calendar: { id: 'demo-cal', name: 'Sample', entries: [] },
    overrides: []
  });

  // Time & Simulation
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [simulatedDate, setSimulatedDate] = useState<string | undefined>(undefined);
  const [simulatedTime, setSimulatedTime] = useState<string | undefined>(undefined);
  const [activeDate, setActiveDate] = useState(getTodayIsoString());
  const [tick, setTick] = useState(0);

  // Load state from local storage on mount
  useEffect(() => {
    async function init() {
      try {
        const onboarded = await mobileStorageService.getHasOnboarded();
        const mode = await mobileStorageService.getActiveMode();
        const theme = await mobileStorageService.getThemePreference();
        const loadedUserData = await mobileStorageService.loadUserData();
        const loadedDemoData = await mobileStorageService.loadDemoData();

        setHasOnboarded(onboarded);
        setActiveMode(mode);
        setThemePref(theme);
        setUserData(loadedUserData);
        setDemoData(loadedDemoData);
      } catch (err) {
        console.error('Failed to init mobile storage', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Timer tick for live happening class progress
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  // Theme resolution
  const theme: AppThemeColors = useMemo(() => {
    if (themePref === 'dark') return darkTheme;
    if (themePref === 'light') return lightTheme;
    return systemColorScheme === 'dark' ? darkTheme : lightTheme;
  }, [themePref, systemColorScheme]);

  // Active data projection (Strictly separated namespaces)
  const activeDataset = activeMode === 'demo' ? demoData : userData;

  const effectiveToday = useMemo(() => {
    if (isSimulationActive && simulatedDate) return simulatedDate;
    return getTodayIsoString();
  }, [isSimulationActive, simulatedDate]);

  const effectiveTime = useMemo(() => {
    if (isSimulationActive && simulatedTime) return simulatedTime;
    return getCurrentTimeIso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSimulationActive, simulatedTime, tick]);

  const effectiveTomorrow = useMemo(() => addDays(effectiveToday, 1), [effectiveToday]);

  const getSchedule = (date: string): DailySchedule => {
    const timeForDate = date === effectiveToday ? effectiveTime : '08:00';
    return getScheduleForDate(
      date,
      activeDataset.timetable,
      activeDataset.calendar,
      activeDataset.overrides,
      timeForDate
    );
  };

  const todaySchedule = useMemo(() => {
    return getScheduleForDate(
      effectiveToday,
      activeDataset.timetable,
      activeDataset.calendar,
      activeDataset.overrides,
      effectiveTime
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveToday, activeDataset, effectiveTime, tick]);

  const tomorrowSchedule = useMemo(() => {
    return getScheduleForDate(
      effectiveTomorrow,
      activeDataset.timetable,
      activeDataset.calendar,
      activeDataset.overrides,
      '08:00'
    );
  }, [effectiveTomorrow, activeDataset]);

  // Mode operations
  const completeOnboarding = async (initialProfile?: Partial<UserProfile>) => {
    const updatedUser = {
      ...userData,
      profile: {
        ...userData.profile,
        ...initialProfile,
        createdAt: new Date().toISOString()
      }
    };
    await mobileStorageService.saveUserData(updatedUser);
    await mobileStorageService.setHasOnboarded(true);
    await mobileStorageService.setActiveMode('user');
    setUserData(updatedUser);
    setHasOnboarded(true);
    setActiveMode('user');
  };

  const enterDemoMode = async () => {
    const freshDemo = await mobileStorageService.loadDemoData();
    await mobileStorageService.setActiveMode('demo');
    setDemoData(freshDemo);
    setActiveMode('demo');
    // Set simulator to a good demo date (Sep 21, 09:15 AM)
    setIsSimulationActive(true);
    setSimulatedDate('2026-09-21');
    setSimulatedTime('09:15');
    setActiveDate('2026-09-21');
  };

  const exitDemoMode = async () => {
    await mobileStorageService.setActiveMode('user');
    setActiveMode('user');
    setIsSimulationActive(false);
    setSimulatedDate(undefined);
    setSimulatedTime(undefined);
    setActiveDate(getTodayIsoString());
  };

  const resetDemoData = async () => {
    const reset = await mobileStorageService.resetDemoDataToDefaults();
    setDemoData(reset);
    if (activeMode === 'demo') {
      setIsSimulationActive(true);
      setSimulatedDate('2026-09-21');
      setSimulatedTime('09:15');
      setActiveDate('2026-09-21');
    }
  };

  const setThemePreference = async (pref: ThemePreference) => {
    await mobileStorageService.setThemePreference(pref);
    setThemePref(pref);
  };

  const setSimulatedDateTime = (date: string, time = '09:00') => {
    setIsSimulationActive(true);
    setSimulatedDate(date);
    setSimulatedTime(time);
    setActiveDate(date);
  };

  const clearSimulation = () => {
    setIsSimulationActive(false);
    setSimulatedDate(undefined);
    setSimulatedTime(undefined);
    setActiveDate(getTodayIsoString());
  };

  // CRUD Operations on Active Dataset
  const saveProfile = async (profileUpdate: Partial<UserProfile>) => {
    const updated = {
      ...activeDataset,
      profile: { ...activeDataset.profile, ...profileUpdate }
    };
    if (activeMode === 'demo') {
      setDemoData(updated);
      await mobileStorageService.saveDemoData(updated);
    } else {
      setUserData(updated);
      await mobileStorageService.saveUserData(updated);
    }
  };

  const addTimetableClass = async (c: Omit<TimetableClass, 'id'>) => {
    const newClass: TimetableClass = {
      ...c,
      id: `cls-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    const updated = {
      ...activeDataset,
      timetable: {
        ...activeDataset.timetable,
        classes: [...activeDataset.timetable.classes, newClass]
      }
    };
    if (activeMode === 'demo') {
      setDemoData(updated);
      await mobileStorageService.saveDemoData(updated);
    } else {
      setUserData(updated);
      await mobileStorageService.saveUserData(updated);
    }
  };

  const updateTimetableClass = async (c: TimetableClass) => {
    const updated = {
      ...activeDataset,
      timetable: {
        ...activeDataset.timetable,
        classes: activeDataset.timetable.classes.map(item => (item.id === c.id ? c : item))
      }
    };
    if (activeMode === 'demo') {
      setDemoData(updated);
      await mobileStorageService.saveDemoData(updated);
    } else {
      setUserData(updated);
      await mobileStorageService.saveUserData(updated);
    }
  };

  const deleteTimetableClass = async (id: string) => {
    const updated = {
      ...activeDataset,
      timetable: {
        ...activeDataset.timetable,
        classes: activeDataset.timetable.classes.filter(item => item.id !== id)
      }
    };
    if (activeMode === 'demo') {
      setDemoData(updated);
      await mobileStorageService.saveDemoData(updated);
    } else {
      setUserData(updated);
      await mobileStorageService.saveUserData(updated);
    }
  };

  const addCalendarEntry = async (entry: Omit<CalendarEntry, 'id'>) => {
    const newEntry: CalendarEntry = {
      ...entry,
      id: `cal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    const updated = {
      ...activeDataset,
      calendar: {
        ...activeDataset.calendar,
        entries: [...activeDataset.calendar.entries, newEntry]
      }
    };
    if (activeMode === 'demo') {
      setDemoData(updated);
      await mobileStorageService.saveDemoData(updated);
    } else {
      setUserData(updated);
      await mobileStorageService.saveUserData(updated);
    }
  };

  const deleteCalendarEntry = async (id: string) => {
    const updated = {
      ...activeDataset,
      calendar: {
        ...activeDataset.calendar,
        entries: activeDataset.calendar.entries.filter(item => item.id !== id)
      }
    };
    if (activeMode === 'demo') {
      setDemoData(updated);
      await mobileStorageService.saveDemoData(updated);
    } else {
      setUserData(updated);
      await mobileStorageService.saveUserData(updated);
    }
  };

  const addOverride = async (override: Omit<DateOverride, 'id' | 'createdAt'>) => {
    const newOverride: DateOverride = {
      ...override,
      id: `ovr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    const updated = {
      ...activeDataset,
      overrides: [newOverride, ...activeDataset.overrides]
    };
    if (activeMode === 'demo') {
      setDemoData(updated);
      await mobileStorageService.saveDemoData(updated);
    } else {
      setUserData(updated);
      await mobileStorageService.saveUserData(updated);
    }
  };

  const updateOverride = async (override: DateOverride) => {
    const updated = {
      ...activeDataset,
      overrides: activeDataset.overrides.map(o => (o.id === override.id ? override : o))
    };
    if (activeMode === 'demo') {
      setDemoData(updated);
      await mobileStorageService.saveDemoData(updated);
    } else {
      setUserData(updated);
      await mobileStorageService.saveUserData(updated);
    }
  };

  const deleteOverride = async (id: string) => {
    const updated = {
      ...activeDataset,
      overrides: activeDataset.overrides.filter(o => o.id !== id)
    };
    if (activeMode === 'demo') {
      setDemoData(updated);
      await mobileStorageService.saveDemoData(updated);
    } else {
      setUserData(updated);
      await mobileStorageService.saveUserData(updated);
    }
  };

  const clearActiveData = async () => {
    const blank: AppStateData = {
      profile: EMPTY_PROFILE,
      timetable: { id: 'usr-tt', name: 'My Schedule', academicTerm: '', classes: [] },
      calendar: { id: 'usr-cal', name: 'My Calendar', entries: [] },
      overrides: []
    };
    if (activeMode === 'demo') {
      setDemoData(blank);
      await mobileStorageService.saveDemoData(blank);
    } else {
      setUserData(blank);
      await mobileStorageService.saveUserData(blank);
    }
  };

  const exportBackupJson = () => {
    return mobileStorageService.exportBackup(activeDataset);
  };

  const importBackupJson = async (json: string) => {
    const res = mobileStorageService.validateAndParseBackup(json);
    if (!res.success || !res.data) {
      return { success: false, errors: res.errors };
    }
    if (activeMode === 'demo') {
      setDemoData(res.data);
      await mobileStorageService.saveDemoData(res.data);
    } else {
      setUserData(res.data);
      await mobileStorageService.saveUserData(res.data);
    }
    return { success: true, errors: [] };
  };

  return (
    <MobileScheduleContext.Provider
      value={{
        hasOnboarded,
        activeMode,
        isLoading,
        completeOnboarding,
        enterDemoMode,
        exitDemoMode,
        resetDemoData,
        themePreference: themePref,
        theme,
        setThemePreference,
        activeTab,
        setActiveTab,
        profile: activeDataset.profile,
        timetable: activeDataset.timetable,
        calendar: activeDataset.calendar,
        overrides: activeDataset.overrides,
        activeDate,
        setActiveDate,
        isSimulationActive,
        simulatedDate,
        simulatedTime,
        setSimulatedDateTime,
        clearSimulation,
        todaySchedule,
        tomorrowSchedule,
        getSchedule,
        saveProfile,
        addTimetableClass,
        updateTimetableClass,
        deleteTimetableClass,
        addCalendarEntry,
        deleteCalendarEntry,
        addOverride,
        updateOverride,
        deleteOverride,
        exportBackupJson,
        importBackupJson,
        clearActiveData
      }}
    >
      <ThemeContext.Provider value={{ colors: theme, isDark: theme.isDark }}>
        {children}
      </ThemeContext.Provider>
    </MobileScheduleContext.Provider>
  );
};

export const useMobileSchedule = () => {
  const context = useContext(MobileScheduleContext);
  if (!context) {
    throw new Error('useMobileSchedule must be used within MobileScheduleProvider');
  }
  return context;
};
