import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast.success('Sign up successful!', {
            description: 'Please check your email to confirm your account.'
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error('Authentication failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <Card className="w-full max-w-md shadow-lg dark:border-slate-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? 'Create an account' : 'Sign in to Factify'}
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email below to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          
          <form onSubmit={handleAuth} className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium leading-none dark:text-slate-200">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-100"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium leading-none dark:text-slate-200">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-100"
              />
            </div>
            <Button type="submit" className="w-full" isLoading={loading}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">Or</span>
            </div>
          </div>

          <div className="text-center text-sm">
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:underline dark:text-blue-500"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
