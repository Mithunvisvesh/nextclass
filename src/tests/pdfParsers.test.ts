import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { extractPdfText, parseCMap, unescapePdfString } from '../services/pdf/pdfExtractor';
import { parseTimetable, normalizeTime } from '../services/pdf/timetableParser';
import { parseAcademicCalendar, parseDateToIso, categorizeEvent } from '../services/pdf/calendarParser';

describe('PDF Parsers & Domain Extraction', () => {
  const timetablePdfPath = path.resolve(process.cwd(), 'docs/reference/Timetable_Sem5_CSE_C.pdf');
  const calendarPdfPath = path.resolve(process.cwd(), 'docs/reference/Academic_Calendar_2026_27_Odd.pdf');

  describe('1. PDF Stream & Text Extractor', () => {
    it('unescapes PDF string literals correctly', () => {
      const raw = 'Hello\\ \\(World\\)\\nTest\\101';
      const codes = unescapePdfString(raw);
      const str = String.fromCharCode(...codes);
      expect(str).toContain('Hello (World)');
      expect(str).toContain('TestA'); // \101 octal is 65 ('A')
    });

    it('parses ToUnicode CMaps with beginbfrange correctly', () => {
      const cmapStr = `
        beginbfrange
        <0013> <0015> <0030>
        <0021> <0022> <0041>
        endbfrange
      `;
      const map = parseCMap(cmapStr);
      expect(map.get(0x13)).toBe('0');
      expect(map.get(0x14)).toBe('1');
      expect(map.get(0x15)).toBe('2');
      expect(map.get(0x21)).toBe('A');
      expect(map.get(0x22)).toBe('B');
    });

    it('extracts text lines from actual Timetable reference PDF', () => {
      const buf = fs.readFileSync(timetablePdfPath);
      const extracted = extractPdfText(buf);
      expect(extracted.lines.length).toBeGreaterThan(50);
      expect(extracted.text).toContain('Monday');
      expect(extracted.text).toContain('Theory Slots');
      expect(extracted.text).toContain('Lab Slots');
    });

    it('extracts text lines from actual Academic Calendar reference PDF', () => {
      const buf = fs.readFileSync(calendarPdfPath);
      const extracted = extractPdfText(buf);
      expect(extracted.lines.length).toBeGreaterThan(100);
      expect(extracted.text).toContain('01-Jul');
      expect(extracted.text).toContain('Holiday');
    });

    it('throws on non-PDF input', () => {
      expect(() => extractPdfText('This is not a pdf file')).toThrow();
    });
  });

  describe('2. Timetable Parser', () => {
    it('normalizes 12-hour and 24-hour time strings', () => {
      expect(normalizeTime('8:10')).toBe('08:10');
      expect(normalizeTime('9:00')).toBe('09:00');
      expect(normalizeTime('1:25', true)).toBe('13:25');
      expect(normalizeTime('2:00', true)).toBe('14:00');
      expect(normalizeTime('03:40 PM')).toBe('15:40');
    });

    it('extracts metadata from reference Timetable PDF', () => {
      const buf = fs.readFileSync(timetablePdfPath);
      const res = parseTimetable(buf);

      expect(res.success).toBe(true);
      expect(res.classes.length).toBeGreaterThan(15);
      expect(res.metadata.institution).toContain('Amrita School of Computing');
      expect(res.metadata.room).toBe('C404');
      expect(res.metadata.effectiveDate).toBe('27-07-2026');
    });

    it('extracts weekdays and course codes', () => {
      const buf = fs.readFileSync(timetablePdfPath);
      const res = parseTimetable(buf);

      const weekdays = new Set(res.classes.map(c => c.dayOfWeek));
      expect(weekdays.has('Monday')).toBe(true);
      expect(weekdays.has('Tuesday')).toBe(true);
      expect(weekdays.has('Wednesday')).toBe(true);
      expect(weekdays.has('Thursday')).toBe(true);
      expect(weekdays.has('Friday')).toBe(true);

      const courseCodes = res.classes.map(c => c.courseCode);
      expect(courseCodes).toContain('23CSE301'); // Machine Learning
      expect(courseCodes).toContain('23CSE302'); // Computer Networks
      expect(courseCodes).toContain('23CSE303'); // Theory of Computation
      expect(courseCodes).toContain('23CSE304'); // Embedded Systems
    });

    it('PRESERVES continuous lab blocks (DO NOT split into 50-minute classes)', () => {
      const buf = fs.readFileSync(timetablePdfPath);
      const res = parseTimetable(buf);

      // Verify Tuesday B LAB (Networks Lab): 08:10 to 10:25 (duration = 135 mins = 2h 15m)
      const tuesdayLab = res.classes.find(
        c => c.dayOfWeek === 'Tuesday' && c.startTime === '08:10' && c.type === 'lab'
      );
      expect(tuesdayLab).toBeDefined();
      expect(tuesdayLab?.endTime).toBe('10:25');
      expect(tuesdayLab?.courseName).toContain('Networks Lab');

      // Verify Tuesday A LAB (ML Lab): 10:50 to 13:05 (duration = 135 mins = 2h 15m)
      const tuesdayLab2 = res.classes.find(
        c => c.dayOfWeek === 'Tuesday' && c.startTime === '10:50' && c.type === 'lab'
      );
      expect(tuesdayLab2).toBeDefined();
      expect(tuesdayLab2?.endTime).toBe('13:05');
      expect(tuesdayLab2?.courseName).toContain('Machine Learning Lab');

      // Verify Monday D LAB (Embedded Lab): 13:25 to 15:40 (duration = 135 mins = 2h 15m)
      const mondayLab = res.classes.find(
        c => c.dayOfWeek === 'Monday' && c.startTime === '13:25' && c.type === 'lab'
      );
      expect(mondayLab).toBeDefined();
      expect(mondayLab?.endTime).toBe('15:40');
      expect(mondayLab?.courseName).toContain('Embedded Systems Lab');
    });

    it('handles incomplete / empty text gracefully without crashing', () => {
      const res = parseTimetable({
        lines: ['Hello world', 'No timetable structure here'],
        text: 'Hello world',
        pageCount: 1,
        rawStreamsCount: 1,
      });
      expect(res.success).toBe(false);
      expect(res.classes).toHaveLength(0);
    });
  });

  describe('3. Academic Calendar Parser', () => {
    it('parses dates into ISO format', () => {
      expect(parseDateToIso('01-Jul', 2026)).toBe('2026-07-01');
      expect(parseDateToIso('14-Sep', 2026)).toBe('2026-09-14');
      expect(parseDateToIso('02-Oct', 2026)).toBe('2026-10-02');
      expect(parseDateToIso('25-Dec', 2026)).toBe('2026-12-25');
      expect(parseDateToIso('2026-09-21')).toBe('2026-09-21');
    });

    it('categorizes events correctly', () => {
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

    it('CRITICAL: Recognizes Special Timetables and maps sourceWeekday', () => {
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

    it('extracts events from actual Academic Calendar reference PDF', () => {
      const buf = fs.readFileSync(calendarPdfPath);
      const res = parseAcademicCalendar(buf);

      expect(res.success).toBe(true);
      expect(res.entries.length).toBeGreaterThan(30);

      // Check holidays exist
      const holidays = res.entries.filter(e => e.type === 'holiday');
      expect(holidays.length).toBeGreaterThan(5);

      // Check special timetables exist and have correct timetableSourceDay
      const specialTimetables = res.entries.filter(e => e.type === 'special_timetable');
      expect(specialTimetables.length).toBeGreaterThan(0);
      expect(specialTimetables.some(e => e.timetableSourceDay === 'Friday')).toBe(true);
      expect(specialTimetables.some(e => e.timetableSourceDay === 'Monday')).toBe(true);
    });

    it('handles malformed calendar input gracefully without crashing', () => {
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
});
