import React, { useState, useMemo } from 'react';
import { DateOverride, OverrideType } from '../../types/override';
import { DayOfWeek, ClassType } from '../../types/timetable';
import { useSchedule } from '../../context/ScheduleContext';
import { X, Check, ArrowLeftRight, Ban, PlusCircle, MapPin, Clock, Calendar } from 'lucide-react';
import { getDayOfWeek } from '../../core/timeUtils';

interface ChangeModalProps {
  initialOverride?: DateOverride | null;
  defaultDate?: string;
  onSave: (override: Omit<DateOverride, 'id' | 'createdAt'> | DateOverride) => void;
  onClose: () => void;
}

export const ChangeModal: React.FC<ChangeModalProps> = ({
  initialOverride,
  defaultDate,
  onSave,
  onClose
}) => {
  const { timetable, calendar, overrides, getSchedule } = useSchedule();

  const [date, setDate] = useState(initialOverride?.date || defaultDate || new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<OverrideType>(initialOverride?.type || 'swap');
  const [targetClassId, setTargetClassId] = useState(initialOverride?.targetClassId || '');
  const [swapWithClassId, setSwapWithClassId] = useState(initialOverride?.swapWithClassId || '');
  const [newRoom, setNewRoom] = useState(initialOverride?.overrideData?.room || '');
  const [newStartTime, setNewStartTime] = useState(initialOverride?.overrideData?.startTime || '09:00');
  const [newEndTime, setNewEndTime] = useState(initialOverride?.overrideData?.endTime || '09:50');
  const [extraCourseName, setExtraCourseName] = useState(initialOverride?.overrideData?.courseName || '');
  const [extraCourseCode, setExtraCourseCode] = useState(initialOverride?.overrideData?.courseCode || '');
  const [extraFaculty, setExtraFaculty] = useState(initialOverride?.overrideData?.faculty || '');
  const [timetableSourceDay, setTimetableSourceDay] = useState<DayOfWeek>(
    initialOverride?.timetableSourceDay || 'Monday'
  );
  const [notes, setNotes] = useState(initialOverride?.notes || '');

  // Get baseline / currently scheduled classes for the selected date
  const daySchedule = useMemo(() => {
    return getSchedule(date);
  }, [date, getSchedule]);

  const candidateClasses = daySchedule.classes;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let overrideData: any = undefined;

    if (type === 'room_change') {
      overrideData = { room: newRoom };
    } else if (type === 'time_change') {
      overrideData = { startTime: newStartTime, endTime: newEndTime };
    } else if (type === 'extra') {
      overrideData = {
        courseCode: extraCourseCode || 'EXTRA',
        courseName: extraCourseName || 'Extra Session',
        faculty: extraFaculty,
        room: newRoom || 'C404',
        startTime: newStartTime,
        endTime: newEndTime,
        type: 'lecture' as ClassType
      };
    }

    const payload = {
      date,
      type,
      targetClassId: targetClassId || undefined,
      swapWithClassId: type === 'swap' ? swapWithClassId || undefined : undefined,
      overrideData,
      timetableSourceDay: type === 'source_day' ? timetableSourceDay : undefined,
      notes: notes || undefined
    };

    if (initialOverride) {
      onSave({
        ...initialOverride,
        ...payload
      });
    } else {
      onSave(payload);
    }
    onClose();
  };

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialOverride ? 'Edit Schedule Change' : 'New Date-Specific Change'}
            </h3>
            <p className="text-xs text-slate-500">
              Affects only the specified date • Preserves recurring baseline
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Date Picker */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Target Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Day: {getDayOfWeek(date)}
            </span>
          </div>

          {/* Change Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Type of Change *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'swap', label: 'Swap Classes', icon: ArrowLeftRight },
                { id: 'cancel', label: 'Cancel Class', icon: Ban },
                { id: 'room_change', label: 'Change Room', icon: MapPin },
                { id: 'time_change', label: 'Change Time', icon: Clock },
                { id: 'extra', label: 'Add Extra Class', icon: PlusCircle },
                { id: 'source_day', label: 'Follow Day Schedule', icon: Calendar },
              ].map(item => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setType(item.id as OverrideType)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-[11px] leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type-Specific Fields */}
          {type === 'swap' && (
            <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  First Class to Swap *
                </label>
                <select
                  required
                  value={targetClassId}
                  onChange={e => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Select Class A --</option>
                  {candidateClasses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.startTime} – {c.courseName} ({c.courseCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Second Class to Swap With *
                </label>
                <select
                  required
                  value={swapWithClassId}
                  onChange={e => setSwapWithClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Select Class B --</option>
                  {candidateClasses
                    .filter(c => c.id !== targetClassId)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.startTime} – {c.courseName} ({c.courseCode})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {type === 'cancel' && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block font-semibold text-slate-700 mb-1">
                Class to Cancel on this Date *
              </label>
              <select
                required
                value={targetClassId}
                onChange={e => setTargetClassId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">-- Select Class --</option>
                {candidateClasses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.startTime} – {c.courseName} ({c.courseCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === 'room_change' && (
            <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Class to Move *
                </label>
                <select
                  required
                  value={targetClassId}
                  onChange={e => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Select Class --</option>
                  {candidateClasses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.startTime} – {c.courseName} (Current: Room {c.room})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Room Number *
                </label>
                <input
                  type="text"
                  required
                  value={newRoom}
                  onChange={e => setNewRoom(e.target.value)}
                  placeholder="e.g. A406 or Seminar Hall"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          )}

          {type === 'time_change' && (
            <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Class to Reschedule *
                </label>
                <select
                  required
                  value={targetClassId}
                  onChange={e => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Select Class --</option>
                  {candidateClasses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.startTime} – {c.courseName} ({c.courseCode})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    New Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={e => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    New End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'extra' && (
            <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={extraCourseCode}
                    onChange={e => setExtraCourseCode(e.target.value)}
                    placeholder="e.g. 23CSE351"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={extraCourseName}
                    onChange={e => setExtraCourseName(e.target.value)}
                    placeholder="e.g. Extra DBMS Review"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={e => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Room
                  </label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={e => setNewRoom(e.target.value)}
                    placeholder="e.g. C404"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Faculty
                  </label>
                  <input
                    type="text"
                    value={extraFaculty}
                    onChange={e => setExtraFaculty(e.target.value)}
                    placeholder="e.g. Dr. Lekshmi R."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'source_day' && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block font-semibold text-slate-700 mb-1">
                Timetable to Follow on this Date *
              </label>
              <select
                value={timetableSourceDay}
                onChange={e => setTimetableSourceDay(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {days.map(d => (
                  <option key={d} value={d}>Follow {d}'s Timetable</option>
                ))}
              </select>
            </div>
          )}

          {/* Notes / Reason */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reason / Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Swapped for project preparation, or room changed due to AC repair"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-sm active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialOverride ? 'Update Change' : 'Apply Change'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
