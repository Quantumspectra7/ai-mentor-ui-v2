'use client';

import { useState } from 'react';
import { Loader2, Clock, BookOpen, Zap, Coffee, RotateCcw, ChevronDown, ChevronUp, ExternalLink, AlertTriangle } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScheduleSession {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  type: 'weak_subject' | 'dsa' | 'review' | 'break';
  title: string;
  description: string;
  resources: { title: string; url: string }[];
}

interface GeneratedSchedule {
  totalMinutes: number;
  summary: string;
  strategy: string;
  sessions: ScheduleSession[];
}

interface ScheduleFormData {
  branch: string;
  marks: number;
  weakSubjects: string[];
  targetDSA: string;
  stressLevel: number;
  hoursAvailable: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const sessionStyles: Record<ScheduleSession['type'], { bg: string; border: string; icon: React.ReactNode; badge: string }> = {
  weak_subject: {
    bg: 'bg-red-500/5',
    border: 'border-red-500/30',
    icon: <BookOpen className="w-4 h-4 text-red-500" />,
    badge: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  dsa: {
    bg: 'bg-primary/5',
    border: 'border-primary/30',
    icon: <Zap className="w-4 h-4 text-primary" />,
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
  review: {
    bg: 'bg-green-500/5',
    border: 'border-green-500/30',
    icon: <RotateCcw className="w-4 h-4 text-green-500" />,
    badge: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  break: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    icon: <Coffee className="w-4 h-4 text-amber-500" />,
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
};

const typeLabel: Record<ScheduleSession['type'], string> = {
  weak_subject: 'Weak Subject',
  dsa: 'DSA Practice',
  review: 'Review',
  break: 'Break',
};

const DSA_TOPICS = [
  'Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Binary Search',
  'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming',
  'Backtracking', 'Heaps & Priority Queue', 'Tries', 'Greedy',
  'Bit Manipulation', 'Stacks & Queues', 'Sorting Algorithms',
];

const BRANCH_OPTIONS = [
  'Computer Science (CSE)', 'Electronics (ECE)', 'Electrical (EEE)',
  'Mechanical (ME)', 'Civil Engineering', 'Information Technology (IT)',
  'Business / Management', 'Other',
];

// ── Main Component ────────────────────────────────────────────────────────────
export function ScheduleGenerator() {
  const [form, setForm] = useState<ScheduleFormData>(() => {
    // Pre-fill from stored profile if available
    try {
      const raw = localStorage.getItem('mentorProfile');
      if (raw) {
        const p = JSON.parse(raw);
        return {
          branch: p.branch || '',
          marks: p.averageMarks ?? 65,
          weakSubjects: Array.isArray(p.weakSubjects) ? p.weakSubjects : [],
          targetDSA: 'Graphs',
          stressLevel: p.stressLevel ?? 3,
          hoursAvailable: p.studyHoursPerDay ?? 3,
        };
      }
    } catch { }
    return { branch: '', marks: 65, weakSubjects: [], targetDSA: 'Graphs', stressLevel: 3, hoursAvailable: 3 };
  });

  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [weakInput, setWeakInput] = useState('');

  const update = <K extends keyof ScheduleFormData>(key: K, value: ScheduleFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const addWeak = () => {
    const v = weakInput.trim();
    if (!v || form.weakSubjects.includes(v)) return;
    update('weakSubjects', [...form.weakSubjects, v]);
    setWeakInput('');
  };

  const removeWeak = (s: string) => update('weakSubjects', form.weakSubjects.filter(x => x !== s));

  const generate = async () => {
    if (!form.branch) { setError('Please select your branch.'); return; }
    setError(null);
    setIsLoading(true);
    setSchedule(null);

    try {
      const res = await fetch('/api/study/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to generate schedule.');
        return;
      }
      setSchedule(data.schedule);
      setIsFallback(data.isFallback ?? false);
      setExpandedIdx(null);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="bg-card border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground text-base">Build My Study Schedule</h3>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">AI-Powered</span>
        </div>

        {/* Row 1: Branch + Marks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Branch</label>
            <select
              value={form.branch}
              onChange={e => update('branch', e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select branch…</option>
              {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Average Marks: <span className="text-primary">{form.marks}%</span>
            </label>
            <input
              type="range" min={0} max={100} step={1}
              value={form.marks}
              onChange={e => update('marks', Number(e.target.value))}
              className="w-full accent-primary mt-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>0%</span>
              <span className={form.marks < 60 ? 'text-red-500 font-bold' : form.marks > 80 ? 'text-green-500 font-bold' : 'text-amber-500 font-bold'}>
                {form.marks < 60 ? '⚠ Below 60% — extra weak-subject focus' : form.marks > 80 ? '🌟 Above 80% — DSA-heavy plan' : '📊 Balanced plan'}
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Row 2: Target DSA + Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Target DSA Topic</label>
            <select
              value={form.targetDSA}
              onChange={e => update('targetDSA', e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              {DSA_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Hours Available: <span className="text-primary">{form.hoursAvailable}h</span>
            </label>
            <input
              type="range" min={0.5} max={10} step={0.5}
              value={form.hoursAvailable}
              onChange={e => update('hoursAvailable', Number(e.target.value))}
              className="w-full accent-primary mt-1"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>0.5h</span><span>10h</span>
            </div>
          </div>
        </div>

        {/* Row 3: Stress Level */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Stress Level: <span className="text-primary">{form.stressLevel}/5</span>
            {form.stressLevel >= 4 && <span className="ml-2 text-amber-500 font-bold text-[10px]">— Decompression breaks will be injected</span>}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => update('stressLevel', n)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                  form.stressLevel === n
                    ? n >= 4 ? 'bg-amber-500/20 border-amber-500/50 text-amber-600' : 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-background border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Row 4: Weak Subjects */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Weak Subjects</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={weakInput}
              onChange={e => setWeakInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addWeak()}
              placeholder="e.g. Operating Systems, DBMS…"
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={addWeak}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all"
            >
              Add
            </button>
          </div>
          {form.weakSubjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.weakSubjects.map(s => (
                <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold">
                  {s}
                  <button onClick={() => removeWeak(s)} className="hover:text-red-800 transition-colors">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generate}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating your optimized schedule…</>
          ) : (
            <><Clock className="w-4 h-4" /> Generate My Study Schedule</>
          )}
        </button>
      </div>

      {/* Schedule Output */}
      {schedule && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="bg-card border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-bold text-foreground text-base">Today's Optimized Schedule</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{schedule.summary}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-bold text-primary">{(schedule.totalMinutes / 60).toFixed(1)}h</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Total</p>
              </div>
            </div>
            {isFallback && (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                AI parsing failed — showing a safe fallback schedule.
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2 italic border-l-2 border-primary/40 pl-3">{schedule.strategy}</p>

            {/* Type legend */}
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(typeLabel).map(([type, label]) => {
                const count = schedule.sessions.filter(s => s.type === type).length;
                if (!count) return null;
                const style = sessionStyles[type as ScheduleSession['type']];
                return (
                  <span key={type} className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${style.badge}`}>
                    {label} × {count}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Sessions Timeline */}
          <div className="relative pl-6">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
            <div className="space-y-3">
              {schedule.sessions.map((session, idx) => {
                const style = sessionStyles[session.type];
                const isExpanded = expandedIdx === idx;
                const isBreak = session.type === 'break';

                return (
                  <div key={idx} className="relative">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[19px] top-4 w-3 h-3 rounded-full border-2 border-background z-10 ${
                      isBreak ? 'bg-amber-400' : session.type === 'dsa' ? 'bg-primary' : session.type === 'review' ? 'bg-green-500' : 'bg-red-400'
                    }`} />

                    <div
                      className={`border rounded-2xl overflow-hidden transition-all ${style.bg} ${style.border} ${!isBreak ? 'cursor-pointer hover:shadow-sm' : ''}`}
                      onClick={() => !isBreak && setExpandedIdx(isExpanded ? null : idx)}
                    >
                      <div className="flex items-center gap-3 px-4 py-3">
                        {style.icon}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${style.badge}`}>
                              {typeLabel[session.type]}
                            </span>
                            <p className="font-semibold text-foreground text-sm truncate">{session.title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{session.startTime} – {session.endTime} · {session.durationMinutes} min</p>
                        </div>
                        {!isBreak && (
                          <div className="shrink-0 text-muted-foreground">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && !isBreak && (
                        <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-3">
                          <p className="text-sm text-muted-foreground leading-relaxed">{session.description}</p>
                          {session.resources.length > 0 && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Resources</p>
                              <div className="space-y-1.5">
                                {session.resources.map((r, ri) => (
                                  <a
                                    key={ri}
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary hover:underline font-medium group"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
                                    {r.title}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regenerate */}
          <button
            onClick={generate}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-card text-sm font-bold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Regenerate Schedule
          </button>
        </div>
      )}
    </div>
  );
}
