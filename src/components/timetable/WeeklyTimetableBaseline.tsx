import React, { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { TimetableClass, DayOfWeek } from '../../types/timetable';
import { 
  Table, 
  ShieldCheck, 
  PlusCircle, 
  Edit, 
  Trash2, 
  MapPin, 
  User, 
  Clock, 
  Sparkles,
  Layers
} from 'lucide-react';
import { formatTime12Hour, parseTimeToMinutes } from '../../core/timeUtils';
import { ClassFormModal } from './ClassFormModal';

export const WeeklyTimetableBaseline: React.FC = () => {
  const { timetable, addTimetableClass, updateTimetableClass, deleteTimetableClass, resetToDemo } = useSchedule();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'All'>('Monday');
  const [editingClass, setEditingClass] = useState<TimetableClass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const filteredClasses = (timetable?.classes || []).filter(c => {
    if (selectedDay === 'All') return true;
    return c.dayOfWeek === selectedDay;
  });

  // Sort by day then by time
  const dayOrder: Record<string, number> = {
    Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7
  };

  filteredClasses.sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) {
      return (dayOrder[a.dayOfWeek] || 99) - (dayOrder[b.dayOfWeek] || 99);
    }
    return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
  });

  const handleEdit = (c: TimetableClass) => {
    setEditingClass(c);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleSave = (data: any) => {
    if (editingClass) {
      updateTimetableClass(data);
    } else {
      addTimetableClass(data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Header & Invariant Shield Notice */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Table className="w-5 h-5 text-brand-600" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Weekly Timetable Baseline
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanent master schedule • {timetable.name || 'Current Term'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddNew}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-xs active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Class</span>
            </button>
          </div>
        </div>

        {/* Invariant Guarantee Banner */}
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs flex items-start space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Permanent Invariant: </span>
            This screen displays your recurring weekly baseline. Temporary date-specific changes (swaps, cancellations, room changes, or special calendar instructions) <span className="font-semibold underline">never alter this baseline</span>. To manage temporary date modifications, visit the <span className="font-bold">Changes</span> tab.
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedDay('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            selectedDay === 'All'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          All Days ({timetable.classes.length})
        </button>
        {days.map(d => {
          const count = timetable.classes.filter(c => c.dayOfWeek === d).length;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDay === d
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {d} {count > 0 ? `(${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Timetable Cards Grid */}
      <div className="space-y-3">
        {filteredClasses.length > 0 ? (
          filteredClasses.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start space-x-3.5">
                {/* Time badge */}
                <div className="w-24 flex-shrink-0 text-left sm:text-right">
                  <div className="text-xs font-bold text-slate-900">
                    {formatTime12Hour(c.startTime)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {formatTime12Hour(c.endTime)}
                  </div>
                  {selectedDay === 'All' && (
                    <div className="text-[10px] font-semibold text-brand-600 uppercase mt-0.5">
                      {c.dayOfWeek.substring(0, 3)}
                    </div>
                  )}
                </div>

                <div className="w-0.5 h-10 bg-slate-200 hidden sm:block" />

                {/* Course Details */}
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {c.courseCode}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-indigo-50 text-brand-700 border border-indigo-200/60">
                      {c.type}
                    </span>
                    {c.slot && (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Slot {c.slot}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {c.courseName}
                  </h4>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <div className="flex items-center space-x-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      <MapPin className="w-3 h-3 text-brand-600" />
                      <span>Room {c.room}</span>
                    </div>
                    {c.faculty && (
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{c.faculty}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-1 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  onClick={() => handleEdit(c)}
                  className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit baseline class"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${c.courseName} (${c.courseCode}) from baseline timetable?`)) {
                      deleteTimetableClass(c.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete class"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs space-y-2">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="font-semibold text-slate-700">No classes for {selectedDay}</div>
            <p>Click "Add Class" above to configure your weekly schedule.</p>
          </div>
        )}
      </div>

      {/* Class Form Modal */}
      {isModalOpen && (
        <ClassFormModal
          initialClass={editingClass}
          defaultDay={selectedDay === 'All' ? 'Monday' : selectedDay}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
