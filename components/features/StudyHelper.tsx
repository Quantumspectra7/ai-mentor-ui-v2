'use client';

import { useState } from 'react';
import { ArrowLeft, BookOpen, Zap, Lightbulb, Target } from 'lucide-react';
import { studyResources } from '@/lib/phaseData';

interface StudyHelperProps {
  onBack: () => void;
}

export function StudyHelper({ onBack }: StudyHelperProps) {
  const [selectedSubject, setSelectedSubject] = useState<keyof typeof studyResources>('programming');

  const subject = studyResources[selectedSubject];

  return (
    <div className="min-h-screen bg-background relative font-sans text-foreground">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-card border shrink-0 rounded-xl hover:bg-accent hover:border-accent-foreground/20 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight text-foreground truncate">Study Helper</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">Master subjects with guided learning paths</p>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Subject Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14 animate-in fade-in slide-in-from-bottom-4">
          {Object.entries(studyResources).map(([key, value], idx) => (
            <button
              key={key}
              onClick={() => setSelectedSubject(key as keyof typeof studyResources)}
              className={`bg-card text-left p-6 md:p-8 rounded-3xl border transition-all group shadow-sm hover:shadow-md ${
                selectedSubject === key
                  ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
                  : 'border-input hover:border-primary/40 hover:bg-accent'
              }`}
            >
              <div className={`p-3.5 rounded-2xl mb-5 w-fit border transition-colors shadow-sm ${selectedSubject === key ? 'bg-primary text-primary-foreground border-transparent' : 'bg-background border-input text-muted-foreground group-hover:text-primary group-hover:border-primary/30'}`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold transition-colors ${selectedSubject === key ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>{value.title}</h3>
              <p className="text-sm font-semibold text-muted-foreground mt-2 uppercase tracking-widest">{value.topics.length} topics</p>
            </button>
          ))}
        </div>

        {/* Topics Content */}
        <div className="bg-card border shadow-sm rounded-3xl p-8 md:p-12 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-10 tracking-tight">{subject.title}</h2>

          <div className="mb-12">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
               <div className="p-2 shrink-0 bg-primary/10 rounded-lg text-primary border border-primary/20">
                  <Target className="w-5 h-5" />
               </div>
               Topics to Master
            </h3>
            
            <div className="space-y-4 pl-2 md:pl-0">
              {subject.topics.map((topic, index) => (
                <div key={index} className="bg-background border rounded-2xl p-5 md:p-6 hover:shadow-md hover:border-primary/40 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-extrabold group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                        {index + 1}
                      </div>
                      <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{topic.name}</h4>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-3 md:mt-0 ml-14 md:ml-0 shrink-0">
                      <span className="px-3.5 py-1.5 rounded-lg border bg-card text-xs font-bold text-muted-foreground shadow-sm">
                        {topic.difficulty}
                      </span>
                      <span className="px-3.5 py-1.5 rounded-lg border bg-primary/10 border-primary/20 text-primary text-xs font-bold shadow-sm">
                        {topic.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Tips */}
            <div className="p-8 rounded-3xl bg-background border shadow-sm">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-3">
                 <div className="p-2 shrink-0 bg-yellow-500/10 rounded-lg text-yellow-600 border border-yellow-500/20">
                    <Lightbulb className="w-5 h-5" />
                 </div>
                 Senior Tip
              </h3>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed italic border-l-2 border-primary/40 pl-4">{subject.tips}</p>
            </div>

            {/* Platforms */}
            <div className="p-8 rounded-3xl bg-background border shadow-sm">
                <h3 className="font-bold text-foreground mb-4">Recommended Learning Platforms</h3>
                <div className="flex flex-wrap gap-2.5">
                  {subject.platforms.map((platform, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-card border rounded-lg text-xs font-bold text-foreground shadow-sm hover:border-primary/40 hover:bg-accent transition-colors"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
            </div>
          </div>
        </div>

        {/* Study Tips Cards */}
        <div className="mb-12">
            <h3 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3 animate-in fade-in">
              <div className="p-2 shrink-0 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
                 <Zap className="w-6 h-6" />
              </div>
              Study Techniques That Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {[
                { icon: '⏰', title: 'Pomodoro Technique', desc: '25 min study, 5 min break', color: 'orange' },
                { icon: '📝', title: 'Active Learning', desc: 'Write, teach, solve problems', color: 'blue' },
                { icon: '👥', title: 'Study Groups', desc: 'Learn faster together', color: 'purple' },
                { icon: '🔄', title: 'Spaced Repetition', desc: 'Review over days/weeks', color: 'emerald' }
              ].map((tip, idx) => (
                <div key={idx} className="bg-card border rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all group">
                  <div className="text-3xl mb-4 p-3 bg-background rounded-xl border w-fit shadow-sm group-hover:scale-110 transition-transform">{tip.icon}</div>
                  <h4 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{tip.title}</h4>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
        </div>

      </main>
    </div>
  );
}
