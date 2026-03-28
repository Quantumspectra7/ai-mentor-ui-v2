'use client';

import { useMemo, useState } from 'react';
import { getPhaseNumber, phaseTitles, phaseDescriptions, randomSeniorTip, motivationalQuotes } from '@/lib/phaseData';
import { MentorChat } from '@/components/features/MentorChat';
import { DailyTasks } from '@/components/features/DailyTasks';
import { CampusGuide } from '@/components/features/CampusGuide';
import { StudyHelper } from '@/components/features/StudyHelper';
import { PanicButton } from '@/components/features/PanicButton';
import { CheckCircle2, MapPin, BookMarked, ChevronLeft, ChevronRight, Zap, Sparkles, Activity, Brain, LogOut } from 'lucide-react';

interface DashboardScreenProps {
  currentDay: number;
  setCurrentDay: (day: number) => void;
  userProfile: {
    name: string;
    branch: string;
    hostel: string;
    interests: string[];
  };
  userEmail?: string;
  onLogout?: () => void;
}

export function DashboardScreen({
  currentDay,
  userEmail,
  onLogout,
  setCurrentDay,
  userProfile
}: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'tasks' | 'campus' | 'study'>('dashboard');
  const phase = getPhaseNumber(currentDay);
  const progressPercent = (currentDay / 90) * 100;
  const tip = useMemo(() => randomSeniorTip(), [currentDay]);
  const quote = useMemo(
    () => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
    [currentDay]
  );

  const handleNextDay = () => {
    if (currentDay < 90) {
      const newDay = currentDay + 1;
      setCurrentDay(newDay);
      localStorage.setItem('mentorDay', newDay.toString());
    }
  };

  const handlePreviousDay = () => {
    if (currentDay > 1) {
      const newDay = currentDay - 1;
      setCurrentDay(newDay);
      localStorage.setItem('mentorDay', newDay.toString());
    }
  };

  if (activeTab === 'chat') {
    return <MentorChat currentDay={currentDay} onBack={() => setActiveTab('dashboard')} />;
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
                {userProfile.branch}{userProfile.hostel && ` • ${userProfile.hostel}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
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
            {onLogout && (
              <button
                onClick={onLogout}
                title={userEmail || 'Logout'}
                className="group relative p-2.5 rounded-xl bg-card border hover:border-destructive hover:bg-destructive/10 hover:text-destructive text-muted-foreground shadow-sm transition-colors"
              >
                <LogOut className="w-5 h-5 transition-colors" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Phase Overview Card */}
        <div className="bg-card text-card-foreground border p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <div className="flex-1">
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary tracking-wide uppercase">Operational Phase {phase}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 tracking-tight">{phaseTitles[phase]}</h2>
              <p className="text-muted-foreground max-w-xl text-base md:text-lg">{phaseDescriptions[phase]}</p>
            </div>
            <div className="md:text-right shrink-0">
              <div className="text-5xl md:text-6xl font-display font-extrabold text-foreground mb-1 tracking-tighter">
                {Math.round(progressPercent)}<span className="text-3xl text-muted-foreground">%</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                <span className="text-primary font-bold">{90 - currentDay}</span> days remaining
              </p>
            </div>
          </div>
          <div className="mt-10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Journey Progress</span>
              <span className="text-xs font-bold text-primary">Day {currentDay}</span>
            </div>
            <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progressPercent}%`, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <button
            onClick={() => setActiveTab('chat')}
            className="group relative rounded-3xl p-6 text-left bg-card border hover:border-primary shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">AI Mentor Chat</h3>
            <p className="text-sm text-muted-foreground">Direct link for instant guidance and personalized advice.</p>
          </button>

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
            onClick={() => setActiveTab('campus')}
            className="group relative rounded-3xl p-6 text-left bg-card border hover:border-primary shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Ecosystem Map</h3>
            <p className="text-sm text-muted-foreground">Navigate the physical campus grid natively.</p>
          </button>

          <button
            onClick={() => setActiveTab('study')}
            className="group relative rounded-3xl p-6 text-left bg-card border hover:border-primary shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <BookMarked className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Study Archives</h3>
            <p className="text-sm text-muted-foreground">Access your academic logs and premium core databases.</p>
          </button>
        </div>

        {/* Intelligence Feeds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card border rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-2 text-sm uppercase tracking-wider">Transmission Received</h3>
                <p className="text-muted-foreground leading-relaxed italic border-l-2 border-primary/50 pl-4 py-1">" {tip} "</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-2 text-sm uppercase tracking-wider">System Directive</h3>
                <p className="text-muted-foreground leading-relaxed font-medium border-l-2 border-primary/50 pl-4 py-1">{quote}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Controls */}
        <div className="bg-card border rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="font-display font-bold text-xl text-foreground mb-1">Time Controls</h3>
            <p className="text-sm text-muted-foreground font-medium">
              Logging Day <span className="text-primary font-bold">{currentDay}</span> of 90
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button
              onClick={handlePreviousDay}
              disabled={currentDay === 1}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-background border hover:bg-accent text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Regress</span>
            </button>
            <button
              onClick={handleNextDay}
              disabled={currentDay === 90}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
            >
              <span className="hidden sm:inline">Advance Cycle</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {currentDay === 90 && (
          <div className="mt-12 rounded-[2.5rem] p-16 text-center border bg-card shadow-lg">
            <div className="text-8xl mb-6">🏆</div>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4 tracking-tight">
              Calibration Complete
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Simulation ended. You have successfully adapted to the campus ecosystem. Retain system logs, share your data packet, and proceed to Year 2 protocols.
            </p>
            <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:shadow-md hover:bg-primary/90 transition-all">
              Broadcast Achievement
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
