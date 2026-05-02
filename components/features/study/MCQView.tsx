'use client';

import { useState, useCallback } from 'react';
import {
  HelpCircle, Loader2, ChevronDown, ChevronUp, CheckCircle2, XCircle,
  Shuffle, Settings2, Play
} from 'lucide-react';
import type { MCQItem, Difficulty } from '@/lib/study/types';

interface MCQViewProps {
  text: string;
  notebookId: string;
  cached?: MCQItem[] | null;
  onGenerated: (mcqs: MCQItem[]) => void;
  onStartTest?: (mcqs: MCQItem[]) => void;
}

type AnswerState = { selected: number; revealed: boolean };

export function MCQView({ text, notebookId, cached, onGenerated, onStartTest }: MCQViewProps) {
  const [mcqs, setMcqs] = useState<MCQItem[]>(cached ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [count, setCount] = useState(5);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [expandedExpl, setExpandedExpl] = useState<number | null>(null);

  const generate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    setAnswers({});
    setExpandedExpl(null);
    try {
      const res = await fetch('/api/study/mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, count, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate MCQs.');
      setMcqs(data.mcqs);
      onGenerated(data.mcqs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error.');
    } finally {
      setLoading(false);
    }
  }, [loading, text, count, difficulty, onGenerated]);

  const handleSelect = (qi: number, optionIdx: number) => {
    if (answers[qi]?.revealed) return;
    setAnswers(prev => ({
      ...prev,
      [qi]: { selected: optionIdx, revealed: false },
    }));
  };

  const reveal = (qi: number) => {
    setAnswers(prev => ({
      ...prev,
      [qi]: { ...prev[qi], revealed: true },
    }));
    setExpandedExpl(qi);
  };

  const difficultyColors: Record<Difficulty, string> = {
    easy: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    hard: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 p-5 bg-card border rounded-2xl">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Difficulty</label>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold capitalize transition-all ${
                  difficulty === d
                    ? `${difficultyColors[d]} border-current`
                    : 'bg-background border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Number of Questions: <span className="text-primary">{count}</span>
          </label>
          <input
            type="range"
            min={3}
            max={15}
            step={1}
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            className="w-32 accent-primary"
          />
        </div>

        <div className="flex gap-3 ml-auto">
          {mcqs.length > 0 && onStartTest && (
            <button
              onClick={() => onStartTest(mcqs)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-primary/30 text-primary font-bold text-sm hover:bg-primary/5 transition-all"
            >
              <Play className="w-4 h-4" />
              Mock Test
            </button>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-60 hover:bg-primary/90 transition-all shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mcqs.length > 0 ? (
              <Shuffle className="w-4 h-4" />
            ) : (
              <HelpCircle className="w-4 h-4" />
            )}
            {loading ? 'Generating…' : mcqs.length > 0 ? 'Regenerate' : 'Generate MCQs'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Empty state */}
      {mcqs.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-bold text-foreground text-lg mb-2">MCQ Generator</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Select difficulty and count above, then generate practice questions from your notes.
          </p>
        </div>
      )}

      {/* MCQ List */}
      {mcqs.length > 0 && (
        <div className="space-y-5">
          {mcqs.map((mcq, qi) => {
            const ans = answers[qi];
            const isRevealed = ans?.revealed ?? false;

            return (
              <div key={qi} className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                {/* Question header */}
                <div className="p-5 border-b border-border/50">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                      {qi + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground leading-snug">{mcq.question}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${difficultyColors[mcq.difficulty]}`}>
                          {mcq.difficulty}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">{mcq.topic}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="p-5 space-y-2.5">
                  {mcq.options.map((opt, oi) => {
                    let optClass = 'bg-background border-border text-foreground hover:border-primary/40';
                    if (ans?.selected === oi && !isRevealed) optClass = 'bg-primary/10 border-primary text-primary';
                    if (isRevealed && oi === mcq.correct) optClass = 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400';
                    if (isRevealed && ans?.selected === oi && oi !== mcq.correct) optClass = 'bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400';
                    if (isRevealed && oi !== mcq.correct && ans?.selected !== oi) optClass = 'bg-background border-border text-muted-foreground opacity-50';

                    return (
                      <button
                        key={oi}
                        onClick={() => handleSelect(qi, oi)}
                        disabled={isRevealed}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${optClass}`}
                      >
                        <span className="shrink-0 w-6 h-6 rounded-full border text-[10px] font-bold flex items-center justify-center border-current opacity-70">
                          {optionLetters[oi]}
                        </span>
                        {opt}
                        {isRevealed && oi === mcq.correct && (
                          <CheckCircle2 className="w-4 h-4 ml-auto text-green-500 shrink-0" />
                        )}
                        {isRevealed && ans?.selected === oi && oi !== mcq.correct && (
                          <XCircle className="w-4 h-4 ml-auto text-red-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Reveal / Explanation */}
                <div className="px-5 pb-4">
                  {!isRevealed ? (
                    <button
                      onClick={() => reveal(qi)}
                      disabled={ans?.selected === undefined}
                      className="text-sm font-semibold text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {ans?.selected !== undefined ? 'Check Answer' : 'Select an option first'}
                    </button>
                  ) : (
                    <div className="mt-1">
                      <button
                        onClick={() => setExpandedExpl(expandedExpl === qi ? null : qi)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {expandedExpl === qi ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        Explanation
                      </button>
                      {expandedExpl === qi && (
                        <div className="mt-2 p-3 rounded-xl bg-background border text-sm text-muted-foreground leading-relaxed animate-in slide-in-from-top-1 duration-200">
                          {mcq.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
