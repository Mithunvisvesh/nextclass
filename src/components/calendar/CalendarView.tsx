import React, { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles, 
  PartyPopper, 
  PlusCircle, 
  Clock, 
  MapPin, 
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { formatDatePretty, formatTime12Hour, parseTimeToMinutes } from '../../core/timeUtils';
import { ClassCard } from '../today/ClassCard';
import { FreePeriodCard } from '../today/FreePeriodCard';

interface CalendarViewProps {
  onOpenAddChange: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenAddChange }) => {
  const { activeDate, setActiveDate, getSchedule, calendar, overrides, timetable } = useSchedule();

  // Current viewed month and year
  const [currentYear, setCurrentYear] = useState(() => {
    const parts = activeDate.split('-').map(Number);
    return parts[0];
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const parts = activeDate.split('-').map(Number);
    return parts[1] - 1; // 0-indexed
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Compute days in current month
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Selected date schedule
  const selectedSchedule = getSchedule(activeDate);

  // Combine classes & breaks for selected date
  const timelineItems: Array<{ type: 'class' | 'break'; data: any; sortMinutes: number }> = [];
  selectedSchedule.classes.forEach(c => {
    timelineItems.push({ type: 'class', data: c, sortMinutes: parseTimeToMinutes(c.startTime) });
  });
  selectedSchedule.freePeriods.forEach(p => {
    timelineItems.push({ type: 'break', data: p, sortMinutes: parseTimeToMinutes(p.startTime) });
  });
  timelineItems.sort((a, b) => a.sortMinutes - b.sortMinutes);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Calendar Header & Month Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentMonth(now.getMonth());
                setCurrentYear(now.getFullYear());
                const y = now.getFullYear();
                const m = (now.getMonth() + 1).toString().padStart(2, '0');
                const d = now.getDate().toString().padStart(2, '0');
                setActiveDate(`${y}-${m}-${d}`);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600 mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            <span>Regular Classes</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Holiday</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Special Timetable</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>User Override</span>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-lg bg-slate-50/50" />
          ))}

          {/* Month days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
            const isSelected = activeDate === dateStr;

            // Day schedule preview
            const daySched = getSchedule(dateStr);
            const isHoliday = daySched.isHoliday;
            const isSpecial = daySched.isSpecialTimetable;
            const hasOverrides = daySched.appliedOverrides.length > 0;
            const hasClasses = daySched.hasClasses;

            return (
              <button
                key={dateStr}
                onClick={() => setActiveDate(dateStr)}
                className={`h-14 sm:h-16 rounded-xl p-1.5 flex flex-col justify-between items-center transition-all relative text-left ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-500/20'
                    : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-800'
                }`}
              >
                {/* Date number */}
                <span className={`text-xs sm:text-sm font-bold leading-none ${
                  isSelected ? 'text-white' : 'text-slate-800'
                }`}>
                  {dayNum}
                </span>

                {/* Badges / Dots container */}
                <div className="flex items-center justify-center space-x-1 mt-auto">
                  {isHoliday && (
                    <span
                      title={`Holiday: ${daySched.holidayTitle}`}
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`}
                    />
                  )}
                  {isSpecial && (
                    <span
                      title="Special Timetable"
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`}
                    />
                  )}
                  {hasOverrides && (
                    <span
                      title="User Override Active"
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-purple-200' : 'bg-purple-500'}`}
                    />
                  )}
                  {!isHoliday && hasClasses && !isSpecial && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-indigo-200' : 'bg-brand-400'}`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Detail Drawer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
              Selected Date Schedule
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {formatDatePretty(activeDate)}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {selectedSchedule.isSpecialTimetable ? (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {selectedSchedule.specialTimetableNote || `Follows ${selectedSchedule.effectiveSourceDay} Schedule`}
                </span>
              ) : (
                `${selectedSchedule.actualDayOfWeek} Schedule`
              )}
            </p>
          </div>

          <button
            onClick={() => onOpenAddChange(activeDate)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-xs active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Change for Date</span>
          </button>
        </div>

        {/* Status Alerts */}
        {selectedSchedule.isHoliday && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-900">
            <PartyPopper className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Holiday: </span>
              <span>{selectedSchedule.holidayTitle || 'Official College Holiday'}. No classes scheduled.</span>
            </div>
          </div>
        )}

        {selectedSchedule.isSpecialTimetable && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center space-x-2 text-amber-900 text-xs">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Special Timetable Day: </span>
              <span>{selectedSchedule.specialTimetableNote}. Classes are following {selectedSchedule.effectiveSourceDay}'s timetable.</span>
            </div>
          </div>
        )}

        {/* Applied Overrides list */}
        {selectedSchedule.appliedOverrides.length > 0 && (
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs space-y-1">
            <span className="font-bold block">User Date-Specific Changes Applied ({selectedSchedule.appliedOverrides.length}):</span>
            <ul className="list-disc list-inside space-y-0.5 text-purple-800">
              {selectedSchedule.appliedOverrides.map(o => (
                <li key={o.id}>
                  <span className="capitalize font-semibold">{o.type.replace('_', ' ')}:</span> {o.notes || 'Modified by user'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Classes List */}
        {!selectedSchedule.isHoliday && (
          <div className="space-y-3 pt-2">
            {selectedSchedule.hasClasses ? (
              timelineItems.map((item, idx) => {
                if (item.type === 'class') {
                  return (
                    <ClassCard
                      key={item.data.id || `cal-class-${idx}`}
                      classItem={item.data}
                    />
                  );
                } else {
                  return (
                    <FreePeriodCard
                      key={`cal-break-${item.data.startTime}-${idx}`}
                      freePeriod={item.data}
                    />
                  );
                }
              })
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No classes scheduled for {selectedSchedule.actualDayOfWeek}.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
