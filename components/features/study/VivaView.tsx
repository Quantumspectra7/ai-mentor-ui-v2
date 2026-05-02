'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, CheckCircle2, XCircle, MessageSquare, Play, RotateCcw } from 'lucide-react';
import type { VivaMessage } from '@/lib/study/types';

interface VivaViewProps {
  text: string;
  notebookTitle: string;
}

export function VivaView({ text, notebookTitle }: VivaViewProps) {
  const [messages, setMessages] = useState<VivaMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startViva = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/study/viva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: text, topic: notebookTitle, isFirst: true, history: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to start viva.');

      const msg: VivaMessage = {
        role: 'examiner',
        content: data.question,
        timestamp: Date.now(),
      };
      setMessages([msg]);
      setHistory([{ role: 'assistant', content: data.question }]);
      setStarted(true);
      setQuestionCount(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error.');
    } finally {
      setLoading(false);
    }
  };

  const sendAnswer = async () => {
    if (!input.trim() || loading) return;
    const answer = input.trim();
    setInput('');

    const studentMsg: VivaMessage = {
      role: 'student',
      content: answer,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, studentMsg]);
    const newHistory = [...history, { role: 'user' as const, content: answer }];
    setHistory(newHistory);

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/study/viva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: text,
          topic: notebookTitle,
          studentAnswer: answer,
          history: newHistory,
          isFirst: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to get examiner response.');

      const examinerMsg: VivaMessage = {
        role: 'examiner',
        content: data.question,
        feedback: data.feedback,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, examinerMsg]);
      setHistory(prev => [...prev, { role: 'assistant', content: data.question }]);
      setQuestionCount(q => q + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get response. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setHistory([]);
    setStarted(false);
    setInput('');
    setQuestionCount(0);
    setError('');
  };

  if (!started) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex p-5 rounded-2xl bg-primary/10 mb-6 border border-primary/20">
          <MessageSquare className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Viva Preparation</h2>
        <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto leading-relaxed">
          An AI examiner will ask you questions about your notes, follow up on your answers,
          and give real-time feedback — just like a real oral exam.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 text-sm">
          {[
            '🎓 Questions based on your actual notes',
            '🔁 Follow-up questions on incomplete answers',
            '✅ Instant feedback on every response',
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-2 text-muted-foreground">
              <span>{tip}</span>
            </div>
          ))}
        </div>
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}
        <button
          onClick={startViva}
          disabled={loading}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:bg-primary/90 disabled:opacity-60 transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          {loading ? 'Starting exam…' : 'Start Viva'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] max-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-bold text-foreground">AI Examiner · {notebookTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium">{questionCount} questions asked</span>
          <button
            onClick={reset}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Restart viva"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'examiner' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0 mr-3 mt-1">
                AI
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'student' ? 'order-first' : ''}`}>
              {/* Feedback badge (for examiner, after first question) */}
              {msg.role === 'examiner' && msg.feedback && i > 0 && (
                <div className="mb-2 flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="italic">{msg.feedback}</span>
                </div>
              )}
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'examiner'
                  ? 'bg-card border border-border text-foreground rounded-tl-sm'
                  : 'bg-primary text-primary-foreground rounded-tr-sm'
              }`}>
                {msg.content}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0 mr-3">
              AI
            </div>
            <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-destructive/5 border-t border-destructive/20 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4 bg-card rounded-b-2xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAnswer(); } }}
            placeholder="Type your answer and press Enter…"
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-colors"
          />
          <button
            onClick={sendAnswer}
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 text-center">
          Answer in your own words. The AI examiner will ask follow-up questions.
        </p>
      </div>
    </div>
  );
}
