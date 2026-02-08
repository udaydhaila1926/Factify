import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LogIn, User } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';
import { ModeToggle } from '../mode-toggle';
import { MagneticLink } from '../ui/magnetic-link';
import { useMagnetic } from '../../hooks/use-magnetic';

// Magnetic Button Wrapper for Icons
const MagneticIcon = ({ children }: { children: React.ReactNode }) => {
  const ref = useMagnetic();
  return <div ref={ref} className="inline-block">{children}</div>;
};

export const Navbar = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-500 border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <ShieldCheck className="h-7 w-7 text-blue-600 dark:text-blue-500 transition-transform duration-700 ease-out group-hover:rotate-12" />
            <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">Factify</span>
        </Link>

        {!isAuthPage && (
          <div className="flex items-center gap-2 md:gap-8">
            <div className="hidden md:flex items-center gap-8 mr-2">
              <MagneticLink to="/about">About</MagneticLink>
              <MagneticLink to="/trending">Trending</MagneticLink>
              {user && (
                <>
                  <MagneticLink to="/dashboard">Dashboard</MagneticLink>
                  <MagneticLink to="/history">History</MagneticLink>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <ModeToggle />

              {user ? (
                <div className="flex items-center gap-2 border-l pl-4 border-border">
                  <Link to="/profile">
                    <MagneticIcon>
                      <Button variant="ghost" size="icon" title="Profile" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </MagneticIcon>
                  </Link>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="default" size="sm" className="rounded-full px-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
