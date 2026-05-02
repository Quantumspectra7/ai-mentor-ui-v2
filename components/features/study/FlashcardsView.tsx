'use client';

import { useState, useCallback } from 'react';
import { Loader2, RotateCcw, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import type { Flashcard } from '@/lib/study/types';

interface FlashcardsViewProps {
  text: string;
  notebookId: string;
  cached?: Flashcard[] | null;
  onGenerated: (cards: Flashcard[]) => void;
}

export function FlashcardsView({ text, notebookId, cached, onGenerated }: FlashcardsViewProps) {
  const [cards, setCards] = useState<Flashcard[]>(cached ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [count, setCount] = useState(10);
  const [mastered, setMastered] = useState<Set<number>>(new Set());

  const generate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    setCurrentIdx(0);
    setFlipped(false);
    setMastered(new Set());
    try {
      const res = await fetch('/api/study/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate flashcards.');
      setCards(data.flashcards);
      onGenerated(data.flashcards);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error.');
    } finally {
      setLoading(false);
    }
  }, [loading, text, count, onGenerated]);

  const prev = () => {
    setCurrentIdx(i => Math.max(0, i - 1));
    setFlipped(false);
  };
  const next = () => {
    setCurrentIdx(i => Math.min(cards.length - 1, i + 1));
    setFlipped(false);
  };
  const toggleMastered = () => {
    setMastered(prev => {
      const next = new Set(prev);
      if (next.has(currentIdx)) next.delete(currentIdx);
      else next.add(currentIdx);
      return next;
    });
  };

  const masteredPct = cards.length ? Math.round((mastered.size / cards.length) * 100) : 0;

  if (cards.length === 0) {
    return (
      <div className="space-y-5">
        {/* Config */}
        <div className="flex flex-wrap items-end gap-4 p-5 bg-card border rounded-2xl">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Cards to generate: <span className="text-primary">{count}</span>
            </label>
            <input
              type="range" min={5} max={20} step={1} value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="w-32 accent-primary"
            />
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-60 hover:bg-primary/90 transition-all shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
            {loading ? 'Generating…' : 'Generate Flashcards'}
          </button>
        </div>

        {!loading && (
          <div className="text-center py-12">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
              <Layers className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg mb-2">Flashcard Deck</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Flip cards for quick revision. Track what you've mastered as you go.
            </p>
          </div>
        )}
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </div>
    );
  }

  const card = cards[currentIdx];
  const isMastered = mastered.has(currentIdx);

  return (
    <div className="space-y-6">
      {/* Progress bar + stats */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1.5">
            <span>Card {currentIdx + 1} of {cards.length}</span>
            <span className="text-primary">✓ {mastered.size} mastered ({masteredPct}%)</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${masteredPct}%` }}
            />
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="ml-4 p-2 rounded-xl border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
          title="Regenerate"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
        </button>
      </div>

      {/* Flip Card */}
      <div
        className="relative h-64 cursor-pointer select-none"
        onClick={() => setFlipped(f => !f)}
        style={{ perspective: '1000px' }}
      >
        <div
          className="w-full h-full transition-transform duration-500 relative"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 rounded-3xl border shadow-sm ${
              isMastered ? 'bg-green-500/5 border-green-500/30' : 'bg-card border-border'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Question</p>
            <p className="text-foreground text-center font-semibold text-lg leading-snug">{card.front}</p>
            <p className="text-xs text-muted-foreground mt-6 animate-pulse">Tap to reveal answer</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-8 rounded-3xl border border-primary/30 bg-primary/5 shadow-sm"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-4">Answer</p>
            <p className="text-foreground text-center leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={prev}
          disabled={currentIdx === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border text-sm font-semibold text-foreground disabled:opacity-40 hover:border-primary/30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>

        <button
          onClick={toggleMastered}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
            isMastered
              ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
              : 'bg-card border-border text-muted-foreground hover:border-green-500/30 hover:text-green-500'
          }`}
        >
          {isMastered ? '✓ Mastered' : 'Mark Mastered'}
        </button>

        <button
          onClick={next}
          disabled={currentIdx === cards.length - 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-all"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center flex-wrap gap-1.5 max-h-10 overflow-hidden">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentIdx(i); setFlipped(false); }}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIdx
                ? 'bg-primary w-4'
                : mastered.has(i) ? 'bg-green-500' : 'bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
