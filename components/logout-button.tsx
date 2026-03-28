'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ redirect: false });
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAuthId');
    localStorage.removeItem('mentorDay');
    localStorage.removeItem('mentorState');
    localStorage.removeItem('mentorProfile');
    localStorage.removeItem('lpuState');
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleLogout}
      className="p-3 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 hover:border-red-500/60 smooth-transition backdrop-blur-sm hover:scale-110 active:scale-95 transition-all"
      aria-label="Logout"
      title="Reset App State / Logout"
    >
      <LogOut className="w-5 h-5 text-red-400" />
    </button>
  );
}
