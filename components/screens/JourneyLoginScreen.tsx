'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface JourneyLoginScreenProps {
  onLoginSuccess: (email: string, authId: string) => void;
  onBack?: () => void;
}

export function JourneyLoginScreen({ onLoginSuccess, onBack }: JourneyLoginScreenProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      if (showSignUp) {
        const register = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: nameInput }),
        });

        if (!register.ok) {
          const data = await register.json();
          setError(data.message || 'Registration failed');
          setIsLoading(false);
          return;
        }
      }

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error || 'Authentication failed');
        setIsLoading(false);
        return;
      }

      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      const authId = session?.user?.id;

      if (authId) {
        localStorage.setItem('userAuthId', authId);
        localStorage.setItem('userEmail', email);
        onLoginSuccess(email, authId);
        if (!onBack) {
          router.push('/');
        }
      } else {
        setError('Authentication failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background text-foreground px-6 py-10">
      
      <div className="w-full max-w-lg z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="rounded-[2.5rem] border bg-card p-10 shadow-lg">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-8 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-semibold">Back to explorer</span>
            </button>
          )}

          <div className="space-y-3 mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">AI Mentor App</h1>
            <p className="text-muted-foreground text-sm font-medium">Student-first access to your organized timeline.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex justify-center">
              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl border bg-background text-foreground text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-50 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold uppercase tracking-widest">
              <div className="h-px flex-1 bg-border" />
              or
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              {showSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">FULL NAME</label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="h-14 rounded-xl bg-background border-input text-foreground px-4 shadow-sm focus-visible:ring-primary text-base"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">EMAIL ARCHIVE</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 rounded-xl bg-background border-input text-foreground px-4 shadow-sm focus-visible:ring-primary text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">SECURITY KEY</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-12 rounded-xl bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-base transition-shadow"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-muted-foreground pt-2 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-input bg-background accent-primary" />
                I agree to the System Protocol & Privacy Terms
              </label>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-colors shadow-sm mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Authenticating Node...
                  </>
                ) : showSignUp ? (
                  'Create Access Token'
                ) : (
                  'Login to Network'
                )}
              </Button>
            </form>

            <div className="text-center text-sm font-medium text-muted-foreground pt-4">
              {showSignUp ? (
                <>
                  Already registered?{' '}
                  <button
                    onClick={() => {
                      setShowSignUp(false);
                      setNameInput('');
                      setError('');
                    }}
                    className="text-foreground hover:text-primary transition-colors font-bold underline decoration-primary/30 underline-offset-4"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  New here?{' '}
                  <button
                    onClick={() => {
                      setShowSignUp(true);
                      setError('');
                    }}
                    className="text-foreground hover:text-primary transition-colors font-bold underline decoration-primary/30 underline-offset-4"
                  >
                    Create account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
