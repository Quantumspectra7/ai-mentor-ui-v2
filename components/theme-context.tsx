'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (next: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
};

const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeToDom = (next: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;

  root.setAttribute('data-theme', next);
  body.setAttribute('data-theme', next);

  root.classList.toggle('dark', next === 'dark');
  root.classList.toggle('light', next === 'light');
  body.classList.toggle('dark', next === 'dark');
  body.classList.toggle('light', next === 'light');
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document !== 'undefined') {
      const existing = document.documentElement.getAttribute('data-theme');
      if (existing === 'light' || existing === 'dark') return existing;
    }
    return getStoredTheme() || getSystemTheme();
  });

  useEffect(() => {
    const stored = getStoredTheme();
    const next = stored || getSystemTheme();
    setThemeState(next);
    applyThemeToDom(next);
  }, []);

  useEffect(() => {
    applyThemeToDom(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Ignore storage errors (private mode, disabled storage).
    }
  }, [theme]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'theme') return;
      const next = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : null;
      if (next && next !== theme) {
        setThemeState(next);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
