'use client';

import { useMemo, useState, useEffect } from 'react';
import { getPhaseNumber, phaseTitles, phaseDescriptions, randomSeniorTip, motivationalQuotes, getDailyTasks, generateAdaptivePlan } from '@/lib/phaseData';
import { StudyPlanProfile } from '@/lib/studyPlanProfile';
import { FloatingChat } from '@/components/features/FloatingChat';
import { DashboardCharts } from '@/components/features/DashboardCharts';
import { DailyTasks } from '@/components/features/DailyTasks';
import { CampusGuide } from '@/components/features/CampusGuide';
import { StudyHelper } from '@/components/features/StudyHelper';
import { PanicButton } from '@/components/features/PanicButton';
import { SmartStudyAssistant } from '@/components/features/study/SmartStudyAssistant';
import { MyCorner } from '@/components/features/MyCorner';
import { GraduationScreen } from '@/components/screens/GraduationScreen';
import { CheckCircle2, MapPin, BookMarked, ChevronLeft, ChevronRight, Zap, Sparkles, Activity, Brain, GraduationCap, FolderOpen } from 'lucide-react';

interface DashboardScreenProps {
  currentDay: number;
  setCurrentDay: (day: number) => void;
  userProfile: StudyPlanProfile;
  onEditProfile?: () => void;
}

export function DashboardScreen({
  currentDay,
  setCurrentDay,
  userProfile,
  onEditProfile
}: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'tasks' | 'campus' | 'study' | 'study-ai' | 'my-corner'>('dashboard');
  const [graduationDismissed, setGraduationDismissed] = useState(() => {
    try { return localStorage.getItem('graduationDismissed') === 'true'; } catch { return false; }
  });
  const phase = getPhaseNumber(currentDay);
  const progressPercent = (currentDay / 90) * 100;
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mentorProfile');
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p.interests)) setInterests(p.interests);
      }
    } catch {}
  }, []);

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

  const todayTasks = useMemo(
    () => {
      let baseTasks = [];
      if (userProfile) {
        baseTasks = generateAdaptivePlan(currentDay, userProfile);
      } else {
        baseTasks = getDailyTasks(currentDay, interests, 2);
      }
      
      // Merge with Agentic AI injected tasks
      if (customAgentTasks.length > 0) {
        // filter out any base tasks if the AI removed them (basic matching)
        baseTasks = [...baseTasks, ...customAgentTasks];
      }
      return baseTasks;
    },
    [currentDay, interests, userProfile, customAgentTasks]
  );
  const quote = useMemo(
    () => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
    [currentDay]
  );



  const devAdvanceDay = () => {
    const raw = localStorage.getItem('mentorStartDate');
    if (raw && currentDay < 90) {
      const d = new Date(raw);
      d.setDate(d.getDate() - 1);
      localStorage.setItem('mentorStartDate', d.toISOString());
      setCurrentDay(currentDay + 1);
    }
  };

  const devRegressDay = () => {
    const raw = localStorage.getItem('mentorStartDate');
    if (raw && currentDay > 1) {
      const d = new Date(raw);
      d.setDate(d.getDate() + 1);
      localStorage.setItem('mentorStartDate', d.toISOString());
      setCurrentDay(currentDay - 1);
    }
  };

  const handleGraduationRestart = () => {
    setCurrentDay(1);
    const startDate = new Date();
    localStorage.setItem('mentorStartDate', startDate.toISOString());
    localStorage.removeItem('graduationDismissed');
    setGraduationDismissed(false);
  };

  const handleGraduationContinue = () => {
    localStorage.setItem('graduationDismissed', 'true');
    setGraduationDismissed(true);
  };

  // Show full graduation screen when day 90 is reached and not yet dismissed
  if (currentDay === 90 && !graduationDismissed) {
    return (
      <GraduationScreen
        userProfile={userProfile}
        onRestart={handleGraduationRestart}
        onContinue={handleGraduationContinue}
      />
    );
  }


  if (activeTab === 'tasks') {
    return <DailyTasks currentDay={currentDay} onBack={() => setActiveTab('dashboard')} />;
  }
  if (activeTab === 'campus') {
    return <CampusGuide onBack={() => setActiveTab('dashboard')} />;
  }
  if (activeTab === 'study') {
    return <StudyHelper onBack={() => setActiveTab('dashboard')} />;
  }
  if (activeTab === 'my-corner') {
    return <MyCorner onBack={() => setActiveTab('dashboard')} userProfile={userProfile} />;
  }
  if (activeTab === 'study-ai') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <SmartStudyAssistant onBack={() => setActiveTab('dashboard')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-background text-foreground overflow-hidden font-sans">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0 flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
               <Sparkles className="w-5 h-5 text-primary" />
             </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground truncate flex items-center gap-2">
                Mentor <span className="text-muted-foreground font-medium">/</span> <span className="text-primary">{userProfile.name}</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                {userProfile.branch}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {onEditProfile && (
              <button 
                onClick={onEditProfile}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-card border hover:border-primary rounded-xl text-sm font-bold shadow-sm transition-colors"
              >
                Edit Setup
              </button>
            )}
            <div className="bg-card border px-4 py-2 flex items-center gap-2.5 rounded-xl shadow-sm">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </div>
              <div>
                <span className="font-bold text-foreground text-base">{currentDay}</span>
                <span className="text-sm text-muted-foreground font-medium ml-1">/ 90</span>
              </div>
            </div>
            <PanicButton />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Daily Schedule (Replaced Phase Overview) */}
        <div className="bg-card text-card-foreground border p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
             <div className="flex items-center gap-3">
               <div className="p-3 rounded-2xl bg-primary/10">
                 <CheckCircle2 className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">Today's Schedule</h2>
                 <p className="text-muted-foreground text-sm">Optimized timetable for Day {currentDay}</p>
               </div>
             </div>
             <div className="text-left md:text-right">
               <p className="text-sm font-bold text-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
               <p className="text-xs text-muted-foreground font-medium">AI-Generated Agenda</p>
             </div>
          </div>
          <div className="relative pl-4 md:pl-0">
            {/* Vertical Line */}
            <div className="absolute left-[27px] md:left-[119px] top-4 bottom-4 w-px bg-border/60" />
            <div className="space-y-6 relative">
              {todayTasks.map((t: any, i: number) => {
                const times = ["08:30 AM", "01:15 PM", "05:00 PM", "08:00 PM", "10:00 PM"];
                const labels = ["Morning Focus", "Afternoon Block", "Evening Session", "Night Review", "Wind Down"];
                return (
                  <div key={i} className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-start group">
                    <div className="w-24 pt-1 md:text-right shrink-0 hidden md:block">
                      <span className="text-sm font-bold text-muted-foreground">{times[i % times.length]}</span>
                    </div>
                    <div className="relative flex-1 bg-background border rounded-2xl p-5 hover:border-primary/50 transition-colors shadow-sm ml-10 md:ml-0">
                      <div className="absolute -left-[35px] top-5 w-4 h-4 rounded-full border-4 border-background bg-primary ring-1 ring-border group-hover:bg-primary group-hover:scale-125 transition-transform" />
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="md:hidden text-xs font-bold text-muted-foreground">{times[i % times.length]}</span>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">{labels[i % labels.length]}</p>
                          </div>
                          <h3 className="font-bold text-foreground text-lg mb-1">{t.title}</h3>
                          <p className="text-sm text-muted-foreground">{t.why || "Recommended by your AI Mentor based on your profile."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">


          <button
            onClick={() => setActiveTab('tasks')}
            className="group relative rounded-3xl p-6 text-left bg-card border hover:border-primary shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Daily Objectives</h3>
            <p className="text-sm text-muted-foreground">Track your missions and achieve your daily goals.</p>
          </button>



          <button
            onClick={() => setActiveTab('study')}
            className="group relative rounded-3xl p-6 text-left bg-card border hover:border-primary shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <BookMarked className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Study Resources</h3>
            <p className="text-sm text-muted-foreground">Curated learning paths, free tools, and study techniques.</p>
          </button>

          {/* ── My Corner ── */}
          <button
            onClick={() => setActiveTab('my-corner')}
            className="group relative rounded-3xl p-6 text-left bg-card border hover:border-primary shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FolderOpen className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">My Corner</h3>
            <p className="text-sm text-muted-foreground">Track your detailed subject progress and organize folders.</p>
          </button>

          {/* ── Smart Study Assistant ── NEW ─────────────────── */}
          <button
            onClick={() => setActiveTab('study-ai')}
            className="group relative rounded-3xl p-6 text-left bg-card border-2 border-primary/30 hover:border-primary shadow-sm hover:shadow-md transition-all duration-300 sm:col-span-2 lg:col-span-1"
          >
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-wider">
                NEW ✨
              </span>
            </div>
            <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Smart Study AI</h3>
            <p className="text-sm text-muted-foreground">AI summaries, MCQs, mock tests, viva prep & flashcards from your notes.</p>
          </button>
        </div>

        {/* Intelligence Feeds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Phase Progress Card (Moved from top) */}
          <div className="bg-card border rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-0.5 text-sm uppercase tracking-wider">Phase {phase}: {phaseTitles[phase]}</h3>
                <p className="text-xs text-muted-foreground pr-2">{phaseDescriptions[phase]}</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Journey Progress</span>
                <span className="text-xs font-bold text-primary">{Math.round(progressPercent)}%</span>
              </div>
              <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progressPercent}%`, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-3 text-right">
                <span className="text-primary font-bold">{90 - currentDay}</span> days remaining
              </p>
            </div>
          </div>

          {/* Quote */}
          <div className="bg-card border rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-2 text-sm uppercase tracking-wider">Today's Mindset</h3>
                <p className="text-muted-foreground leading-relaxed font-medium border-l-2 border-primary/50 pl-4 py-1 italic">&ldquo;{quote}&rdquo;</p>
              </div>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="bg-card border rounded-[2rem] p-8 shadow-sm md:col-span-2">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-0.5 text-sm uppercase tracking-wider">Persistent Stats Dashboard</h3>
                <p className="text-xs text-muted-foreground pr-2">Your overall performance metrics and completion rates.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-background border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{currentDay}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Days Logged</p>
              </div>
              <div className="bg-background border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {(() => {
                    try {
                      const savedMap = localStorage.getItem('tasksByDay');
                      if (!savedMap) return 0;
                      const parsed = JSON.parse(savedMap);
                      return Object.values(parsed).reduce((acc: number, arr: any) => acc + (arr.length || 0), 0);
                    } catch { return 0; }
                  })()}
                </p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Total Tasks Done</p>
              </div>
              <div className="bg-background border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-500">
                  {Math.round(progressPercent)}%
                </p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Journey Progress</p>
              </div>
              <div className="bg-background border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-orange-500">{userProfile.studyHoursPerDay}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Daily Hrs Goal</p>
              </div>
            </div>
          </div>

          <DashboardCharts />
        </div>
        {currentDay === 90 && (
          <div className="mt-8 rounded-2xl p-6 border border-primary/20 bg-primary/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-bold text-foreground text-sm">Journey Complete!</p>
                <p className="text-xs text-muted-foreground">You finished the 90-day program.</p>
              </div>
            </div>
            <button
              onClick={() => setGraduationDismissed(false)}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              View Certificate
            </button>
          </div>
        )}
      </main>

      {/* Developer Time Travel Controls */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-neutral-900 text-white p-2.5 rounded-xl flex items-center gap-2 z-50 text-xs font-mono shadow-2xl border border-white/10">
          <span className="py-1 px-2 font-bold text-neutral-400">DEV MODE:</span>
          <button onClick={devRegressDay} disabled={currentDay <= 1} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg transition-colors">-1 Day</button>
          <span className="font-bold px-2 text-primary">{currentDay}/90</span>
          <button onClick={devAdvanceDay} disabled={currentDay >= 90} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg transition-colors">+1 Day</button>
        </div>
      )}

      {/* Floating AI Mentor Chat */}
      <FloatingChat currentDay={currentDay} userProfile={userProfile} />
    </div>
  );
}
