import { describe, it, expect } from 'vitest';
import { getScheduleForDate } from '../core/scheduleEngine';
import { DEMO_TIMETABLE } from '../data/demoTimetable';
import { DEMO_CALENDAR, DEMO_OVERRIDES } from '../data/demoCalendar';
import { WeeklyTimetable } from '../types/timetable';
import { AcademicCalendar } from '../types/calendar';
import { DateOverride } from '../types/override';

describe('Schedule Engine — getScheduleForDate', () => {
  // Test 1: Normal Weekday (Monday without overrides)
  it('1. correctly computes a normal weekday schedule', () => {
    // 2026-09-28 is a normal Monday
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, [], '08:00');
    expect(schedule.actualDayOfWeek).toBe('Monday');
    expect(schedule.effectiveSourceDay).toBe('Monday');
    expect(schedule.isHoliday).toBe(false);
    expect(schedule.isSpecialTimetable).toBe(false);
    expect(schedule.classes.length).toBe(5);
    expect(schedule.classes[0].courseCode).toBe('23CSE301');
    expect(schedule.classes[0].startTime).toBe('09:00');
  });

  // Test 2: Weekend (Normal Sunday)
  it('2. returns no classes on a normal weekend without scheduled classes', () => {
    // 2026-09-20 is Sunday
    const schedule = getScheduleForDate('2026-09-20', DEMO_TIMETABLE, DEMO_CALENDAR, [], '10:00');
    expect(schedule.actualDayOfWeek).toBe('Sunday');
    expect(schedule.classes.length).toBe(0);
    expect(schedule.hasClasses).toBe(false);
  });

  // Test 3: Holiday
  it('3. recognizes holidays and excludes regular classes', () => {
    // 2026-09-14 is Ganesh Chaturthi (Monday)
    const schedule = getScheduleForDate('2026-09-14', DEMO_TIMETABLE, DEMO_CALENDAR, [], '09:00');
    expect(schedule.isHoliday).toBe(true);
    expect(schedule.holidayTitle).toContain('Ganesh Chaturthi');
    expect(schedule.classes.length).toBe(0);
  });

  // Test 4: Official Special Timetable Day
  it('4. applies official special timetable day (Oct 1 Thursday follows Monday)', () => {
    // 2026-10-01 is Thursday, but calendar says "Monday Timetable for all"
    const schedule = getScheduleForDate('2026-10-01', DEMO_TIMETABLE, DEMO_CALENDAR, [], '08:00');
    expect(schedule.actualDayOfWeek).toBe('Thursday');
    expect(schedule.effectiveSourceDay).toBe('Monday');
    expect(schedule.isSpecialTimetable).toBe(true);
    expect(schedule.specialTimetableNote).toContain('Monday Timetable for all');
    // Should have 5 Monday classes instead of 6 Thursday classes
    expect(schedule.classes.length).toBe(5);
    expect(schedule.classes[0].courseCode).toBe('23CSE301'); // Monday 9 AM
  });

  // Test 5: User Override for Source Day
  it('5. allows user date-specific override to follow another weekday', () => {
    const userOverride: DateOverride[] = [
      {
        id: 'usr-ovr-day',
        date: '2026-09-22', // Tuesday
        type: 'source_day',
        timetableSourceDay: 'Friday',
        createdAt: '2026-09-16T10:00:00Z'
      }
    ];
    const schedule = getScheduleForDate('2026-09-22', DEMO_TIMETABLE, DEMO_CALENDAR, userOverride, '08:00');
    expect(schedule.actualDayOfWeek).toBe('Tuesday');
    expect(schedule.effectiveSourceDay).toBe('Friday');
    expect(schedule.isSpecialTimetable).toBe(true);
    expect(schedule.classes.some(c => c.courseName === 'Embedded Systems Lab')).toBe(true);
  });

  // Test 6: Cancelled Class Override
  it('6. cancels a specific class on a specific date', () => {
    const overrides: DateOverride[] = [
      {
        id: 'ovr-cancel',
        date: '2026-09-28', // Monday
        type: 'cancel',
        targetClassId: 'mon-1', // Machine Learning
        createdAt: '2026-09-16T10:00:00Z'
      }
    ];
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, overrides, '08:00');
    expect(schedule.classes.length).toBe(4);
    expect(schedule.classes.find(c => c.id === 'mon-1')).toBeUndefined();
  });

  // Test 7: Swapped Classes Override
  it('7. swaps two classes on a specific date', () => {
    // 2026-09-21: Swap mon-2 (NLP 09:50-10:40) and mon-3 (CN 11:00-11:50)
    const swapOverride: DateOverride[] = [
      {
        id: 'ovr-swap',
        date: '2026-09-21',
        type: 'swap',
        targetClassId: 'mon-2',
        swapWithClassId: 'mon-3',
        createdAt: '2026-09-16T10:00:00Z'
      }
    ];
    const schedule = getScheduleForDate('2026-09-21', DEMO_TIMETABLE, DEMO_CALENDAR, swapOverride, '08:00');
    
    const nlp = schedule.classes.find(c => c.id === 'mon-2');
    const cn = schedule.classes.find(c => c.id === 'mon-3');

    expect(nlp).toBeDefined();
    expect(cn).toBeDefined();
    // In swapped state, NLP should now be at 11:00 and CN at 09:50
    expect(nlp?.startTime).toBe('11:00');
    expect(nlp?.endTime).toBe('11:50');
    expect(cn?.startTime).toBe('09:50');
    expect(cn?.endTime).toBe('10:40');
    expect(nlp?.isOverride).toBe(true);
    expect(cn?.isOverride).toBe(true);
  });

  // Test 8: Extra Class Override
  it('8. adds an extra class on a date', () => {
    const extraOverride: DateOverride[] = [
      {
        id: 'ovr-extra',
        date: '2026-09-28',
        type: 'extra',
        overrideData: {
          id: 'extra-class-1',
          courseCode: '23CSE351',
          courseName: 'Foundations of Data Science',
          startTime: '16:30',
          endTime: '17:30',
          room: 'C404',
          type: 'lecture'
        },
        createdAt: '2026-09-16T10:00:00Z'
      }
    ];
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, extraOverride, '08:00');
    expect(schedule.classes.length).toBe(6);
    const extra = schedule.classes.find(c => c.courseCode === '23CSE351');
    expect(extra).toBeDefined();
    expect(extra?.isOverride).toBe(true);
    expect(extra?.startTime).toBe('16:30');
  });

  // Test 9: Room Change Override
  it('9. changes room for a specific class on a date', () => {
    const roomOverride: DateOverride[] = [
      {
        id: 'ovr-room',
        date: '2026-09-28',
        type: 'room_change',
        targetClassId: 'mon-1',
        overrideData: { room: 'Auditorium' },
        createdAt: '2026-09-16T10:00:00Z'
      }
    ];
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, roomOverride, '08:00');
    const ml = schedule.classes.find(c => c.id === 'mon-1');
    expect(ml?.room).toBe('Auditorium');
    expect(ml?.originalValues?.room).toBe('C404');
    expect(ml?.isOverride).toBe(true);
  });

  // Test 10: Time Change Override
  it('10. changes time for a class on a date', () => {
    const timeOverride: DateOverride[] = [
      {
        id: 'ovr-time',
        date: '2026-09-28',
        type: 'time_change',
        targetClassId: 'mon-5',
        overrideData: { startTime: '15:00', endTime: '16:00' },
        createdAt: '2026-09-16T10:00:00Z'
      }
    ];
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, timeOverride, '08:00');
    const toc = schedule.classes.find(c => c.id === 'mon-5');
    expect(toc?.startTime).toBe('15:00');
    expect(toc?.endTime).toBe('16:00');
    expect(toc?.originalValues?.startTime).toBe('14:00');
  });

  // Test 11: Multiple changes on same date
  it('11. correctly applies multiple changes on the same date', () => {
    const multiOverrides: DateOverride[] = [
      {
        id: 'ovr-cancel-1',
        date: '2026-09-28',
        type: 'cancel',
        targetClassId: 'mon-1',
        createdAt: '2026-09-16T10:00:00Z'
      },
      {
        id: 'ovr-room-1',
        date: '2026-09-28',
        type: 'room_change',
        targetClassId: 'mon-2',
        overrideData: { room: 'Lab B' },
        createdAt: '2026-09-16T10:00:00Z'
      }
    ];
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, multiOverrides, '08:00');
    expect(schedule.classes.length).toBe(4);
    expect(schedule.classes.find(c => c.id === 'mon-1')).toBeUndefined();
    expect(schedule.classes.find(c => c.id === 'mon-2')?.room).toBe('Lab B');
  });

  // Test 12: CORE INVARIANT PRESERVATION
  it('12. preserves baseline recurring timetable across other dates after override', () => {
    const swapOverride: DateOverride[] = [
      {
        id: 'ovr-swap-21',
        date: '2026-09-21',
        type: 'swap',
        targetClassId: 'mon-2',
        swapWithClassId: 'mon-3',
        createdAt: '2026-09-16T10:00:00Z'
      }
    ];

    // Sep 21: Swapped
    const sep21 = getScheduleForDate('2026-09-21', DEMO_TIMETABLE, DEMO_CALENDAR, swapOverride, '08:00');
    expect(sep21.classes.find(c => c.id === 'mon-2')?.startTime).toBe('11:00');

    // Sep 28 (next Monday): MUST BE ORIGINAL UNTOUCHED BASELINE
    const sep28 = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, swapOverride, '08:00');
    expect(sep28.classes.find(c => c.id === 'mon-2')?.startTime).toBe('09:50');
    expect(sep28.classes.find(c => c.id === 'mon-3')?.startTime).toBe('11:00');
    expect(sep28.classes.find(c => c.id === 'mon-2')?.isOverride).toBeFalsy();

    // Baseline object in memory must also be untouched
    const baselineMon2 = DEMO_TIMETABLE.classes.find(c => c.id === 'mon-2');
    expect(baselineMon2?.startTime).toBe('09:50');
  });

  // Test 13: Free Periods Calculation
  it('13. calculates free periods / breaks between classes', () => {
    // On Monday: mon-2 ends at 10:40, mon-3 starts at 11:00 (20 min break)
    // mon-4 ends at 12:40, mon-5 starts at 14:00 (80 min lunch break)
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, [], '08:00');
    expect(schedule.freePeriods.length).toBeGreaterThanOrEqual(2);
    
    const recess = schedule.freePeriods.find(p => p.startTime === '10:40' && p.endTime === '11:00');
    expect(recess).toBeDefined();
    expect(recess?.durationMinutes).toBe(20);

    const lunch = schedule.freePeriods.find(p => p.startTime === '12:40' && p.endTime === '14:00');
    expect(lunch).toBeDefined();
    expect(lunch?.durationMinutes).toBe(80);
    expect(lunch?.label).toContain('Lunch Break');
  });

  // Test 14: Active Class Detection (Happening)
  it('14. accurately identifies currently happening class and progress', () => {
    // Machine Learning is 09:00 - 09:50. Current time: 09:25 (halfway = 50%)
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, [], '09:25');
    expect(schedule.currentClass).not.toBeNull();
    expect(schedule.currentClass?.courseCode).toBe('23CSE301');
    expect(schedule.currentClass?.status).toBe('happening');
    expect(schedule.currentClass?.progressPercent).toBe(50);
  });

  // Test 15: Next Class Detection (Upcoming)
  it('15. accurately identifies next class', () => {
    // Current time: 09:25. Next class at 09:50 is mon-2 (NLP)
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, [], '09:25');
    expect(schedule.nextClass).not.toBeNull();
    expect(schedule.nextClass?.courseCode).toBe('23CSE471');
    expect(schedule.nextClass?.status).toBe('upcoming');
  });

  // Test 16: No Upcoming Class when Day is Over
  it('16. reports no upcoming or happening class after end of day', () => {
    // Last class ends at 14:50. Current time: 17:00
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, [], '17:00');
    expect(schedule.currentClass).toBeNull();
    expect(schedule.nextClass).toBeNull();
    expect(schedule.classes.every(c => c.status === 'completed')).toBe(true);
  });

  // Test 17: Empty Timetable Gracefully Handled
  it('17. handles empty timetable without errors', () => {
    const emptyTimetable: WeeklyTimetable = {
      id: 'empty',
      name: 'Empty',
      academicTerm: '',
      classes: []
    };
    const schedule = getScheduleForDate('2026-09-28', emptyTimetable, DEMO_CALENDAR, [], '09:00');
    expect(schedule.classes).toEqual([]);
    expect(schedule.hasClasses).toBe(false);
    expect(schedule.currentClass).toBeNull();
  });

  // Test 18: Empty Calendar Gracefully Handled
  it('18. handles empty calendar without errors', () => {
    const emptyCalendar: AcademicCalendar = {
      id: 'empty',
      name: 'Empty',
      entries: []
    };
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, emptyCalendar, [], '09:00');
    expect(schedule.classes.length).toBe(5);
    expect(schedule.isHoliday).toBe(false);
  });

  // Test 19: Chronological sorting preserved after out-of-order overrides
  it('19. keeps classes sorted chronologically even when extra classes are added', () => {
    const extraOverride: DateOverride[] = [
      {
        id: 'ovr-morning',
        date: '2026-09-28',
        type: 'extra',
        overrideData: {
          id: 'early-bird',
          courseCode: 'EARLY101',
          courseName: 'Zero Period',
          startTime: '08:00',
          endTime: '08:45',
          room: 'C404'
        },
        createdAt: '2026-09-16T10:00:00Z'
      }
    ];
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, extraOverride, '07:30');
    expect(schedule.classes[0].courseCode).toBe('EARLY101');
    expect(schedule.classes[1].courseCode).toBe('23CSE301');
  });

  // Test 20: Vacation handling
  it('20. handles vacation entries', () => {
    const calendarWithVacation: AcademicCalendar = {
      id: 'vac-cal',
      name: 'Calendar',
      entries: [
        {
          id: 'vac-1',
          date: '2026-12-28',
          title: 'Semester Break Vacation',
          type: 'vacation'
        }
      ]
    };
    const schedule = getScheduleForDate('2026-12-28', DEMO_TIMETABLE, calendarWithVacation, [], '09:00');
    expect(schedule.isVacation).toBe(true);
    expect(schedule.classes.length).toBe(0);
  });

  // Test 21: Special Timetable on Saturday (e.g. 31-Oct Sat follows Friday)
  it('21. applies special timetable on weekend (31-Oct Saturday follows Friday Timetable)', () => {
    const schedule = getScheduleForDate('2026-10-31', DEMO_TIMETABLE, DEMO_CALENDAR, [], '08:00');
    expect(schedule.actualDayOfWeek).toBe('Saturday');
    expect(schedule.effectiveSourceDay).toBe('Friday');
    expect(schedule.isSpecialTimetable).toBe(true);
    expect(schedule.classes.length).toBe(6); // Friday has 6 classes
    expect(schedule.classes.some(c => c.courseName === 'Embedded Systems Lab')).toBe(true);
  });

  // Test 22: Unknown/Malformed override types handled safely
  it('22. ignores unknown override types without crashing', () => {
    const badOverride: any = [
      {
        id: 'bad-1',
        date: '2026-09-28',
        type: 'invalid_action_type',
        createdAt: '2026-09-16T10:00:00Z'
      }
    ];
    expect(() => {
      getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, badOverride, '09:00');
    }).not.toThrow();
  });
});
