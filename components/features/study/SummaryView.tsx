'use client';

import { useState } from 'react';
import {
  AlignLeft, BookOpen, ListChecks, Star, Loader2,
  ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import type { SummaryResult, SummaryMode } from '@/lib/study/types';

interface SummaryViewProps {
  text: string;
  notebookId: string;
  cached?: SummaryResult | null;
  onGenerated: (result: SummaryResult) => void;
}

const MODES: { id: SummaryMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'short',      label: 'Quick Recap',    icon: <AlignLeft className="w-4 h-4" />,   desc: '2-3 sentences' },
  { id: 'detailed',   label: 'Deep Dive',      icon: <BookOpen className="w-4 h-4" />,    desc: 'Full explanation' },
  { id: 'bullets',    label: 'Key Points',     icon: <ListChecks className="w-4 h-4" />,  desc: 'Bullet notes' },
  { id: 'highlights', label: 'Must Knows',     icon: <Star className="w-4 h-4" />,        desc: 'Top concepts' },
];

export function SummaryView({ text, notebookId, cached, onGenerated }: SummaryViewProps) {
  const [result, setResult] = useState<SummaryResult | null>(cached ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeMode, setActiveMode] = useState<SummaryMode>('short');
  const [copied, setCopied] = useState(false);
  const [expandedHighlight, setExpandedHighlight] = useState<number | null>(null);

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/study/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate summary.');
      setResult(data.summary);
      onGenerated(data.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const content = activeMode === 'bullets'
      ? result.bullets.join('\n')
      : activeMode === 'highlights'
        ? result.highlights.join('\n')
        : activeMode === 'detailed' ? result.detailed : result.short;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Generate button */}
      {!result && (
        <div className="text-center py-10">
          <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-bold text-foreground text-lg mb-2">AI Summary Generator</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Generates 4 summary modes: Quick Recap, Deep Dive, Bullet Notes, and Must-Know highlights.
          </p>
          <button
            onClick={generate}
            disabled={loading}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:bg-primary/90 disabled:opacity-60 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
            {loading ? 'Generating…' : 'Generate Summary'}
          </button>
          {error && <p className="text-sm text-destructive mt-4">{error}</p>}
        </div>
      )}

      {result && (
        <>
          {/* Mode tabs */}
          <div className="flex flex-wrap gap-2">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMode(m.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  activeMode === m.id
                    ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
              >
                {m.icon}
                {m.label}
                <span className="hidden sm:inline text-[11px] opacity-70">({m.desc})</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-card border rounded-2xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
                {MODES.find(m => m.id === activeMode)?.label}
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {activeMode === 'short' && (
              <p className="text-foreground leading-relaxed text-base">{result.short}</p>
            )}
            {activeMode === 'detailed' && (
              <p className="text-foreground leading-relaxed whitespace-pre-line">{result.detailed}</p>
            )}
            {activeMode === 'bullets' && (
              <ul className="space-y-3">
                {result.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {activeMode === 'highlights' && (
              <div className="space-y-2">
                {result.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => setExpandedHighlight(expandedHighlight === i ? null : i)}
                  >
                    <Star className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground flex-1">{h}</p>
                    {expandedHighlight === i ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Regenerate */}
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '↺'}
            {loading ? 'Regenerating…' : 'Regenerate Summary'}
          </button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      )}
    </div>
  );
}
