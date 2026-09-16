import React, { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { DateOverride } from '../../types/override';
import { 
  Edit3, 
  PlusCircle, 
  Trash2, 
  ArrowLeftRight, 
  Ban, 
  MapPin, 
  Clock, 
  Plus, 
  Calendar, 
  CalendarRange, 
  AlertCircle 
} from 'lucide-react';
import { formatDatePretty, formatDateShort } from '../../core/timeUtils';
import { ChangeModal } from './ChangeModal';

export const ChangesManager: React.FC = () => {
  const { overrides, addOverride, updateOverride, deleteOverride, timetable, todaySchedule } = useSchedule();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState<DateOverride | null>(null);

  const handleEdit = (ovr: DateOverride) => {
    setEditingOverride(ovr);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingOverride(null);
    setIsModalOpen(true);
  };

  const handleSave = (data: any) => {
    if (editingOverride) {
      updateOverride(data);
    } else {
      addOverride(data);
    }
  };

  const getClassName = (classId?: string) => {
    if (!classId) return 'Class';
    const found = timetable.classes.find(c => c.id === classId);
    return found ? `${found.courseName} (${found.courseCode})` : classId;
  };

  const getChangeSummary = (ovr: DateOverride) => {
    switch (ovr.type) {
      case 'swap':
        return `Swap ${getClassName(ovr.targetClassId)} with ${getClassName(ovr.swapWithClassId)}`;
      case 'cancel':
        return `Cancel ${getClassName(ovr.targetClassId)}`;
      case 'room_change':
        return `Room changed to ${ovr.overrideData?.room || 'TBD'} for ${getClassName(ovr.targetClassId)}`;
      case 'time_change':
        return `Time changed to ${ovr.overrideData?.startTime} - ${ovr.overrideData?.endTime} for ${getClassName(ovr.targetClassId)}`;
      case 'extra':
        return `Add extra class: ${ovr.overrideData?.courseName || 'Session'} (${ovr.overrideData?.startTime} - ${ovr.overrideData?.endTime})`;
      case 'source_day':
        return `Follows ${ovr.timetableSourceDay}'s weekly schedule`;
      case 'edit':
        return `Custom edit for ${getClassName(ovr.targetClassId)}`;
      default:
        return 'Date-specific change';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'swap': return ArrowLeftRight;
      case 'cancel': return Ban;
      case 'room_change': return MapPin;
      case 'time_change': return Clock;
      case 'extra': return Plus;
      case 'source_day': return Calendar;
      default: return Edit3;
    }
  };

  // Sort overrides: future first, then chronological
  const sortedOverrides = [...overrides].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Date-Specific Changes
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Temporary overrides • Does not alter the recurring weekly baseline
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-xs active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Schedule Change</span>
        </button>
      </div>

      {/* Info notice */}
      <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-900 text-xs flex items-start space-x-2.5">
        <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Student Change Manager: </span>
          Use this area to track swapped hours, faculty leave cancellations, room shifts, or extra tutorial sessions. These overrides apply strictly to their designated dates and automatically expire once passed.
        </div>
      </div>

      {/* Changes list */}
      <div className="space-y-3">
        {sortedOverrides.length > 0 ? (
          sortedOverrides.map(ovr => {
            const Icon = getTypeIcon(ovr.type);
            const isToday = ovr.date === todaySchedule.date;
            const isPast = ovr.date < todaySchedule.date;

            return (
              <div
                key={ovr.id}
                className={`rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isToday
                    ? 'bg-purple-50/50 border-purple-300 ring-2 ring-purple-500/10'
                    : isPast
                    ? 'bg-slate-50/80 border-slate-200 opacity-70'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  {/* Date badge */}
                  <div className="w-24 flex-shrink-0">
                    <div className="text-xs font-bold text-slate-900">
                      {formatDateShort(ovr.date)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {ovr.date}
                    </div>
                    {isToday && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-600 text-white">
                        TODAY
                      </span>
                    )}
                    {isPast && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-200 text-slate-600">
                        PAST
                      </span>
                    )}
                  </div>

                  <div className="w-0.5 h-10 bg-slate-200 hidden sm:block" />

                  {/* Change Details */}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                        <Icon className="w-3 h-3" />
                        <span>{ovr.type.replace('_', ' ')}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {getChangeSummary(ovr)}
                    </h4>

                    {ovr.notes && (
                      <p className="mt-1 text-xs text-slate-500 italic">
                        "{ovr.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-1 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleEdit(ovr)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit override"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this temporary change?')) {
                        deleteOverride(ovr.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete change"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs space-y-2">
            <CalendarRange className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="font-semibold text-slate-700">No date-specific changes registered</div>
            <p>Click "New Schedule Change" above to record swapped lectures, room changes, or cancellations.</p>
          </div>
        )}
      </div>

      {/* Change Modal */}
      {isModalOpen && (
        <ChangeModal
          initialOverride={editingOverride}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
