import React, { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { PlayCircle, RotateCcw, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDatePretty, formatTime12Hour } from '../../core/timeUtils';

export const TimeSimulatorBanner: React.FC = () => {
  const { settings, setSimulatedDate, clearSimulation, currentSimulatedTime, todaySchedule } = useSchedule();
  const [isExpanded, setIsExpanded] = useState(false);
  const [customDate, setCustomDate] = useState(todaySchedule.date);
  const [customTime, setCustomTime] = useState(currentSimulatedTime);

  const presets = [
    { label: 'Sep 21 (Swapped)', date: '2026-09-21', time: '09:15', desc: 'NLP & CN Swapped' },
    { label: 'Sep 23 (Cancel)', date: '2026-09-23', time: '09:00', desc: 'CN Cancelled' },
    { label: 'Sep 25 (Room)', date: '2026-09-25', time: '09:15', desc: 'Room changed to A406' },
    { label: 'Sep 14 (Holiday)', date: '2026-09-14', time: '10:00', desc: 'Ganesh Chaturthi' },
    { label: 'Oct 01 (Special)', date: '2026-10-01', time: '09:20', desc: 'Mon Schedule on Thu' },
    { label: 'Oct 31 (Sat Special)', date: '2026-10-31', time: '08:30', desc: 'Fri Schedule on Sat' },
  ];

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-indigo-500/10 border-b border-amber-200/80 text-slate-800 text-xs px-4 py-2 transition-all">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Active Simulation Status */}
        <div className="flex items-center space-x-2">
          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${settings.isSimulationActive ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="font-semibold text-slate-800">
            {settings.isSimulationActive ? 'Time Simulator Active:' : 'Live System Time:'}
          </span>
          <span className="bg-white/80 px-2 py-0.5 rounded font-mono font-medium text-slate-700 border border-slate-200">
            {todaySchedule.date} • {formatTime12Hour(currentSimulatedTime)}
          </span>
          {settings.isSimulationActive && (
            <span className="hidden sm:inline text-amber-700 font-medium">
              ({todaySchedule.actualDayOfWeek})
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {settings.isSimulationActive ? (
            <button
              onClick={clearSimulation}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium transition-colors shadow-xs active:scale-95"
              title="Reset to Real Device Time"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset to Live</span>
            </button>
          ) : null}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors shadow-xs active:scale-95"
          >
            <span>{isExpanded ? 'Hide Scenarios' : 'Simulate Scenarios'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Preset Picker */}
      {isExpanded && (
        <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-slate-200/80">
          <div className="text-[11px] font-medium text-slate-600 mb-1.5 flex items-center justify-between">
            <span>Quick Professor Grading Scenarios (One-click jump):</span>
            <span className="text-slate-500 text-[10px]">Instant schedule recomputation</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
            {presets.map(p => (
              <button
                key={p.date}
                onClick={() => setSimulatedDate(p.date, p.time)}
                className={`p-1.5 rounded-lg border text-left transition-all ${
                  todaySchedule.date === p.date
                    ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <div className="font-bold truncate text-[11px]">{p.label}</div>
                <div className={`text-[10px] truncate ${todaySchedule.date === p.date ? 'text-brand-100' : 'text-slate-500'}`}>
                  {p.desc}
                </div>
              </button>
            ))}
          </div>

          {/* Custom Date / Time inputs */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 bg-white/60 p-2 rounded-lg border border-slate-200">
            <span className="font-medium text-slate-700">Custom Date & Time:</span>
            <input
              type="date"
              value={customDate}
              onChange={e => setCustomDate(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-brand-500"
            />
            <input
              type="time"
              value={customTime}
              onChange={e => setCustomTime(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-brand-500"
            />
            <button
              onClick={() => setSimulatedDate(customDate, customTime)}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs transition-colors"
            >
              Apply Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
