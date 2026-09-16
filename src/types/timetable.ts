export type DayOfWeek = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday' 
  | 'Sunday';

export type ClassType = 
  | 'lecture' 
  | 'lab' 
  | 'tutorial' 
  | 'activity' 
  | 'counselling' 
  | 'other';

export interface TimetableClass {
  id: string;
  courseCode: string;
  courseName: string;
  faculty: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // 'HH:mm' 24-hr format
  endTime: string;   // 'HH:mm' 24-hr format
  room: string;
  type: ClassType;
  slot?: string;
  notes?: string;
}

export interface WeeklyTimetable {
  id: string;
  name: string;
  academicTerm: string;
  classes: TimetableClass[];
}
