import { DayOfWeek, TimetableClass } from './timetable';

export type OverrideType = 
  | 'cancel'        // Cancel a class
  | 'swap'          // Swap two classes
  | 'extra'         // Add an extra class
  | 'room_change'   // Change room for a class
  | 'time_change'   // Change time for a class
  | 'source_day'    // Make date follow another day's timetable
  | 'edit';         // General edit of a class instance

export interface DateOverride {
  id: string;
  date: string; // ISO format 'YYYY-MM-DD'
  type: OverrideType;
  targetClassId?: string;       // Affected class ID
  swapWithClassId?: string;     // If swapping, the second class ID
  overrideData?: Partial<TimetableClass>; // Custom properties (room, times, extra class details)
  timetableSourceDay?: DayOfWeek; // For 'source_day' override
  notes?: string;
  createdAt: string;
}
