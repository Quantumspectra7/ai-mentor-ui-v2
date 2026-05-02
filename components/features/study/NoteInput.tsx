'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload, FileText, X, ClipboardPaste, AlertCircle,
  Loader2, CheckCircle2, FileUp, FileBadge
} from 'lucide-react';
import { cleanText, wordCount } from '@/lib/study/prompts';

interface NoteInputProps {
  onSubmit: (text: string, title: string) => void;
  isLoading?: boolean;
}

type FileStatus = 'idle' | 'extracting' | 'done' | 'error';

interface FileInfo {
  name: string;
  format: string;
  wordCount: number;
  status: FileStatus;
  error?: string;
}

const SUPPORTED_TYPES = [
  '.pdf', '.docx', '.doc', '.pptx', '.txt', '.md',
];
const ACCEPT = SUPPORTED_TYPES.join(',');

const FORMAT_ICONS: Record<string, string> = {
  PDF: '📄',
  DOCX: '📝',
  DOC: '📝',
  PPTX: '📊',
  TEXT: '📃',
  MD: '📃',
};

export function NoteInput({ onSubmit, isLoading = false }: NoteInputProps) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const words = wordCount(text);
  const isReady = text.trim().length >= 30;

  // ── Upload file to server for extraction ────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_TYPES.includes(ext)) {
      setFileInfo({ name: file.name, format: '', wordCount: 0, status: 'error', error: `Unsupported type "${ext}". Use: ${SUPPORTED_TYPES.join(', ')}` });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setFileInfo({ name: file.name, format: '', wordCount: 0, status: 'error', error: 'File exceeds 20 MB limit.' });
      return;
    }

    setFileInfo({ name: file.name, format: '', wordCount: 0, status: 'extracting' });

    // .txt and .md — read directly in browser (no server round-trip needed)
    if (ext === '.txt' || ext === '.md') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = cleanText(e.target?.result as string);
        setText(content);
        if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
        setFileInfo({
          name: file.name,
          format: 'TEXT',
          wordCount: wordCount(content),
          status: 'done',
        });
      };
      reader.onerror = () => setFileInfo({ name: file.name, format: '', wordCount: 0, status: 'error', error: 'Failed to read file.' });
      reader.readAsText(file);
      return;
    }

    // PDF / DOCX / PPTX — send to server
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/study/extract-text', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();

      if (!res.ok) {
        setFileInfo({ name: file.name, format: '', wordCount: 0, status: 'error', error: data.error ?? 'Extraction failed.' });
        return;
      }

      setText(prev => prev ? prev + '\n\n' + data.text : data.text);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
      setFileInfo({
        name: file.name,
        format: data.format,
        wordCount: data.wordCount,
        status: 'done',
      });
    } catch {
      setFileInfo({ name: file.name, format: '', wordCount: 0, status: 'error', error: 'Network error. Check your connection.' });
    }
  }, [title]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePaste = async () => {
    try {
      const pasted = await navigator.clipboard.readText();
      if (pasted) setText(prev => prev ? prev + '\n\n' + cleanText(pasted) : cleanText(pasted));
    } catch {
      alert('Could not access clipboard. Please use Ctrl+V inside the text area.');
    }
  };

  const clearAll = () => {
    setText('');
    setFileInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">Notebook Title</label>
        <input
          type="text"
          placeholder="e.g. Operating Systems — Chapter 3"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-colors"
        />
      </div>

      {/* Drop zone + file upload */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-primary bg-primary/10'
            : fileInfo?.status === 'done'
              ? 'border-green-500/40 bg-green-500/5'
              : fileInfo?.status === 'error'
                ? 'border-destructive/40 bg-destructive/5'
                : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {fileInfo?.status === 'extracting' ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-semibold text-foreground">Extracting text from <span className="text-primary">{fileInfo.name}</span>…</p>
            <p className="text-xs text-muted-foreground">This may take a few seconds</p>
          </div>
        ) : fileInfo?.status === 'done' ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <span className="text-sm font-bold text-foreground">{FORMAT_ICONS[fileInfo.format] ?? '📄'} {fileInfo.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {fileInfo.format} extracted · <span className="text-primary font-semibold">{fileInfo.wordCount.toLocaleString()} words</span>
            </p>
            <button
              onClick={e => { e.stopPropagation(); clearAll(); }}
              className="mt-1 text-xs text-muted-foreground hover:text-destructive transition-colors font-semibold"
            >
              × Remove file
            </button>
          </div>
        ) : fileInfo?.status === 'error' ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <p className="text-sm font-semibold text-destructive">{fileInfo.error}</p>
            <p className="text-xs text-muted-foreground">Click to try a different file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex items-center gap-2 text-3xl">📄📝📊</div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Drop a file here or <span className="text-primary">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF · DOCX · DOC · PPTX · TXT · MD &nbsp;·&nbsp; Max 20 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">or paste text</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Text area */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-semibold text-foreground">Study Material</label>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${words >= 50 ? 'text-primary' : 'text-muted-foreground'}`}>
              {words.toLocaleString()} words
            </span>
            {text && (
              <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive transition-colors font-semibold">
                Clear
              </button>
            )}
          </div>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste your notes, lecture content, textbook excerpts, or any study material here…"
          rows={9}
          className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none transition-colors leading-relaxed"
        />
      </div>

      {/* Clipboard paste */}
      <button
        onClick={handlePaste}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground text-sm font-semibold transition-all"
      >
        <ClipboardPaste className="w-4 h-4" />
        Paste from Clipboard
      </button>

      {/* Supported formats info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[
          { icon: '📄', label: 'PDF', desc: 'Lecture slides, papers' },
          { icon: '📝', label: 'DOCX / DOC', desc: 'Word documents' },
          { icon: '📊', label: 'PPTX', desc: 'PowerPoint slides' },
          { icon: '📃', label: 'TXT / MD', desc: 'Plain text & Markdown' },
          { icon: '✏️', label: 'Type directly', desc: 'Paste text above' },
          { icon: '📋', label: 'Clipboard', desc: 'One-click paste' },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border/50">
            <span className="text-base">{f.icon}</span>
            <div>
              <p className="text-xs font-bold text-foreground">{f.label}</p>
              <p className="text-[10px] text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={() => {
          if (isReady && !isLoading) {
            onSubmit(text.trim(), title.trim() || 'Untitled Notebook');
          }
        }}
        disabled={!isReady || isLoading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Analyze &amp; Generate Study Tools
          </>
        )}
      </button>

      {!isReady && text.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Minimum 30 characters needed to generate study tools.
        </p>
      )}
    </div>
  );
}
