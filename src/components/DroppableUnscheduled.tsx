import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StudyBlock } from '../types';
import { StudyBlockItem } from './StudyBlockItem';
import { cn } from '@/lib/utils';

interface Props {
  id: string;
  blocks: StudyBlock[];
  onDeleteBlock: (id: string) => void;
  onUpdateBlockTitle: (id: string, newTitle: string) => void;
  onToggleComplete: (id: string) => void;
  key?: string;
}

export function DroppableUnscheduled({ id, blocks, onDeleteBlock, onUpdateBlockTitle, onToggleComplete }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "space-y-2 min-h-[150px] transition-colors rounded-xl p-2",
        isOver && "bg-slate-100/50 ring-2 ring-slate-200 ring-inset"
      )}
    >
      <SortableContext
        id={id}
        items={blocks.map(b => b.id)}
        strategy={verticalListSortingStrategy}
      >
        {blocks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
            No unscheduled tasks
          </div>
        ) : (
          blocks.map((block) => (
            <StudyBlockItem
              key={block.id}
              block={block}
              onDelete={onDeleteBlock}
              onUpdateTitle={onUpdateBlockTitle}
              onToggleComplete={onToggleComplete}
            />
          ))
        )}
      </SortableContext>
    </div>
  );
}
