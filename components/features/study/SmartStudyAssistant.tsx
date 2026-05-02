'use client';

import { useState, useCallback } from 'react';
import {
  GraduationCap, BookOpen, HelpCircle, Timer, MessageSquare,
  Layers, FolderOpen, Plus, Trash2, ChevronLeft, Clock,
  FileText, ArrowLeft, Sparkles
} from 'lucide-react';
import { NoteInput } from './NoteInput';
import { SummaryView } from './SummaryView';
import { MCQView } from './MCQView';
import { MockTestView } from './MockTestView';
import { VivaView } from './VivaView';
import { FlashcardsView } from './FlashcardsView';
import {
  getAllNotebooks, saveNotebook, deleteNotebook, createNotebook,
  getCached, setCached
} from '@/lib/study/studyStorage';
import type { Notebook, MCQItem, SummaryResult, Flashcard, TestResult } from '@/lib/study/types';

type StudyTab = 'summary' | 'mcq' | 'test' | 'viva' | 'flashcards';

interface SmartStudyAssistantProps {
  onBack: () => void;
}

const STUDY_TABS: { id: StudyTab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'summary',    label: 'Summary',    icon: <BookOpen className="w-4 h-4" />,     desc: 'AI-generated notes' },
  { id: 'mcq',       label: 'MCQs',       icon: <HelpCircle className="w-4 h-4" />,   desc: 'Practice questions' },
  { id: 'test',      label: 'Mock Test',  icon: <Timer className="w-4 h-4" />,         desc: 'Timed exam mode' },
  { id: 'viva',      label: 'Viva Prep',  icon: <MessageSquare className="w-4 h-4" />, desc: 'AI examiner' },
  { id: 'flashcards',label: 'Flashcards', icon: <Layers className="w-4 h-4" />,        desc: 'Flip-card revision' },
];

export function SmartStudyAssistant({ onBack }: SmartStudyAssistantProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => getAllNotebooks());
  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);
  const [activeTab, setActiveTab] = useState<StudyTab>('summary');
  const [testMCQs, setTestMCQs] = useState<MCQItem[] | null>(null);
  const [showNewInput, setShowNewInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Notebook management ─────────────────────────────────────────────────────
  const handleNewNotebook = useCallback((text: string, title: string) => {
    setIsProcessing(true);
    const nb = createNotebook(title, text);
    saveNotebook(nb);
    setNotebooks(getAllNotebooks());
    setActiveNotebook(nb);
    setActiveTab('summary');
    setShowNewInput(false);
    setIsProcessing(false);
  }, []);

  const handleDeleteNotebook = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotebook(id);
    setNotebooks(getAllNotebooks());
    if (activeNotebook?.id === id) setActiveNotebook(null);
  }, [activeNotebook]);

  // ── Result persist callbacks ─────────────────────────────────────────────────
  const handleSummaryGenerated = useCallback((result: SummaryResult) => {
    if (!activeNotebook) return;
    const updated = { ...activeNotebook, summary: result, updatedAt: Date.now() };
    saveNotebook(updated);
    setActiveNotebook(updated);
    setCached(activeNotebook.id, 'summary', result);
  }, [activeNotebook]);

  const handleMCQGenerated = useCallback((mcqs: MCQItem[]) => {
    if (!activeNotebook) return;
    const updated = { ...activeNotebook, mcqs, updatedAt: Date.now() };
    saveNotebook(updated);
    setActiveNotebook(updated);
    setCached(activeNotebook.id, 'mcqs', mcqs);
  }, [activeNotebook]);

  const handleFlashcardsGenerated = useCallback((flashcards: Flashcard[]) => {
    if (!activeNotebook) return;
    const updated = { ...activeNotebook, flashcards, updatedAt: Date.now() };
    saveNotebook(updated);
    setActiveNotebook(updated);
    setCached(activeNotebook.id, 'flashcards', flashcards);
  }, [activeNotebook]);

  const handleTestComplete = useCallback((result: TestResult) => {
    if (!activeNotebook) return;
    const history = [...(activeNotebook.testHistory ?? []), result];
    const updated = { ...activeNotebook, testHistory: history, updatedAt: Date.now() };
    saveNotebook(updated);
    setActiveNotebook(updated);
  }, [activeNotebook]);

  const handleStartTest = useCallback((mcqs: MCQItem[]) => {
    setTestMCQs(mcqs);
    setActiveTab('test');
  }, []);

  // ── NOTEBOOK LIST (home) ─────────────────────────────────────────────────────
  if (!activeNotebook && !showNewInput) {
    return (
      <div className="min-h-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground">Smart Study Assistant</h1>
              <p className="text-xs text-muted-foreground">AI-powered · NotebookLM-style</p>
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['📝 AI Summaries', '❓ MCQ Generator', '⏱ Mock Tests', '🎓 Viva Prep', '🃏 Flashcards'].map(f => (
            <span key={f} className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              {f}
            </span>
          ))}
        </div>

        {/* New notebook CTA */}
        <button
          onClick={() => setShowNewInput(true)}
          className="w-full flex items-center gap-4 p-6 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all group mb-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-bold text-foreground">New Notebook</p>
            <p className="text-sm text-muted-foreground">Paste notes, upload a file, or type study material</p>
          </div>
          <Sparkles className="w-5 h-5 text-primary ml-auto opacity-60 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Recent notebooks */}
        {notebooks.length > 0 ? (
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Recent Notebooks ({notebooks.length})
            </p>
            <div className="space-y-3">
              {notebooks.map(nb => (
                <div
                  key={nb.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setActiveNotebook(nb);
                    setActiveTab('summary');
                    setTestMCQs(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setActiveNotebook(nb);
                      setActiveTab('summary');
                      setTestMCQs(null);
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border hover:border-primary/30 shadow-sm hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{nb.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground">{nb.wordCount?.toLocaleString() ?? 0} words</span>
                      {nb.summary && (
                        <span className="text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded">Summary</span>
                      )}
                      {nb.mcqs && nb.mcqs.length > 0 && (
                        <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded">{nb.mcqs.length} MCQs</span>
                      )}
                      {nb.testHistory && nb.testHistory.length > 0 && (
                        <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                          Best: {Math.max(...nb.testHistory.map(t => t.accuracy))}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(nb.updatedAt).toLocaleDateString()}
                    </div>
                    <button
                      onClick={(e) => handleDeleteNotebook(nb.id, e)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                      title="Delete notebook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notebooks yet. Create your first one above!</p>
          </div>
        )}
      </div>
    );
  }

  // ── NEW NOTEBOOK INPUT ────────────────────────────────────────────────────────
  if (showNewInput) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setShowNewInput(false)}
            className="p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-foreground text-lg">New Notebook</h2>
            <p className="text-xs text-muted-foreground">Add your study material below</p>
          </div>
        </div>
        <NoteInput onSubmit={handleNewNotebook} isLoading={isProcessing} />
      </div>
    );
  }

  // ── ACTIVE NOTEBOOK ───────────────────────────────────────────────────────────
  if (activeNotebook) {
    return (
      <div className="min-h-full flex flex-col gap-0">
        {/* Notebook header */}
        <div className="flex items-start gap-3 mb-6">
          <button
            onClick={() => { setActiveNotebook(null); setTestMCQs(null); }}
            className="p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-foreground text-lg truncate">{activeNotebook.title}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground">{activeNotebook.wordCount?.toLocaleString() ?? 0} words</span>
              {activeNotebook.testHistory && activeNotebook.testHistory.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  🏆 Best score: {Math.max(...activeNotebook.testHistory.map(t => t.accuracy))}%
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                Updated {new Date(activeNotebook.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {STUDY_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id !== 'test') setTestMCQs(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-semibold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1">
          {activeTab === 'summary' && (
            <SummaryView
              text={activeNotebook.rawText}
              notebookId={activeNotebook.id}
              cached={activeNotebook.summary ?? null}
              onGenerated={handleSummaryGenerated}
            />
          )}
          {activeTab === 'mcq' && (
            <MCQView
              text={activeNotebook.rawText}
              notebookId={activeNotebook.id}
              cached={activeNotebook.mcqs ?? null}
              onGenerated={handleMCQGenerated}
              onStartTest={handleStartTest}
            />
          )}
          {activeTab === 'test' && (
            testMCQs && testMCQs.length > 0
              ? <MockTestView mcqs={testMCQs} onComplete={handleTestComplete} />
              : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm mb-4">
                    No MCQs loaded. Generate some questions first, then click "Mock Test".
                  </p>
                  <button
                    onClick={() => setActiveTab('mcq')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Generate MCQs
                  </button>
                </div>
              )
          )}
          {activeTab === 'viva' && (
            <VivaView text={activeNotebook.rawText} notebookTitle={activeNotebook.title} />
          )}
          {activeTab === 'flashcards' && (
            <FlashcardsView
              text={activeNotebook.rawText}
              notebookId={activeNotebook.id}
              cached={activeNotebook.flashcards ?? null}
              onGenerated={handleFlashcardsGenerated}
            />
          )}
        </div>
      </div>
    );
  }

  return null;
}
