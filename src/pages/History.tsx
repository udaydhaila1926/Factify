import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ClaimResult } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Loader2, Calendar, Search, Trash2, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const History = () => {
  const [history, setHistory] = useState<ClaimResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const navigate = useNavigate();
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      // Improved error handling for missing tables
      if (error.code === 'PGRST205') {
        toast.error('Database setup incomplete: Run migration SQL');
      } else {
        toast.error(`Failed to load history: ${error.message}`);
      }
    } else {
      const claims = data as ClaimResult[];
      setHistory(claims);
      processChartData(claims);
    }
    setIsLoading(false);
  };

  // ✅ FIXED: Mon → Sun order
  const processChartData = (claims: ClaimResult[]) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const stats = days.map(day => ({
      name: day,
      True: 0,
      False: 0,
      Mixed: 0,
    }));

    claims.forEach(claim => {
      const jsDay = new Date(claim.created_at).getDay(); // 0 = Sun
      const chartIndex = jsDay === 0 ? 6 : jsDay - 1;

      if (claim.verdict === 'True') stats[chartIndex].True++;
      else if (claim.verdict === 'False') stats[chartIndex].False++;
      else stats[chartIndex].Mixed++;
    });

    setChartData(stats);
  };

  useGSAP(() => {
    if (!isLoading) {
      gsap.from('.chart-container', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
  }, { scope: container, dependencies: [isLoading] });

  const handleDelete = async (id: string) => {
    gsap.to(`#claim-${id}`, {
      height: 0,
      opacity: 0,
      marginBottom: 0,
      duration: 0.4,
      onComplete: async () => {
        const { error } = await supabase.from('claims').delete().eq('id', id);
        if (!error) {
          const updated = history.filter(h => h.id !== id);
          setHistory(updated);
          processChartData(updated);
          toast.success('Record deleted');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div ref={container} className="min-h-screen bg-slate-50 dark:bg-slate-950/80">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Verification History
            </h1>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="rounded-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
            >
              <Search className="mr-2 h-4 w-4" />
              Verify New Claim
            </Button>
          </div>

          {history.length > 0 && (
            <Card className="chart-container mb-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <BarChart2 className="h-5 w-5 text-blue-500" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.4)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip cursor={false} />
                      <Legend />
                      <Bar dataKey="True" stackId="a" fill="#22c55e" />
                      <Bar dataKey="False" stackId="a" fill="#ef4444" />
                      <Bar dataKey="Mixed" stackId="a" fill="#eab308" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History list stays unchanged */}
          <div className="space-y-4">
            {history.map((item) => (
              <div
                id={`claim-${item.id}`}
                key={item.id}
                className="history-item bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={item.verdict === 'True' ? 'success' : item.verdict === 'False' ? 'destructive' : 'warning'}>
                      {item.verdict}
                    </Badge>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium line-clamp-2">
                    {item.input_text}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block">
                    <div className="text-lg font-bold" style={{ color: item.credibility_score >= 80 ? '#22c55e' : item.credibility_score >= 50 ? '#eab308' : '#ef4444' }}>
                      {item.credibility_score}%
                    </div>
                    <div className="text-[10px] uppercase text-slate-500">Score</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
