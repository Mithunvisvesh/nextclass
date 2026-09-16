import { WeeklyTimetable } from '../types/timetable';

export const DEMO_TIMETABLE: WeeklyTimetable = {
  id: 'demo-timetable-sem5',
  name: 'Sample B.Tech CSE Semester 5 Timetable',
  academicTerm: 'Odd Semester 2026-27',
  classes: [
    // --- MONDAY ---
    {
      id: 'mon-1',
      courseCode: '23CSE301',
      courseName: 'Machine Learning',
      faculty: 'Dr. Debanjali',
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '09:50',
      room: 'C404',
      type: 'lecture',
      slot: 'A',
      notes: 'Bring laptop for ML practical concepts'
    },
    {
      id: 'mon-2',
      courseCode: '23CSE471',
      courseName: 'Natural Language Processing',
      faculty: 'Dr. Nandu C. Nair',
      dayOfWeek: 'Monday',
      startTime: '09:50',
      endTime: '10:40',
      room: 'D205',
      type: 'lecture',
      slot: 'PE I',
      notes: 'Professional Elective I'
    },
    {
      id: 'mon-3',
      courseCode: '23CSE302',
      courseName: 'Computer Networks',
      faculty: 'Dr. Shinu M.R.',
      dayOfWeek: 'Monday',
      startTime: '11:00',
      endTime: '11:50',
      room: 'C404',
      type: 'lecture',
      slot: 'B',
      notes: 'Transport Layer protocols'
    },
    {
      id: 'mon-4',
      courseCode: '23CSE473',
      courseName: 'Neural Networks & Deep Learning',
      faculty: 'Dr. Manju Venugopal',
      dayOfWeek: 'Monday',
      startTime: '11:50',
      endTime: '12:40',
      room: 'C404',
      type: 'lecture',
      slot: 'PE II',
      notes: 'Backpropagation derivation'
    },
    {
      id: 'mon-5',
      courseCode: '23CSE303',
      courseName: 'Theory of Computation',
      faculty: 'Ms. Divya Kumari',
      dayOfWeek: 'Monday',
      startTime: '14:00',
      endTime: '14:50',
      room: 'C404',
      type: 'lecture',
      slot: 'C',
      notes: 'Turing Machines and Decidability'
    },

    // --- TUESDAY ---
    {
      id: 'tue-1',
      courseCode: '23CSE303',
      courseName: 'Theory of Computation',
      faculty: 'Ms. Divya Kumari',
      dayOfWeek: 'Tuesday',
      startTime: '09:00',
      endTime: '09:50',
      room: 'C404',
      type: 'lecture',
      slot: 'C'
    },
    {
      id: 'tue-2',
      courseCode: '23CSE304',
      courseName: 'Embedded Systems',
      faculty: 'Mr. Niranjan D.K.',
      dayOfWeek: 'Tuesday',
      startTime: '09:50',
      endTime: '10:40',
      room: 'C404',
      type: 'lecture',
      slot: 'D'
    },
    {
      id: 'tue-3',
      courseCode: '23CSE302',
      courseName: 'Computer Networks Lab',
      faculty: 'Dr. Shinu M.R.',
      dayOfWeek: 'Tuesday',
      startTime: '10:50',
      endTime: '13:05',
      room: 'Lab AS',
      type: 'lab',
      slot: 'B LAB',
      notes: 'Socket programming in C/Python'
    },
    {
      id: 'tue-4',
      courseCode: '23CSE301',
      courseName: 'Machine Learning Lab',
      faculty: 'Dr. Debanjali',
      dayOfWeek: 'Tuesday',
      startTime: '14:00',
      endTime: '15:40',
      room: 'Lab AS',
      type: 'lab',
      slot: 'A LAB',
      notes: 'Scikit-learn classification models'
    },

    // --- WEDNESDAY ---
    {
      id: 'wed-1',
      courseCode: '23CSE302',
      courseName: 'Computer Networks',
      faculty: 'Dr. Shinu M.R.',
      dayOfWeek: 'Wednesday',
      startTime: '09:00',
      endTime: '09:50',
      room: 'C404',
      type: 'lecture',
      slot: 'B'
    },
    {
      id: 'wed-2',
      courseCode: '23CSE303',
      courseName: 'Theory of Computation',
      faculty: 'Ms. Divya Kumari',
      dayOfWeek: 'Wednesday',
      startTime: '09:50',
      endTime: '10:40',
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
      startTime: '11:00',
      endTime: '11:50',
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
      startTime: '11:50',
      endTime: '12:40',
      room: 'C404',
      type: 'lecture',
      slot: 'PE I'
    },
    {
      id: 'wed-5',
      courseCode: '23LSE301',
      courseName: 'Life Skills for Engineers III',
      faculty: 'Ms. Srinithi / Ms. Jisha Nair',
      dayOfWeek: 'Wednesday',
      startTime: '14:00',
      endTime: '16:20',
      room: 'C404',
      type: 'activity',
      slot: 'CIR',
      notes: 'Aptitude and verbal reasoning'
    },

    // --- THURSDAY ---
    {
      id: 'thu-1',
      courseCode: '23CSE471',
      courseName: 'Natural Language Processing',
      faculty: 'Dr. Nandu C. Nair',
      dayOfWeek: 'Thursday',
      startTime: '09:00',
      endTime: '09:50',
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
      startTime: '09:50',
      endTime: '10:40',
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
      startTime: '11:00',
      endTime: '11:50',
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
      startTime: '11:50',
      endTime: '12:40',
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
      startTime: '14:00',
      endTime: '14:50',
      room: 'C404',
      type: 'lecture',
      slot: 'EVS',
      notes: 'EVS continuous evaluation'
    },
    {
      id: 'thu-6',
      courseCode: '23CSE302',
      courseName: 'Computer Networks',
      faculty: 'Dr. Shinu M.R.',
      dayOfWeek: 'Thursday',
      startTime: '14:50',
      endTime: '15:40',
      room: 'C404',
      type: 'tutorial',
      slot: 'B'
    },

    // --- FRIDAY ---
    {
      id: 'fri-1',
      courseCode: '23CSE304',
      courseName: 'Embedded Systems Lab',
      faculty: 'Mr. Niranjan D.K.',
      dayOfWeek: 'Friday',
      startTime: '08:10',
      endTime: '10:25',
      room: 'Lab AS',
      type: 'lab',
      slot: 'D LAB',
      notes: 'ARM Cortex-M peripheral interfacing'
    },
    {
      id: 'fri-2',
      courseCode: '23CSE473',
      courseName: 'Neural Networks & Deep Learning',
      faculty: 'Dr. Manju Venugopal',
      dayOfWeek: 'Friday',
      startTime: '09:00',
      endTime: '09:50',
      room: 'C404',
      type: 'lecture',
      slot: 'PE II'
    },
    {
      id: 'fri-3',
      courseCode: '23LSE301',
      courseName: 'Life Skills & Counselling',
      faculty: 'Faculty Advisors',
      dayOfWeek: 'Friday',
      startTime: '09:50',
      endTime: '10:40',
      room: 'C404',
      type: 'counselling',
      slot: 'CIR'
    },
    {
      id: 'fri-4',
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
      id: 'fri-5',
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
      id: 'fri-6',
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
