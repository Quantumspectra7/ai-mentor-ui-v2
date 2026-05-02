'use client';

import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Flame, Star, CheckCircle2, Trophy, ChevronDown, ChevronUp, Lightbulb, Zap } from 'lucide-react';
import { getDailyTasks, getPhaseNumber, phaseTitles, generateAdaptivePlan } from '@/lib/phaseData';
import type { DailyTask } from '@/lib/phaseData';
import { StudyPlanProfile } from '@/lib/studyPlanProfile';

interface DailyTasksProps {
  currentDay: number;
  onBack: () => void;
}

const categoryConfig: Record<string, { emoji: string; color: string; label: string }> = {
  academics:   { emoji: '📚', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',   label: 'Academics' },
  admin:       { emoji: '📋', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', label: 'Admin' },
  exploration: { emoji: '🗺️', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20', label: 'Explore' },
  social:      { emoji: '👥', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',   label: 'Social' },
  activities:  { emoji: '🎯', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', label: 'Activity' },
  learning:    { emoji: '💡', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', label: 'Learning' },
  skills:      { emoji: '⚡', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', label: 'Skills' },
  planning:    { emoji: '🗓️', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',   label: 'Planning' },
  coding:      { emoji: '💻', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',  label: 'Coding' },
  design:      { emoji: '🎨', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',   label: 'Design' },
  sports:      { emoji: '⚽', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', label: 'Sports' },
  career:      { emoji: '🚀', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',  label: 'Career' },
  health:      { emoji: '🧘', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',   label: 'Health' },
};

const priorityConfig: Record<string, string> = {
  High: 'bg-red-500/10 text-red-600 border-red-500/20',
  Medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Low: 'bg-green-500/10 text-green-600 border-green-500/20',
};

const priorityScore = { High: 3, Medium: 2, Low: 1 };

export function DailyTasks({ currentDay, onBack }: DailyTasksProps) {
  const phase = getPhaseNumber(currentDay);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [profile, setProfile] = useState<StudyPlanProfile | null>(null);

  // Load user profile
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mentorProfile');
      if (raw) {
        const p = JSON.parse(raw);
        setProfile(p);
        if (Array.isArray(p.interests)) setInterests(p.interests);
      }
    } catch {}
  }, []);

  // Load saved completions for today
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

  const [customAgentTasks, setCustomAgentTasks] = useState<any[]>([]);

  // Listen for agentic task modifications
  useEffect(() => {
    const fetchCustomTasks = () => {
      try {
        const raw = localStorage.getItem(`customTasks_${currentDay}`);
        if (raw) setCustomAgentTasks(JSON.parse(raw));
        else setCustomAgentTasks([]);
      } catch {
        setCustomAgentTasks([]);
      }
    };

    fetchCustomTasks();
    window.addEventListener('customTasksUpdated', fetchCustomTasks);
    return () => window.removeEventListener('customTasksUpdated', fetchCustomTasks);
  }, [currentDay]);

  const selectedTasks: DailyTask[] = useMemo(() => {
    let baseTasks = profile ? generateAdaptivePlan(currentDay, profile) : getDailyTasks(currentDay, interests, 4);
    
    if (customAgentTasks.length > 0) {
      baseTasks = [...baseTasks, ...customAgentTasks.map(t => ({...t, category: t.type || 'activities', priority: t.priority || 'High'}))];
    }
    
    // Deduplicate
    const unique = Array.from(new Set(baseTasks.map(t => t.title))).map(title => baseTasks.find(t => t.title === title)!);
    
    // Sort by priority
    unique.sort((a, b) => {
      const scoreA = priorityScore[a.priority as keyof typeof priorityScore] || priorityScore.Medium;
      const scoreB = priorityScore[b.priority as keyof typeof priorityScore] || priorityScore.Medium;
      return scoreB - scoreA;
    });

    return unique;
  }, [currentDay, interests, customAgentTasks, profile]);

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
  };

  const completedCount = selectedTasks.filter((_, i) => completedTasks.includes(`${currentDay}-${i}`)).length;
  const completionPercent = selectedTasks.length ? (completedCount / selectedTasks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-card border hover:bg-accent text-foreground transition-colors shrink-0 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold truncate flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                Daily Objectives
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Day {currentDay} · {phaseTitles[phase]}
              </p>
            </div>
          </div>
          <div className="bg-card border px-4 py-2 rounded-xl text-center shrink-0 shadow-sm">
            <p className="text-2xl font-bold text-primary">{completedCount}/{selectedTasks.length}</p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Done</p>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-foreground">Today's Progress</span>
            <span className="text-sm font-bold text-primary">{Math.round(completionPercent)}%</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          {interests.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Tailored for your interests: {interests.join(' · ')}
            </p>
          )}
        </div>

        {/* Task List */}
        <div className="space-y-3 mb-10">
          {selectedTasks.map((task, index) => {
            const taskId = `${currentDay}-${index}`;
            const isCompleted = completedTasks.includes(taskId);
            const isExpanded = expandedTask === index;
            const cat = categoryConfig[task.category] || { emoji: '🎯', color: 'bg-muted text-muted-foreground border-muted', label: task.category };

            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all shadow-sm ${
                  isCompleted
                    ? 'border-primary/30 bg-primary/5'
                    : 'bg-card border-border hover:border-primary/40 hover:shadow-md'
                }`}
              >
                <div
                  onClick={() => toggleTask(index)}
                  className="w-full p-5 text-left flex items-start gap-4 cursor-pointer"
                >
                  {/* Checkbox */}
                  <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted-foreground/30 hover:border-primary/60'
                  }`}>
                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-base transition-colors ${
                      isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase tracking-wide ${cat.color}`}>
                        {cat.emoji} {cat.label}
                      </span>
                      {task.priority && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wide ${priorityConfig[task.priority] || priorityConfig.Medium}`}>
                          Priority: {task.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Why expand */}
                  {task.why && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedTask(isExpanded ? null : index); }}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="Why this task?"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Expandable "Why" section */}
                {isExpanded && task.why && (
                  <div className="px-5 pb-4 pt-1 border-t border-border/50 animate-in slide-in-from-top-1 duration-200">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="italic leading-relaxed">{task.why}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border p-5 rounded-2xl text-center shadow-sm">
            <div className="inline-flex p-2.5 rounded-xl bg-orange-500/10 mb-3 border border-orange-500/20">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{currentDay}</p>
            <p className="text-xs text-muted-foreground font-medium mt-1">Day Streak</p>
          </div>
          <div className="bg-card border p-5 rounded-2xl text-center shadow-sm">
            <div className="inline-flex p-2.5 rounded-xl bg-blue-500/10 mb-3 border border-blue-500/20">
              <Star className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{selectedTasks.length}</p>
            <p className="text-xs text-muted-foreground font-medium mt-1">Today's Tasks</p>
          </div>
          <div className="bg-card border p-5 rounded-2xl text-center shadow-sm">
            <div className="inline-flex p-2.5 rounded-xl bg-primary/10 mb-3 border border-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground font-medium mt-1">Completed</p>
          </div>
        </div>

        {/* All Done */}
        {completionPercent === 100 && (
          <div className="bg-card border border-primary/30 p-8 rounded-3xl text-center shadow-md animate-in zoom-in-95 duration-500">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-foreground mb-2">Perfect Day! 🎉</h3>
            <p className="text-muted-foreground">All {selectedTasks.length} tasks done. You're building real momentum.</p>
          </div>
        )}
      </main>
    </div>
  );
}
