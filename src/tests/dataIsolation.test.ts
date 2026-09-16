import { describe, it, expect, beforeEach } from 'vitest';
import {
  mobileStorageService,
  UserProfile,
  AppStateData,
  EMPTY_PROFILE,
  DEMO_PROFILE,
} from '../storage/mobileStorage';
import { TimetableClass } from '../types/timetable';
import { CalendarEntry } from '../types/calendar';

describe('Data Isolation & User Schedule Invariance', () => {
  beforeEach(async () => {
    // Clear storage for clean test slate
    await mobileStorageService.saveUserData({
      profile: EMPTY_PROFILE,
      timetable: { id: 'usr-tt', name: 'My Schedule', academicTerm: 'Fall 2026', classes: [] },
      calendar: { id: 'usr-cal', name: 'My Calendar', entries: [] },
      overrides: [],
    });
    await mobileStorageService.resetDemoData();
    await mobileStorageService.setActiveMode('user');
    await mobileStorageService.setHasOnboarded(false);
  });

  it('verifies fresh install starts unconfigured without demo data', async () => {
    const hasOnboarded = await mobileStorageService.getHasOnboarded();
    const activeMode = await mobileStorageService.getActiveMode();
    const userData = await mobileStorageService.loadUserData();

    expect(hasOnboarded).toBe(false);
    expect(activeMode).toBe('user');
    expect(userData.profile.name).toBe('');
    expect(userData.timetable.classes.length).toBe(0);
    expect(userData.calendar.entries.length).toBe(0);
    expect(userData.overrides.length).toBe(0);
  });

  it('executes exact 7-step isolation scenario without data loss', async () => {
    // Step 1: Create a local user profile
    const customProfile: UserProfile = {
      name: 'Priya Sharma',
      institution: 'Amrita School of Computing',
      course: 'B.Tech AI & Data Science',
      department: 'Artificial Intelligence',
      semester: '5',
      section: 'A',
      createdAt: new Date().toISOString(),
    };

    // Step 2: Add a custom user timetable
    const customClass: TimetableClass = {
      id: 'custom-mon-1',
      courseCode: '23AID301',
      courseName: 'Deep Reinforcement Learning',
      faculty: 'Dr. K. Raman',
      dayOfWeek: 'Monday',
      startTime: '08:10',
      endTime: '09:00',
      room: 'B201',
      type: 'lecture',
      slot: 'A',
    };

    // Step 3: Add a custom user calendar entry
    const customCalendarEntry: CalendarEntry = {
      id: 'custom-event-1',
      date: '2026-09-25',
      title: 'Department AI Symposium',
      type: 'other',
      description: 'Annual technical paper presentation',
    };

    const userState: AppStateData = {
      profile: customProfile,
      timetable: {
        id: 'usr-tt-1',
        name: "Priya's Autumn Routine",
        academicTerm: 'Odd 2026-27',
        classes: [customClass],
      },
      calendar: {
        id: 'usr-cal-1',
        name: 'Personal Academic Calendar',
        entries: [customCalendarEntry],
      },
      overrides: [],
    };

    await mobileStorageService.saveUserData(userState);
    await mobileStorageService.setHasOnboarded(true);

    // Verify user data is safely persisted
    let loadedUser = await mobileStorageService.loadUserData();
    expect(loadedUser.profile.name).toBe('Priya Sharma');
    expect(loadedUser.timetable.classes.length).toBe(1);
    expect(loadedUser.timetable.classes[0].courseCode).toBe('23AID301');
    expect(loadedUser.calendar.entries.length).toBe(1);
    expect(loadedUser.calendar.entries[0].title).toBe('Department AI Symposium');

    // Step 4: Enter Demo Mode
    await mobileStorageService.setActiveMode('demo');
    const mode = await mobileStorageService.getActiveMode();
    expect(mode).toBe('demo');

    let demoData = await mobileStorageService.loadDemoData();
    expect(demoData.profile.name).toBe(DEMO_PROFILE.name);
    expect(demoData.timetable.classes.length).toBeGreaterThan(0); // Loaded CSE-C demo timetable

    // Step 5: Modify demo data (add class, delete class in demo mode)
    const modifiedDemoClasses = [
      ...demoData.timetable.classes,
      {
        id: 'demo-extra-hackathon',
        courseCode: 'HACK99',
        courseName: 'Hackathon Prep',
        faculty: 'Faculty Mentor',
        dayOfWeek: 'Wednesday' as const,
        startTime: '16:00',
        endTime: '17:00',
        room: 'Auditorium',
        type: 'activity' as const,
      },
    ];
    demoData.timetable.classes = modifiedDemoClasses;
    await mobileStorageService.saveDemoData(demoData);

    // Verify demo data was modified
    const reloadedDemo = await mobileStorageService.loadDemoData();
    expect(reloadedDemo.timetable.classes.some(c => c.id === 'demo-extra-hackathon')).toBe(true);

    // Step 6: Reset / Exit Demo Mode
    await mobileStorageService.resetDemoData();
    await mobileStorageService.setActiveMode('user');

    // Step 7: Confirm the user's original timetable and calendar are completely UNCHANGED!
    loadedUser = await mobileStorageService.loadUserData();
    const finalMode = await mobileStorageService.getActiveMode();

    expect(finalMode).toBe('user');
    expect(loadedUser.profile.name).toBe('Priya Sharma');
    expect(loadedUser.profile.course).toBe('B.Tech AI & Data Science');
    expect(loadedUser.timetable.classes.length).toBe(1);
    expect(loadedUser.timetable.classes[0].id).toBe('custom-mon-1');
    expect(loadedUser.timetable.classes[0].courseCode).toBe('23AID301');
    expect(loadedUser.timetable.classes[0].room).toBe('B201');
    expect(loadedUser.calendar.entries.length).toBe(1);
    expect(loadedUser.calendar.entries[0].id).toBe('custom-event-1');
    expect(loadedUser.calendar.entries[0].title).toBe('Department AI Symposium');
    expect(loadedUser.timetable.classes.some(c => c.id === 'demo-extra-hackathon')).toBe(false);
  });
});
