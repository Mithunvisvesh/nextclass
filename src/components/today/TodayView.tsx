import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { TodayHero } from './TodayHero';
import { ClassCard } from './ClassCard';
import { FreePeriodCard } from './FreePeriodCard';
import { TomorrowPreview } from './TomorrowPreview';
import { PlusCircle, Clock, Calendar } from 'lucide-react';
import { parseTimeToMinutes } from '../../core/timeUtils';

interface TodayViewProps {
  onOpenAddChange: (defaultDate?: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({ onOpenAddChange }) => {
  const { todaySchedule, tomorrowSchedule, currentSimulatedTime, setCurrentTab, setActiveDate } = useSchedule();

  const handleSelectTomorrow = () => {
    setActiveDate(tomorrowSchedule.date);
    setCurrentTab('calendar');
  };

  // Build combined chronological items (classes and free periods)
  const items: Array<{ type: 'class' | 'break'; data: any; sortMinutes: number }> = [];

  todaySchedule.classes.forEach(c => {
    items.push({
      type: 'class',
      data: c,
      sortMinutes: parseTimeToMinutes(c.startTime)
    });
  });

  todaySchedule.freePeriods.forEach(p => {
    items.push({
      type: 'break',
      data: p,
      sortMinutes: parseTimeToMinutes(p.startTime)
    });
  });

  items.sort((a, b) => a.sortMinutes - b.sortMinutes);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Hero Section */}
      <TodayHero
        schedule={todaySchedule}
        currentTimeStr={currentSimulatedTime}
        onViewChanges={() => setCurrentTab('changes')}
      />

      {/* Timeline Section */}
      {todaySchedule.hasClasses && !todaySchedule.isHoliday && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Today's Timeline ({todaySchedule.classes.length} class{todaySchedule.classes.length > 1 ? 'es' : ''})
            </h3>

            {/* Quick Add Change button */}
            <button
              onClick={() => onOpenAddChange(todaySchedule.date)}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Change for Today</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              if (item.type === 'class') {
                return (
                  <ClassCard
                    key={item.data.id || `class-${index}`}
                    classItem={item.data}
                  />
                );
              } else {
                return (
                  <FreePeriodCard
                    key={`break-${item.data.startTime}-${index}`}
                    freePeriod={item.data}
                  />
                );
              }
            })}
          </div>
        </div>
      )}

      {/* Tomorrow Section */}
      <TomorrowPreview
        tomorrowSchedule={tomorrowSchedule}
        onSelectTomorrow={handleSelectTomorrow}
      />
    </div>
  );
};
