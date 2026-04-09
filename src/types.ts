export type Course = 'PHAR 303' | 'PHAR 307' | 'PHAR 306';

export interface StudyBlock {
  id: string;
  title: string;
  course: Course;
  isCompleted: boolean;
}

export interface DayState {
  date: string; // YYYY-MM-DD
  blocks: StudyBlock[];
  isCrossedOut: boolean;
}

export interface PlannerState {
  days: Record<string, DayState>;
  unscheduled: StudyBlock[];
}

export const COURSE_COLORS: Record<Course, string> = {
  'PHAR 303': 'bg-pink-500/40 border-pink-500/50 text-pink-900',
  'PHAR 307': 'bg-green-500/40 border-green-500/50 text-green-900',
  'PHAR 306': 'bg-purple-500/40 border-purple-500/50 text-purple-900',
};

export const EXAM_DATES: Record<Course, string> = {
  'PHAR 303': '2026-04-14',
  'PHAR 307': '2026-04-20',
  'PHAR 306': '2026-04-22',
};
