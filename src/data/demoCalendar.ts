import { AcademicCalendar } from '../types/calendar';
import { DateOverride } from '../types/override';

export const DEMO_CALENDAR: AcademicCalendar = {
  id: 'demo-calendar-2026-odd',
  name: 'Academic Calendar 2026-27 (Odd Semester)',
  entries: [
    {
      id: 'cal-1',
      date: '2026-07-27',
      title: 'Commencement of Classes (S5)',
      type: 'working_day',
      description: 'First instruction day of odd semester'
    },
    {
      id: 'cal-2',
      date: '2026-07-29',
      title: 'Guru Poornima',
      type: 'holiday',
      description: 'Official College Holiday'
    },
    {
      id: 'cal-3',
      date: '2026-08-08',
      title: 'Second Saturday',
      type: 'holiday',
      description: 'Institutional Holiday'
    },
    {
      id: 'cal-4',
      date: '2026-08-15',
      title: 'Independence Day',
      type: 'holiday',
      description: 'National Holiday'
    },
    {
      id: 'cal-5',
      date: '2026-08-21',
      title: 'Varamahalakshmi Vratam',
      type: 'holiday',
      description: 'Festival Holiday'
    },
    {
      id: 'cal-6',
      date: '2026-08-22',
      title: 'Fourth Saturday',
      type: 'holiday',
      description: 'Institutional Holiday'
    },
    {
      id: 'cal-7',
      date: '2026-09-04',
      title: 'Sree Krishna Janmashtami',
      type: 'holiday',
      description: 'Festival Holiday'
    },
    {
      id: 'cal-8',
      date: '2026-09-12',
      title: 'Second Saturday',
      type: 'holiday',
      description: 'Institutional Holiday'
    },
    {
      id: 'cal-9',
      date: '2026-09-14',
      title: 'Ganesh Chaturthi',
      type: 'holiday',
      description: 'Festival Holiday'
    },
    {
      id: 'cal-10',
      date: '2026-09-26',
      title: 'Fourth Saturday',
      type: 'holiday',
      description: 'Institutional Holiday'
    },
    {
      id: 'cal-11',
      date: '2026-09-27',
      title: "Amma's Birthday",
      type: 'holiday',
      description: 'Institutional Holiday'
    },
    {
      id: 'cal-12',
      date: '2026-10-01',
      title: 'Monday Timetable for all',
      type: 'special_timetable',
      timetableSourceDay: 'Monday',
      description: 'Official academic schedule adjustment: follows Monday timetable'
    },
    {
      id: 'cal-13',
      date: '2026-10-02',
      title: 'Gandhi Jayanti',
      type: 'holiday',
      description: 'National Holiday'
    },
    {
      id: 'cal-14',
      date: '2026-10-10',
      title: 'Second Saturday',
      type: 'holiday',
      description: 'Institutional Holiday'
    },
    {
      id: 'cal-15',
      date: '2026-10-20',
      title: 'Maha Navami / Ayudha Pooja',
      type: 'holiday',
      description: 'Festival Holiday'
    },
    {
      id: 'cal-16',
      date: '2026-10-21',
      title: 'Vijayadashami',
      type: 'holiday',
      description: 'Festival Holiday'
    },
    {
      id: 'cal-17',
      date: '2026-10-24',
      title: 'Fourth Saturday',
      type: 'holiday',
      description: 'Institutional Holiday'
    },
    {
      id: 'cal-18',
      date: '2026-10-26',
      title: 'Valmiki Jayanti',
      type: 'holiday',
      description: 'Official Holiday'
    },
    {
      id: 'cal-19',
      date: '2026-10-31',
      title: 'Friday Timetable for all',
      type: 'special_timetable',
      timetableSourceDay: 'Friday',
      description: 'Official academic adjustment: Saturday follows Friday timetable'
    },
    {
      id: 'cal-20',
      date: '2026-11-07',
      title: 'Monday Timetable for all',
      type: 'special_timetable',
      timetableSourceDay: 'Monday',
      description: 'Official academic adjustment: Saturday follows Monday timetable'
    },
    {
      id: 'cal-21',
      date: '2026-11-09',
      title: 'Deepavali Amavasya',
      type: 'holiday',
      description: 'Festival Holiday'
    },
    {
      id: 'cal-22',
      date: '2026-11-10',
      title: 'Balipadyami Deepavali',
      type: 'holiday',
      description: 'Festival Holiday'
    },
    {
      id: 'cal-23',
      date: '2026-11-14',
      title: 'Second Saturday',
      type: 'holiday',
      description: 'Institutional Holiday'
    },
    {
      id: 'cal-24',
      date: '2026-11-28',
      title: 'Fourth Saturday',
      type: 'holiday',
      description: 'Institutional Holiday'
    },
    {
      id: 'cal-25',
      date: '2026-12-25',
      title: 'Christmas',
      type: 'holiday',
      description: 'Festival Holiday'
    }
  ]
};

export const DEMO_OVERRIDES: DateOverride[] = [
  {
    id: 'ovr-1',
    date: '2026-09-21',
    type: 'swap',
    targetClassId: 'mon-2', // NLP (09:50)
    swapWithClassId: 'mon-3', // Computer Networks (11:00)
    notes: 'Swap NLP and Computer Networks for laboratory preparation',
    createdAt: '2026-09-16T10:00:00Z'
  },
  {
    id: 'ovr-2',
    date: '2026-09-23',
    type: 'cancel',
    targetClassId: 'wed-1', // Computer Networks (09:00)
    notes: 'Faculty attending research conference; class cancelled',
    createdAt: '2026-09-16T10:30:00Z'
  },
  {
    id: 'ovr-3',
    date: '2026-09-25',
    type: 'room_change',
    targetClassId: 'fri-2', // Neural Networks & Deep Learning
    overrideData: {
      room: 'A406'
    },
    notes: 'Room shifted from C404 to A406 due to projector repair',
    createdAt: '2026-09-16T11:00:00Z'
  },
  {
    id: 'ovr-4',
    date: '2026-09-29',
    type: 'extra',
    overrideData: {
      id: 'extra-dbms-1',
      courseCode: '23CSE351',
      courseName: 'Foundations of Data Science',
      faculty: 'Dr. Lekshmi R.',
      dayOfWeek: 'Tuesday',
      startTime: '16:30',
      endTime: '17:30',
      room: 'C404',
      type: 'lecture',
      notes: 'Extra review session before midterm'
    },
    notes: 'Extra review session scheduled by faculty',
    createdAt: '2026-09-16T11:30:00Z'
  }
];
