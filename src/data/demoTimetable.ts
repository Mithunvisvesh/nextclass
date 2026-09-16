import { WeeklyTimetable } from '../types/timetable';

/**
 * RECONSTRUCTED SAMPLE TIMETABLE
 * Authoritative Source: docs/reference/Timetable_Sem5_CSE_C.pdf
 * Room: C404 | Section: C (CSE) | Effective: 27-07-2026
 *
 * Slots Structure from PDF:
 * - Period 1 (Early Morning): 08:10 - 09:00
 * - Period 2: 09:00 - 09:50
 * - Period 3: 09:50 - 10:40
 * - Tea Break: 10:40 - 11:00
 * - Period 4: 11:00 - 11:50
 * - Period 5: 11:50 - 12:40
 * - Lunch Break: 12:40 - 14:00 (or 12:40 - 13:25 for afternoon lab)
 * - Period 6: 14:00 - 14:50 (2:00 - 2:50)
 * - Period 7: 14:50 - 15:40 (2:50 - 3:40)
 * - Period 8: 15:40 - 16:20 (3:40 - 4:20)
 *
 * Lab Slots (Lab AS):
 * - Morning Lab: 08:10 - 10:25
 * - Midday Lab: 10:50 - 13:05 (10:50 - 1:05)
 * - Afternoon Lab: 13:25 - 15:40 (1:25 - 3:40)
 */
export const DEMO_TIMETABLE: WeeklyTimetable = {
  id: 'demo-timetable-sem5-c',
  name: 'B.Tech CSE Semester 5 (Section C)',
  academicTerm: 'Odd Semester 2026-27',
  classes: [
    // ==========================================
    // MONDAY
    // ==========================================
    {
      id: 'mon-1',
      courseCode: '23CSE301',
      courseName: 'Machine Learning',
      faculty: 'Dr. Debanjali (co: Mr. Bharath)',
      dayOfWeek: 'Monday',
      startTime: '08:10',
      endTime: '09:00',
      room: 'C404',
      type: 'lecture',
      slot: 'A',
      notes: 'Starts at 8:10 AM'
    },
    {
      id: 'mon-2',
      courseCode: '23CSE471',
      courseName: 'Natural Language Processing',
      faculty: 'Dr. Nandu C. Nair',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '09:50',
      room: 'D205',
      type: 'lecture',
      slot: 'PE I',
      notes: 'Professional Elective I (Only Monday in D205/C405)'
    },
    {
      id: 'mon-3',
      courseCode: '23CSE302',
      courseName: 'Computer Networks',
      faculty: 'Dr. Shinu M.R. (co: Dr. Gurupriya M.)',
      dayOfWeek: 'Monday',
      startTime: '09:50',
      endTime: '10:40',
      room: 'C404',
      type: 'lecture',
      slot: 'B'
    },
    {
      id: 'mon-4',
      courseCode: '23CSE473',
      courseName: 'Neural Networks & Deep Learning',
      faculty: 'Dr. Manju Venugopal',
      dayOfWeek: 'Monday',
      startTime: '11:00',
      endTime: '11:50',
      room: 'C404',
      type: 'lecture',
      slot: 'PE II',
      notes: 'Professional Elective II'
    },
    {
      id: 'mon-5',
      courseCode: '23CSE303',
      courseName: 'Theory of Computation',
      faculty: 'Ms. Divya Kumari',
      dayOfWeek: 'Monday',
      startTime: '11:50',
      endTime: '12:40',
      room: 'C404',
      type: 'lecture',
      slot: 'C'
    },
    {
      id: 'mon-6',
      courseCode: '23CSE304',
      courseName: 'Embedded Systems Lab',
      faculty: 'Mr. Niranjan D.K. (co: Ms. Arya Suresh)',
      dayOfWeek: 'Monday',
      startTime: '13:25',
      endTime: '15:40',
      room: 'Lab AS',
      type: 'lab',
      slot: 'D LAB',
      notes: 'ARM Cortex & peripheral interfacing practicals'
    },

    // ==========================================
    // TUESDAY
    // ==========================================
    {
      id: 'tue-1',
      courseCode: '23CSE302',
      courseName: 'Computer Networks Lab',
      faculty: 'Dr. Shinu M.R. (co: Dr. Gurupriya M.)',
      dayOfWeek: 'Tuesday',
      startTime: '08:10',
      endTime: '10:25',
      room: 'Lab AS',
      type: 'lab',
      slot: 'B LAB',
      notes: 'Packet tracer & socket programming (8:10 AM - 10:25 AM)'
    },
    {
      id: 'tue-2',
      courseCode: '23CSE301',
      courseName: 'Machine Learning Lab',
      faculty: 'Dr. Debanjali (co: Mr. Bharath)',
      dayOfWeek: 'Tuesday',
      startTime: '10:50',
      endTime: '13:05',
      room: 'Lab AS',
      type: 'lab',
      slot: 'A LAB',
      notes: 'Scikit-Learn & model evaluation practicals (10:50 AM - 1:05 PM)'
    },
    {
      id: 'tue-3',
      courseCode: '23CSE303',
      courseName: 'Theory of Computation',
      faculty: 'Ms. Divya Kumari',
      dayOfWeek: 'Tuesday',
      startTime: '14:00',
      endTime: '14:50',
      room: 'C404',
      type: 'lecture',
      slot: 'C'
    },
    {
      id: 'tue-4',
      courseCode: '23CSE304',
      courseName: 'Embedded Systems',
      faculty: 'Mr. Niranjan D.K. (co: Ms. Arya Suresh)',
      dayOfWeek: 'Tuesday',
      startTime: '14:50',
      endTime: '15:40',
      room: 'C404',
      type: 'lecture',
      slot: 'D'
    },

    // ==========================================
    // WEDNESDAY
    // ==========================================
    {
      id: 'wed-1',
      courseCode: '23CSE302',
      courseName: 'Computer Networks',
      faculty: 'Dr. Shinu M.R.',
      dayOfWeek: 'Wednesday',
      startTime: '08:10',
      endTime: '09:00',
      room: 'C404',
      type: 'lecture',
      slot: 'B',
      notes: 'Includes morning prayer at 8:10 AM'
    },
    {
      id: 'wed-2',
      courseCode: '23CSE303',
      courseName: 'Theory of Computation',
      faculty: 'Ms. Divya Kumari',
      dayOfWeek: 'Wednesday',
      startTime: '09:00',
      endTime: '09:50',
      room: 'C404',
      type: 'lecture',
      slot: 'C'
    },
    {
      id: 'wed-3',
      courseCode: '23CSE473',
      courseName: 'Neural Networks & Deep Learning',
      faculty: 'Dr. Manju Venugopal',
      dayOfWeek: 'Wednesday',
      startTime: '09:50',
      endTime: '10:40',
      room: 'C404',
      type: 'lecture',
      slot: 'PE II'
    },
    {
      id: 'wed-4',
      courseCode: '23CSE471',
      courseName: 'Natural Language Processing',
      faculty: 'Dr. Nandu C. Nair',
      dayOfWeek: 'Wednesday',
      startTime: '11:00',
      endTime: '11:50',
      room: 'C404',
      type: 'lecture',
      slot: 'PE I'
    },
    {
      id: 'wed-5',
      courseCode: '23LSE301',
      courseName: 'Life Skills for Engineers III',
      faculty: 'Ms. Srinithi, Ms. Jisha Nair, Mr. Ankit Jain',
      dayOfWeek: 'Wednesday',
      startTime: '11:50',
      endTime: '12:40',
      room: 'C404',
      type: 'activity',
      slot: 'CIR'
    },
    {
      id: 'wed-6',
      courseCode: '23LSE301',
      courseName: 'Life Skills for Engineers III',
      faculty: 'CIR Faculty',
      dayOfWeek: 'Wednesday',
      startTime: '14:00',
      endTime: '14:50',
      room: 'C404',
      type: 'activity',
      slot: 'CIR'
    },
    {
      id: 'wed-7',
      courseCode: '23LSE301',
      courseName: 'Life Skills for Engineers III',
      faculty: 'CIR Faculty',
      dayOfWeek: 'Wednesday',
      startTime: '14:50',
      endTime: '15:40',
      room: 'C404',
      type: 'activity',
      slot: 'CIR'
    },

    // ==========================================
    // THURSDAY
    // ==========================================
    {
      id: 'thu-1',
      courseCode: '23CSE471',
      courseName: 'Natural Language Processing',
      faculty: 'Dr. Nandu C. Nair',
      dayOfWeek: 'Thursday',
      startTime: '08:10',
      endTime: '09:00',
      room: 'C404',
      type: 'lecture',
      slot: 'PE I'
    },
    {
      id: 'thu-2',
      courseCode: '23CSE301',
      courseName: 'Machine Learning',
      faculty: 'Dr. Debanjali',
      dayOfWeek: 'Thursday',
      startTime: '09:00',
      endTime: '09:50',
      room: 'C404',
      type: 'lecture',
      slot: 'A'
    },
    {
      id: 'thu-3',
      courseCode: '23CSE304',
      courseName: 'Embedded Systems',
      faculty: 'Mr. Niranjan D.K.',
      dayOfWeek: 'Thursday',
      startTime: '09:50',
      endTime: '10:40',
      room: 'C404',
      type: 'lecture',
      slot: 'D'
    },
    {
      id: 'thu-4',
      courseCode: '23CSE303',
      courseName: 'Theory of Computation',
      faculty: 'Ms. Divya Kumari',
      dayOfWeek: 'Thursday',
      startTime: '11:00',
      endTime: '11:50',
      room: 'C404',
      type: 'lecture',
      slot: 'C'
    },
    {
      id: 'thu-5',
      courseCode: '23ENV300',
      courseName: 'Environmental Science',
      faculty: 'Dr. Mohankumar',
      dayOfWeek: 'Thursday',
      startTime: '11:50',
      endTime: '12:40',
      room: 'C404',
      type: 'lecture',
      slot: 'EVS'
    },
    {
      id: 'thu-6',
      courseCode: '23ENV300',
      courseName: 'Environmental Science Evaluation',
      faculty: 'Dr. Mohankumar',
      dayOfWeek: 'Thursday',
      startTime: '14:00',
      endTime: '14:50',
      room: 'C404',
      type: 'tutorial',
      slot: 'EVS Evaluation'
    },
    {
      id: 'thu-7',
      courseCode: '23CSE302',
      courseName: 'Computer Networks',
      faculty: 'Dr. Shinu M.R.',
      dayOfWeek: 'Thursday',
      startTime: '14:50',
      endTime: '15:40',
      room: 'C404',
      type: 'lecture',
      slot: 'B'
    },

    // ==========================================
    // FRIDAY
    // ==========================================
    {
      id: 'fri-1',
      courseCode: '23CSE473',
      courseName: 'Neural Networks & Deep Learning',
      faculty: 'Dr. Manju Venugopal',
      dayOfWeek: 'Friday',
      startTime: '08:10',
      endTime: '09:00',
      room: 'C404',
      type: 'lecture',
      slot: 'PE II'
    },
    {
      id: 'fri-2',
      courseCode: 'COUNS',
      courseName: 'Counselling Session',
      faculty: 'Dr. Vineet Nair (Faculty Advisor)',
      dayOfWeek: 'Friday',
      startTime: '09:00',
      endTime: '09:50',
      room: 'C404',
      type: 'counselling',
      slot: 'COUNSELLING',
      notes: 'Class Committee & Student Counselling'
    },
    {
      id: 'fri-3',
      courseCode: 'EVAL',
      courseName: 'Evaluation Session',
      faculty: 'Faculty Advisors',
      dayOfWeek: 'Friday',
      startTime: '09:50',
      endTime: '10:40',
      room: 'C404',
      type: 'tutorial',
      slot: 'EVALUATION',
      notes: 'Continuous Evaluation'
    },
    {
      id: 'fri-4',
      courseCode: '23LSE301',
      courseName: 'Life Skills for Engineers III',
      faculty: 'CIR Faculty',
      dayOfWeek: 'Friday',
      startTime: '11:00',
      endTime: '11:50',
      room: 'C404',
      type: 'activity',
      slot: 'CIR'
    },
    {
      id: 'fri-5',
      courseCode: '23CSE301',
      courseName: 'Machine Learning',
      faculty: 'Dr. Debanjali',
      dayOfWeek: 'Friday',
      startTime: '11:50',
      endTime: '12:40',
      room: 'C404',
      type: 'lecture',
      slot: 'A'
    },
    {
      id: 'fri-6',
      courseCode: '23CSE302',
      courseName: 'Computer Networks',
      faculty: 'Dr. Shinu M.R.',
      dayOfWeek: 'Friday',
      startTime: '14:00',
      endTime: '14:50',
      room: 'C404',
      type: 'lecture',
      slot: 'B'
    },
    {
      id: 'fri-7',
      courseCode: '23CSE304',
      courseName: 'Embedded Systems',
      faculty: 'Mr. Niranjan D.K.',
      dayOfWeek: 'Friday',
      startTime: '14:50',
      endTime: '15:40',
      room: 'C404',
      type: 'lecture',
      slot: 'D'
    }
  ]
};
