'use client';

import { ThemeToggle } from './theme-toggle';
import { LogoutButton } from './logout-button';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <ThemeToggle />
        <LogoutButton />
      </div>
      {children}
    </>
  );
}
