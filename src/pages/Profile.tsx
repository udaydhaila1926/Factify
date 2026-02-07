import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { User, Mail, Calendar, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';

export const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, true: 0, false: 0 });
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      fetchStats(session.user.id);
    };
    getUser();
  }, [navigate]);

  const fetchStats = async (userId: string) => {
    const { data } = await supabase
      .from('claims')
      .select('verdict')
      .eq('user_id', userId);

    if (data) {
      setStats({
        total: data.length,
        true: data.filter(c => c.verdict === 'True').length,
        false: data.filter(c => c.verdict === 'False').length,
      });
    }
  };

  useGSAP(() => {
    if (!container.current) return;

    gsap.fromTo(
      container.current.querySelectorAll('.profile-item'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' }
    );
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  if (!user) return null;

  return (
    /* 🔥 FORCE PAGE BACKGROUND */
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div
        ref={container}
        className="container mx-auto max-w-2xl px-4 py-12"
      >
        <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">
          My Profile
        </h1>

        <div className="grid gap-6">
          {/* PROFILE CARD */}
          <Card className="profile-item bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  {user.email?.split('@')[0]}
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Member since {new Date(user.created_at).getFullYear()}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-slate-500" />
                <span>Role: User</span>
              </div>
            </CardContent>
          </Card>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="profile-item bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-xs uppercase text-slate-600 dark:text-slate-400">
                Total Checks
              </div>
            </Card>

            <Card className="profile-item bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.true}
              </div>
              <div className="text-xs uppercase text-slate-600 dark:text-slate-400">
                Verified True
              </div>
            </Card>

            <Card className="profile-item bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-red-600">
                {stats.false}
              </div>
              <div className="text-xs uppercase text-slate-600 dark:text-slate-400">
                Debunked
              </div>
            </Card>
          </div>

          {/* SIGN OUT */}
          <Button
            variant="destructive"
            className="profile-item w-full"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};