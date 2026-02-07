import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { verifyClaim } from '../services/verification';
import { ClaimResult } from '../types';
import { Search, AlertTriangle, CheckCircle, HelpCircle, ExternalLink, Activity, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageTransition } from '../components/layout/PageTransition';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';

export const Dashboard = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [history, setHistory] = useState<ClaimResult[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const container = useRef(null);

  // Check Auth & Fetch History
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUserId(session.user.id);
      fetchHistory(session.user.id);
    };
    checkUser();
  }, [navigate]);

  const fetchHistory = async (uid: string) => {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    }
    else if (data) setHistory(data as unknown as ClaimResult[]);
  };

  // Animate Result Card when it appears
  useGSAP(() => {
    if (result) {
      gsap.fromTo('.result-card', 
        { y: 30, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'sine.out' }
      );
      
      gsap.fromTo('.result-item',
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'sine.out', delay: 0.2 }
      );
    }
  }, { scope: container, dependencies: [result] });

  // Animate History Items on load
  useGSAP(() => {
    if (history.length > 0) {
      gsap.from('.history-item', {
        x: -10,
        opacity: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: 'sine.out',
        delay: 0.3
      });
    }
  }, { scope: container, dependencies: [history.length] });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;

    setIsLoading(true);
    setResult(null);

    try {
      const verificationResult = await verifyClaim(input);

      const { data, error } = await supabase
        .from('claims')
        .insert({
          user_id: userId,
          input_text: verificationResult.input_text,
          verdict: verificationResult.verdict,
          credibility_score: verificationResult.credibility_score,
          explanation: verificationResult.explanation,
          sources: verificationResult.sources,
          confidence_level: verificationResult.confidence_level || 0
        })
        .select()
        .single();

      if (error) throw error;

      const newClaim = data as unknown as ClaimResult;
      setResult(newClaim);
      setHistory(prev => [newClaim, ...prev]);
      setInput(''); 
      toast.success('Claim verified successfully');
    } catch (error: any) {
      console.error("Verification failed", error);
      toast.error(error.message || "Failed to verify claim. Check API Keys.");
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'True': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400';
      case 'False': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400';
      case 'Mixed': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900 dark:text-yellow-400';
      default: return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 50) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const stats = history.reduce((acc, curr) => {
    acc[curr.verdict] = (acc[curr.verdict] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    { name: 'True', value: stats['True'] || 0 },
    { name: 'False', value: stats['False'] || 0 },
    { name: 'Mixed', value: stats['Mixed'] || 0 },
  ].filter(d => d.value > 0);

  return (
    <PageTransition>
      <div ref={container} className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Verify claims and track misinformation trends.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input & Results Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-card">
              <CardHeader>
                <CardTitle>Verify a Claim</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="relative group">
                    <textarea
                      className="w-full min-h-[120px] p-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none text-foreground placeholder:text-muted-foreground transition-all duration-300 group-hover:border-blue-500/50"
                      placeholder="Paste text, a URL, or a claim here to verify..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                      {input.length} chars
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                     <div className="text-xs text-muted-foreground flex items-center gap-1">
                       <Settings className="h-3 w-3" />
                       <span>Powered by Gemini & Serper</span>
                     </div>
                    <Button type="submit" disabled={!input.trim()} isLoading={isLoading} className="shadow-lg shadow-blue-500/20">
                      <Search className="mr-2 h-4 w-4" /> Verify Claim
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {result && (
              <Card className="result-card border-l-4 overflow-hidden border-slate-200 dark:border-slate-800 bg-card" style={{ borderLeftColor: getScoreColor(result.credibility_score) }}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">Analysis Result</h3>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getVerdictColor(result.verdict)}`}>
                        {result.verdict === 'True' && <CheckCircle className="mr-1.5 h-4 w-4" />}
                        {result.verdict === 'False' && <AlertTriangle className="mr-1.5 h-4 w-4" />}
                        {result.verdict === 'Mixed' && <HelpCircle className="mr-1.5 h-4 w-4" />}
                        {result.verdict}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold" style={{ color: getScoreColor(result.credibility_score) }}>
                        {result.credibility_score}/100
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Credibility Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="result-item bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Explanation</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{result.explanation}</p>
                    </div>

                    <div className="result-item">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Verified Sources</h4>
                      <div className="space-y-2">
                        {result.sources && result.sources.length > 0 ? (
                          result.sources.map((source, idx) => (
                            <div key={source.id || idx} className="flex flex-col p-3 border border-border rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors gap-2">
                              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                      {source.name ? source.name.substring(0, 2) : 'UK'}
                                  </div>
                                  <div>
                                      <div className="text-sm font-medium text-foreground">{source.name}</div>
                                      <div className="text-xs text-muted-foreground">Credibility: <span className="text-green-600 dark:text-green-400 font-medium">{source.credibility}</span></div>
                                  </div>
                                  </div>
                                  <a href={source.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400">
                                  <ExternalLink className="h-4 w-4" />
                                  </a>
                              </div>
                              {source.snippet && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 pl-11">{source.snippet}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground italic">No specific sources cited.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar: History & Stats */}
          <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No verification history yet.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.map((item) => (
                      <div key={item.id} className="history-item border-b border-border last:border-0 pb-3 last:pb-0">
                        <div className="flex justify-between items-center mb-1">
                          <Badge variant={item.verdict === 'True' ? 'success' : item.verdict === 'False' ? 'destructive' : 'warning'}>
                            {item.verdict}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.input_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-card">
               <CardHeader>
                <CardTitle className="text-lg">Credibility Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[200px] flex items-center justify-center relative">
                 {chartData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'True' ? '#22c55e' : entry.name === 'False' ? '#ef4444' : '#eab308'} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                 ) : (
                   <div className="text-muted-foreground text-sm">No data available</div>
                 )}
                {chartData.length > 0 && (
                  <div className="absolute text-center pointer-events-none">
                    <div className="text-2xl font-bold text-foreground">{history.length}</div>
                    <div className="text-xs text-muted-foreground">Claims</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
