'use client';

import { useTheme } from './theme-context';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-3 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-primary/30 w-[46px] h-[46px]" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-full border border-primary/30 bg-white/5 hover:border-primary/60 smooth-transition backdrop-blur-sm hover:scale-110 active:scale-95"
      aria-label="Toggle theme"
      aria-pressed={theme === 'dark'}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-800" />
      )}
    </button>
  );
}