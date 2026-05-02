import type { Notebook } from './types';

const STORAGE_KEY = 'study_notebooks';
const CACHE_KEY = 'study_cache';

// ─── Notebook CRUD ────────────────────────────────────────────────────────────

export function getAllNotebooks(): Notebook[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotebook(nb: Notebook): void {
  if (typeof window === 'undefined') return;
  const all = getAllNotebooks();
  const existing = all.findIndex(n => n.id === nb.id);
  if (existing >= 0) {
    all[existing] = { ...nb, updatedAt: Date.now() };
  } else {
    all.unshift({ ...nb, updatedAt: Date.now() });
  }
  // Keep max 20 notebooks
  const trimmed = all.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getNotebook(id: string): Notebook | null {
  return getAllNotebooks().find(n => n.id === id) ?? null;
}

export function deleteNotebook(id: string): void {
  const all = getAllNotebooks().filter(n => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function createNotebook(title: string, rawText: string): Notebook {
  return {
    id: `nb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    rawText,
    wordCount: rawText.trim().split(/\s+/).filter(Boolean).length,
  };
}

// ─── Result Cache (per notebook + mode) ──────────────────────────────────────

interface CacheEntry {
  notebookId: string;
  mode: string;
  data: unknown;
  params?: string;        // e.g., difficulty
  cachedAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

export function getCached(notebookId: string, mode: string, params?: string): unknown | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entries: CacheEntry[] = JSON.parse(raw);
    const entry = entries.find(
      e => e.notebookId === notebookId && e.mode === mode && e.params === (params ?? '')
    );
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export function setCached(notebookId: string, mode: string, data: unknown, params?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const entries: CacheEntry[] = raw ? JSON.parse(raw) : [];
    const idx = entries.findIndex(
      e => e.notebookId === notebookId && e.mode === mode && e.params === (params ?? '')
    );
    const entry: CacheEntry = {
      notebookId,
      mode,
      data,
      params: params ?? '',
      cachedAt: Date.now(),
    };
    if (idx >= 0) entries[idx] = entry;
    else entries.push(entry);
    // Max 50 cache entries
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries.slice(-50)));
  } catch {}
}
