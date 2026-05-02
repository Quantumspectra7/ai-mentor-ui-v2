'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Clock, CheckCircle2, XCircle, Trophy, BarChart3,
  AlertTriangle, ChevronRight, RotateCcw, Target
} from 'lucide-react';
import type { MCQItem, TestResult, PerQuestionResult } from '@/lib/study/types';

interface MockTestViewProps {
  mcqs: MCQItem[];
  onComplete: (result: TestResult) => void;
}

type Phase = 'intro' | 'test' | 'result';

const TIME_PER_QUESTION_SEC = 45;

export function MockTestView({ mcqs, onComplete }: MockTestViewProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(mcqs.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION_SEC);
  const [totalTime, setTotalTime] = useState(0);
  const [qTimes, setQTimes] = useState<number[]>(new Array(mcqs.length).fill(0));
  const [result, setResult] = useState<TestResult | null>(null);
  const qStartRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Per-question countdown
  useEffect(() => {
    if (phase !== 'test') return;
    setTimeLeft(TIME_PER_QUESTION_SEC);
    qStartRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleNext(true); // auto-advance
          return TIME_PER_QUESTION_SEC;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQ]);

  // Total elapsed timer
  useEffect(() => {
    if (phase !== 'test') return;
    totalTimerRef.current = setInterval(() => setTotalTime(t => t + 1), 1000);
    return () => { if (totalTimerRef.current) clearInterval(totalTimerRef.current); };
  }, [phase]);

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);
  };

  const handleNext = useCallback((autoSubmit = false) => {
    const elapsed = Math.round((Date.now() - qStartRef.current) / 1000);
    const chosenIdx = autoSubmit ? (selected ?? -1) : (selected ?? -1);

    setQTimes(prev => {
      const n = [...prev];
      n[currentQ] = elapsed;
      return n;
    });
    setAnswers(prev => {
      const n = [...prev];
      n[currentQ] = chosenIdx === -1 ? null : chosenIdx;
      return n;
    });
    setSelected(null);

    if (currentQ < mcqs.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      // Submit test
      clearTimers();
      computeResult([...answers.slice(0, currentQ), chosenIdx === -1 ? null : chosenIdx]);
    }
  }, [currentQ, mcqs.length, selected, answers]);

  const computeResult = (finalAnswers: (number | null)[]) => {
    const perQuestion: PerQuestionResult[] = mcqs.map((mcq, i) => ({
      correct: finalAnswers[i] === mcq.correct,
      timeSec: qTimes[i] ?? 0,
      topic: mcq.topic,
      selectedIndex: finalAnswers[i] ?? -1,
    }));

    const score = perQuestion.filter(p => p.correct).length;
    const accuracy = Math.round((score / mcqs.length) * 100);

    // Identify weak topics (wrong answers)
    const wrongTopics = perQuestion
      .filter(p => !p.correct)
      .map(p => p.topic)
      .filter(Boolean);
    const topicCounts: Record<string, number> = {};
    wrongTopics.forEach(t => { topicCounts[t] = (topicCounts[t] ?? 0) + 1; });
    const weakTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([t]) => t);

    const testResult: TestResult = {
      id: `test_${Date.now()}`,
      date: Date.now(),
      score,
      total: mcqs.length,
      timeTaken: totalTime,
      perQuestion,
      weakTopics,
      accuracy,
    };
    setResult(testResult);
    setPhase('result');
    onComplete(testResult);
  };

  const reset = () => {
    clearTimers();
    setPhase('intro');
    setCurrentQ(0);
    setSelected(null);
    setAnswers(new Array(mcqs.length).fill(null));
    setTotalTime(0);
    setQTimes(new Array(mcqs.length).fill(0));
    setResult(null);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ── INTRO ────────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="text-center py-12">
        <div className="inline-flex p-5 rounded-2xl bg-primary/10 mb-6 border border-primary/20">
          <Target className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Mock Test Ready</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">
          {mcqs.length} questions · {TIME_PER_QUESTION_SEC}s per question · Auto-submit on timeout
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-10">
          {[
            { label: 'Questions', value: mcqs.length },
            { label: 'Time/Q', value: `${TIME_PER_QUESTION_SEC}s` },
            { label: 'Total', value: formatTime(mcqs.length * TIME_PER_QUESTION_SEC) },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-2xl p-4 text-center">
              <p className="text-xl font-extrabold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setPhase('test')}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:bg-primary/90 transition-all"
        >
          <Play className="w-5 h-5" />
          Start Test
        </button>
      </div>
    );
  }

  // ── TEST ─────────────────────────────────────────────────────────────────────
  if (phase === 'test') {
    const mcq = mcqs[currentQ];
    const progress = ((currentQ) / mcqs.length) * 100;
    const timerPct = (timeLeft / TIME_PER_QUESTION_SEC) * 100;
    const timerDanger = timeLeft <= 10;
    const optionLetters = ['A', 'B', 'C', 'D'];

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Progress + timer */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1.5">
              <span>Question {currentQ + 1} of {mcqs.length}</span>
              <span>{Math.round(progress)}% done</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm shrink-0 transition-colors ${
            timerDanger ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-card border-border text-foreground'
          }`}>
            <Clock className={`w-4 h-4 ${timerDanger ? 'animate-pulse' : ''}`} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${timerDanger ? 'bg-red-500' : 'bg-primary'}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>

        {/* Question card */}
        <div className="bg-card border rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-6">
            <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold">
              {currentQ + 1}
            </span>
            <div>
              <p className="font-semibold text-foreground text-base leading-snug">{mcq.question}</p>
              <span className="text-xs text-muted-foreground mt-1 inline-block">{mcq.topic}</span>
            </div>
          </div>

          <div className="space-y-3">
            {mcq.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => setSelected(oi)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium text-left transition-all ${
                  selected === oi
                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                    : 'bg-background border-border text-foreground hover:border-primary/40'
                }`}
              >
                <span className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-[11px] font-bold transition-colors ${
                  selected === oi ? 'bg-primary border-primary text-primary-foreground' : 'border-border text-muted-foreground'
                }`}>
                  {optionLetters[oi]}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            Total elapsed: {formatTime(totalTime)}
          </span>
          <button
            onClick={() => handleNext()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-sm hover:bg-primary/90 transition-all"
          >
            {currentQ < mcqs.length - 1 ? 'Next' : 'Submit'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT ───────────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const grade = result.accuracy >= 80 ? 'Excellent' : result.accuracy >= 60 ? 'Good' : result.accuracy >= 40 ? 'Fair' : 'Needs Work';
    const gradeColor = result.accuracy >= 80 ? 'text-green-500' : result.accuracy >= 60 ? 'text-primary' : result.accuracy >= 40 ? 'text-amber-500' : 'text-red-500';

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Score card */}
        <div className="bg-card border rounded-3xl p-8 text-center">
          <Trophy className={`w-12 h-12 mx-auto mb-4 ${gradeColor}`} />
          <h2 className="text-4xl font-extrabold text-foreground mb-1">{result.score}/{result.total}</h2>
          <p className={`text-2xl font-bold mb-1 ${gradeColor}`}>{grade}</p>
          <p className="text-muted-foreground text-sm">Accuracy: {result.accuracy}% · Time: {formatTime(result.timeTaken)}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Correct', value: result.score, icon: <CheckCircle2 className="w-5 h-5 text-green-500" /> },
            { label: 'Wrong', value: result.total - result.score, icon: <XCircle className="w-5 h-5 text-red-500" /> },
            { label: 'Accuracy', value: `${result.accuracy}%`, icon: <Target className="w-5 h-5 text-primary" /> },
            { label: 'Avg. Time', value: `${Math.round(result.timeTaken / result.total)}s`, icon: <Clock className="w-5 h-5 text-amber-500" /> },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-2xl p-4 text-center">
              <div className="flex justify-center mb-2">{s.icon}</div>
              <p className="text-xl font-extrabold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Weak topics */}
        {result.weakTopics.length > 0 && (
          <div className="bg-card border border-amber-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-foreground text-sm">Weak Topics — Focus Here</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.weakTopics.map((topic, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Per-question review */}
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="p-4 border-b flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground text-sm">Question Review</h3>
          </div>
          <div className="divide-y divide-border">
            {result.perQuestion.map((pq, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  pq.correct
                    ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{mcqs[i]?.question ?? `Q${i + 1}`}</p>
                  <p className="text-[11px] text-muted-foreground">{pq.topic} · {pq.timeSec}s</p>
                </div>
                {pq.correct
                  ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  : <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                }
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={reset}
          className="flex items-center gap-2 mx-auto px-7 py-3 rounded-xl bg-card border font-bold text-sm hover:border-primary/30 hover:text-primary transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Retry Test
        </button>
      </div>
    );
  }

  return null;
}
