'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, GraduationCap, Video, Trophy, FileText, MessageCircle, Lightbulb, Compass } from 'lucide-react';
import { UserType } from '@/lib/lpuData';

interface LPUExplorerProps {
  onSelectUserType: (userType: UserType) => void;
  onNavigateToModule?: (module: string) => void;
}

export function LPUExplorer({ onSelectUserType, onNavigateToModule }: LPUExplorerProps) {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  const handleSelectType = (type: UserType) => {
    setSelectedType(type);
    onSelectUserType(type);
  };

  const userTypes = [
    {
      id: 'pre-admission',
      icon: '🎓',
      title: 'Planning to join LPU',
      description: 'Help with admission, campus selection, and preparation',
      color: 'from-amber-400 to-amber-600',
    },
    {
      id: 'new-student',
      icon: '🧑‍🎓',
      title: 'Newly admitted student',
      description: 'First week prep, documents, hostel info, and orientation',
      color: 'from-teal-400 to-cyan-500',
    },
    {
      id: 'fresher',
      icon: '📘',
      title: 'First-year student (90-day mentor)',
      description: 'Guided daily journey through your first 90 days',
      color: 'from-rose-400 to-orange-500',
    },
  ];

  if (!selectedType) {
    return (
      <div className="min-h-screen relative overflow-hidden grain-overlay">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative z-10 container mx-auto px-4 py-20">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="eyebrow text-xs text-amber-300 mb-3">LPU Explorer</p>
            <h1 className="font-display hero-title text-5xl md:text-6xl text-amber-50 mb-4">
              Welcome to LPU Explorer
            </h1>
            <p className="text-lg text-amber-100/70 max-w-2xl mx-auto">
              Your complete companion for admission, campus life, and success at Lovely Professional University
            </p>
          </div>

          {/* User Type Selection */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {userTypes.map((type) => (
              <Card
                key={type.id}
                className="cursor-pointer transition-all hover:scale-[1.02] overflow-hidden luxe-card"
                onClick={() => handleSelectType(type.id as UserType)}
              >
                <div className={`h-1 bg-gradient-to-r ${type.color}`} />
                <CardHeader>
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <CardTitle className="font-display text-2xl text-amber-50">{type.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-100/70 mb-4">{type.description}</p>
                  <Button
                    className="w-full bg-amber-500 text-black hover:bg-amber-400"
                    onClick={() => handleSelectType(type.id as UserType)}
                  >
                    Continue {type.icon}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Overview */}
          <Card className="luxe-card">
            <CardHeader>
              <CardTitle className="font-display text-2xl text-amber-50">What You'll Get</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FeatureItem icon={Video} label="Video Hub" description="15+ authentic campus videos" />
                <FeatureItem icon={Trophy} label="Success Stories" description="Real placements & startups" />
                <FeatureItem icon={FileText} label="Procedures" description="Step-by-step guides & checklists" />
                <FeatureItem icon={MessageCircle} label="Senior Advice" description="Raw unfiltered wisdom" />
                <FeatureItem icon={Lightbulb} label="Reality Check" description="Expectation vs truth" />
                <FeatureItem icon={Compass} label="Branch Explorer" description="Which path is for you?" />
                <FeatureItem icon={BookOpen} label="Study Resources" description="Curated notes & playlists" />
                <FeatureItem icon={Users} label="Peer Connect" description="Common questions answered" />
                <FeatureItem icon={GraduationCap} label="90-Day Mentor" description="Personal guided journey" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // After user type is selected - show LPU Explorer modules
  return <LPUExplorerModules userType={selectedType} onNavigateToModule={onNavigateToModule} />;
}

function FeatureItem({ icon: Icon, label, description }: { icon: any; label: string; description: string }) {
  return (
    <div className="p-4 rounded-2xl border border-amber-500/15 bg-black/30">
      <Icon className="w-6 h-6 text-amber-300 mb-2" />
      <div className="font-semibold text-amber-50 text-sm">{label}</div>
      <div className="text-xs text-amber-100/60">{description}</div>
    </div>
  );
}

function LPUExplorerModules({ userType, onNavigateToModule }: { userType: UserType; onNavigateToModule?: (module: string) => void }) {
  const allModules = [
    {
      id: 'videos',
      icon: '🎥',
      title: 'Video Hub',
      description: 'Campus tours, admission process, hostel life, academics, coding',
      for: ['pre-admission', 'new-student', 'fresher']
    },
    {
      id: 'stories',
      icon: '🏆',
      title: 'Success Stories',
      description: 'Real placements, hackathon winners, startups, diverse careers',
      for: ['pre-admission', 'fresher']
    },
    {
      id: 'procedures',
      icon: '📋',
      title: 'Procedures & Guides',
      description: 'Documents checklist, hostel allocation, fee payment, ID card process',
      for: ['pre-admission', 'new-student']
    },
    {
      id: 'senior-advice',
      icon: '💬',
      title: 'Senior Comments',
      description: 'Honest advice from seniors in your branch and hostel',
      for: ['new-student', 'fresher']
    },
    {
      id: 'reality-check',
      icon: '⚡',
      title: 'Reality Check',
      description: 'Expectation vs reality - honest campus truths',
      for: ['pre-admission', 'new-student']
    },
    {
      id: 'resources',
      icon: '📚',
      title: 'Study Resources',
      description: 'Curated notes, playlists, and tools for each semester',
      for: ['fresher']
    },
    {
      id: 'branch-explorer',
      icon: '🧭',
      title: 'Branch Explorer',
      description: 'Detailed info, careers, and "is this for you?" quiz',
      for: ['pre-admission']
    },
  ];

  const modules = allModules.filter(m => m.for.includes(userType));

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <p className="eyebrow text-xs text-amber-300 mb-3">LPU Explorer</p>
          <h2 className="font-display section-title text-4xl text-amber-50 mb-2">LPU Explorer Dashboard</h2>
          <p className="text-amber-100/70">
            Logged in as: <span className="text-amber-300 font-semibold capitalize">{userType.replace('-', ' ')}</span>
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card
              key={module.id}
              className="cursor-pointer transition-all hover:scale-[1.02] overflow-hidden group luxe-card"
              onClick={() => onNavigateToModule?.(module.id)}
            >
              <CardHeader>
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{module.icon}</div>
                <CardTitle className="font-display text-2xl text-amber-50">{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-100/70 mb-6">{module.description}</p>
                <Button
                  variant="outline"
                  className="w-full border-amber-500/40 text-amber-100 hover:bg-amber-500/10"
                >
                  Explore {module.icon}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Tips */}
        <Card className="mt-12 luxe-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-50 font-display">
              <span>💡</span> Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-100/70 space-y-2">
            <p>✓ Start with Videos to get real perspective from seniors</p>
            <p>✓ Read Success Stories to see diverse career paths</p>
            <p>✓ Keep Procedures & Guides handy for quick reference</p>
            <p>✓ Senior Comments are raw and unfiltered - most helpful for first month jitters</p>
            <p>✓ If unsure about your branch, take the "Is this branch for you?" quiz</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
