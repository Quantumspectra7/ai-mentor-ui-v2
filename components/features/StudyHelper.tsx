'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, BookOpen, Code2, Palette, Calculator, Globe, RefreshCw, Clock } from 'lucide-react';
import { ScheduleGenerator } from './ScheduleGenerator';

interface StudyHelperProps {
  onBack: () => void;
}

type Track = 'cse' | 'math' | 'web' | 'design' | 'general';

const tracks: { id: Track; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'cse', label: 'CS & Coding', icon: <Code2 className="w-5 h-5" />, desc: 'DSA, development, ML, competitive coding' },
  { id: 'web', label: 'Web & App Dev', icon: <Globe className="w-5 h-5" />, desc: 'Frontend, backend, React, APIs' },
  { id: 'math', label: 'Core & Maths', icon: <Calculator className="w-5 h-5" />, desc: 'Calculus, physics, chemistry, statistics' },
  { id: 'design', label: 'Design & UI/UX', icon: <Palette className="w-5 h-5" />, desc: 'Figma, product thinking, visual design' },
  { id: 'general', label: 'General Skills', icon: <BookOpen className="w-5 h-5" />, desc: 'Productivity, career, communication' },
];

interface Resource {
  name: string;
  desc: string;
  url: string;
  tag: string;
  tagColor: string;
  free: boolean;
}

const resources: Record<Track, Resource[]> = {
  cse: [
    { name: 'LeetCode', desc: 'The #1 platform for DSA interview prep. Start with Easy, build up.', url: 'https://leetcode.com', tag: 'DSA', tagColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20', free: true },
    { name: 'NeetCode.io', desc: 'Curated LeetCode roadmap — best structured DSA path available for free.', url: 'https://neetcode.io', tag: 'DSA', tagColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20', free: true },
    { name: 'GeeksForGeeks', desc: 'Theory + practice for every CS concept. Great for exam prep and placement.', url: 'https://geeksforgeeks.org', tag: 'CS Theory', tagColor: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', free: true },
    { name: 'CS50 (Harvard)', desc: 'Best intro CS course ever made. Free, practical, and globally respected.', url: 'https://cs50.harvard.edu', tag: 'Course', tagColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', free: true },
    { name: 'HackerRank', desc: 'Placement test format practice. Campus placements often use this format.', url: 'https://hackerrank.com', tag: 'Placement', tagColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', free: true },
    { name: 'GitHub', desc: 'Host your code. Build your profile. Recruiters check this before your resume.', url: 'https://github.com', tag: 'Portfolio', tagColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', free: true },
    { name: 'NPTEL', desc: 'IIT-professor-taught courses. Valid certificates for resume. Many CS + core subjects.', url: 'https://nptel.ac.in', tag: 'Certificate', tagColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', free: false },
    { name: 'Roadmap.sh', desc: 'Visual learning roadmaps for every dev path — backend, frontend, DevOps, ML.', url: 'https://roadmap.sh', tag: 'Roadmap', tagColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20', free: true },
  ],
  web: [
    { name: 'The Odin Project', desc: 'Best free full-stack curriculum. HTML → CSS → JS → React → Node. All free.', url: 'https://www.theodinproject.com', tag: 'Full Stack', tagColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', free: true },
    { name: 'freeCodeCamp', desc: '3,000+ hours of free coding. Responsive design, JS, APIs, Python, SQL.', url: 'https://www.freecodecamp.org', tag: 'Coding', tagColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', free: true },
    { name: 'Frontend Mentor', desc: 'Real design challenges → build them in code → show in portfolio.', url: 'https://frontendmentor.io', tag: 'Projects', tagColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20', free: true },
    { name: 'MDN Web Docs', desc: 'The official HTML/CSS/JS reference. Use this when you are confused about any web concept.', url: 'https://developer.mozilla.org', tag: 'Reference', tagColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', free: true },
    { name: 'Vercel', desc: 'Deploy your web projects for free in 60 seconds. Show your live apps in interviews.', url: 'https://vercel.com', tag: 'Deploy', tagColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', free: true },
    { name: 'CSS Tricks', desc: 'Guides, tutorials, and tricks for advanced CSS. Flexbox/Grid guides are legendary.', url: 'https://css-tricks.com', tag: 'CSS', tagColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', free: true },
  ],
  math: [
    { name: 'NPTEL', desc: 'IIT professors teach maths, physics, chemistry. Certificates add to your resume.', url: 'https://nptel.ac.in', tag: 'Certificate', tagColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', free: false },
    { name: 'Khan Academy', desc: 'Master calculus, statistics, and algebra at your own pace. Fully free.', url: 'https://khanacademy.org', tag: 'Maths', tagColor: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', free: true },
    { name: 'MIT OpenCourseWare', desc: 'Full MIT lecture notes and problem sets for maths, physics, CS. MIT-level, free.', url: 'https://ocw.mit.edu', tag: 'University', tagColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', free: true },
    { name: 'Brilliant.org', desc: 'Interactive problem-solving — great for building intuition in maths and CS.', url: 'https://brilliant.org', tag: 'Problem Solving', tagColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20', free: false },
    { name: "Paul's Math Notes", desc: 'Free complete notes for Calculus 1/2/3, Differential Equations, Linear Algebra.', url: 'https://tutorial.math.lamar.edu', tag: 'Notes', tagColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', free: true },
  ],
  design: [
    { name: 'Figma', desc: 'Industry standard design tool. Free for students. Build your UI/UX portfolio here.', url: 'https://figma.com', tag: 'UI/UX Tool', tagColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', free: true },
    { name: 'Canva', desc: 'Design posters, presentations, social posts. Perfect for club work and events.', url: 'https://canva.com', tag: 'Graphics', tagColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20', free: true },
    { name: 'Behance', desc: 'Browse world-class design portfolios. Study great work to develop your eye.', url: 'https://behance.net', tag: 'Inspiration', tagColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', free: true },
    { name: 'Refactoring UI', desc: 'Practical book on making things look good — by the Tailwind CSS creators.', url: 'https://refactoringui.com', tag: 'UI Book', tagColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', free: false },
    { name: 'Laws of UX', desc: 'Psychology principles every designer needs to know — free website.', url: 'https://lawsofux.com', tag: 'UX Principles', tagColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20', free: true },
    { name: 'Google Fonts', desc: 'Free font library. Typography is the fastest way to make designs look professional.', url: 'https://fonts.google.com', tag: 'Typography', tagColor: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', free: true },
  ],
  general: [
    { name: 'Notion', desc: 'Note-taking, planning, second brain. The best student productivity system.', url: 'https://notion.so', tag: 'Productivity', tagColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', free: true },
    { name: 'LinkedIn Learning', desc: 'Courses on communication, Excel, presentations, and career skills.', url: 'https://linkedin.com/learning', tag: 'Career', tagColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', free: false },
    { name: 'Coursera', desc: 'University-backed courses. Many free to audit. Google, Meta, IBM certifications available.', url: 'https://coursera.org', tag: 'Courses', tagColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', free: false },
    { name: 'YouTube', desc: "MIT, Stanford, Traversy Media, Fireship — the world's best free education.", url: 'https://youtube.com', tag: 'Video', tagColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', free: true },
    { name: 'Anki', desc: 'Flashcard app with spaced repetition. The scientifically proven way to retain facts.', url: 'https://apps.ankiweb.net', tag: 'Memory', tagColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20', free: true },
    { name: 'Grammarly', desc: 'AI-powered writing assistant. Makes your emails, reports, and cover letters shine.', url: 'https://grammarly.com', tag: 'Writing', tagColor: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20', free: true },
    { name: 'ChatGPT', desc: 'Ask it to explain concepts, debug code, write outlines, summarize papers. Use it wisely.', url: 'https://chat.openai.com', tag: 'AI Tool', tagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', free: true },
  ],
};

const studyTechniques = [
  { icon: '⏰', title: 'Pomodoro', desc: '25 min deep work → 5 min break. Best for assignments and problem sets.' },
  { icon: '🃏', title: 'Active Recall', desc: 'Test yourself instead of re-reading. Close book, write what you remember.' },
  { icon: '🔁', title: 'Spaced Repetition', desc: 'Review at day 1, 3, 7, 14 intervals. Use Anki to automate this.' },
  { icon: '✍️', title: 'Feynman Technique', desc: "Explain the concept to a 10-year-old. If you can't, you don't know it yet." },
];

export function StudyHelper({ onBack }: StudyHelperProps) {
  const [activeView, setActiveView] = useState<'resources' | 'schedule'>('resources');
  const [selectedTrack, setSelectedTrack] = useState<Track>('cse');
  const [aiResources, setAiResources] = useState<Resource[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [savedWeakSubjects, setSavedWeakSubjects] = useState<string[]>([]);
  const [savedInterests, setSavedInterests] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mentorProfile');
      if (raw) {
        const profile = JSON.parse(raw);

        // Auto-select track from branch
        const branch = (profile.branch || '').toLowerCase();
        if (branch.includes('cse') || branch.includes('computer')) setSelectedTrack('cse');
        else if (branch.includes('web') || branch.includes('it')) setSelectedTrack('web');
        else if (branch.includes('design')) setSelectedTrack('design');
        else if (branch.includes('mech') || branch.includes('civil') || branch.includes('ee')) setSelectedTrack('math');

        const weakSubjects: string[] = Array.isArray(profile.weakSubjects) ? profile.weakSubjects : [];
        const interests: string[] = Array.isArray(profile.interests) ? profile.interests : [];

        setSavedWeakSubjects(weakSubjects);
        setSavedInterests(interests);

        // Fetch AI recommendations if weak subjects exist
        if (weakSubjects.length > 0) {
          fetchAiRecommendations(weakSubjects, interests);
        }
      }
    } catch { }
  }, []);

  const fetchAiRecommendations = async (weakSubjects: string[], interests: string[]) => {
    setIsLoadingAi(true);
    setAiError(false);
    try {
      const res = await fetch('/api/study/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weakSubjects, interests, currentDay: 1 }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.recommendations)) {
        setAiResources(data.recommendations);
      } else {
        setAiError(true);
      }
    } catch {
      setAiError(true);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const list = resources[selectedTrack];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-card border shrink-0 rounded-xl hover:bg-accent transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary shrink-0" />
              Study Resources
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Curated free tools and learning paths for LPU students</p>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="max-w-4xl mx-auto px-6 pt-4 flex gap-2">
        <button
          onClick={() => setActiveView('resources')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
            activeView === 'resources'
              ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
              : 'bg-card border-border text-muted-foreground hover:border-primary/40'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Resources
        </button>
        <button
          onClick={() => setActiveView('schedule')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
            activeView === 'schedule'
              ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
              : 'bg-card border-border text-muted-foreground hover:border-primary/40'
          }`}
        >
          <Clock className="w-4 h-4" /> AI Schedule
          <span className="text-[9px] font-extrabold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full border border-primary/30 ml-1">
            {activeView !== 'schedule' ? 'NEW' : ''}
          </span>
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Schedule Generator View */}
        {activeView === 'schedule' && (
          <ScheduleGenerator />
        )}

        {/* Resources View */}
        {activeView === 'resources' && (
          <>
        {/* AI Personalized Resources */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">✨ AI Curated For You</h2>
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                Based on weak subjects
              </span>
            </div>
            {savedWeakSubjects.length > 0 && !isLoadingAi && (
              <button
                onClick={() => fetchAiRecommendations(savedWeakSubjects, savedInterests)}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            )}
          </div>

          {isLoadingAi ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-muted/50 rounded-2xl p-5 h-32 border border-border" />
              ))}
            </div>
          ) : aiResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiResources.map((r, i) => (
                <a
                  key={`ai-${i}`}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-5 bg-card border-2 border-primary/20 hover:border-primary/50 hover:shadow-md transition-all group rounded-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full group-hover:bg-primary/10 transition-colors" />
                  <div className="flex-1 min-w-0 relative">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{r.name}</h3>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 leading-snug">{r.desc}</p>
                    <span className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase tracking-wide ${r.tagColor || 'bg-primary/10 text-primary border-primary/20'}`}>
                      {r.tag}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : aiError ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-sm text-destructive">
              <span>Failed to fetch AI recommendations.</span>
              <button
                onClick={() => fetchAiRecommendations(savedWeakSubjects, savedInterests)}
                className="font-semibold underline hover:no-underline ml-2"
              >
                Retry
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic bg-muted/20 p-4 rounded-xl border border-dashed">
              Set your weak subjects in your profile to unlock personalized AI resource recommendations.
            </p>
          )}
        </div>

        {/* Track Selection */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-foreground mb-3">Browse by learning track:</p>
          <div className="flex flex-wrap gap-2">
            {tracks.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTrack(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  selectedTrack === t.id
                    ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                    : 'bg-card border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          {tracks.find(t => t.id === selectedTrack) && (
            <p className="text-xs text-muted-foreground mt-2 ml-1">
              {tracks.find(t => t.id === selectedTrack)!.desc}
            </p>
          )}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {list.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 bg-card border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{r.name}</h3>
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground mb-3 leading-snug">{r.desc}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold uppercase tracking-wide ${r.tagColor}`}>{r.tag}</span>
                  {r.free && (
                    <span className="px-2 py-0.5 rounded-md border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400 text-[11px] font-semibold uppercase tracking-wide">Free</span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Study Techniques */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Techniques that actually work</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {studyTechniques.map((t, i) => (
              <div key={i} className="bg-card border rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all">
                <div className="text-2xl mb-3">{t.icon}</div>
                <h4 className="font-bold text-foreground mb-1.5 text-sm">{t.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
}
