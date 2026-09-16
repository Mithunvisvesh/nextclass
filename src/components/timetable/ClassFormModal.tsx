import React, { useState } from 'react';
import { TimetableClass, DayOfWeek, ClassType } from '../../types/timetable';
import { X, Check } from 'lucide-react';

interface ClassFormModalProps {
  initialClass?: TimetableClass | null;
  onSave: (classData: Omit<TimetableClass, 'id'> | TimetableClass) => void;
  onClose: () => void;
  defaultDay?: DayOfWeek;
}

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  initialClass,
  onSave,
  onClose,
  defaultDay = 'Monday'
}) => {
  const [courseCode, setCourseCode] = useState(initialClass?.courseCode || '');
  const [courseName, setCourseName] = useState(initialClass?.courseName || '');
  const [faculty, setFaculty] = useState(initialClass?.faculty || '');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(initialClass?.dayOfWeek || defaultDay);
  const [startTime, setStartTime] = useState(initialClass?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initialClass?.endTime || '09:50');
  const [room, setRoom] = useState(initialClass?.room || 'C404');
  const [type, setType] = useState<ClassType>(initialClass?.type || 'lecture');
  const [slot, setSlot] = useState(initialClass?.slot || '');
  const [notes, setNotes] = useState(initialClass?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    if (initialClass) {
      onSave({
        ...initialClass,
        courseCode,
        courseName,
        faculty,
        dayOfWeek,
        startTime,
        endTime,
        room,
        type,
        slot: slot || undefined,
        notes: notes || undefined
      });
    } else {
      onSave({
        courseCode,
        courseName,
        faculty,
        dayOfWeek,
        startTime,
        endTime,
        room,
        type,
        slot: slot || undefined,
        notes: notes || undefined
      });
    }
    onClose();
  };

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const types: ClassType[] = ['lecture', 'lab', 'tutorial', 'activity', 'counselling', 'other'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {initialClass ? 'Edit Baseline Class' : 'Add Baseline Class'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course Code
              </label>
              <input
                type="text"
                value={courseCode}
                onChange={e => setCourseCode(e.target.value)}
                placeholder="e.g. 23CSE301"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Slot (Optional)
              </label>
              <input
                type="text"
                value={slot}
                onChange={e => setSlot(e.target.value)}
                placeholder="e.g. A, PE I"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Name *
            </label>
            <input
              type="text"
              required
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
              placeholder="e.g. Machine Learning"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Day of Week
              </label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {days.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as ClassType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {types.map(t => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room Number
              </label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. C404"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Faculty Name
              </label>
              <input
                type="text"
                value={faculty}
                onChange={e => setFaculty(e.target.value)}
                placeholder="e.g. Dr. Debanjali"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Bring lab coat, or submit assignment"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-sm active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialClass ? 'Save Changes' : 'Add Class'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
