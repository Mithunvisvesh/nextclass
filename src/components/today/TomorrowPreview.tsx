import React from 'react';
import { DailySchedule } from '../../types/schedule';
import { Calendar, ChevronRight, Sparkles, PartyPopper, MapPin } from 'lucide-react';
import { formatDatePretty, formatTime12Hour } from '../../core/timeUtils';

interface TomorrowPreviewProps {
  tomorrowSchedule: DailySchedule;
  onSelectTomorrow: () => void;
}

export const TomorrowPreview: React.FC<TomorrowPreviewProps> = ({
  tomorrowSchedule,
  onSelectTomorrow,
}) => {
  const { isHoliday, holidayTitle, isSpecialTimetable, specialTimetableNote, classes } = tomorrowSchedule;

  return (
    <div className="mt-8 pt-6 border-t-2 border-slate-200/80">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-600">
            Ahead of Time
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Tomorrow's Schedule
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {formatDatePretty(tomorrowSchedule.date)}
          </p>
        </div>

        <button
          onClick={onSelectTomorrow}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors active:scale-95"
        >
          <span>Open Day</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tomorrow's Status */}
      {isHoliday ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-900">
          <PartyPopper className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Tomorrow is a Holiday: </span>
            <span>{holidayTitle || 'College Holiday'}. No classes scheduled!</span>
          </div>
        </div>
      ) : isSpecialTimetable ? (
        <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center space-x-2 text-amber-900 text-xs">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Special Timetable Alert: </span>
            <span>{specialTimetableNote || `Follows ${tomorrowSchedule.effectiveSourceDay} schedule`}</span>
          </div>
        </div>
      ) : null}

      {/* List of Tomorrow's Classes (Compact Summary) */}
      {!isHoliday && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-xs">
          {classes.length > 0 ? (
            classes.map(c => (
              <div
                key={c.id}
                className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-14 font-mono font-bold text-slate-700">
                    {c.startTime}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-900 truncate">
                      {c.courseName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                      <span className="font-mono">{c.courseCode}</span>
                      <span>•</span>
                      <span>{c.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center space-x-1 text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                  <MapPin className="w-3 h-3 text-brand-600" />
                  <span>{c.room}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-slate-500">
              No classes scheduled for tomorrow ({tomorrowSchedule.actualDayOfWeek}).
            </div>
          )}
        </div>
      )}
    </div>
  );
};
