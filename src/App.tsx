import { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { format, eachDayOfInterval } from 'date-fns';
import { Plus, LayoutGrid, ListTodo, ChevronLeft, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { PlannerState, StudyBlock, Course, DayState, COURSE_COLORS, EXAM_DATES } from './types';
import { CalendarDay } from './components/CalendarDay';
import { StudyBlockItem } from './components/StudyBlockItem';
import { DroppableUnscheduled } from './components/DroppableUnscheduled';
import { DDayCountdown } from './components/DDayCountdown';
import { QuickNotes } from './components/QuickNotes';
import { LockScreen } from './components/LockScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'study-flow-planner-v1';
const SESSION_LOCK_KEY = 'study-flow-unlocked';

const APRIL_2026 = {
  start: new Date(2026, 3, 1),
  end: new Date(2026, 3, 30)
};

export default function App() {
  const [state, setState] = useState<PlannerState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    
    // Initial state
    const days: Record<string, DayState> = {};
    const allDays = eachDayOfInterval(APRIL_2026);
    allDays.forEach(d => {
      const key = format(d, 'yyyy-MM-dd');
      days[key] = { date: key, blocks: [], isCrossedOut: false };
    });
    
    return { days, unscheduled: [] };
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockCourse, setNewBlockCourse] = useState<Course>('PHAR 303');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_sidebar');
    return saved === 'true';
  });

  const [mobileDateIndex, setMobileDateIndex] = useState(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const index = eachDayOfInterval(APRIL_2026).findIndex(d => format(d, 'yyyy-MM-dd') === today);
    return index !== -1 ? index : 0;
  });

  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem(SESSION_LOCK_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_sidebar', isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  const handleUnlock = () => {
    setIsUnlocked(true);
    sessionStorage.setItem(SESSION_LOCK_KEY, 'true');
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const allDays = useMemo(() => {
    return eachDayOfInterval(APRIL_2026);
  }, []);

  const findContainer = (id: string) => {
    if (id === 'unscheduled') return 'unscheduled';
    if (state.days[id]) return id;
    
    // Check if it's a block id
    if (state.unscheduled.find(b => b.id === id)) return 'unscheduled';
    return Object.keys(state.days).find(key => state.days[key].blocks.find(b => b.id === id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setState(prev => {
      const activeItems = activeContainer === 'unscheduled' ? prev.unscheduled : prev.days[activeContainer].blocks;
      const overItems = overContainer === 'unscheduled' ? prev.unscheduled : prev.days[overContainer].blocks;

      const activeIndex = activeItems.findIndex(i => i.id === active.id);
      const overIndex = over.id in prev.days || over.id === 'unscheduled' 
        ? overItems.length 
        : overItems.findIndex(i => i.id === over.id);

      const item = activeItems[activeIndex];

      const newUnscheduled = [...prev.unscheduled];
      const newDays = { ...prev.days };

      // Remove from source
      if (activeContainer === 'unscheduled') {
        newUnscheduled.splice(activeIndex, 1);
      } else {
        newDays[activeContainer] = {
          ...newDays[activeContainer],
          blocks: newDays[activeContainer].blocks.filter(i => i.id !== active.id)
        };
      }

      // Add to destination
      if (overContainer === 'unscheduled') {
        newUnscheduled.splice(overIndex, 0, item);
      } else {
        const destBlocks = [...newDays[overContainer].blocks];
        destBlocks.splice(overIndex, 0, item);
        newDays[overContainer] = {
          ...newDays[overContainer],
          blocks: destBlocks
        };
      }

      return { ...prev, unscheduled: newUnscheduled, days: newDays };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const items = activeContainer === 'unscheduled' ? state.unscheduled : state.days[activeContainer].blocks;
      const activeIndex = items.findIndex(i => i.id === active.id);
      const overIndex = items.findIndex(i => i.id === over.id);

      if (activeIndex !== overIndex) {
        setState(prev => {
          if (activeContainer === 'unscheduled') {
            return { ...prev, unscheduled: arrayMove(prev.unscheduled, activeIndex, overIndex) };
          } else {
            return {
              ...prev,
              days: {
                ...prev.days,
                [activeContainer]: {
                  ...prev.days[activeContainer],
                  blocks: arrayMove(prev.days[activeContainer].blocks, activeIndex, overIndex)
                }
              }
            };
          }
        });
      }
    }

    setActiveId(null);
  };

  const addBlock = () => {
    if (!newBlockTitle.trim()) return;
    const newBlock: StudyBlock = {
      id: uuidv4(),
      title: newBlockTitle,
      course: newBlockCourse,
      isCompleted: false
    };
    setState(prev => ({
      ...prev,
      unscheduled: [newBlock, ...prev.unscheduled]
    }));
    setNewBlockTitle('');
    setIsDialogOpen(false);
  };

  const deleteBlock = (id: string) => {
    setState(prev => {
      const newUnscheduled = prev.unscheduled.filter(b => b.id !== id);
      const newDays = { ...prev.days };
      Object.keys(newDays).forEach(key => {
        newDays[key] = {
          ...newDays[key],
          blocks: newDays[key].blocks.filter(b => b.id !== id)
        };
      });
      return { ...prev, unscheduled: newUnscheduled, days: newDays };
    });
  };

  const updateBlockTitle = (id: string, newTitle: string) => {
    setState(prev => {
      const newUnscheduled = prev.unscheduled.map(b => b.id === id ? { ...b, title: newTitle } : b);
      const newDays = { ...prev.days };
      Object.keys(newDays).forEach(key => {
        newDays[key] = {
          ...newDays[key],
          blocks: newDays[key].blocks.map(b => b.id === id ? { ...b, title: newTitle } : b)
        };
      });
      return { ...prev, unscheduled: newUnscheduled, days: newDays };
    });
  };

  const toggleComplete = (id: string) => {
    setState(prev => {
      const newUnscheduled = prev.unscheduled.map(b => b.id === id ? { ...b, isCompleted: !b.isCompleted } : b);
      const newDays = { ...prev.days };
      Object.keys(newDays).forEach(key => {
        newDays[key] = {
          ...newDays[key],
          blocks: newDays[key].blocks.map(b => b.id === id ? { ...b, isCompleted: !b.isCompleted } : b)
        };
      });
      return { ...prev, unscheduled: newUnscheduled, days: newDays };
    });
  };

  const toggleCrossOut = (date: string) => {
    setState(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [date]: {
          ...prev.days[date],
          isCrossedOut: !prev.days[date].isCrossedOut
        }
      }
    }));
  };

  const activeBlock = useMemo(() => {
    if (!activeId) return null;
    return state.unscheduled.find(b => b.id === activeId) || 
           Object.values(state.days).flatMap((d: DayState) => d.blocks).find(b => b.id === activeId);
  }, [activeId, state]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  if (!isUnlocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-[#FDFDFB] text-slate-900 font-sans p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-800 mb-1">Study Flow</h1>
              <p className="text-slate-500 font-medium">April 2026 Planner</p>
            </div>
            <QuickNotes />
            <DDayCountdown />
          </header>

          <div className={cn(
            "grid gap-8 items-start transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[300px_1fr]"
          )}>
            {/* Sidebar / Unscheduled */}
            {!isSidebarCollapsed && (
              <aside className="space-y-6 lg:sticky lg:top-8">
                <Card className="border-slate-200 shadow-sm overflow-hidden relative">
                  <div className="p-4 bg-slate-50 border-bottom border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold">
                      <ListTodo size={18} />
                      <span>Task Pool</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger render={<Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full" />}>
                          <Plus size={16} />
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Create Study Block</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">Title</label>
                              <Input 
                                placeholder="e.g. Lecture 1 Review" 
                                value={newBlockTitle}
                                onChange={(e) => setNewBlockTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addBlock()}
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">Course</label>
                              <Select value={newBlockCourse} onValueChange={(v) => setNewBlockCourse(v as Course)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PHAR 303">PHAR 303 (Pink)</SelectItem>
                                  <SelectItem value="PHAR 307">PHAR 307 (Green)</SelectItem>
                                  <SelectItem value="PHAR 306">PHAR 306 (Purple)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button onClick={addBlock} className="w-full">Add to Pool</Button>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0" 
                        onClick={() => setIsSidebarCollapsed(true)}
                        title="Collapse Sidebar"
                      >
                        <ChevronLeft size={16} />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <ScrollArea className="h-[500px] pr-4">
                      <DroppableUnscheduled 
                        id="unscheduled"
                        blocks={state.unscheduled}
                        onDeleteBlock={deleteBlock}
                        onUpdateBlockTitle={updateBlockTitle}
                        onToggleComplete={toggleComplete}
                      />
                    </ScrollArea>
                  </CardContent>
                </Card>

                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-800 text-sm">
                  <p className="font-semibold mb-1 flex items-center gap-2">
                    <LayoutGrid size={14} />
                    Pro Tip
                  </p>
                  <p className="opacity-80">Drag blocks from the pool onto the calendar to schedule your study sessions.</p>
                </div>
              </aside>
            )}

            {/* Calendar Grid (Desktop) */}
            <main className="hidden md:block relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {isSidebarCollapsed && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="absolute top-3 left-3 z-10 h-8 w-8 p-0 bg-white shadow-sm"
                  onClick={() => setIsSidebarCollapsed(false)}
                  title="Expand Sidebar"
                >
                  <ChevronRight size={16} />
                </Button>
              )}
              
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7">
                {/* Padding for start of month (April 1, 2026 is Wednesday = index 3) */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={`pad-${i}`} className="bg-slate-50/20 border border-slate-100" />
                ))}
                
                {allDays.map((date: Date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const examCourse = Object.keys(EXAM_DATES).find(
                    key => EXAM_DATES[key as Course] === dateStr
                  ) as Course | undefined;

                  return (
                    <CalendarDay
                      key={dateStr}
                      day={state.days[dateStr]}
                      onDeleteBlock={deleteBlock}
                      onUpdateBlockTitle={updateBlockTitle}
                      onToggleComplete={toggleComplete}
                      onToggleCrossOut={toggleCrossOut}
                      isToday={dateStr === todayStr}
                      examLabel={examCourse}
                    />
                  );
                })}

                {/* Padding for end of month (April 30 is Thursday = index 4, so 2 days padding) */}
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={`pad-end-${i}`} className="bg-slate-50/20 border border-slate-100" />
                ))}
              </div>

              <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: {
                    active: {
                      opacity: '0.5',
                    },
                  },
                }),
              }}>
                {activeBlock ? (
                  <div className={cn(
                    "p-2 rounded-md border text-xs font-medium shadow-xl ring-2 ring-slate-400 scale-105",
                    activeBlock.isCompleted 
                      ? "bg-slate-100 border-slate-200 text-slate-400" 
                      : COURSE_COLORS[activeBlock.course]
                  )}>
                    {activeBlock.title}
                  </div>
                ) : null}
              </DragOverlay>
            </main>

            {/* Calendar Single Day (Mobile) */}
            <main className="md:hidden space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={mobileDateIndex === 0}
                  onClick={() => setMobileDateIndex(prev => prev - 1)}
                >
                  <ChevronLeft size={20} />
                </Button>
                
                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    {format(allDays[mobileDateIndex], 'EEEE')}
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    {format(allDays[mobileDateIndex], 'MMMM d, yyyy')}
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={mobileDateIndex === allDays.length - 1}
                  onClick={() => setMobileDateIndex(prev => prev + 1)}
                >
                  <ChevronRight size={20} />
                </Button>
              </div>

              <div className="min-h-[400px]">
                {(() => {
                  const date = allDays[mobileDateIndex];
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const examCourse = Object.keys(EXAM_DATES).find(
                    key => EXAM_DATES[key as Course] === dateStr
                  ) as Course | undefined;

                  return (
                    <CalendarDay
                      day={state.days[dateStr]}
                      onDeleteBlock={deleteBlock}
                      onUpdateBlockTitle={updateBlockTitle}
                      onToggleComplete={toggleComplete}
                      onToggleCrossOut={toggleCrossOut}
                      isToday={dateStr === todayStr}
                      examLabel={examCourse}
                    />
                  );
                })()}
              </div>
            </main>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

