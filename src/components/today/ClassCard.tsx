import React from 'react';
import { ProcessedClass } from '../../types/schedule';
import { MapPin, User, ArrowLeftRight, Ban, PlusCircle, AlertCircle, Clock, Check } from 'lucide-react';
import { formatTime12Hour } from '../../core/timeUtils';

interface ClassCardProps {
  classItem: ProcessedClass;
  onModifyClick?: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({ classItem, onModifyClick }) => {
  const isHappening = classItem.status === 'happening';
  const isCompleted = classItem.status === 'completed';
  const isUpcoming = classItem.status === 'upcoming';

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'lab':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'tutorial':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'activity':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'counselling':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-indigo-50 text-brand-700 border-indigo-200';
    }
  };

  return (
    <div
      className={`relative flex items-stretch gap-3 transition-all ${
        isCompleted ? 'opacity-65' : ''
      }`}
    >
      {/* Time Column on Left */}
      <div className="w-16 sm:w-20 flex-shrink-0 flex flex-col justify-start pt-1 text-right">
        <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
          {formatTime12Hour(classItem.startTime)}
        </span>
        <span className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
          {formatTime12Hour(classItem.endTime)}
        </span>
      </div>

      {/* Timeline Bullet Connector */}
      <div className="flex flex-col items-center">
        <div
          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
            isHappening
              ? 'bg-brand-600 border-brand-200 ring-4 ring-brand-100 scale-110'
              : isCompleted
              ? 'bg-slate-300 border-slate-200 text-white'
              : 'bg-white border-brand-400'
          }`}
        >
          {isCompleted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </div>
        <div className="w-0.5 flex-1 bg-slate-200 my-1" />
      </div>

      {/* Card Content */}
      <div
        className={`flex-1 rounded-xl p-3.5 sm:p-4 transition-all border ${
          isHappening
            ? 'bg-white border-brand-500 shadow-md ring-2 ring-brand-500/15'
            : isCompleted
            ? 'bg-slate-50 border-slate-200'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        {/* Header Tags */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
            <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {classItem.courseCode}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getTypeStyle(
                classItem.type
              )}`}
            >
              {classItem.type}
            </span>
            {classItem.slot && (
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                Slot {classItem.slot}
              </span>
            )}
          </div>

          {/* Status Badge */}
          {isHappening && (
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Happening</span>
            </span>
          )}
        </div>

        {/* Course Title */}
        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
          {classItem.courseName}
        </h4>

        {/* Details: Room, Faculty */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          <div className="flex items-center space-x-1 font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
            <MapPin className="w-3 h-3 text-brand-600 flex-shrink-0" />
            <span>Room {classItem.room}</span>
          </div>

          {classItem.faculty && (
            <div className="flex items-center space-x-1 text-slate-500">
              <User className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[200px]">{classItem.faculty}</span>
            </div>
          )}
        </div>

        {/* Date-Specific Override Notice Badge */}
        {classItem.isOverride && (
          <div className="mt-2.5 p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start space-x-2">
            {classItem.overrideType === 'swap' ? (
              <ArrowLeftRight className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
            ) : classItem.overrideType === 'extra' ? (
              <PlusCircle className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold">Modified for today: </span>
              <span>{classItem.overrideNote || 'Schedule override active'}</span>
              {classItem.originalValues?.room && (
                <span className="block text-[11px] text-purple-700">
                  Original room: {classItem.originalValues.room}
                </span>
              )}
              {classItem.originalValues?.startTime && (
                <span className="block text-[11px] text-purple-700">
                  Original time: {formatTime12Hour(classItem.originalValues.startTime)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Notes if any */}
        {classItem.notes && !classItem.isOverride && (
          <p className="mt-2 text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded">
            {classItem.notes}
          </p>
        )}
      </div>
    </div>
  );
};
