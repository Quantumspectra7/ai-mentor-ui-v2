'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Trophy, Star, Sparkles, RotateCcw, GraduationCap,
  BookOpen, CheckCircle2, Brain, Zap, CalendarDays,
  ArrowRight, Share2, Target, Flame, Medal, ChevronRight
} from 'lucide-react';

import { StudyPlanProfile } from '@/lib/studyPlanProfile';

interface GraduationScreenProps {
  userProfile: StudyPlanProfile;
  onRestart: () => void;
  onContinue: () => void; // stay on dashboard, just reset the "wow" moment
}

// Phase titles matching the existing app
const PHASES = [
  { num: 1, label: 'AI Calibration', days: '1–30', emoji: '🧠', desc: 'Mapped your unique learning profile & baseline' },
  { num: 2, label: 'Adaptive Execution', days: '31–60', emoji: '⚡', desc: 'Mastered personalized daily study protocols' },
  { num: 3, label: 'Predictive Mastery', days: '61–90', emoji: '🎯', desc: 'Reached peak performance via smart analytics' },
];

const ACHIEVEMENTS = [
  { icon: '📅', title: '90-Day Streak', desc: 'Completed the full AI mentorship journey' },
  { icon: '🧠', title: 'Algorithm Aligned', desc: 'Perfectly synced with your AI study rhythms' },
  { icon: '🤖', title: 'AI-Powered Learner', desc: 'Used Smart Study AI to supercharge revision' },
  { icon: '💡', title: 'Problem Solver', desc: 'Tackled real challenges with your AI mentor' },
  { icon: '🔥', title: 'Consistent', desc: 'Showed up every day through 3 adaptive phases' },
  { icon: '🛡️', title: 'Stress Resistant', desc: 'Maintained mental bandwidth through predictive AI pacing' },
];

export function GraduationScreen({ userProfile, onRestart, onContinue }: GraduationScreenProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [visibleAchievements, setVisibleAchievements] = useState(0);
  const [choice, setChoice] = useState<'none' | 'restart' | 'continue'>('none');

  useEffect(() => {
    setShowConfetti(true);
    // Stagger-reveal achievements
    const timers = ACHIEVEMENTS.map((_, i) =>
      setTimeout(() => setVisibleAchievements(i + 1), 400 + i * 180)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleRestart = () => {
    setChoice('restart');
    setTimeout(onRestart, 600);
  };

  const handleContinue = () => {
    setChoice('continue');
    setTimeout(onContinue, 400);
  };

  // Simple CSS confetti via animated spans
  const confettiColors = ['bg-primary', 'bg-yellow-400', 'bg-green-400', 'bg-pink-400', 'bg-purple-400', 'bg-blue-400'];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className={`absolute w-2 h-2 rounded-sm opacity-80 ${confettiColors[i % confettiColors.length]}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 10 + 5}%`,
                animation: `fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px hsl(var(--primary) / 0.3); }
          50%        { box-shadow: 0 0 50px hsl(var(--primary) / 0.6); }
        }
        .glow-ring {
          animation: pulse-glow 2.5s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 space-y-16">

        {/* ── Hero ── */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative w-28 h-28 rounded-full bg-primary/10 border-4 border-primary/30 flex items-center justify-center glow-ring">
              <Trophy className="w-14 h-14 text-primary" />
              <span className="absolute -top-2 -right-2 text-2xl">✨</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
              🎉 Journey Complete · Day 90
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
              You made it,{' '}
              <span className="text-primary">{userProfile.name.split(' ')[0]}</span>!
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              90 days. 3 phases. Countless wins. You've gone from a new admit
              to a fully adapted LPU student — that's no small thing.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
              🎓 {userProfile.branch}
            </span>
            {userProfile.weakSubjects?.map(i => (
              <span key={i} className="px-4 py-2 rounded-full bg-muted border border-border text-muted-foreground text-sm font-semibold">
                {i}
              </span>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <CalendarDays className="w-5 h-5 text-primary" />, value: '90', label: 'Days Completed' },
            { icon: <Target className="w-5 h-5 text-green-500" />, value: '3', label: 'Phases Mastered' },
            { icon: <Flame className="w-5 h-5 text-orange-500" />, value: '100%', label: 'Journey Progress' },
            { icon: <Medal className="w-5 h-5 text-yellow-500" />, value: `${ACHIEVEMENTS.length}`, label: 'Achievements' },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-2xl p-5 text-center shadow-sm">
              <div className="flex justify-center mb-2">{s.icon}</div>
              <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Phase Journey ── */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Your 90-Day Journey
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {PHASES.map((ph, i) => (
              <div key={ph.num} className="relative bg-card border rounded-2xl p-6 shadow-sm">
                {i < PHASES.length - 1 && (
                  <ChevronRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                )}
                <div className="text-3xl mb-3">{ph.emoji}</div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Phase {ph.num} · Days {ph.days}</p>
                <h3 className="font-bold text-foreground mb-1">{ph.label}</h3>
                <p className="text-sm text-muted-foreground">{ph.desc}</p>
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Achievements ── */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Achievements Unlocked
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((a, i) => (
              <div
                key={a.title}
                className={`flex items-center gap-4 p-4 bg-card border rounded-2xl shadow-sm transition-all duration-500 ${i < visibleAchievements ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                  {a.icon}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── What's next? ── */}
        <div className="bg-card border rounded-3xl p-8">
          <h2 className="text-xl font-bold text-foreground mb-2">What happens next?</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-lg">
            Your first 90 days are done — but your LPU journey is just getting started.
            Choose how you'd like to continue.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Year 2 / Continue */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Continue your Journey</p>
                  <p className="text-xs text-muted-foreground">Keep all tools, unlock deeper goals</p>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  'Smart Study AI stays fully active',
                  'AI Mentor Chat continues',
                  'Daily objectives refresh with advanced content',
                  'All your notebooks & test history preserved',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleContinue}
                disabled={choice !== 'none'}
                className={`mt-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-sm hover:bg-primary/90 transition-all disabled:opacity-60 ${choice === 'continue' ? 'scale-95' : 'hover:scale-105'
                  }`}
              >
                <Sparkles className="w-4 h-4" />
                Continue Journey
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Restart */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted">
                  <RotateCcw className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Restart Journey</p>
                  <p className="text-xs text-muted-foreground">Go back to Day 1 fresh</p>
                </div>
              </div>
              <ul className="space-y-2">
                {[
                  'Reset day counter to Day 1',
                  'Re-experience the full 90-day path',
                  'Great for a fresh semester start',
                  'Smart Study notebooks kept',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleRestart}
                disabled={choice !== 'none'}
                className={`mt-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card border font-bold text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-60 ${choice === 'restart' ? 'scale-95' : ''
                  }`}
              >
                <RotateCcw className="w-4 h-4" />
                Restart from Day 1
              </button>
            </div>
          </div>
        </div>

        {/* ── Tools still available ── */}
        <div className="text-center pb-4">
          <p className="text-sm text-muted-foreground mb-4 font-medium">
            All study tools remain fully available regardless of your choice:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: <Brain className="w-3.5 h-3.5" />, label: 'AI Mentor Chat' },
              { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Smart Study AI' },
              { icon: <Target className="w-3.5 h-3.5" />, label: 'Daily Objectives' },
              { icon: <GraduationCap className="w-3.5 h-3.5" />, label: 'Mock Tests' },
            ].map(t => (
              <span
                key={t.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-xs font-semibold text-muted-foreground"
              >
                {t.icon}
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
