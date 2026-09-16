import React from 'react';
import { FreePeriod } from '../../types/schedule';
import { Coffee, Utensils, Clock } from 'lucide-react';
import { formatTime12Hour } from '../../core/timeUtils';

interface FreePeriodCardProps {
  freePeriod: FreePeriod;
}

export const FreePeriodCard: React.FC<FreePeriodCardProps> = ({ freePeriod }) => {
  const isLunch = freePeriod.label.toLowerCase().includes('lunch');
  const Icon = isLunch ? Utensils : Coffee;

  return (
    <div className="flex items-center gap-3 my-1.5 opacity-80 hover:opacity-100 transition-opacity">
      {/* Time offset */}
      <div className="w-16 sm:w-20 flex-shrink-0 text-right">
        <span className="text-[11px] font-mono text-slate-400">
          {formatTime12Hour(freePeriod.startTime)}
        </span>
      </div>

      {/* Bullet */}
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-slate-300" />
      </div>

      {/* Break pill */}
      <div className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100/80 border border-dashed border-slate-300 text-slate-600 text-xs">
        <div className="flex items-center space-x-2">
          <Icon className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold">{freePeriod.label}</span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {formatTime12Hour(freePeriod.startTime)} – {formatTime12Hour(freePeriod.endTime)}
        </span>
      </div>
    </div>
  );
};
