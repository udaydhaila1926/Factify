import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { PageTransition } from '../components/layout/PageTransition';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';

export const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    gsap.from('.auth-item', {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.7,
      ease: 'power3.out',
      delay: 0.15,
    });
  }, { scope: container });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Account created! Please check your email.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <div ref={container} className="w-full max-w-md relative z-10">
          <Card
            className="
              bg-white dark:bg-slate-900
              border border-slate-200 dark:border-slate-700
              shadow-2xl
            "
          >
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center auth-item">
                <div className="h-16 w-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <ShieldCheck className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100 auth-item">
                {isSignUp ? 'Create an account' : 'Welcome back'}
              </CardTitle>

              <p className="text-sm text-slate-600 dark:text-slate-400 auth-item">
                {isSignUp
                  ? 'Enter your details to get started'
                  : 'Enter your credentials to access your dashboard'}
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                {error && (
                  <div className="auth-item flex items-center gap-2 rounded-md p-3 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2 auth-item">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="
                      bg-slate-50 dark:bg-slate-800
                      border-slate-300 dark:border-slate-600
                      text-slate-900 dark:text-slate-100
                      placeholder:text-slate-400
                    "
                  />
                </div>

                <div className="space-y-2 auth-item">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="
                      bg-slate-50 dark:bg-slate-800
                      border-slate-300 dark:border-slate-600
                      text-slate-900 dark:text-slate-100
                    "
                  />
                </div>

                <div className="auth-item pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 text-base shadow-md shadow-blue-500/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      isSignUp ? 'Sign Up' : 'Sign In'
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center text-sm auth-item">
                <span className="text-slate-600 dark:text-slate-400">
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};
