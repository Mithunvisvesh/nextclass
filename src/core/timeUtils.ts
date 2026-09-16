import { DayOfWeek } from '../types/timetable';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

/**
 * Parses YYYY-MM-DD to DayOfWeek
 */
export function getDayOfWeek(dateStr: string): DayOfWeek {
  const parts = dateStr.split('-').map(Number);
  // Using UTC or local with fixed year/month/day
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return DAYS_OF_WEEK[d.getDay()];
}

/**
 * Formats YYYY-MM-DD to "Wednesday, Sep 16, 2026"
 */
export function formatDatePretty(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Formats YYYY-MM-DD to "Sep 16"
 */
export function formatDateShort(dateStr: string): string {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Converts "09:30" or "9:30" to minutes since midnight (570)
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/**
 * Converts minutes since midnight back to "HH:mm"
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Converts "14:00" to "2:00 PM"
 */
export function formatTime12Hour(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${ampm}`;
}

/**
 * Adds n days to ISO date string
 */
export function addDays(dateStr: string, days: number): string {
  const parts = dateStr.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's ISO date string 'YYYY-MM-DD'
 */
export function getTodayIsoString(overrideDate?: string): string {
  if (overrideDate) return overrideDate;
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current time 'HH:mm'
 */
export function getCurrentTimeIso(overrideTime?: string): string {
  if (overrideTime) return overrideTime;
  const d = new Date();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
