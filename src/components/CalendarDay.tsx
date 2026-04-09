import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DayState } from '../types';
import { StudyBlockItem } from './StudyBlockItem';
import { cn } from '@/lib/utils';
import { Ban } from 'lucide-react';

interface Props {
  day: DayState;
  onDeleteBlock: (id: string) => void;
  onUpdateBlockTitle: (id: string, newTitle: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleCrossOut: (date: string) => void;
  isToday: boolean;
  examLabel?: string;
  key?: string;
}

export function CalendarDay({ day, onDeleteBlock, onUpdateBlockTitle, onToggleComplete, onToggleCrossOut, isToday, examLabel }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: day.date,
  });

  const dayNumber = day.date.split('-')[2];

  const getExamStyles = () => {
    return { 
      bg: "bg-pink-50/50 ring-pink-300", 
      text: "text-pink-600", 
      badge: "text-pink-500 bg-pink-100" 
    };
  };

  const examStyles = examLabel ? getExamStyles() : null;
  const examShortLabel = examLabel ? (examLabel.includes(' ') ? examLabel.split(' ')[1] : examLabel) : '';

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative min-h-[140px] p-2 border border-slate-200 bg-white transition-colors flex flex-col gap-1 rounded-lg shadow-sm",
        isOver && "bg-slate-50 ring-2 ring-slate-300 ring-inset",
        isToday && "ring-2 ring-blue-400 ring-inset bg-blue-50/30",
        examStyles && cn(examStyles.bg, "ring-2 ring-inset")
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-semibold text-slate-500",
            isToday && "text-blue-600",
            examStyles && examStyles.text
          )}>
            {parseInt(dayNumber)}
          </span>
          {examLabel && (
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded leading-none",
              examStyles?.badge
            )}>
              EXAM: {examShortLabel}
            </span>
          )}
        </div>
        <button
          onClick={() => onToggleCrossOut(day.date)}
          className={cn(
            "p-1 rounded-full transition-colors",
            day.isCrossedOut ? "text-red-500 bg-red-50" : "text-slate-300 hover:text-red-400 hover:bg-red-50/50"
          )}
          title="Toggle Cross Out"
        >
          <Ban size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <SortableContext
          id={day.date}
          items={day.blocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {day.blocks.map((block) => (
            <StudyBlockItem
              key={block.id}
              block={block}
              onDelete={onDeleteBlock}
              onUpdateTitle={onUpdateBlockTitle}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </SortableContext>
      </div>

      {day.isCrossedOut && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden rounded-lg">
          <div className="w-[150%] h-[4px] bg-red-500/60 rotate-45 absolute" />
          <div className="w-[150%] h-[4px] bg-red-500/60 -rotate-45 absolute" />
        </div>
      )}
    </div>
  );
}
