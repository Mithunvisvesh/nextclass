import { describe, it, expect } from 'vitest';
import { getScheduleForDate } from '../core/scheduleEngine';
import { DEMO_TIMETABLE } from '../data/demoTimetable';
import { DEMO_CALENDAR, DEMO_OVERRIDES } from '../data/demoCalendar';
import { WeeklyTimetable } from '../types/timetable';
import { AcademicCalendar } from '../types/calendar';
import { DateOverride } from '../types/override';

describe('Schedule Engine — getScheduleForDate (Corrected Timetable Fixtures)', () => {
  // Test 1: Normal Weekday (Monday with 8:10 AM start and 6 classes)
  it('1. correctly computes a normal weekday schedule with 8:10 AM start slot', () => {
    // 2026-09-28 is a normal Monday
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, [], '07:30');
    expect(schedule.actualDayOfWeek).toBe('Monday');
    expect(schedule.effectiveSourceDay).toBe('Monday');
    expect(schedule.isHoliday).toBe(false);
    expect(schedule.isSpecialTimetable).toBe(false);
    expect(schedule.classes.length).toBe(6);
    // Verified against PDF: First slot is 8:10 - 9:00 Slot A Machine Learning
    expect(schedule.classes[0].courseCode).toBe('23CSE301');
    expect(schedule.classes[0].startTime).toBe('08:10');
    expect(schedule.classes[0].endTime).toBe('09:00');
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
    const schedule = getScheduleForDate('2026-09-14', DEMO_TIMETABLE, DEMO_CALENDAR, [], '08:30');
    expect(schedule.isHoliday).toBe(true);
    expect(schedule.holidayTitle).toContain('Ganesh Chaturthi');
    expect(schedule.classes.length).toBe(0);
  });

  // Test 4: Official Special Timetable Day (Oct 1 Thursday follows Monday)
  it('4. applies official special timetable day (Oct 1 Thursday follows Monday)', () => {
    // 2026-10-01 is Thursday, but calendar says "Monday Timetable for all"
    const schedule = getScheduleForDate('2026-10-01', DEMO_TIMETABLE, DEMO_CALENDAR, [], '07:45');
    expect(schedule.actualDayOfWeek).toBe('Thursday');
    expect(schedule.effectiveSourceDay).toBe('Monday');
    expect(schedule.isSpecialTimetable).toBe(true);
    expect(schedule.specialTimetableNote).toContain('Monday Timetable for all');
    expect(schedule.classes.length).toBe(6);
    expect(schedule.classes[0].courseCode).toBe('23CSE301');
    expect(schedule.classes[0].startTime).toBe('08:10');
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
    const schedule = getScheduleForDate('2026-09-22', DEMO_TIMETABLE, DEMO_CALENDAR, userOverride, '07:30');
    expect(schedule.actualDayOfWeek).toBe('Tuesday');
    expect(schedule.effectiveSourceDay).toBe('Friday');
    expect(schedule.isSpecialTimetable).toBe(true);
    expect(schedule.classes.length).toBe(7); // Friday has 7 classes
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
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, overrides, '07:30');
    expect(schedule.classes.length).toBe(5);
    expect(schedule.classes.find(c => c.id === 'mon-1')).toBeUndefined();
  });

  // Test 7: Swapped Classes Override (Sep 21)
  it('7. swaps two classes on a specific date', () => {
    // 2026-09-21: Swap mon-2 (NLP 09:00-09:50) and mon-3 (CN 09:50-10:40)
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
    const schedule = getScheduleForDate('2026-09-21', DEMO_TIMETABLE, DEMO_CALENDAR, swapOverride, '07:30');
    
    const nlp = schedule.classes.find(c => c.id === 'mon-2');
    const cn = schedule.classes.find(c => c.id === 'mon-3');

    expect(nlp).toBeDefined();
    expect(cn).toBeDefined();
    // Swapped: NLP now at 09:50, CN now at 09:00
    expect(nlp?.startTime).toBe('09:50');
    expect(nlp?.endTime).toBe('10:40');
    expect(cn?.startTime).toBe('09:00');
    expect(cn?.endTime).toBe('09:50');
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
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, extraOverride, '07:30');
    expect(schedule.classes.length).toBe(7);
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
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, roomOverride, '07:30');
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
        overrideData: { startTime: '12:00', endTime: '12:50' },
        createdAt: '2026-09-16T10:00:00Z'
      }
    ];
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, timeOverride, '07:30');
    const toc = schedule.classes.find(c => c.id === 'mon-5');
    expect(toc?.startTime).toBe('12:00');
    expect(toc?.endTime).toBe('12:50');
    expect(toc?.originalValues?.startTime).toBe('11:50');
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
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, multiOverrides, '07:30');
    expect(schedule.classes.length).toBe(5);
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
    const sep21 = getScheduleForDate('2026-09-21', DEMO_TIMETABLE, DEMO_CALENDAR, swapOverride, '07:30');
    expect(sep21.classes.find(c => c.id === 'mon-2')?.startTime).toBe('09:50');

    // Sep 28 (next Monday): MUST BE ORIGINAL UNTOUCHED BASELINE
    const sep28 = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, swapOverride, '07:30');
    expect(sep28.classes.find(c => c.id === 'mon-2')?.startTime).toBe('09:00');
    expect(sep28.classes.find(c => c.id === 'mon-3')?.startTime).toBe('09:50');
    expect(sep28.classes.find(c => c.id === 'mon-2')?.isOverride).toBeFalsy();

    // Baseline object in memory must also be untouched
    const baselineMon2 = DEMO_TIMETABLE.classes.find(c => c.id === 'mon-2');
    expect(baselineMon2?.startTime).toBe('09:00');
  });

  // Test 13: Free Periods Calculation (Tea Break and Lunch Break)
  it('13. calculates free periods / breaks between classes', () => {
    // On Monday: mon-3 ends at 10:40, mon-4 starts at 11:00 (20 min tea break)
    // mon-5 ends at 12:40, mon-6 starts at 13:25 (45 min lunch break)
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, [], '07:30');
    expect(schedule.freePeriods.length).toBeGreaterThanOrEqual(2);
    
    const recess = schedule.freePeriods.find(p => p.startTime === '10:40' && p.endTime === '11:00');
    expect(recess).toBeDefined();
    expect(recess?.durationMinutes).toBe(20);

    const lunch = schedule.freePeriods.find(p => p.startTime === '12:40' && p.endTime === '13:25');
    expect(lunch).toBeDefined();
    expect(lunch?.durationMinutes).toBe(45);
    expect(lunch?.label).toContain('Lunch Break');
  });

  // Test 14: Active Class Detection (Happening at 8:35 AM)
  it('14. accurately identifies currently happening class and progress at 08:35 AM', () => {
    // Machine Learning is 08:10 - 09:00 (50 mins). At 08:35, 25 mins elapsed = 50%
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, [], '08:35');
    expect(schedule.currentClass).not.toBeNull();
    expect(schedule.currentClass?.courseCode).toBe('23CSE301');
    expect(schedule.currentClass?.status).toBe('happening');
    expect(schedule.currentClass?.progressPercent).toBe(50);
  });

  // Test 15: Next Class Detection (Upcoming)
  it('15. accurately identifies next upcoming class', () => {
    // Current time: 08:35. Next class at 09:00 is mon-2 (NLP)
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, [], '08:35');
    expect(schedule.nextClass).not.toBeNull();
    expect(schedule.nextClass?.courseCode).toBe('23CSE471');
    expect(schedule.nextClass?.status).toBe('upcoming');
  });

  // Test 16: End of Day Detection
  it('16. reports no upcoming or happening class after end of day', () => {
    // Last class (mon-6 Embedded Lab) ends at 15:40. At 17:00, all are completed
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
    expect(schedule.classes.length).toBe(6);
    expect(schedule.isHoliday).toBe(false);
  });

  // Test 19: Chronological sorting preserved after out-of-order overrides
  it('19. keeps classes sorted chronologically even when extra early class is added', () => {
    const extraOverride: DateOverride[] = [
      {
        id: 'ovr-early',
        date: '2026-09-28',
        type: 'extra',
        overrideData: {
          id: 'early-bird',
          courseCode: 'EARLY101',
          courseName: 'Zero Period',
          startTime: '07:30',
          endTime: '08:05',
          room: 'C404'
        },
        createdAt: '2026-09-16T10:00:00Z'
      }
    ];
    const schedule = getScheduleForDate('2026-09-28', DEMO_TIMETABLE, DEMO_CALENDAR, extraOverride, '07:00');
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

  // Test 21: Special Timetable on Saturday (31-Oct Saturday follows Friday Timetable)
  it('21. applies special timetable on weekend (31-Oct Saturday follows Friday Timetable)', () => {
    const schedule = getScheduleForDate('2026-10-31', DEMO_TIMETABLE, DEMO_CALENDAR, [], '07:30');
    expect(schedule.actualDayOfWeek).toBe('Saturday');
    expect(schedule.effectiveSourceDay).toBe('Friday');
    expect(schedule.isSpecialTimetable).toBe(true);
    expect(schedule.classes.length).toBe(7); // Friday has 7 classes
    expect(schedule.classes[0].courseName).toBe('Neural Networks & Deep Learning');
    expect(schedule.classes[0].startTime).toBe('08:10');
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

  // Test 23: Multi-hour lab duration verification (Tuesday CN Lab 8:10 - 10:25)
  it('23. accurately computes multi-hour lab slot (Tuesday CN Lab is 135 minutes)', () => {
    const schedule = getScheduleForDate('2026-09-29', DEMO_TIMETABLE, DEMO_CALENDAR, [], '07:30');
    const cnLab = schedule.classes.find(c => c.id === 'tue-1');
    expect(cnLab).toBeDefined();
    expect(cnLab?.startTime).toBe('08:10');
    expect(cnLab?.endTime).toBe('10:25');
    expect(cnLab?.type).toBe('lab');
  });

  // Test 24: Tuesday afternoon lab slot (ML Lab 10:50 - 13:05)
  it('24. accurately computes midday lab slot (Tuesday ML Lab is 10:50 - 13:05)', () => {
    const schedule = getScheduleForDate('2026-09-29', DEMO_TIMETABLE, DEMO_CALENDAR, [], '07:30');
    const mlLab = schedule.classes.find(c => c.id === 'tue-2');
    expect(mlLab).toBeDefined();
    expect(mlLab?.startTime).toBe('10:50');
    expect(mlLab?.endTime).toBe('13:05');
  });
});
