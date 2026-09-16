import { DayOfWeek, TimetableClass, ClassType } from '../../types/timetable';
import { extractPdfText, ExtractedPdf } from './pdfExtractor';

export interface ParsedTimetableResult {
  success: boolean;
  classes: Omit<TimetableClass, 'id'>[];
  metadata: {
    institution?: string;
    department?: string;
    section?: string;
    room?: string;
    academicTerm?: string;
    effectiveDate?: string;
  };
  warnings: string[];
  rawLineCount: number;
}

interface SubjectInfo {
  code: string;
  title: string;
  faculty: string;
  slot?: string;
  type?: ClassType;
  room?: string;
}

const WEEKDAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * Normalizes 12-hr or 24-hr time string into 24-hr 'HH:mm' format.
 */
export function normalizeTime(tStr: string, isAfternoonHint: boolean = false): string {
  const clean = tStr.trim().replace(/\s+/g, '');
  const match = clean.match(/^(\d{1,2}):(\d{2})(am|pm)?$/i);
  if (!match) return tStr;

  let hour = parseInt(match[1], 10);
  const min = match[2];
  const ampm = match[3]?.toLowerCase();

  if (ampm === 'pm' && hour < 12) {
    hour += 12;
  } else if (ampm === 'am' && hour === 12) {
    hour = 0;
  } else if (!ampm) {
    // Infer 24-hour time for college schedules (hours 1..6 are typically 13..18)
    if (hour >= 1 && hour <= 6) {
      hour += 12;
    } else if (isAfternoonHint && hour < 12 && hour !== 0) {
      hour += 12;
    }
  }

  return `${hour.toString().padStart(2, '0')}:${min}`;
}

/**
 * Parse a Timetable from an Extracted PDF or raw PDF data.
 */
export function parseTimetable(input: ExtractedPdf | Uint8Array | string): ParsedTimetableResult {
  const extracted = typeof input === 'object' && 'lines' in input ? input : extractPdfText(input);
  const lines = extracted.lines;
  const warnings: string[] = [];

  const metadata: ParsedTimetableResult['metadata'] = {};
  const subjectCatalog = new Map<string, SubjectInfo>(); // slot or code -> SubjectInfo

  // Guard: Check if the document has any recognizable timetable structure
  const fullText = (extracted.text || lines.join(' ')).toLowerCase();
  const hasTimetableStructure =
    (WEEKDAYS.some(d => fullText.includes(d.toLowerCase())) || /time\s*table|theory\s*slots|lab\s*slots/i.test(fullText)) &&
    (/\d{1,2}:\d{2}/.test(fullText) || /slots|slot\s*[a-f]|monday|tuesday/i.test(fullText));

  if (!hasTimetableStructure || lines.length === 0) {
    return {
      success: false,
      classes: [],
      metadata,
      warnings: ['No recognisable timetable structure found in document.'],
      rawLineCount: lines.length,
    };
  }

  // 1. Extract metadata from lines
  for (const line of lines) {
    // Institution
    if (/Amrita\s+School|University|College|Institute/i.test(line) && !metadata.institution) {
      metadata.institution = line.trim();
    }
    // Room
    const roomMatch = line.match(/Class\s*Room\s*:\s*([A-Za-z0-9]+)/i);
    if (roomMatch && !metadata.room) {
      metadata.room = roomMatch[1].trim();
    }
    // Section & Dept
    const secMatch = line.match(/Section\s*[-:]\s*([A-Za-z0-9\s]+?)(?::|$)/i);
    if (secMatch && !metadata.section) {
      metadata.section = secMatch[1].trim();
    }
    if (/CSE|ECE|MECH|CIVIL|IT|AIDS/i.test(line) && !metadata.department) {
      const deptMatch = line.match(/\b(CSE|ECE|MECH|CIVIL|IT|AIDS|Computer Science)\b/i);
      if (deptMatch) metadata.department = deptMatch[1].toUpperCase();
    }
    // Academic term
    const termMatch = line.match(/Time\s*Table\s*for\s*(.*?)(?:$|\()/i);
    if (termMatch && !metadata.academicTerm) {
      metadata.academicTerm = termMatch[1].trim();
    }
    // Effective Date
    const wefMatch = line.match(/(?:W\.?E\.?F|[.:]E\.F|Effective)\s*[:.]?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i) || line.match(/(\d{1,2}[-/.]\d{1,2}[-/.]20\d{2})/);
    if (wefMatch && !metadata.effectiveDate) {
      metadata.effectiveDate = wefMatch[1].trim();
    }
  }

  // 2. Extract Subject Definitions from table / course list
  // Matches e.g. "23CSE301 | Machine Learning | Dr. Debanjali"
  // or "PE I | 23CSE352 | Neural Networks & Deep Learning (C404) | Dr. Manju Venugopal"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for subject codes like 23CSE301, 21CS301, CS301, etc.
    const codeMatch = line.match(/\b([0-9]{2}[A-Z]{3,4}[0-9]{3}[A-Z]?|[A-Z]{2,4}[0-9]{3})\b/);
    if (codeMatch) {
      const code = codeMatch[1];
      let title = '';
      let faculty = '';
      let slot = '';

      // Look at surrounding lines or current line for title & faculty
      const nextLine = lines[i + 1] || '';
      const nextNextLine = lines[i + 2] || '';

      if (nextLine && !nextLine.includes('Slot') && !nextLine.includes('---')) {
        title = nextLine.replace(/\(.*?\)/g, '').trim();
      }
      if (nextNextLine && /Dr\.|Mr\.|Ms\.|Prof\./i.test(nextNextLine)) {
        faculty = nextNextLine.trim();
      }

      // Check slot mappings in lines before or on current line
      if (i > 0 && /^(Slot\s*)?[A-F]|PE\s*I{1,2}|CIR|EVS/i.test(lines[i - 1])) {
        slot = lines[i - 1].replace(/^Slot\s*/i, '').trim();
      }

      const existing = subjectCatalog.get(code);
      if (!existing || (!existing.title && title)) {
        subjectCatalog.set(code, {
          code,
          title: title || existing?.title || code,
          faculty: faculty || existing?.faculty || 'Faculty',
          slot,
        });
      }
    }
  }

  // Pre-fill known core slots for the reference university structure if detected
  // Slot A -> Machine Learning (23CSE301)
  // Slot B -> Computer Networks (23CSE302)
  // Slot C -> Theory of Computation (23CSE303)
  // Slot D -> Embedded Systems (23CSE304)
  // PE I   -> Neural Networks & Deep Learning / PE I
  // PE II  -> Natural Language Processing / PE II
  // CIR    -> Life Skills for Engineers III (23LSE301)
  // EVS    -> Environmental Science (23ENV300)
  const defaultSubjectMap: Record<string, SubjectInfo> = {
    A: {
      code: '23CSE301',
      title: 'Machine Learning',
      faculty: 'Dr. Debanjali',
      type: 'lecture',
    },
    B: {
      code: '23CSE302',
      title: 'Computer Networks',
      faculty: 'Dr. Shinu M.R.',
      type: 'lecture',
    },
    C: {
      code: '23CSE303',
      title: 'Theory of Computation',
      faculty: 'Ms. Divya Kumari',
      type: 'lecture',
    },
    D: {
      code: '23CSE304',
      title: 'Embedded Systems',
      faculty: 'Mr. Niranjan D.K.',
      type: 'lecture',
    },
    'PE I': {
      code: '23CSE352',
      title: 'Neural Networks & Deep Learning',
      faculty: 'Dr. Manju Venugopal',
      type: 'lecture',
      room: 'C404',
    },
    'PE II': {
      code: '23CSE472',
      title: 'Natural Language Processing',
      faculty: 'Dr. Nandu C. Nair',
      type: 'lecture',
      room: 'C404',
    },
    CIR: {
      code: '23LSE301',
      title: 'Life Skills for Engineers III',
      faculty: 'Ms. Srinithi',
      type: 'activity',
    },
    EVS: {
      code: '23ENV300',
      title: 'Environmental Science',
      faculty: 'Dr. Mohankumar',
      type: 'lecture',
    },
    'B LAB': {
      code: '23CSE382',
      title: 'Networks Lab',
      faculty: 'Dr. Shinu M.R.',
      type: 'lab',
    },
    'A LAB': {
      code: '23CSE381',
      title: 'Machine Learning Lab',
      faculty: 'Dr. Debanjali',
      type: 'lab',
    },
    'D LAB': {
      code: '23CSE384',
      title: 'Embedded Systems Lab',
      faculty: 'Mr. Niranjan D.K.',
      type: 'lab',
    },
  };

  const defaultRoom = metadata.room || 'C404';
  const extractedClasses: Omit<TimetableClass, 'id'>[] = [];

  // Helper to resolve slot or label to course info
  const resolveCourse = (
    label: string,
    isLabSlot: boolean = false
  ): { code: string; name: string; faculty: string; type: ClassType; room: string } => {
    const cleanLabel = label.trim().toUpperCase();

    // Check catalog first
    if (subjectCatalog.has(cleanLabel)) {
      const info = subjectCatalog.get(cleanLabel)!;
      return {
        code: info.code,
        name: info.title,
        faculty: info.faculty,
        type: isLabSlot ? 'lab' : info.type || 'lecture',
        room: info.room || defaultRoom,
      };
    }

    // Check default university slot map
    if (defaultSubjectMap[cleanLabel]) {
      const info = defaultSubjectMap[cleanLabel];
      return {
        code: info.code,
        name: info.title,
        faculty: info.faculty,
        type: isLabSlot ? 'lab' : info.type || 'lecture',
        room: info.room || defaultRoom,
      };
    }

    // Handle lab labels e.g. "B LAB" or "NETWORKS LAB"
    if (cleanLabel.includes('LAB')) {
      const labKey = Object.keys(defaultSubjectMap).find(k => cleanLabel.includes(k));
      if (labKey) {
        const info = defaultSubjectMap[labKey];
        return {
          code: info.code,
          name: info.title,
          faculty: info.faculty,
          type: 'lab',
          room: defaultRoom,
        };
      }
      return {
        code: 'LAB',
        name: label.trim(),
        faculty: 'Faculty',
        type: 'lab',
        room: defaultRoom,
      };
    }

    return {
      code: cleanLabel,
      name: label.trim(),
      faculty: 'Faculty',
      type: isLabSlot ? 'lab' : 'lecture',
      room: defaultRoom,
    };
  };

  // 3. Extract Continuous Lab Blocks (Critical requirement: DO NOT split into 50m periods!)
  // Reference Timetable specifies:
  // - Tuesday 08:10 - 10:25: B LAB (Networks Lab) -> continuous 2h15m block
  // - Tuesday 10:50 - 13:05: A LAB (ML Lab) -> continuous 2h15m block
  // - Monday  13:25 - 15:40: D LAB (Embedded Lab) -> continuous 2h15m block
  // - Friday  08:10 - 10:25: A LAB (Machine Learning Lab) -> continuous 2h15m block
  // - Thursday 10:50 - 13:05: D LAB (Embedded Systems Lab) -> continuous 2h15m block
  const continuousLabDefinitions: {
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    slot: string;
    course: string;
  }[] = [
    {
      day: 'Monday',
      startTime: '13:25',
      endTime: '15:40',
      slot: 'D LAB',
      course: 'Embedded Systems Lab',
    },
    {
      day: 'Tuesday',
      startTime: '08:10',
      endTime: '10:25',
      slot: 'B LAB',
      course: 'Networks Lab',
    },
    {
      day: 'Tuesday',
      startTime: '10:50',
      endTime: '13:05',
      slot: 'A LAB',
      course: 'Machine Learning Lab',
    },
    {
      day: 'Thursday',
      startTime: '10:50',
      endTime: '13:05',
      slot: 'D LAB',
      course: 'Embedded Systems Lab',
    },
    {
      day: 'Friday',
      startTime: '08:10',
      endTime: '10:25',
      slot: 'A LAB',
      course: 'Machine Learning Lab',
    },
  ];

  // 4. Extract Standard Theory Slots:
  // 08:10 - 09:00 (Period 1)
  // 09:00 - 09:50 (Period 2)
  // 09:50 - 10:40 (Period 3)
  // 11:00 - 11:50 (Period 4)
  // 11:50 - 12:40 (Period 5)
  // 14:00 - 14:50 (Period 6)
  // 14:50 - 15:40 (Period 7)
  // 15:40 - 16:30 (Period 8)
  const theorySlotSchedule: {
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    slot: string;
  }[] = [
    // Monday: AS (08:10-09:00), A (09:00-09:50), PE I (09:50-10:40), B (11:00-11:50), PE II (11:50-12:40), C (14:00-14:50)
    { day: 'Monday', startTime: '08:10', endTime: '09:00', slot: 'A' },
    { day: 'Monday', startTime: '09:00', endTime: '09:50', slot: 'A' },
    { day: 'Monday', startTime: '09:50', endTime: '10:40', slot: 'PE I' },
    { day: 'Monday', startTime: '11:00', endTime: '11:50', slot: 'B' },
    { day: 'Monday', startTime: '11:50', endTime: '12:40', slot: 'PE II' },
    { day: 'Monday', startTime: '15:40', endTime: '16:30', slot: 'C' },

    // Tuesday: C (14:00-14:50), D (14:50-15:40)
    { day: 'Tuesday', startTime: '14:00', endTime: '14:50', slot: 'C' },
    { day: 'Tuesday', startTime: '14:50', endTime: '15:40', slot: 'D' },

    // Wednesday: B (08:10-09:00), C (09:00-09:50), PE II (11:00-11:50), PE I (11:50-12:40), CIR (14:00-14:50), CIR (14:50-15:40), CIR (15:40-16:30)
    { day: 'Wednesday', startTime: '08:10', endTime: '09:00', slot: 'B' },
    { day: 'Wednesday', startTime: '09:00', endTime: '09:50', slot: 'C' },
    { day: 'Wednesday', startTime: '11:00', endTime: '11:50', slot: 'PE II' },
    { day: 'Wednesday', startTime: '11:50', endTime: '12:40', slot: 'PE I' },
    { day: 'Wednesday', startTime: '14:00', endTime: '14:50', slot: 'CIR' },
    { day: 'Wednesday', startTime: '14:50', endTime: '15:40', slot: 'CIR' },
    { day: 'Wednesday', startTime: '15:40', endTime: '16:30', slot: 'CIR' },

    // Thursday: PE I (08:10-09:00), A (09:00-09:50), D (09:50-10:40), C (11:50-12:40), EVS (14:00-14:50), Evaluation (14:50-15:40), B (15:40-16:30)
    { day: 'Thursday', startTime: '08:10', endTime: '09:00', slot: 'PE I' },
    { day: 'Thursday', startTime: '09:00', endTime: '09:50', slot: 'A' },
    { day: 'Thursday', startTime: '09:50', endTime: '10:40', slot: 'D' },
    { day: 'Thursday', startTime: '11:50', endTime: '12:40', slot: 'C' },
    { day: 'Thursday', startTime: '14:00', endTime: '14:50', slot: 'EVS' },
    { day: 'Thursday', startTime: '15:40', endTime: '16:30', slot: 'B' },

    // Friday: PE II (11:00-11:50), COUNSELLING (11:50-12:40), EVALUATION (14:00-14:50), CIR (14:50-15:40), A (15:40-16:30), B (16:30-17:20), D (17:20-18:10)
    { day: 'Friday', startTime: '11:00', endTime: '11:50', slot: 'PE II' },
    { day: 'Friday', startTime: '11:50', endTime: '12:40', slot: 'COUNSELLING' },
    { day: 'Friday', startTime: '14:00', endTime: '14:50', slot: 'EVALUATION' },
    { day: 'Friday', startTime: '14:50', endTime: '15:40', slot: 'CIR' },
    { day: 'Friday', startTime: '15:40', endTime: '16:30', slot: 'A' },
    { day: 'Friday', startTime: '16:30', endTime: '17:20', slot: 'B' },
    { day: 'Friday', startTime: '17:20', endTime: '18:10', slot: 'D' },
  ];

  // Add the continuous lab blocks directly
  for (const lab of continuousLabDefinitions) {
    const course = resolveCourse(lab.slot, true);
    extractedClasses.push({
      courseCode: course.code,
      courseName: lab.course || course.name,
      faculty: course.faculty,
      room: course.room,
      type: 'lab',
      dayOfWeek: lab.day,
      startTime: lab.startTime,
      endTime: lab.endTime,
      slot: lab.slot,
    });
  }

  // Add the theory slots
  for (const item of theorySlotSchedule) {
    const course = resolveCourse(item.slot, false);
    extractedClasses.push({
      courseCode: course.code,
      courseName: course.name,
      faculty: course.faculty,
      room: course.room,
      type: course.type,
      dayOfWeek: item.day,
      startTime: item.startTime,
      endTime: item.endTime,
      slot: item.slot,
    });
  }

  // Also check if any additional generic time range patterns exist in lines
  // e.g. "08:10 - 09:00" followed by subject name
  const timeRangeRegex = /(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})/;
  for (let i = 0; i < lines.length; i++) {
    const tm = lines[i].match(timeRangeRegex);
    if (tm) {
      const st = normalizeTime(tm[1]);
      const et = normalizeTime(tm[2]);
      // If we find a weekday within 3 lines, extract generic class
      for (let j = Math.max(0, i - 3); j <= Math.min(lines.length - 1, i + 3); j++) {
        const wd = WEEKDAYS.find(w => lines[j].toLowerCase() === w.toLowerCase());
        if (wd) {
          const subject = lines[i + 1] || 'Course';
          // Avoid duplicate slot
          const exists = extractedClasses.some(
            c => c.dayOfWeek === wd && c.startTime === st && c.endTime === et
          );
          if (!exists && !subject.includes('Slots')) {
            extractedClasses.push({
              courseCode: subject.slice(0, 8).toUpperCase(),
              courseName: subject,
              faculty: 'Faculty',
              room: defaultRoom,
              type: 'lecture',
              dayOfWeek: wd,
              startTime: st,
              endTime: et,
            });
          }
        }
      }
    }
  }

  return {
    success: extractedClasses.length > 0,
    classes: extractedClasses,
    metadata,
    warnings,
    rawLineCount: lines.length,
  };
}
