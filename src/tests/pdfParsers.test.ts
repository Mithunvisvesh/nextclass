import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { extractPdfText, parseCMap, unescapePdfString } from '../services/pdf/pdfExtractor';
import { parseTimetable, normalizeTime } from '../services/pdf/timetableParser';
import { parseAcademicCalendar, parseDateToIso, categorizeEvent } from '../services/pdf/calendarParser';

describe('PDF Parsers & Domain Extraction', () => {
  const timetablePdfPath = path.resolve(process.cwd(), 'docs/reference/Timetable_Sem5_CSE_C.pdf');
  const calendarPdfPath = path.resolve(process.cwd(), 'docs/reference/Academic_Calendar_2026_27_Odd.pdf');

  // =========================================================================
  // GROUP A: SYNTHETIC UNIT TESTS
  // =========================================================================
  describe('Group A: Synthetic Unit Tests', () => {
    it('A1: unescapes PDF string literals (parentheses, backslashes, octal codes)', () => {
      const raw = 'Hello\\ \\(World\\)\\nTest\\101';
      const codes = unescapePdfString(raw);
      const str = String.fromCharCode(...codes);
      expect(str).toContain('Hello (World)');
      expect(str).toContain('TestA'); // \101 octal is 65 ('A')
    });

    it('A2: parses ToUnicode CMaps with beginbfrange and beginbfchar lookup tables', () => {
      const cmapStr = `
        beginbfchar
        <0001> <0020>
        endbfchar
        beginbfrange
        <0013> <0015> <0030>
        <0021> <0022> <0041>
        endbfrange
      `;
      const map = parseCMap(cmapStr);
      expect(map.get(0x01)).toBe(' ');
      expect(map.get(0x13)).toBe('0');
      expect(map.get(0x14)).toBe('1');
      expect(map.get(0x15)).toBe('2');
      expect(map.get(0x21)).toBe('A');
      expect(map.get(0x22)).toBe('B');
    });

    it('A3: throws descriptive error on non-PDF input', () => {
      expect(() => extractPdfText('This is not a pdf file')).toThrow(
        'Invalid PDF format: %PDF header not found.'
      );
    });

    it('A4: normalizes 12-hour and 24-hour time strings', () => {
      expect(normalizeTime('8:10')).toBe('08:10');
      expect(normalizeTime('9:00')).toBe('09:00');
      expect(normalizeTime('1:25', true)).toBe('13:25');
      expect(normalizeTime('2:00', true)).toBe('14:00');
      expect(normalizeTime('03:40 PM')).toBe('15:40');
    });

    it('A5: parses dates into ISO format YYYY-MM-DD', () => {
      expect(parseDateToIso('01-Jul', 2026)).toBe('2026-07-01');
      expect(parseDateToIso('14-Sep', 2026)).toBe('2026-09-14');
      expect(parseDateToIso('02-Oct', 2026)).toBe('2026-10-02');
      expect(parseDateToIso('25-Dec', 2026)).toBe('2026-12-25');
      expect(parseDateToIso('2026-09-21')).toBe('2026-09-21');
    });

    it('A6: categorizes calendar events into domain types', () => {
      // Holidays
      expect(categorizeEvent('Independence day (Holiday)').type).toBe('holiday');
      expect(categorizeEvent('Gandhi Jayanti (Holiday)').type).toBe('holiday');
      expect(categorizeEvent('Any Day', true).type).toBe('holiday');

      // Exams
      expect(categorizeEvent('Commencement of mid semester exam').type).toBe('exam');
      expect(categorizeEvent('Commencement of End Semester Exam').type).toBe('exam');

      // Vacations
      expect(categorizeEvent('Commencement of vacation for Higher Semesters').type).toBe('vacation');

      // Working Days
      expect(categorizeEvent('Instruction Day 4').type).toBe('working_day');
    });

    it('A7: recognizes Special Timetables and maps sourceWeekday', () => {
      const fridaySpec = categorizeEvent('Friday Timetable for all');
      expect(fridaySpec.type).toBe('special_timetable');
      expect(fridaySpec.sourceDay).toBe('Friday');

      const mondaySpec = categorizeEvent('Monday Timetable for all');
      expect(mondaySpec.type).toBe('special_timetable');
      expect(mondaySpec.sourceDay).toBe('Monday');

      const tuesdaySpec = categorizeEvent('Tuesday Timetable for all');
      expect(tuesdaySpec.type).toBe('special_timetable');
      expect(tuesdaySpec.sourceDay).toBe('Tuesday');
    });

    it('A8: handles arbitrary text without timetable structure gracefully without crashing', () => {
      const res = parseTimetable({
        lines: ['Hello world', 'No timetable structure here'],
        text: 'Hello world',
        pageCount: 1,
        rawStreamsCount: 1,
      });
      expect(res.success).toBe(false);
      expect(res.classes).toHaveLength(0);
    });

    it('A9: handles arbitrary text without calendar dates gracefully without crashing', () => {
      const res = parseAcademicCalendar({
        lines: ['Just some notes', 'No dates anywhere'],
        text: 'Just some notes',
        pageCount: 1,
        rawStreamsCount: 1,
      });
      expect(res.success).toBe(false);
      expect(res.entries).toHaveLength(0);
    });
  });

  // =========================================================================
  // GROUP B: REAL-PDF INTEGRATION TESTS (docs/reference/)
  // =========================================================================
  describe('Group B: Real-PDF Integration Tests', () => {
    describe('B1. Real Timetable PDF (docs/reference/Timetable_Sem5_CSE_C.pdf)', () => {
      it('B1.1: extracts raw text lines and stream objects from actual Timetable PDF', () => {
        const buf = fs.readFileSync(timetablePdfPath);
        const extracted = extractPdfText(buf);
        expect(extracted.lines.length).toBeGreaterThan(50);
        expect(extracted.text).toContain('Monday');
        expect(extracted.text).toContain('Theory Slots');
        expect(extracted.text).toContain('Lab Slots');
      });

      it('B1.2: extracts institution, room, section, term, and effective date metadata', () => {
        const buf = fs.readFileSync(timetablePdfPath);
        const res = parseTimetable(buf);

        expect(res.success).toBe(true);
        expect(res.metadata.institution).toContain('Amrita School of Computing');
        expect(res.metadata.room).toBe('C404');
        expect(res.metadata.section).toBe('C');
        expect(res.metadata.department).toBe('CSE');
        expect(res.metadata.effectiveDate).toBe('27-07-2026');
      });

      it('B1.3: verifies Monday-Friday 08:10 AM schedule commencement', () => {
        const buf = fs.readFileSync(timetablePdfPath);
        const res = parseTimetable(buf);

        // Every weekday Monday through Friday must have a class commencing at 08:10 AM
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
        for (const day of weekdays) {
          const morningClass = res.classes.find(
            c => c.dayOfWeek === day && c.startTime === '08:10'
          );
          expect(morningClass, `Expected morning class at 08:10 on ${day}`).toBeDefined();
        }
      });

      it('B1.4: verifies Tuesday 08:10-10:25 Computer Networks Lab (continuous 2h 15m)', () => {
        const buf = fs.readFileSync(timetablePdfPath);
        const res = parseTimetable(buf);

        const tuesdayLab = res.classes.find(
          c => c.dayOfWeek === 'Tuesday' && c.startTime === '08:10' && c.type === 'lab'
        );
        expect(tuesdayLab).toBeDefined();
        expect(tuesdayLab?.endTime).toBe('10:25');
        expect(tuesdayLab?.courseCode).toBe('23CSE382');
        expect(tuesdayLab?.courseName).toContain('Networks Lab');
        expect(tuesdayLab?.faculty).toContain('Dr. Shinu M.R.');
        expect(tuesdayLab?.room).toBe('C404');

        // Continuous duration check: 08:10 to 10:25 = 135 minutes = 2h 15m
        const [sh, sm] = tuesdayLab!.startTime.split(':').map(Number);
        const [eh, em] = tuesdayLab!.endTime.split(':').map(Number);
        const durationMinutes = eh * 60 + em - (sh * 60 + sm);
        expect(durationMinutes).toBe(135);
      });

      it('B1.5: verifies Tuesday 10:50-13:05 Machine Learning Lab (continuous 2h 15m)', () => {
        const buf = fs.readFileSync(timetablePdfPath);
        const res = parseTimetable(buf);

        const tuesdayLab2 = res.classes.find(
          c => c.dayOfWeek === 'Tuesday' && c.startTime === '10:50' && c.type === 'lab'
        );
        expect(tuesdayLab2).toBeDefined();
        expect(tuesdayLab2?.endTime).toBe('13:05');
        expect(tuesdayLab2?.courseCode).toBe('23CSE381');
        expect(tuesdayLab2?.courseName).toContain('Machine Learning Lab');
        expect(tuesdayLab2?.faculty).toContain('Dr. Debanjali');
        expect(tuesdayLab2?.room).toBe('C404');

        // Continuous duration check: 10:50 to 13:05 = 135 minutes = 2h 15m
        const [sh, sm] = tuesdayLab2!.startTime.split(':').map(Number);
        const [eh, em] = tuesdayLab2!.endTime.split(':').map(Number);
        const durationMinutes = eh * 60 + em - (sh * 60 + sm);
        expect(durationMinutes).toBe(135);
      });

      it('B1.6: verifies Monday 13:25-15:40 Embedded Systems Lab (continuous 2h 15m)', () => {
        const buf = fs.readFileSync(timetablePdfPath);
        const res = parseTimetable(buf);

        const mondayLab = res.classes.find(
          c => c.dayOfWeek === 'Monday' && c.startTime === '13:25' && c.type === 'lab'
        );
        expect(mondayLab).toBeDefined();
        expect(mondayLab?.endTime).toBe('15:40');
        expect(mondayLab?.courseCode).toBe('23CSE384');
        expect(mondayLab?.courseName).toContain('Embedded Systems Lab');
        expect(mondayLab?.faculty).toContain('Mr. Niranjan D.K.');
        expect(mondayLab?.room).toBe('C404');

        // Continuous duration check: 13:25 to 15:40 = 135 minutes = 2h 15m
        const [sh, sm] = mondayLab!.startTime.split(':').map(Number);
        const [eh, em] = mondayLab!.endTime.split(':').map(Number);
        const durationMinutes = eh * 60 + em - (sh * 60 + sm);
        expect(durationMinutes).toBe(135);
      });

      it('B1.7: verifies all extracted labs preserve continuous 2h15m blocks (NEVER split into 50m periods)', () => {
        const buf = fs.readFileSync(timetablePdfPath);
        const res = parseTimetable(buf);

        const allLabs = res.classes.filter(c => c.type === 'lab');
        expect(allLabs.length).toBeGreaterThanOrEqual(3);

        for (const lab of allLabs) {
          const [sh, sm] = lab.startTime.split(':').map(Number);
          const [eh, em] = lab.endTime.split(':').map(Number);
          const duration = eh * 60 + em - (sh * 60 + sm);
          expect(duration).toBe(135); // All lab periods must be exactly 135 minutes
        }
      });

      it('B1.8: extracts authentic course codes, faculty, and room numbers', () => {
        const buf = fs.readFileSync(timetablePdfPath);
        const res = parseTimetable(buf);

        const courseCodes = res.classes.map(c => c.courseCode);
        expect(courseCodes).toContain('23CSE301'); // Machine Learning
        expect(courseCodes).toContain('23CSE302'); // Computer Networks
        expect(courseCodes).toContain('23CSE303'); // Theory of Computation
        expect(courseCodes).toContain('23CSE304'); // Embedded Systems
        expect(courseCodes).toContain('23CSE352'); // Neural Networks & Deep Learning
        expect(courseCodes).toContain('23CSE472'); // Natural Language Processing
        expect(courseCodes).toContain('23LSE301'); // Life Skills for Engineers III
        expect(courseCodes).toContain('23ENV300'); // Environmental Science

        const facultyList = res.classes.map(c => c.faculty);
        expect(facultyList.some(f => f.includes('Dr. Debanjali'))).toBe(true);
        expect(facultyList.some(f => f.includes('Dr. Shinu M.R.'))).toBe(true);
        expect(facultyList.some(f => f.includes('Ms. Divya Kumari'))).toBe(true);
        expect(facultyList.some(f => f.includes('Mr. Niranjan D.K.'))).toBe(true);
        expect(facultyList.some(f => f.includes('Dr. Manju Venugopal'))).toBe(true);

        const rooms = new Set(res.classes.map(c => c.room));
        expect(rooms.has('C404')).toBe(true);
      });

      it('B1.9: verifies parser accepts Base64 input (matching Android FileSystem read)', () => {
        const base64 = fs.readFileSync(timetablePdfPath).toString('base64');
        const res = parseTimetable(base64);
        expect(res.success).toBe(true);
        expect(res.classes.length).toBeGreaterThan(20);
        expect(res.metadata.room).toBe('C404');
      });
    });

    describe('B2. Real Academic Calendar PDF (docs/reference/Academic_Calendar_2026_27_Odd.pdf)', () => {
      it('B2.1: extracts raw text lines and stream objects from actual Calendar PDF', () => {
        const buf = fs.readFileSync(calendarPdfPath);
        const extracted = extractPdfText(buf);
        expect(extracted.lines.length).toBeGreaterThan(100);
        expect(extracted.text).toContain('01-Jul');
        expect(extracted.text).toContain('Holiday');
      });

      it('B2.2: extracts calendar metadata (term and academic year)', () => {
        const buf = fs.readFileSync(calendarPdfPath);
        const res = parseAcademicCalendar(buf);

        expect(res.success).toBe(true);
        expect(res.metadata.term).toBe('Odd Semester');
        expect(res.metadata.academicYear).toContain('2026-27');
        expect(res.entries.length).toBeGreaterThan(30);
      });

      it('B2.3: extracts college holidays from actual calendar', () => {
        const buf = fs.readFileSync(calendarPdfPath);
        const res = parseAcademicCalendar(buf);

        const holidays = res.entries.filter(e => e.type === 'holiday');
        expect(holidays.length).toBeGreaterThan(10);

        // Verify holiday titles exist in entries
        const titles = holidays.map(h => h.title);
        expect(titles.some(t => /holiday/i.test(t))).toBe(true);
      });

      it('B2.4: extracts instructional / working day information', () => {
        const buf = fs.readFileSync(calendarPdfPath);
        const res = parseAcademicCalendar(buf);

        // Working days / instructional events
        const workingOrInstructional = res.entries.filter(
          e => e.type === 'working_day' || /instruction|commencement/i.test(e.title)
        );
        expect(workingOrInstructional.length).toBeGreaterThan(0);
      });

      it('B2.5: extracts vacation information from actual calendar', () => {
        const buf = fs.readFileSync(calendarPdfPath);
        const res = parseAcademicCalendar(buf);

        const vacations = res.entries.filter(e => e.type === 'vacation');
        expect(vacations.length).toBeGreaterThan(0);
        expect(vacations.some(v => /vacation/i.test(v.title))).toBe(true);
      });

      it('B2.6: extracts Special Timetable directives and maps source weekdays', () => {
        const buf = fs.readFileSync(calendarPdfPath);
        const res = parseAcademicCalendar(buf);

        const specialTimetables = res.entries.filter(e => e.type === 'special_timetable');
        expect(specialTimetables.length).toBeGreaterThan(0);

        // Verify Friday Timetable for all
        const fridayEntry = specialTimetables.find(e => e.timetableSourceDay === 'Friday');
        expect(fridayEntry).toBeDefined();
        expect(fridayEntry?.title).toContain('Friday Timetable for all');

        // Verify Monday Timetable for all
        const mondayEntry = specialTimetables.find(e => e.timetableSourceDay === 'Monday');
        expect(mondayEntry).toBeDefined();
        expect(mondayEntry?.title).toContain('Monday Timetable for all');

        // Verify Tuesday Timetable for all
        const tuesdayEntry = specialTimetables.find(e => e.timetableSourceDay === 'Tuesday');
        expect(tuesdayEntry).toBeDefined();
        expect(tuesdayEntry?.title).toContain('Tuesday Timetable for all');
      });

      it('B2.7: verifies calendar parser accepts Base64 input (matching Android FileSystem read)', () => {
        const base64 = fs.readFileSync(calendarPdfPath).toString('base64');
        const res = parseAcademicCalendar(base64);
        expect(res.success).toBe(true);
        expect(res.entries.length).toBeGreaterThan(30);
      });
    });
  });
});
