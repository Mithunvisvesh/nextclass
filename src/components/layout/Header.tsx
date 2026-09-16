import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { Clock, Calendar, Sparkles, SlidersHorizontal } from 'lucide-react';
import { formatDatePretty } from '../../core/timeUtils';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { settings, activeDate, currentSimulatedTime, resetToDemo } = useSchedule();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Clock className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                NextClass
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200/60">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Know what's next.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Quick Demo Data Loader Button */}
          <button
            onClick={resetToDemo}
            title="Reload Sample Timetable & Calendar"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors border border-brand-200/80 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Sample Data</span>
          </button>

          {/* Settings / Options button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
            title="Settings & Simulation"
            aria-label="Settings"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
