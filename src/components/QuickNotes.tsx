import { useState, useEffect } from 'react';
import { StickyNote } from 'lucide-react';

const STORAGE_KEY = 'study-flow-quick-notes';

export function QuickNotes() {
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, notes);
  }, [notes]);

  return (
    <div className="flex-1 max-w-md w-full bg-yellow-50/50 border border-yellow-200/60 rounded-xl p-3 shadow-sm transition-all hover:shadow-md group">
      <div className="flex items-center gap-2 mb-2 text-yellow-700/70 font-bold text-[10px] uppercase tracking-widest">
        <StickyNote size={12} className="group-hover:rotate-12 transition-transform" />
        <span>Quick Notes</span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Jot down quick reminders here..."
        className="w-full h-16 bg-transparent border-none resize-none text-xs text-slate-700 placeholder:text-yellow-600/30 focus:ring-0 p-0 font-medium leading-relaxed"
      />
    </div>
  );
}
