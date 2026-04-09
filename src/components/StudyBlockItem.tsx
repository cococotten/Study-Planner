import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StudyBlock, COURSE_COLORS } from '../types';
import { X, GripVertical, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  block: StudyBlock;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onToggleComplete: (id: string) => void;
  key?: string;
}

export function StudyBlockItem({ block, onDelete, onUpdateTitle, onToggleComplete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(block.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdateTitle(block.id, editTitle);
    } else {
      setEditTitle(block.title);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center p-2 mb-1 rounded-md border text-xs font-medium transition-all shadow-sm",
        block.isCompleted 
          ? "bg-slate-100 border-slate-200 text-slate-400" 
          : COURSE_COLORS[block.course],
        isDragging && "z-50 shadow-lg"
      )}
    >
      {!isEditing && (
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity mr-1.5 shrink-0"
        >
          <GripVertical size={14} />
        </div>
      )}
      
      <div className="flex items-center w-0 group-hover:w-5 overflow-hidden transition-all duration-200 shrink-0">
        <input
          type="checkbox"
          checked={block.isCompleted || false}
          onChange={() => onToggleComplete(block.id)}
          className="h-3 w-3 rounded border-slate-300 text-slate-600 focus:ring-slate-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
      
      {isEditing ? (
        <div className="flex-1 flex items-center gap-1">
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="flex-1 bg-white/50 border-none p-0 text-xs focus:ring-0 outline-none rounded"
          />
        </div>
      ) : (
        <span 
          className={cn(
            "flex-1 truncate cursor-text",
            block.isCompleted && "line-through opacity-60"
          )}
          onClick={() => !block.isCompleted && setIsEditing(true)}
        >
          {block.title}
        </span>
      )}
      
      {!isEditing && (
        <button
          onClick={() => onDelete(block.id)}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-black/5 rounded transition-all"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
