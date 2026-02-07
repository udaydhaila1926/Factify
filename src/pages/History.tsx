import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { useTheme } from '../components/theme-provider';
import { supabase } from '../lib/supabase';
import { DbClaim } from '../types';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Skeleton } from '../components/ui/Skeleton';

export function History() {
  const { theme } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [claims, setClaims] = useState<DbClaim[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Chart colors based on theme
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Stats
  const totalClaims = claims.length;
  const misinformationCount = claims.filter(c => c.verdict === 'False').length;
  const avgScore = totalClaims > 0 
    ? Math.round(claims.reduce((acc, curr) => acc + curr.score, 0) / totalClaims) 
    : 0;

  // Prepare Chart Data (Last 7 days)
  const chartData = React.useMemo(() => {
    const days = 7;
    const data = new Map();
    
    // Initialize last 7 days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      data.set(dateStr, { date: dateStr, verified: 0, fake: 0 });
    }

    // Fill with actual data
    claims.forEach(claim => {
      const claimDate = new Date(claim.created_at);
      const dateStr = claimDate.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Only count if within the last 7 days initialized above
      if (data.has(dateStr)) {
        const entry = data.get(dateStr);
        if (claim.verdict === 'True') {
            entry.verified += 1;
        } else if (claim.verdict === 'False') {
            entry.fake += 1;
        }
      }
    });

    return Array.from(data.values());
  }, [claims]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <Skeleton className="h-10 w-64" /> {/* Title */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton className="h-[380px] lg:col-span-2 rounded-xl" /> {/* Chart */}
                <Skeleton className="h-[380px] rounded-xl" /> {/* Stats */}
            </div>
            <Skeleton className="h-[200px] rounded-xl" /> {/* Recent List */}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="text-center max-w-md">
            <div className="bg-blue-100 p-4 rounded-full inline-flex mb-4 dark:bg-blue-900/30">
                <AlertCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 dark:text-white">Sign in to view history</h1>
            <p className="text-slate-600 mb-6 dark:text-slate-400">
                Create an account or log in to track your verification history and analytics.
            </p>
            <Link to="/login">
                <Button size="lg" className="w-full">Log In / Sign Up</Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8 dark:text-white">Verification History</h1>
            
            {claims.length === 0 ? (
                <Card className="dark:border-slate-800 text-center py-12">
                    <CardContent>
                        <p className="text-slate-500 mb-4">No claims verified yet.</p>
                        <Link to="/dashboard">
                            <Button>Verify your first claim</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <Card className="lg:col-span-2 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle>Weekly Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                            <XAxis dataKey="date" stroke={textColor} tick={{fill: textColor}} />
                                            <YAxis stroke={textColor} tick={{fill: textColor}} allowDecimals={false} />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    backgroundColor: tooltipBg, 
                                                    borderColor: tooltipBorder,
                                                    color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                                                }} 
                                                cursor={{fill: theme === 'dark' ? '#1e293b' : '#f1f5f9'}}
                                            />
                                            <Bar dataKey="verified" fill="#2563eb" name="True Claims" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="fake" fill="#ef4444" name="False Claims" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="dark:border-slate-800">
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Total Claims Verified</div>
                                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalClaims}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Misinformation Detected</div>
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-500">{misinformationCount}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Avg. Credibility Score</div>
                                    <div className={cn(
                                        "text-3xl font-bold",
                                        avgScore >= 80 ? "text-green-600 dark:text-green-500" :
                                        avgScore >= 50 ? "text-amber-600 dark:text-amber-500" :
                                        "text-red-600 dark:text-red-500"
                                    )}>{avgScore}/100</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Recent Verifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {claims.map((claim) => (
                                    <div key={claim.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 truncate dark:text-slate-200" title={claim.input_text}>
                                                {claim.input_text}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(claim.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium border w-fit whitespace-nowrap",
                                            claim.verdict === 'True' ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900" :
                                            claim.verdict === 'False' ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900" :
                                            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900"
                                        )}>
                                            {claim.verdict}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    </div>
  );
}
