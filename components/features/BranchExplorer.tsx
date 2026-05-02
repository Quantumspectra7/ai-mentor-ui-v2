'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { branchInfo, branchQuiz } from '@/lib/lpuData';
import { TrendingUp } from 'lucide-react';

interface BranchExplorerProps {
  onBack?: () => void;
}

export function BranchExplorer({ onBack }: BranchExplorerProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);

  if (showQuiz) {
    return (
      <BranchQuiz
        onBack={() => {
          setShowQuiz(false);
          setQuizAnswers([]);
        }}
        onQuizComplete={(results) => {
          setQuizAnswers(results);
          setShowQuiz(false);
        }}
      />
    );
  }

  const displayBranch = selectedBranch
    ? branchInfo.find((b) => b.id === selectedBranch)
    : null;

  return (
    <div className="space-y-10 bg-background text-foreground min-h-screen py-10 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          {onBack && (
            <Button variant="outline" className="mb-4" onClick={onBack}>
              ← Back
            </Button>
          )}
          <p className="eyebrow text-xs text-amber-600 dark:text-amber-300">Branch Explorer</p>
          <h1 className="font-display hero-title text-4xl text-foreground mb-2 md:text-5xl">🧭 Branch Explorer</h1>
          <p className="text-muted-foreground">
            Explore careers, placements, and reality of each branch at LPU
          </p>

          <Button
            onClick={() => setShowQuiz(true)}
            className="mt-4 bg-amber-500 text-black hover:bg-amber-400"
          >
            🎯 Take "Is This Branch For You?" Quiz
          </Button>
        </div>

        {!displayBranch ? (
          // Branch Selection Grid
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {branchInfo.map((branch) => (
              <Card
                key={branch.id}
                className="cursor-pointer transition-all hover:scale-[1.02] overflow-hidden group luxe-card"
                onClick={() => setSelectedBranch(branch.id)}
              >
                <div className="h-1 bg-gradient-to-r from-amber-500 to-teal-500" />
                <CardHeader>
                  <CardTitle className="font-display text-2xl text-foreground">{branch.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">{branch.description}</p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">📊 Placement Rate</span>
                      <span className="font-bold text-emerald-300">{branch.placementRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">💰 Avg Package</span>
                      <span className="font-bold text-amber-300">₹{branch.avgPackage} LPA</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">🏢 Top Recruiters</span>
                      <span className="text-xs text-muted-foreground">
                        {branch.topRecruiters[0]}, {branch.topRecruiters[1]}...
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4 border-amber-500/40 text-foreground hover:bg-amber-500/10"
                  >
                    Learn More →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Detailed Branch View
          <div>
            <Button
              variant="outline"
              className="mb-6"
              onClick={() => setSelectedBranch(null)}
            >
              ← Back to Branches
            </Button>

            <Card className="luxe-card border-amber-500/30 mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-3xl text-foreground mb-2">
                      {displayBranch?.name}
                    </CardTitle>
                    <p className="text-muted-foreground">{displayBranch?.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Key Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/40 border border-emerald-500/30">
                    <p className="text-sm text-muted-foreground mb-1">📊 Placement Rate</p>
                    <p className="text-3xl font-bold text-emerald-300">
                      {displayBranch?.placementRate}%
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/40 border border-amber-500/30">
                    <p className="text-sm text-muted-foreground mb-1">💰 Average Package</p>
                    <p className="text-3xl font-bold text-amber-300">
                      ₹{displayBranch?.avgPackage} LPA
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/40 border border-teal-500/30">
                    <p className="text-sm text-muted-foreground mb-1">🎯 Career Paths</p>
                    <p className="text-lg font-bold text-foreground">
                      {displayBranch?.careerPaths.length} Options
                    </p>
                  </div>
                </div>

                {/* Subjects */}
                <div>
                  <h3 className="font-display text-xl text-foreground mb-3">📚 Core Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayBranch?.subjects.map((subject) => (
                      <Badge key={subject} className="bg-amber-500/20 text-foreground border border-amber-500/30">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Top Recruiters */}
                <div>
                  <h3 className="font-display text-xl text-foreground mb-3">🏢 Top Recruiters</h3>
                  <div className="grid md:grid-cols-3 gap-2">
                    {displayBranch?.topRecruiters.map((recruiter) => (
                      <div
                        key={recruiter}
                        className="p-3 rounded-2xl bg-muted/40 border border-teal-500/30 text-center"
                      >
                        <p className="text-foreground font-semibold">{recruiter}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Career Paths */}
                <div>
                  <h3 className="font-display text-xl text-foreground mb-3">🚀 Career Paths</h3>
                  <div className="space-y-2">
                    {displayBranch?.careerPaths.map((path) => (
                      <div
                        key={path}
                        className="p-3 rounded-2xl bg-muted/40 border border-emerald-500/30 text-foreground/80 flex items-center gap-2"
                      >
                        <TrendingUp className="w-4 h-4 text-emerald-300" />
                        {path}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Is This For You */}
                <div>
                  <h3 className="font-display text-xl text-foreground mb-3">✅ Is This for You?</h3>
                  <div className="space-y-2">
                    {displayBranch?.isForYou.map((reason) => (
                      <div
                        key={reason}
                        className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm"
                      >
                        ✓ {reason}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Need Urgently */}
                <div>
                  <h3 className="font-display text-xl text-foreground mb-3">🎯 You Need Urgently</h3>
                  <div className="space-y-2">
                    {displayBranch?.needUrgently.map((need) => (
                      <div
                        key={need}
                        className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-foreground text-sm"
                      >
                        ⚡ {need}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Senior Advice */}
                <div className="bg-muted/40 border-l-4 border-amber-500 p-4 rounded-2xl">
                  <p className="text-sm text-muted-foreground mb-2">💬 Senior Advice:</p>
                  <p className="text-foreground italic">"{displayBranch?.seniorAdvice}"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quiz CTA */}
        {!showQuiz && !displayBranch && (
          <Card className="luxe-card border-amber-500/30">
            <CardHeader>
              <CardTitle className="font-display text-2xl text-foreground">🤔 Still Can't Decide?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Take our interactive quiz to find out which branch matches your interests, skills, and career goals.
              </p>
              <Button
                onClick={() => setShowQuiz(true)}
                className="bg-amber-500 text-black hover:bg-amber-400"
              >
                🎯 Start Quiz (2 min)
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

function BranchQuiz({
  onBack,
  onQuizComplete,
}: {
  onBack: () => void;
  onQuizComplete: (results: string[]) => void;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (branchIds: string[]) => {
    const newAnswers = [...answers, ...branchIds];
    setAnswers(newAnswers);

    if (currentQ < branchQuiz.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calculate results
      const branchCounts = branchInfo.map((b) => ({
        branch: b.name,
        branchId: b.id,
        count: newAnswers.filter((id) => id === b.id).length,
      }));

      branchCounts.sort((a, b) => b.count - a.count);

      // Show results
      onQuizComplete(newAnswers);
    }
  };

  const question = branchQuiz[currentQ];

  return (
    <div className="space-y-10 max-w-2xl">
      <Button variant="outline" className="mb-2" onClick={onBack}>
        ← Back
      </Button>

      <Card className="luxe-card border-amber-500/30">
        <CardHeader>
          <div className="mb-4">
            <p className="text-foreground font-semibold">Question {currentQ + 1} of {branchQuiz.length}</p>
            <div className="w-full bg-muted/40 rounded-full h-2 mt-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentQ + 1) / branchQuiz.length) * 100}%` }}
              />
            </div>
          </div>
          <CardTitle className="font-display text-2xl text-foreground">{question.question}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <Button
                key={idx}
                onClick={() => handleAnswer(option.branch)}
                variant="outline"
                className="w-full justify-start h-auto py-4 px-6 border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10 text-left text-foreground"
              >
                <span className="text-lg">{option.text}</span>
              </Button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-8 text-center">
            Your answers help us recommend the best branch for you
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



