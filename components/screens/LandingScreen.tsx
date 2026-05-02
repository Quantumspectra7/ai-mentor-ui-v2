'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { Sparkles, BookOpen, TrendingUp, ArrowRight, Zap, Brain, Plus, X } from 'lucide-react';
import { defaultStudyPlanProfile, StudyPlanProfile } from '@/lib/studyPlanProfile';

const BRANCH_OPTIONS = [
  'Computer Science (CSE)',
  'Electronics (ECE)',
  'Electrical (EEE)',
  'Mechanical (ME)',
  'Civil Engineering',
  'Business / Management',
  'Design',
  'Other',
];

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Programming',
  'Data Structures',
  'Electronics',
  'Mechanics',
  'Communication Skills',
];

const clampNumber = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};

interface LandingScreenProps {
  mode?: 'landing' | 'onboarding';
  onStartJourney?: () => void;
  onExportLPU?: () => void;
  onBackFromOnboarding?: () => void;
  onStart: (profile: StudyPlanProfile) => void;
}

const getAttendanceColor = (val: number) => {
  if (val < 60) return "bg-red-500";
  if (val < 75) return "bg-orange-500";
  if (val < 85) return "bg-yellow-500";
  return "bg-green-500";
};

const getAttendanceBorder = (val: number) => {
  if (val < 60) return "border-red-500";
  if (val < 75) return "border-orange-500";
  if (val < 85) return "border-yellow-500";
  return "border-green-500";
};

export function LandingScreen({ mode = 'landing', onStartJourney, onExportLPU, onBackFromOnboarding, onStart }: LandingScreenProps) {
  const [planInput, setPlanInput] = useState<StudyPlanProfile>(defaultStudyPlanProfile);
  const [customSubject, setCustomSubject] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Must be declared here (before any conditional return) to satisfy Rules of Hooks
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const isOnboarding = mode === 'onboarding';

  const updatePlanInput = <K extends keyof StudyPlanProfile>(key: K, value: StudyPlanProfile[K]) => {
    setPlanInput((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const toggleWeakSubject = (subject: string) => {
    const nextSubjects = planInput.weakSubjects.includes(subject)
      ? planInput.weakSubjects.filter((item) => item !== subject)
      : [...planInput.weakSubjects, subject];
    updatePlanInput('weakSubjects', nextSubjects);
  };

  const addCustomSubject = () => {
    const subject = customSubject.trim();
    if (!subject || planInput.weakSubjects.includes(subject)) return;
    updatePlanInput('weakSubjects', [...planInput.weakSubjects, subject]);
    setCustomSubject('');
  };

  const validatePlanInput = () => {
    const nextErrors: Record<string, string> = {};
    if (!planInput.branch) nextErrors.branch = 'Select your branch.';
    if (planInput.attendance < 0 || planInput.attendance > 100) nextErrors.attendance = 'Attendance must be 0-100%.';
    if (planInput.averageMarks < 0 || planInput.averageMarks > 100) nextErrors.averageMarks = 'Marks must be 0-100%.';
    if (planInput.weakSubjects.length === 0) nextErrors.weakSubjects = 'Select at least one weak subject.';
    if (planInput.studyHoursPerDay < 0 || planInput.studyHoursPerDay > 12) nextErrors.studyHoursPerDay = 'Study hours must be 0-12.';
    if (planInput.stressLevel < 1 || planInput.stressLevel > 5) nextErrors.stressLevel = 'Stress level is required.';
    if (planInput.hoursAvailableToday < 0 || planInput.hoursAvailableToday > 12) nextErrors.hoursAvailableToday = 'Today hours must be 0-12.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleStart = () => {
    if (!validatePlanInput()) return;
    onStart?.({
      ...planInput,
      name: planInput.name.trim(),
      averageMarks: clampNumber(planInput.averageMarks, 0, 100),
      attendance: clampNumber(planInput.attendance, 0, 100),
      studyHoursPerDay: clampNumber(planInput.studyHoursPerDay, 0, 12),
      hoursAvailableToday: clampNumber(planInput.hoursAvailableToday, 0, 12),
    });
  };

  if (!isOnboarding) {
    return (
      <BackgroundBeamsWithCollision className="min-h-screen">
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

        <div className="relative z-10 flex items-center justify-center w-full px-4 py-12">
          <div className="max-w-5xl mx-auto w-full">
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center space-y-8 mb-20 mt-12"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Introducing Your AI Mentor</span>
              </motion.div>

              <div className="space-y-6">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="font-display font-bold text-5xl md:text-7xl tracking-tight text-balance leading-tight text-foreground"
                >
                  Master Your<br />
                  <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">First 90 Days</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                >
                  Transform academic pressure into predictable success. Access personalized daily roadmaps, proactive stress management, and an intelligent companion dedicated to your continuous growth.
                </motion.p>
              </div>

              {/* Features Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12"
              >
                <div className="bg-card border rounded-3xl p-8 text-left shadow-sm hover:shadow-md transition-shadow group">
                  <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">AI Mentor Chat</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Get instant personalized advice on academics, campus life, and personal growth.</p>
                </div>

                <div className="bg-card border rounded-3xl p-8 text-left shadow-sm hover:shadow-md transition-shadow group">
                  <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Campus & Study Hub</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Navigate campus, find resources, and discover how to excel in your studies.</p>
                </div>

                <div className="bg-card border rounded-3xl p-8 text-left shadow-sm hover:shadow-md transition-shadow group">
                  <div className="mb-6 inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Progress & Growth</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Track daily milestones and celebrate your journey from day 1 to day 90.</p>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="pt-12 flex flex-wrap items-center justify-center gap-4"
              >
                <button
                  onClick={onStartJourney}
                  className="inline-flex items-center gap-3 text-base font-semibold group px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <Zap className="w-4 h-4" />
                  Start Your 90-Day Journey
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="text-sm text-muted-foreground pt-6 font-medium flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-500" /> No credit card required • 100% Local Processing • No tracking
              </motion.p>
            </motion.div>
          </div>
        </div>
      </BackgroundBeamsWithCollision>
    );
  }


  const handleNextStep = () => {
    if (step === 1) {
      if (!planInput.branch) { setErrors({ branch: 'Select your branch.' }); return; }
      if (planInput.weakSubjects.length === 0) { setErrors({ weakSubjects: 'Select at least one weak subject.' }); return; }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      if (planInput.stressLevel < 1 || planInput.stressLevel > 5) { setErrors({ stressLevel: 'Stress level is required.' }); return; }
      setErrors({});
      setStep(3);
    } else if (step === 3) {
      if (!validatePlanInput()) return;
      setStep(4);
      setIsGenerating(true);
      setTimeout(() => {
        handleStart();
      }, 2500);
    }
  };

  const handlePrevStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  // Onboarding Form (Study Plan Generator)
  return (
    <div className="min-h-screen relative bg-background text-foreground flex items-center justify-center py-10">
      <div className="relative z-10 w-full max-w-4xl px-4">
        
        {step < 4 && (
          <button
            onClick={onBackFromOnboarding}
            className="mb-8 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group text-sm font-medium w-fit border bg-card px-5 py-2.5 rounded-full hover:bg-accent shadow-sm"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Cancel Setup
          </button>
        )}

        <div className="bg-card border rounded-[2.5rem] p-8 md:p-12 shadow-lg relative overflow-hidden">
          
          {/* Progress Bar */}
          {step < 4 && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: `${((step - 1) / 3) * 100}%` }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {step === 4 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 space-y-8"
            >
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-spin border-t-primary" style={{ animationDuration: '1.5s' }} />
                <Brain className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div>
                <h2 className="font-display font-bold text-3xl text-foreground mb-3">Generating Your Plan...</h2>
                <p className="text-muted-foreground text-lg">Our AI is analyzing your profile and building your 90-day roadmap.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-10 text-center">
                <h1 className="font-display font-bold text-4xl text-foreground mb-4 tracking-tight">
                  {step === 1 ? "Basic Info & Academics" : step === 2 ? "Mindset & Behavior" : "Goals & Availability"}
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Step {step} of 3
                </p>
              </div>

              <div className="space-y-10 max-w-3xl mx-auto">
                
                {step === 1 && (
                  <>
                    {/* SECTION 1: Basic */}
                    <section className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Name <span className="text-muted-foreground font-normal">(Optional)</span></label>
                          <div className="relative">
                            <Input placeholder="Your Name" value={planInput.name} onChange={(e) => updatePlanInput('name', e.target.value)} className="h-12 bg-background border-input pl-10" />
                            <Brain className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground">Academic Branch</label>
                          <div className="relative">
                            <select value={planInput.branch} onChange={(e) => updatePlanInput('branch', e.target.value)} className="w-full h-12 bg-background border border-input text-foreground pl-10 pr-4 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm">
                              <option value="" disabled>Select branch</option>
                              {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <Zap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          </div>
                          {errors.branch && <p className="text-xs text-destructive">{errors.branch}</p>}
                        </div>
                      </div>
                    </section>

                    {/* SECTION 2: Academic Status */}
                    <section className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <label className="text-sm font-semibold flex justify-between">Attendance <span>{planInput.attendance}%</span></label>
                          <Slider value={[planInput.attendance]} min={0} max={100} step={1} indicatorClass={getAttendanceColor(planInput.attendance)} thumbClass={getAttendanceBorder(planInput.attendance)} onValueChange={([val]) => updatePlanInput('attendance', val)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Average Marks (%)</label>
                          <Input type="number" min={0} max={100} placeholder="e.g. 75" value={planInput.averageMarks || ''} onChange={(e) => updatePlanInput('averageMarks', parseInt(e.target.value) || 0)} className="h-12 bg-background border-input" />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-sm font-semibold">Weak Subjects</label>
                        <div className="flex flex-wrap gap-2">
                          {SUBJECT_OPTIONS.map((sub) => {
                            const isActive = planInput.weakSubjects.includes(sub);
                            return (
                              <button key={sub} onClick={() => toggleWeakSubject(sub)} className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent text-foreground border-input'}`}>
                                {sub}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-2 max-w-sm mt-2">
                          <Input placeholder="Add custom subject" value={customSubject} onChange={(e) => setCustomSubject(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustomSubject()} className="h-10 text-sm" />
                          <button onClick={addCustomSubject} className="px-3 rounded-md bg-accent hover:bg-accent/80 transition-colors border"><Plus className="w-4 h-4 text-foreground" /></button>
                        </div>
                        {planInput.weakSubjects.filter(s => !SUBJECT_OPTIONS.includes(s)).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {planInput.weakSubjects.filter(s => !SUBJECT_OPTIONS.includes(s)).map(sub => (
                              <span key={sub} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                                {sub}
                                <button onClick={() => toggleWeakSubject(sub)} className="hover:text-primary/70"><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                        )}
                        {errors.weakSubjects && <p className="text-xs text-destructive">{errors.weakSubjects}</p>}
                      </div>
                    </section>
                  </>
                )}

                {step === 2 && (
                  <>
                    <section className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <label className="text-sm font-semibold flex justify-between">Stress Level <span>{planInput.stressLevel}/5</span></label>
                          <Slider value={[planInput.stressLevel]} min={1} max={5} step={1} onValueChange={([val]) => updatePlanInput('stressLevel', val)} />
                          {errors.stressLevel && <p className="text-xs text-destructive">{errors.stressLevel}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Main Stress Cause</label>
                          <select value={planInput.stressCause} onChange={(e) => updatePlanInput('stressCause', e.target.value as any)} className="w-full h-12 bg-background border border-input text-foreground px-4 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm">
                            <option value="academics">Academics / Exams</option>
                            <option value="time">Time Management</option>
                            <option value="peer">Peer Pressure</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </section>
                    <section className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <label className="text-sm font-semibold flex justify-between">Study Hours (Per Day) <span>{planInput.studyHoursPerDay} hrs</span></label>
                          <Slider value={[planInput.studyHoursPerDay]} min={0} max={12} step={1} onValueChange={([val]) => updatePlanInput('studyHoursPerDay', val)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Consistency</label>
                          <select value={planInput.consistency} onChange={(e) => updatePlanInput('consistency', e.target.value as any)} className="w-full h-12 bg-background border border-input text-foreground px-4 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm">
                            <option value="regular">Regular</option>
                            <option value="irregular">Irregular</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Procrastination Level</label>
                          <select value={planInput.procrastinationLevel} onChange={(e) => updatePlanInput('procrastinationLevel', e.target.value as any)} className="w-full h-12 bg-background border border-input text-foreground px-4 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-sm">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>
                    </section>
                  </>
                )}

                {step === 3 && (
                  <>
                    <section className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Current Subjects (Comma separated)</label>
                          <Input placeholder="e.g. OS, DBMS, Computer Networks" value={planInput.currentSubjects?.join(', ') || ''} onChange={(e) => updatePlanInput('currentSubjects', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="h-12 bg-background border-input" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Target DSA Topic</label>
                          <Input placeholder="e.g. Arrays, Trees, Graphs" value={planInput.dsaTopic || ''} onChange={(e) => updatePlanInput('dsaTopic', e.target.value)} className="h-12 bg-background border-input" />
                        </div>
                      </div>
                    </section>
                    <section className="space-y-6">
                      <div className="space-y-4 max-w-md">
                        <label className="text-sm font-semibold flex justify-between">Hours Available Today <span>{planInput.hoursAvailableToday} hrs</span></label>
                        <Slider value={[planInput.hoursAvailableToday]} min={0} max={12} step={1} onValueChange={([val]) => updatePlanInput('hoursAvailableToday', val)} />
                        {errors.hoursAvailableToday && <p className="text-xs text-destructive">{errors.hoursAvailableToday}</p>}
                      </div>
                    </section>
                  </>
                )}

                {/* Navigation Buttons */}
                <div className="pt-8 border-t mt-12 flex items-center justify-between gap-4">
                  {step > 1 ? (
                    <button onClick={handlePrevStep} className="px-6 h-14 rounded-xl font-bold text-base bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all flex items-center gap-2">
                      <ArrowRight className="w-5 h-5 rotate-180" /> Back
                    </button>
                  ) : <div></div>}
                  
                  <button onClick={handleNextStep} className="px-8 h-14 rounded-xl font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md hover:shadow-lg">
                    {step === 3 ? "Generate My Plan" : "Continue"}
                    {step !== 3 && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
