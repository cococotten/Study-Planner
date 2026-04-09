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

  const courses: Course[] = ['PHAR 303', 'PHAR 307', 'PHAR 306'];

  return (
    <div className="flex flex-col gap-2 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Exam Countdowns</h3>
      <div className="flex flex-wrap gap-4">
        {courses.map((course) => (
          <div key={course} className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">{course}</span>
            <Badge variant="outline" className={cn(
              "font-mono text-sm px-2 py-0.5",
              course === 'PHAR 303' ? "border-pink-200 text-pink-700 bg-pink-50" :
              course === 'PHAR 307' ? "border-green-200 text-green-700 bg-green-50" :
              "border-purple-200 text-purple-700 bg-purple-50"
            )}>
              D{getDDay(EXAM_DATES[course])}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
