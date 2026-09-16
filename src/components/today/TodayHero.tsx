import React from 'react';
import { DailySchedule, ProcessedClass } from '../../types/schedule';
import { 
  Sparkles, 
  MapPin, 
  User, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  PartyPopper,
  Flame,
  ArrowRight
} from 'lucide-react';
import { formatDatePretty, formatTime12Hour, parseTimeToMinutes } from '../../core/timeUtils';

interface TodayHeroProps {
  schedule: DailySchedule;
  currentTimeStr: string;
  onViewChanges?: () => void;
}

export const TodayHero: React.FC<TodayHeroProps> = ({ schedule, currentTimeStr, onViewChanges }) => {
  const { currentClass, nextClass, isHoliday, holidayTitle, isSpecialTimetable, specialTimetableNote } = schedule;

  // Compute minutes remaining in current class if happening
  const minutesRemaining = currentClass
    ? parseTimeToMinutes(currentClass.endTime) - parseTimeToMinutes(currentTimeStr)
    : 0;

  // Minutes until next class if upcoming
  const minutesUntilNext = nextClass
    ? parseTimeToMinutes(nextClass.startTime) - parseTimeToMinutes(currentTimeStr)
    : 0;

  return (
    <div className="space-y-3">
      {/* Date Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {formatDatePretty(schedule.date)}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            {isSpecialTimetable ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {specialTimetableNote || `Follows ${schedule.effectiveSourceDay} Schedule`}
              </span>
            ) : (
              `${schedule.actualDayOfWeek} Schedule`
            )}
          </p>
        </div>

        {/* Override Pill Count */}
        {schedule.appliedOverrides.length > 0 && (
          <button
            onClick={onViewChanges}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200 transition-colors"
          >
            <span>{schedule.appliedOverrides.length} date override{schedule.appliedOverrides.length > 1 ? 's' : ''} active</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Special Timetable / Holiday Alert Banners */}
      {isHoliday ? (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 border-2 border-emerald-300/80 rounded-2xl p-5 text-center shadow-xs">
          <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-700 mb-2">
            <PartyPopper className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-emerald-900">
            Holiday: {holidayTitle || 'Official College Holiday'}
          </h3>
          <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
            No regular academic classes are scheduled for today. Enjoy your day off or catch up on self-study!
          </p>
        </div>
      ) : isSpecialTimetable ? (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 rounded-xl p-3 flex items-start space-x-3 text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Special Timetable Day: </span>
            <span>{specialTimetableNote}. Classes are running per {schedule.effectiveSourceDay}'s weekly schedule.</span>
          </div>
        </div>
      ) : null}

      {/* Hero Class Status Card (Happening / Next / All Done) */}
      {!isHoliday && (
        <>
          {currentClass ? (
            /* HAPPENING NOW CARD */
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white p-5 shadow-lg shadow-brand-500/25">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                    Happening Right Now
                  </span>
                </div>
                <div className="text-xs font-semibold bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-xs">
                  {minutesRemaining > 0 ? `${minutesRemaining} min${minutesRemaining > 1 ? 's' : ''} remaining` : 'Ending shortly'}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-baseline space-x-2">
                  <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-indigo-100">
                    {currentClass.courseCode}
                  </span>
                  {currentClass.slot && (
                    <span className="text-[11px] font-semibold text-indigo-200">
                      Slot {currentClass.slot}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1 leading-snug">
                  {currentClass.courseName}
                </h3>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-indigo-100 font-medium">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-indigo-300" />
                  <span>{formatTime12Hour(currentClass.startTime)} – {formatTime12Hour(currentClass.endTime)}</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-black/20 px-2 py-0.5 rounded-md">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-bold text-white">Room {currentClass.room}</span>
                </div>
                {currentClass.faculty && (
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-300" />
                    <span className="truncate max-w-[200px]">{currentClass.faculty}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${currentClass.progressPercent || 20}%` }}
                  />
                </div>
              </div>
            </div>
          ) : nextClass ? (
            /* NEXT CLASS UPCOMING CARD */
            <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    Up Next
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {minutesUntilNext > 0
                    ? `In ${minutesUntilNext >= 60 ? `${Math.floor(minutesUntilNext / 60)}h ` : ''}${minutesUntilNext % 60}m`
                    : 'Starting momentarily'}
                </span>
              </div>

              <div className="mt-2.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {nextClass.courseCode}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {formatTime12Hour(nextClass.startTime)} – {formatTime12Hour(nextClass.endTime)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {nextClass.courseName}
                </h3>
              </div>

              <div className="mt-3 flex items-center space-x-4 text-xs text-slate-600">
                <div className="flex items-center space-x-1 font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>Room {nextClass.room}</span>
                </div>
                {nextClass.faculty && (
                  <div className="flex items-center space-x-1 text-slate-500 truncate">
                    <User className="w-3.5 h-3.5" />
                    <span>{nextClass.faculty}</span>
                  </div>
                )}
              </div>
            </div>
          ) : schedule.hasClasses ? (
            /* ALL CLASSES COMPLETED */
            <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-slate-200 p-4 text-center">
              <div className="inline-flex p-2 rounded-full bg-indigo-100 text-brand-600 mb-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">All classes finished for today!</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                You've completed all scheduled lectures and labs. Check below for tomorrow's timetable.
              </p>
            </div>
          ) : (
            /* NO CLASSES ON THIS DATE */
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center text-slate-600">
              <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No classes scheduled for today</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Enjoy your free day or prepare for upcoming coursework.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
