'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { procedures } from '@/lib/lpuData';
import { ChevronDown, Download } from 'lucide-react';

interface ProceduresProps {
  onBack?: () => void;
}

export function Procedures({ onBack }: ProceduresProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<{ [key: string]: boolean[] }>({});

  useEffect(() => {
    const saved = localStorage.getItem('completedSteps');
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, []);

  const categories = [...new Set(procedures.map((p) => p.category))];

  const toggleCompleted = (procId: string, stepIdx: number) => {
    setCompletedSteps((prev) => {
      const existing = prev[procId] ? [...prev[procId]] : [];
      existing[stepIdx] = !existing[stepIdx];
      const next = { ...prev, [procId]: existing };
      localStorage.setItem('completedSteps', JSON.stringify(next));
      return next;
    });
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'admission':
        return '📝';
      case 'documents':
        return '📄';
      case 'hostel':
        return '🛏️';
      case 'fees':
        return '💳';
      case 'academic':
        return '📚';
      case 'identity':
        return '🪪';
      default:
        return '📋';
    }
  };

  return (
    <div className="space-y-10 bg-background text-foreground min-h-screen py-10 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          {onBack && (
            <Button variant="outline" className="mb-4" onClick={onBack}>
              ← Back
            </Button>
          )}
          <p className="eyebrow text-xs text-amber-600 dark:text-amber-300">Procedures</p>
          <h1 className="font-display hero-title text-4xl text-foreground mb-2 md:text-5xl">📋 Procedures & Guides</h1>
          <p className="text-muted-foreground">
            Step-by-step guides for admission documents, hostel allocation, fee payment, and more
          </p>
        </div>

        {/* Important Note */}
        <Card className="mb-8 luxe-card border-amber-500/30">
          <CardContent className="pt-6">
            <p className="text-foreground font-semibold mb-2">⚠️ Keep These Handy:</p>
            <p className="text-muted-foreground">
              Bookmark this page. You'll need to reference it multiple times during admission and first semester. Download PDFs where available.
            </p>
          </CardContent>
        </Card>

        {/* Procedures by Category */}
        <div className="space-y-6">
          {categories.map((category) => {
            const procs = procedures.filter((p) => p.category === category);
            return (
              <div key={category}>
                <h2 className="font-display text-2xl text-foreground mb-4">
                  {getCategoryIcon(category)} {category.replace('-', ' ').toUpperCase()}
                </h2>

                <div className="space-y-4 mb-8">
                  {procs.map((proc) => (
                    <Card
                      key={proc.id}
                      className="luxe-card transition-all cursor-pointer"
                      onClick={() =>
                        setExpandedId(expandedId === proc.id ? null : proc.id)
                      }
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg text-foreground">
                                {proc.title}
                              </CardTitle>
                              {proc.important && (
                                <Badge className="bg-red-600">⚠️ Important</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Estimated time: {proc.estimatedTime}
                            </p>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground transition-transform ${
                              expandedId === proc.id ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </CardHeader>

                      {expandedId === proc.id && (
                        <CardContent className="space-y-4">
                          {/* Steps */}
                          <div>
                            <p className="font-semibold text-foreground mb-3">
                              📋 Steps ({proc.steps.length}):
                            </p>
                            <div className="space-y-2">
                              {proc.steps.map((step, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-start gap-3 p-3 rounded transition-all ${
                                    completedSteps[proc.id]?.[idx]
                                      ? 'bg-green-500/10 border border-green-500/30'
                                      : 'bg-muted/40 border border-amber-500/20'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCompleted(proc.id, idx);
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={completedSteps[proc.id]?.[idx] || false}
                                    onChange={() => {}}
                                    className="w-5 h-5 mt-1 cursor-pointer"
                                  />
                                  <div>
                                    <p
                                      className={
                                        completedSteps[proc.id]?.[idx]
                                          ? 'text-green-300 line-through'
                                          : 'text-muted-foreground'
                                      }
                                    >
                                      {idx + 1}. {step}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Progress */}
                            {proc.steps.length > 0 && (
                              <div className="mt-4">
                                <p className="text-xs text-muted-foreground mb-1">
                                  Progress:{' '}
                                  {completedSteps[proc.id]?.filter((v) => v).length || 0} /{' '}
                                  {proc.steps.length}
                                </p>
                                <div className="w-full bg-muted/40 rounded-full h-2">
                                  <div
                                    className="bg-emerald-500 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${
                                        ((completedSteps[proc.id]?.filter((v) => v)
                                          .length || 0) /
                                          proc.steps.length) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Contact & Links */}
                          <div className="border-t border-amber-500/20 pt-4 flex flex-col gap-2">
                            {proc.contact && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  📞 Contact:
                                </p>
                                <p className="text-foreground/80 font-mono text-sm">
                                  {proc.contact}
                                </p>
                              </div>
                            )}

                            {proc.downloadUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-amber-500/40 text-foreground hover:bg-amber-500/10 justify-start"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF/Format
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Checklist Summary */}
        <Card className="mt-12 luxe-card border-amber-500/30">
          <CardHeader>
            <CardTitle className="font-display text-2xl text-foreground">✅ Your Completion Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Total steps completed:{' '}
              <span className="font-bold text-amber-300">
                {Object.values(completedSteps)
                  .flat()
                  .filter((v) => v).length}
              </span>{' '}
              / {procedures.reduce((acc, p) => acc + p.steps.length, 0)}
            </p>
            <div className="w-full bg-muted/40 rounded-full h-3">
              <div
                className="bg-amber-500 h-3 rounded-full transition-all"
                style={{
                  width: `${
                    (Object.values(completedSteps)
                      .flat()
                      .filter((v) => v).length /
                      procedures.reduce((acc, p) => acc + p.steps.length, 0)) *
                    100
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep tracking your progress by checking off steps as you complete them
            </p>
          </CardContent>
        </Card>
    </div>
  );
}



