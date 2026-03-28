'use client';

import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Flame, Star, Zap, CheckCircle2, Trophy } from 'lucide-react';
import { dailyTasksByPhase } from '@/lib/phaseData';

const getPhaseNumber = (day: number): 1 | 2 | 3 => {
  if (day <= 30) return 1;
  if (day <= 60) return 2;
  return 3;
};

interface DailyTasksProps {
  currentDay: number;
  onBack: () => void;
}

const categoryEmojis: Record<string, string> = {
  academics: '📚',
  exploration: '🗺️',
  social: '👥',
  admin: '📋',
  activities: '🎯',
  learning: '💡',
  skills: '⚡',
  planning: '🎯'
};

export function DailyTasks({ currentDay, onBack }: DailyTasksProps) {
  const phase = getPhaseNumber(currentDay);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  useEffect(() => {
    const savedMap = localStorage.getItem('tasksByDay');
    if (savedMap) {
      const parsed = JSON.parse(savedMap) as Record<string, string[]>;
      if (parsed[String(currentDay)]) {
        setCompletedTasks(parsed[String(currentDay)]);
        return;
      }
    }

    const saved = localStorage.getItem(`tasksDay${currentDay}`);
    if (saved) setCompletedTasks(JSON.parse(saved));
  }, [currentDay]);

  const selectedTasks = useMemo(() => {
    const dayTasks = dailyTasksByPhase[phase];
    return dayTasks.slice(0, 3);
  }, [phase]);

  const toggleTask = (index: number) => {
    const taskId = `${currentDay}-${index}`;
    const updated = completedTasks.includes(taskId)
      ? completedTasks.filter(id => id !== taskId)
      : [...completedTasks, taskId];
    setCompletedTasks(updated);
    localStorage.setItem(`tasksDay${currentDay}`, JSON.stringify(updated));

    const existing = localStorage.getItem('tasksByDay');
    const tasksByDay = existing ? JSON.parse(existing) as Record<string, string[]> : {};
    tasksByDay[String(currentDay)] = updated;
    localStorage.setItem('tasksByDay', JSON.stringify(tasksByDay));

    const authId = localStorage.getItem('userAuthId');
    const email = localStorage.getItem('userEmail');
    if (authId || email) {
      fetch('/api/auth/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authId,
          email,
          progress: { tasksByDay },
        }),
      }).catch((error) => {
        console.error('Failed to persist tasks:', error);
      });
    }
  };

  const completionPercent = selectedTasks.length
    ? (completedTasks.length / selectedTasks.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background relative font-sans text-foreground">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-card border hover:bg-accent text-foreground transition-colors shrink-0 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-bold truncate">Daily Objectives</h1>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">Day {currentDay} of your journey</p>
            </div>
          </div>
          <div className="bg-card border px-4 py-2 rounded-xl text-center shrink-0 shadow-sm">
            <p className="text-2xl font-bold text-primary">{Math.round(completionPercent)}%</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Complete</p>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        
        {/* Progress Bar Header */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-2">
           <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-foreground">Daily Progress</span>
              <span className="text-sm font-bold text-primary">{Math.round(completionPercent)}%</span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
        </div>

        {/* Task List */}
        <div className="space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {selectedTasks.map((task, index) => {
            const taskId = `${currentDay}-${index}`;
            const isCompleted = completedTasks.includes(taskId);
            return (
              <button
                key={index}
                onClick={() => toggleTask(index)}
                className={`w-full p-6 text-left group rounded-2xl border transition-all shadow-sm hover:shadow-md ${
                  isCompleted
                    ? 'border-primary bg-primary/5'
                    : 'bg-card border-input hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-1.5 rounded-full shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border-2 border-muted-foreground/30 text-transparent group-hover:border-primary/50'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className={`font-semibold text-lg transition-colors ${
                      isCompleted
                        ? 'text-muted-foreground line-through decoration-muted-foreground/50'
                        : 'text-foreground group-hover:text-primary'
                    }`}>
                      {task.title}
                    </p>
                    <div className="inline-flex mt-2 items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                      <span>{categoryEmojis[task.category]}</span>
                      {task.category}
                    </div>
                  </div>
                  <span className="text-3xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all shrink-0">
                    {categoryEmojis[task.category] || '🎯'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-card border p-8 rounded-3xl text-center shadow-sm hover:scale-[1.02] transition-transform">
            <div className="inline-flex p-4 rounded-2xl bg-orange-500/10 mb-4 border border-orange-500/20">
              <Flame className="w-7 h-7 text-orange-500" />
            </div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Streak</p>
            <p className="text-4xl font-display font-extrabold text-foreground">{currentDay}</p>
            <p className="text-xs text-muted-foreground font-medium mt-2">days consistent</p>
          </div>

          <div className="bg-card border p-8 rounded-3xl text-center shadow-sm hover:scale-[1.02] transition-transform">
            <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 mb-4 border border-blue-500/20">
              <Star className="w-7 h-7 text-blue-500" />
            </div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Tasks Today</p>
            <p className="text-4xl font-display font-extrabold text-foreground">{selectedTasks.length}</p>
            <p className="text-xs text-muted-foreground font-medium mt-2">to complete</p>
          </div>

          <div className="bg-card border p-8 rounded-3xl text-center shadow-sm hover:scale-[1.02] transition-transform">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4 border border-primary/20">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Completed</p>
            <p className="text-4xl font-display font-extrabold text-foreground">{completedTasks.length}</p>
            <p className="text-xs text-muted-foreground font-medium mt-2">tasks done</p>
          </div>
        </div>

        {/* Achievement Card */}
        {completionPercent === 100 && (
          <div className="bg-card border border-primary/30 p-10 rounded-3xl text-center mb-12 shadow-md animate-in zoom-in-95 duration-500">
            <Trophy className="w-14 h-14 text-yellow-500 mx-auto mb-5 animate-bounce" />
            <h3 className="text-3xl font-display font-bold text-foreground mb-3 tracking-tight">Perfect Day! 🎉</h3>
            <p className="text-muted-foreground text-lg mb-6">You've completed all tasks for today. Keep up the momentum!</p>
            <div className="h-1.5 w-16 bg-primary rounded-full mx-auto" />
          </div>
        )}

      </main>
    </div>
  );
}
