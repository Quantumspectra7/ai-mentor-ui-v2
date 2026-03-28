'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Sparkles, BookOpen, TrendingUp, ArrowRight, Zap, Brain, Loader2 } from 'lucide-react';

const INTEREST_OPTIONS = ['Coding', 'Design', 'Core', 'Robotics', 'Sports', 'Arts'];

interface LandingScreenProps {
  mode?: 'landing' | 'onboarding';
  onStartJourney?: () => void;
  onBackFromOnboarding?: () => void;
  onStart: (profile: {
    name: string;
    branch: string;
    hostel: string;
    interests: string[];
    extracurricular: string;
  }) => void;
}

export function LandingScreen({ mode = 'landing', onStartJourney, onBackFromOnboarding, onStart }: LandingScreenProps) {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [hostel, setHostel] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [extracurricular, setExtracurricular] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isOnboarding = mode === 'onboarding';

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleStart = async () => {
    if (name && branch) {
      setIsSaving(true);
      
      try {
        const userEmail = localStorage.getItem('userEmail');
        const userAuthId = localStorage.getItem('userAuthId');
        
        await fetch('/api/auth/save-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            authId: userAuthId,
            name,
            branch,
            hostel,
            interests,
            extracurricular,
            progress: {
              currentDay: 1,
              mentorState: 'dashboard',
              lpuState: localStorage.getItem('lpuState')
                ? JSON.parse(localStorage.getItem('lpuState') as string)
                : null,
            },
          }),
        });

        onStart?.({
          name,
          branch,
          hostel,
          interests,
          extracurricular
        });
      } catch (error) {
        console.error('Failed to save profile:', error);
        onStart?.({
          name,
          branch,
          hostel,
          interests,
          extracurricular
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!isOnboarding) {
    return (
      <div className="min-h-screen relative bg-background text-foreground overflow-hidden">
        {/* Crisp Grid Background */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full opacity-[0.03] dark:opacity-[0.05]" {...{ 'xmlns': 'http://www.w3.org/2000/svg' }}>
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
          <div className="max-w-5xl mx-auto w-full">
            {/* Hero Section */}
            <div className="text-center space-y-8 mb-20 mt-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card shadow-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Introducing Your AI Mentor</span>
              </div>

              <div className="space-y-6">
                <h1 className="font-display font-bold text-5xl md:text-7xl tracking-tight text-balance leading-tight text-foreground">
                  Master Your<br />
                  <span className="text-primary">First 90 Days</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Your personal AI mentor guides you through campus life with real advice, daily tasks, and emotional support. From orientation to confidence, we've got you covered.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                <div className="bg-card border rounded-3xl p-8 text-left shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">AI Mentor Chat</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Get instant personalized advice on academics, campus life, and personal growth.</p>
                </div>

                <div className="bg-card border rounded-3xl p-8 text-left shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Campus & Study Hub</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Navigate campus, find resources, and discover how to excel in your studies.</p>
                </div>

                <div className="bg-card border rounded-3xl p-8 text-left shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Progress & Growth</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Track daily milestones and celebrate your journey from day 1 to day 90.</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-12 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={onStartJourney}
                  className="inline-flex items-center gap-3 text-base font-semibold group px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Zap className="w-4 h-4" />
                  Start Your 90-Day Journey
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  href="/lpu"
                  className="inline-flex items-center gap-3 text-base font-semibold px-8 py-4 rounded-xl border bg-card hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
                >
                  Explore LPU Ecosystem
                </Link>
              </div>

              <p className="text-sm text-muted-foreground pt-6 font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> No credit card required • 100% Local Processing • No tracking
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding Form (SaaS Clean)
  return (
    <div className="min-h-screen relative bg-background text-foreground flex items-center justify-center py-10">
      <div className="relative z-10 w-full max-w-3xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <button
          onClick={onBackFromOnboarding}
          className="mb-8 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group text-sm font-medium w-fit border bg-card px-5 py-2.5 rounded-full hover:bg-accent shadow-sm"
        >
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Cancel Setup
        </button>

        <div className="bg-card border rounded-[2.5rem] p-8 md:p-12 shadow-lg">
          <div className="mb-10 text-center">
            <h1 className="font-display font-bold text-4xl text-foreground mb-4 tracking-tight">
              Tell Us About Yourself
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              We use this data to instantly personalize your AI mentor and tailor your dashboard.
            </p>
          </div>

          <div className="space-y-8 max-w-2xl mx-auto">
            {/* Name Input */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Your Full Name
              </label>
              <div className="relative">
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 bg-background border-input text-foreground text-lg rounded-xl pl-12 focus-visible:ring-primary shadow-sm"
                />
                <Brain className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch Select */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  Academic Branch
                </label>
                <div className="relative">
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full h-14 bg-background border border-input text-foreground pl-12 pr-10 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-base"
                  >
                    <option value="" disabled>Select branch</option>
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="EEE">Electrical (EEE)</option>
                    <option value="ME">Mechanical (ME)</option>
                    <option value="CIVIL">Civil Engineering</option>
                    <option value="Other">Other</option>
                  </select>
                  <Zap className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Hostel Select */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  Living Status
                </label>
                <div className="relative">
                  <select
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    className="w-full h-14 bg-background border border-input text-foreground pl-12 pr-10 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-base"
                  >
                    <option value="" disabled>Select status</option>
                    <option value="hostel">Hostel Resident</option>
                    <option value="day">Day Scholar</option>
                  </select>
                  <BookOpen className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                Activities <span className="text-muted-foreground font-normal text-xs">Optional</span>
              </label>
              <div className="relative">
                <Input
                  placeholder="e.g. Sports, Robotics, Arts"
                  value={extracurricular}
                  onChange={(e) => setExtracurricular(e.target.value)}
                  className="h-14 bg-background border-input text-foreground text-base rounded-xl pl-12 focus-visible:ring-primary shadow-sm"
                />
                <Sparkles className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-4 pt-2">
               <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                Interests <span className="text-muted-foreground font-normal text-xs">{interests.length} selected</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {INTEREST_OPTIONS.map((interest) => {
                  const isActive = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                          : 'bg-background hover:bg-accent text-foreground border-input'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-8">
              <button
                onClick={handleStart}
                disabled={!name || !branch}
                className={`w-full h-14 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                  name && branch
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    Initialize Profile
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
