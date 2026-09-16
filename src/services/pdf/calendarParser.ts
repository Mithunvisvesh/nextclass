import { CalendarEntry, CalendarEntryType } from '../../types/calendar';
import { DayOfWeek } from '../../types/timetable';
import { extractPdfText, ExtractedPdf } from './pdfExtractor';

export interface ParsedCalendarResult {
  success: boolean;
  entries: Omit<CalendarEntry, 'id'>[];
  metadata: {
    academicYear?: string;
    term?: string;
    institution?: string;
  };
  warnings: string[];
  rawLineCount: number;
}

const MONTH_NAMES: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};

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
 * Normalizes e.g. "01-Jul" or "14-Sep" with current academic year into "YYYY-MM-DD"
 */
export function parseDateToIso(dateStr: string, currentYear: number = 2026): string | null {
  const clean = dateStr.trim();
  // Match "01-Jul" or "1-Jul"
  const mmmMatch = clean.match(/^(\d{1,2})-([A-Za-z]{3})$/i);
  if (mmmMatch) {
    const day = mmmMatch[1].padStart(2, '0');
    const monthKey = mmmMatch[2].toLowerCase();
    const month = MONTH_NAMES[monthKey];
    if (month) {
      // If month is Jan-May and academic year started in July (Odd), year might be currentYear + 1
      const year = parseInt(month, 10) < 6 ? currentYear + 1 : currentYear;
      return `${year}-${month}-${day}`;
    }
  }

  // Match ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // Match DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Determine entry type from text title and indicators.
 */
export function categorizeEvent(
  title: string,
  isHMarker: boolean = false
): { type: CalendarEntryType; sourceDay?: DayOfWeek } {
  const lower = title.toLowerCase();

  // 1. Special Timetable (CRITICAL: Must NOT be treated as ordinary holiday)
  // e.g. "Friday Timetable for all", "Monday Timetable for all", "Follows Tuesday Schedule"
  for (const day of WEEKDAYS) {
    const pattern = new RegExp(
      `(?:${day}\\s+Timetable|Follows\\s+${day}\\s+(?:Timetable|Schedule))`,
      'i'
    );
    if (pattern.test(title)) {
      return {
        type: 'special_timetable',
        sourceDay: day,
      };
    }
  }

  // Generic special timetable check
  if (/special\s+timetable|altered\s+timetable/i.test(lower)) {
    return { type: 'special_timetable' };
  }

  // 2. Exam
  if (
    /mid\s*sem|end\s*sem|ese\b|exam\b|evaluation\b|assessment\b|mid\s*term|arrear/i.test(
      lower
    )
  ) {
    return { type: 'exam' };
  }

  // 3. Vacation
  if (/vacation\b|semester\s*break|holiday\s*break/i.test(lower)) {
    return { type: 'vacation' };
  }

  // 4. Holiday
  if (isHMarker || /holiday\b|jayanti\b|vratam\b|chaturthi\b|deepavali\b|christmas\b/i.test(lower)) {
    return { type: 'holiday' };
  }

  // 5. Working Day / Instructional Day
  if (/instruction\s*day|working\s*day|commencement\s*of\s*classes/i.test(lower)) {
    return { type: 'working_day' };
  }

  return { type: 'other' };
}

/**
 * Parse an Academic Calendar PDF into structured CalendarEntry items.
 */
export function parseAcademicCalendar(
  input: ExtractedPdf | Uint8Array | string
): ParsedCalendarResult {
  const extracted = typeof input === 'object' && 'lines' in input ? input : extractPdfText(input);
  const lines = extracted.lines;
  const warnings: string[] = [];

  const metadata: ParsedCalendarResult['metadata'] = {};
  let currentYear = 2026;

  // 1. Detect Year & Academic Term
  for (const line of lines) {
    const yearMatch = line.match(/\b(20\d{2})[-–](20\d{2}|\d{2})\b/);
    if (yearMatch) {
      metadata.academicYear = yearMatch[0];
      currentYear = parseInt(yearMatch[1], 10);
    }
    if (/Odd\s*Semester/i.test(line)) metadata.term = 'Odd Semester';
    if (/Even\s*Semester/i.test(line)) metadata.term = 'Even Semester';
    if (/Amrita|University|College/i.test(line) && !metadata.institution) {
      metadata.institution = line.trim();
    }
  }

  const entries: Omit<CalendarEntry, 'id'>[] = [];
  const processedDates = new Set<string>();

  // 2. Scan lines for Dates and Event Descriptions
  // Date format in calendar: "01-Jul", "02-Jul", ... "30-Nov", "28-Dec"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isoDate = parseDateToIso(line, currentYear);

    if (isoDate) {
      // Look at following lines for associated info (Day of week, 'H', Event Title)
      let title = '';
      let isHMarker = false;

      // Inspect next 5 lines
      for (let j = i + 1; j <= Math.min(lines.length - 1, i + 5); j++) {
        const next = lines[j].trim();
        // If we hit the next date, stop looking
        if (parseDateToIso(next, currentYear)) break;

        if (next === 'H') {
          isHMarker = true;
          continue;
        }

        // Ignore single digits (day counter numbers) and 2-3 char weekday codes
        if (/^\d{1,2}$/.test(next)) continue;
        if (/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun|st|nd|rd|th)$/i.test(next)) continue;

        // Found substantive text
        if (next.length > 2 && !title) {
          title = next;
        } else if (next.length > 2 && title && !title.includes(next)) {
          title += ' ' + next;
        }
      }

      // Default title if empty
      if (!title) {
        title = isHMarker ? 'Holiday' : 'Academic Day';
      }

      const { type, sourceDay } = categorizeEvent(title, isHMarker);

      // Avoid duplicates for same date
      const key = `${isoDate}-${type}-${sourceDay || ''}`;
      if (!processedDates.has(key)) {
        processedDates.add(key);
        entries.push({
          date: isoDate,
          title: title.trim(),
          type,
          timetableSourceDay: sourceDay,
          description: title.trim(),
        });
      }
    }
  }

  // 3. Fallback / Dedicated search for Special Timetables
  // e.g. "Friday Timetable for all", "Monday Timetable for all", "Tuesday Timetable for all"
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const day of WEEKDAYS) {
      const specMatch = line.match(
        new RegExp(`(${day}\\s+Timetable\\s*(?:for\\s+all)?)`, 'i')
      );
      if (specMatch) {
        // Find nearest date before or after this line (within 10 lines)
        let foundIso: string | null = null;
        for (let j = Math.max(0, i - 10); j <= Math.min(lines.length - 1, i + 10); j++) {
          const iso = parseDateToIso(lines[j], currentYear);
          if (iso) {
            foundIso = iso;
            break;
          }
        }

        if (foundIso) {
          const exists = entries.some(
            e => e.date === foundIso && e.type === 'special_timetable' && e.timetableSourceDay === day
          );
          if (!exists) {
            entries.push({
              date: foundIso,
              title: specMatch[1].trim(),
              type: 'special_timetable',
              timetableSourceDay: day,
              description: specMatch[1].trim(),
            });
          }
        }
      }
    }
  }

  // Sort entries by date ascending
  entries.sort((a, b) => a.date.localeCompare(b.date));

  return {
    success: entries.length > 0,
    entries,
    metadata,
    warnings,
    rawLineCount: lines.length,
  };
}
