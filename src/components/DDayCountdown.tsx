import { EXAM_DATES, Course } from '../types';
import { differenceInDays, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function DDayCountdown() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDDay = (dateStr: string) => {
    const examDate = parseISO(dateStr);
    examDate.setHours(0, 0, 0, 0);
    const diff = differenceInDays(examDate, today);
    if (diff === 0) return '-Day';
    return diff > 0 ? `-${diff}` : `+${Math.abs(diff)}`;
  };

  const courses = Object.keys(EXAM_DATES) as Course[];

  const getBadgeStyles = (course: Course) => {
    switch (course) {
      case 'PHAR 303': return "border-pink-200 text-pink-700 bg-pink-50";
      case 'PHAR 307': return "border-green-200 text-green-700 bg-green-50";
      case 'PHAR 306': return "border-purple-200 text-purple-700 bg-purple-50";
      case 'EOSC': return "border-amber-200 text-amber-700 bg-amber-50";
      default: return "border-slate-200 text-slate-700 bg-slate-50";
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Exam Countdowns</h3>
      <div className="flex flex-wrap gap-4">
        {courses.map((course) => (
          <div key={course} className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">{course}</span>
            <Badge variant="outline" className={cn(
              "font-mono text-sm px-2 py-0.5",
              getBadgeStyles(course)
            )}>
              D{getDDay(EXAM_DATES[course])}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
