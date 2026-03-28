'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowRight, Activity, Sparkles, Fingerprint } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background text-foreground">
      <div className="relative z-10 w-full max-w-md p-6 animate-in slide-in-from-bottom-4 duration-500">
        
        <div className="mb-10 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
             <Sparkles className="w-8 h-8 text-primary" />
          </div>
          
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-foreground tracking-wide uppercase">System Online</span>
            </div>
          </div>

          <h1 className="text-4xl font-display font-bold tracking-tight text-foreground pb-2">
            AI Mentor
          </h1>
          <p className="text-muted-foreground font-medium text-sm">Authenticate to access the intelligence core</p>
        </div>

        <form 
          onSubmit={handleSubmit}
          className="bg-card border p-8 rounded-[2rem] shadow-lg space-y-6"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground ml-1">Secure ID</Label>
              <div className="relative group">
                <Fingerprint className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="student@lpu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 bg-background border-input hover:bg-accent/50 focus:bg-background text-foreground placeholder:text-muted-foreground h-12 rounded-xl transition-colors shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-foreground">Neural Key</Label>
                <a href="#" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                  Reset Key?
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 bg-background border-input hover:bg-accent/50 focus:bg-background text-foreground placeholder:text-muted-foreground h-12 rounded-xl transition-colors shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !email || !password}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Activity className="h-5 w-5 animate-pulse text-primary-foreground/70" />
                Authenticating...
              </>
            ) : (
              <>
                Initialize Session
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
