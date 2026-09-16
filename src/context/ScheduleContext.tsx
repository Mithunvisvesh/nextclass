import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { WeeklyTimetable, TimetableClass } from '../types/timetable';
import { AcademicCalendar, CalendarEntry } from '../types/calendar';
import { DateOverride } from '../types/override';
import { DailySchedule, AppSettings } from '../types/schedule';
import { localStorageService, DEFAULT_SETTINGS } from '../storage/localStorage';
import { getScheduleForDate } from '../core/scheduleEngine';
import { getTodayIsoString, addDays, getCurrentTimeIso } from '../core/timeUtils';

export type NavigationTab = 'today' | 'calendar' | 'timetable' | 'changes' | 'settings';

interface ScheduleContextType {
  timetable: WeeklyTimetable;
  calendar: AcademicCalendar;
  overrides: DateOverride[];
  settings: AppSettings;
  activeDate: string;
  currentTab: NavigationTab;
  currentSimulatedTime: string;
  todaySchedule: DailySchedule;
  tomorrowSchedule: DailySchedule;
  activeDateSchedule: DailySchedule;
  getSchedule: (date: string) => DailySchedule;
  setActiveDate: (date: string) => void;
  setCurrentTab: (tab: NavigationTab) => void;
  addOverride: (override: Omit<DateOverride, 'id' | 'createdAt'>) => void;
  updateOverride: (override: DateOverride) => void;
  deleteOverride: (id: string) => void;
  addTimetableClass: (c: Omit<TimetableClass, 'id'>) => void;
  updateTimetableClass: (c: TimetableClass) => void;
  deleteTimetableClass: (id: string) => void;
  addCalendarEntry: (entry: Omit<CalendarEntry, 'id'>) => void;
  deleteCalendarEntry: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  setSimulatedDate: (isoDate: string, timeStr?: string) => void;
  clearSimulation: () => void;
  resetToDemo: () => void;
  clearAllData: () => void;
  exportData: () => string;
  importData: (jsonStr: string) => { success: boolean; errors: string[] };
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(() => localStorageService.initializeStorage());
  const [activeDate, setActiveDate] = useState(() => {
    if (data.settings.isSimulationActive && data.settings.simulatedDateTime) {
      return data.settings.simulatedDateTime.split('T')[0];
    }
    return getTodayIsoString();
  });
  const [currentTab, setCurrentTab] = useState<NavigationTab>('today');
  const [tick, setTick] = useState(0);

  // Periodic timer tick to update live happening/upcoming class status
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 30000); // every 30 seconds
    return () => clearInterval(timer);
  }, []);

  const todayIso = useMemo(() => {
    if (data.settings.isSimulationActive && data.settings.simulatedDateTime) {
      return data.settings.simulatedDateTime.split('T')[0];
    }
    return getTodayIsoString();
  }, [data.settings.isSimulationActive, data.settings.simulatedDateTime]);

  const tomorrowIso = useMemo(() => addDays(todayIso, 1), [todayIso]);

  const currentSimulatedTime = useMemo(() => {
    if (data.settings.isSimulationActive && data.settings.simulatedDateTime) {
      const timePart = data.settings.simulatedDateTime.split('T')[1];
      return timePart ? timePart.substring(0, 5) : '09:00';
    }
    return getCurrentTimeIso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.settings.isSimulationActive, data.settings.simulatedDateTime, tick]);

  const getSchedule = (date: string): DailySchedule => {
    const timeForDate = date === todayIso ? currentSimulatedTime : '09:00';
    return getScheduleForDate(date, data.timetable, data.calendar, data.overrides, timeForDate);
  };

  const todaySchedule = useMemo(() => {
    return getScheduleForDate(
      todayIso,
      data.timetable,
      data.calendar,
      data.overrides,
      currentSimulatedTime
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayIso, data.timetable, data.calendar, data.overrides, currentSimulatedTime, tick]);

  const tomorrowSchedule = useMemo(() => {
    return getScheduleForDate(
      tomorrowIso,
      data.timetable,
      data.calendar,
      data.overrides,
      '09:00'
    );
  }, [tomorrowIso, data.timetable, data.calendar, data.overrides]);

  const activeDateSchedule = useMemo(() => {
    const timeForDate = activeDate === todayIso ? currentSimulatedTime : '09:00';
    return getScheduleForDate(
      activeDate,
      data.timetable,
      data.calendar,
      data.overrides,
      timeForDate
    );
  }, [activeDate, todayIso, data.timetable, data.calendar, data.overrides, currentSimulatedTime]);

  const addOverride = (override: Omit<DateOverride, 'id' | 'createdAt'>) => {
    const newOverride: DateOverride = {
      ...override,
      id: `ovr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newOverride, ...data.overrides];
    localStorageService.saveOverrides(updated);
    setData(prev => ({ ...prev, overrides: updated }));
  };

  const updateOverride = (override: DateOverride) => {
    const updated = data.overrides.map(o => (o.id === override.id ? override : o));
    localStorageService.saveOverrides(updated);
    setData(prev => ({ ...prev, overrides: updated }));
  };

  const deleteOverride = (id: string) => {
    const updated = data.overrides.filter(o => o.id !== id);
    localStorageService.saveOverrides(updated);
    setData(prev => ({ ...prev, overrides: updated }));
  };

  const addTimetableClass = (c: Omit<TimetableClass, 'id'>) => {
    const newClass: TimetableClass = {
      ...c,
      id: `class-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    const updated = {
      ...data.timetable,
      classes: [...data.timetable.classes, newClass]
    };
    localStorageService.saveTimetable(updated);
    setData(prev => ({ ...prev, timetable: updated }));
  };

  const updateTimetableClass = (c: TimetableClass) => {
    const updated = {
      ...data.timetable,
      classes: data.timetable.classes.map(item => (item.id === c.id ? c : item))
    };
    localStorageService.saveTimetable(updated);
    setData(prev => ({ ...prev, timetable: updated }));
  };

  const deleteTimetableClass = (id: string) => {
    const updated = {
      ...data.timetable,
      classes: data.timetable.classes.filter(item => item.id !== id)
    };
    localStorageService.saveTimetable(updated);
    setData(prev => ({ ...prev, timetable: updated }));
  };

  const addCalendarEntry = (entry: Omit<CalendarEntry, 'id'>) => {
    const newEntry: CalendarEntry = {
      ...entry,
      id: `cal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    const updated = {
      ...data.calendar,
      entries: [...data.calendar.entries, newEntry]
    };
    localStorageService.saveCalendar(updated);
    setData(prev => ({ ...prev, calendar: updated }));
  };

  const deleteCalendarEntry = (id: string) => {
    const updated = {
      ...data.calendar,
      entries: data.calendar.entries.filter(item => item.id !== id)
    };
    localStorageService.saveCalendar(updated);
    setData(prev => ({ ...prev, calendar: updated }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...data.settings, ...newSettings };
    localStorageService.saveSettings(updated);
    setData(prev => ({ ...prev, settings: updated }));
  };

  const setSimulatedDate = (isoDate: string, timeStr = '09:30') => {
    const simulatedDateTime = `${isoDate}T${timeStr}:00`;
    const updatedSettings = {
      ...data.settings,
      isSimulationActive: true,
      simulatedDateTime
    };
    localStorageService.saveSettings(updatedSettings);
    setData(prev => ({ ...prev, settings: updatedSettings }));
    setActiveDate(isoDate);
  };

  const clearSimulation = () => {
    const updatedSettings = {
      ...data.settings,
      isSimulationActive: false
    };
    localStorageService.saveSettings(updatedSettings);
    setData(prev => ({ ...prev, settings: updatedSettings }));
    setActiveDate(getTodayIsoString());
  };

  const resetToDemo = () => {
    const fresh = localStorageService.resetToDemo();
    setData(fresh);
    setActiveDate(
      fresh.settings.isSimulationActive && fresh.settings.simulatedDateTime
        ? fresh.settings.simulatedDateTime.split('T')[0]
        : getTodayIsoString()
    );
  };

  const clearAllData = () => {
    localStorageService.clearAllData();
    setData(prev => ({
      ...prev,
      timetable: { id: 'empty', name: 'Empty', academicTerm: '', classes: [] },
      calendar: { id: 'empty', name: 'Empty', entries: [] },
      overrides: []
    }));
  };

  const exportData = () => {
    return localStorageService.exportFullBackup();
  };

  const importData = (jsonStr: string) => {
    const result = localStorageService.importBackup(jsonStr);
    if (result.success && result.imported) {
      setData(result.imported);
      return { success: true, errors: [] };
    }
    return { success: false, errors: result.errors };
  };

  return (
    <ScheduleContext.Provider
      value={{
        timetable: data.timetable,
        calendar: data.calendar,
        overrides: data.overrides,
        settings: data.settings,
        activeDate,
        currentTab,
        currentSimulatedTime,
        todaySchedule,
        tomorrowSchedule,
        activeDateSchedule,
        getSchedule,
        setActiveDate,
        setCurrentTab,
        addOverride,
        updateOverride,
        deleteOverride,
        addTimetableClass,
        updateTimetableClass,
        deleteTimetableClass,
        addCalendarEntry,
        deleteCalendarEntry,
        updateSettings,
        setSimulatedDate,
        clearSimulation,
        resetToDemo,
        clearAllData,
        exportData,
        importData
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
