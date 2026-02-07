import React, { useState, useEffect, useRef } from 'react';
import { Search, AlertCircle, CheckCircle, HelpCircle, BarChart3, ExternalLink, Sparkles, Zap, Bot, SearchCheck, BrainCircuit, Loader2, Download, Share2, Newspaper, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { analyzeClaim, getActiveEngine, EngineType } from '../services/aiFactory';
import { searchFactChecks } from '../services/googleFactCheck';
import { analyzeWithBert, loadBertModel } from '../services/bertModel';
import { fetchRelatedNews } from '../services/newsApi';
import { AnalysisResult, GoogleFactCheckReview, BertAnalysis, NewsArticle } from '../types';
import { cn } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTheme } from '../components/theme-provider';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export function Dashboard() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [factChecks, setFactChecks] = useState<GoogleFactCheckReview[]>([]);
  const [bertResult, setBertResult] = useState<BertAnalysis | null>(null);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isBertLoading, setIsBertLoading] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [activeEngine, setActiveEngine] = useState<EngineType>('mock');
  const [activeModules, setActiveModules] = useState({
    news: false,
    factCheck: false,
    bert: true
  });

  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // GSAP Animation for results
  useGSAP(() => {
    if (result && resultRef.current) {
        gsap.fromTo(resultRef.current, 
            { y: 50, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.2)" }
        );
        
        // Stagger children cards
        gsap.fromTo(".result-card-item", 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.2, ease: "power2.out" }
        );
    }
  }, { scope: containerRef, dependencies: [result] });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    setActiveEngine(getActiveEngine());
    
    // Check for keys in Environment Variables
    const newsKey = import.meta.env.VITE_NEWS_API_KEY;
    const factKey = import.meta.env.VITE_GOOGLE_FACT_CHECK_KEY;
    
    setActiveModules({
        news: !!(newsKey && newsKey.length > 5),
        factCheck: !!(factKey && factKey.length > 5),
        bert: true
    });

    loadBertModel().catch(console.error);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setResult(null);
    setFactChecks([]);
    setBertResult(null);
    setNewsArticles([]);
    
    try {
      // Use Environment Variables
      const newsApiKey = import.meta.env.VITE_NEWS_API_KEY || '';
      const newsPromise = fetchRelatedNews(input, newsApiKey);
      
      const factCheckKey = import.meta.env.VITE_GOOGLE_FACT_CHECK_KEY || '';
      const factCheckPromise = searchFactChecks(input, factCheckKey);

      setIsBertLoading(true);
      const bertPromise = analyzeWithBert(input);

      const [newsData, factCheckData, bertData] = await Promise.all([
        newsPromise,
        factCheckPromise,
        bertPromise
      ]);

      setNewsArticles(newsData);
      setFactChecks(factCheckData);
      setBertResult(bertData);
      setIsBertLoading(false);

      let contextString = "";
      if (newsData.length > 0) {
        contextString = newsData.map(a => `Title: ${a.title}\nSource: ${a.source.name}\nDescription: ${a.description}`).join('\n\n');
      }

      const aiData = await analyzeClaim(input, contextString);
      setResult(aiData);

      if (user) {
        await supabase.from('claims').insert({
          user_id: user.id,
          input_text: input,
          verdict: aiData.verdict,
          score: aiData.score,
          confidence: aiData.confidence,
          explanation: aiData.summary,
          sources: aiData.sources
        });
        toast.success('Analysis Complete');
      }

    } catch (error: any) {
      console.error("Failed to analyze", error);
      toast.error('Verification Failed', { description: error.message });
    } finally {
      setIsLoading(false);
      setIsBertLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!resultRef.current) return;
    try {
      toast.info('Generating image...');
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: theme === 'dark' ? '#020617' : '#ffffff',
        scale: 2,
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `factify-verification-${Date.now()}.png`;
      link.click();
      toast.success('Image downloaded!');
    } catch (error) {
      console.error("Download failed", error);
      toast.error('Failed to generate image');
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'True': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400';
      case 'False': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400';
      case 'Mixed': return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900 dark:text-amber-400';
      default: return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#16a34a';
    if (score >= 50) return '#d97706';
    return '#dc2626';
  };

  const emptyCellColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';

  const EngineBadge = () => {
    let icon = <Bot className="h-3 w-3" />;
    let text = "Mock Engine";
    let style = "text-slate-500 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";

    if (activeEngine === 'gemini') {
        icon = <Zap className="h-3 w-3" />;
        text = "Gemini Active";
        style = "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900";
    } else if (activeEngine === 'openai') {
        icon = <Sparkles className="h-3 w-3" />;
        text = "GPT-4o Active";
        style = "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900";
    }

    return (
        <div className={cn("flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border transition-colors", style)}>
            {icon} {text}
        </div>
    );
  };

  const ModuleStatus = ({ active, label, icon: Icon }: { active: boolean, label: string, icon: any }) => (
    <div className={cn(
        "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border",
        active 
            ? "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300" 
            : "bg-slate-50/50 border-transparent text-slate-400 dark:bg-slate-900/50 dark:text-slate-600"
    )}>
        <Icon className={cn("h-3 w-3", active ? "text-blue-500" : "text-slate-400 dark:text-slate-600")} />
        <span>{label}</span>
        <div className={cn("h-1.5 w-1.5 rounded-full ml-1", active ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700")} />
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Verify a Claim</h1>
            <p className="text-slate-600 mt-2 dark:text-slate-400">Multi-layered analysis: AI + News Context + BERT Linguistics.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
             <ModuleStatus active={activeModules.news} label="News Context" icon={Newspaper} />
             <ModuleStatus active={activeModules.factCheck} label="Fact Checks" icon={SearchCheck} />
             <ModuleStatus active={activeModules.bert} label="Linguistics" icon={BrainCircuit} />
             <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
             <EngineBadge />
          </div>
        </div>

        {/* Input Area */}
        <Card className="mb-8 shadow-md border-slate-200 dark:border-slate-800 transition-all hover:shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleVerify} className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 'NASA admits earth is flat' or paste a news article URL..."
                className="w-full min-h-[120px] p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 transition-all"
              />
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {bertResult ? 'Linguistic analysis complete' : 'Powered by BERT & Gemini'}
                </span>
                <Button type="submit" size="lg" disabled={!input.trim() || isLoading} className="w-32 transition-transform active:scale-95">
                  {isLoading ? 'Analyzing...' : 'Verify'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Area */}
        {result && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex justify-end mb-4">
                 <Button variant="outline" size="sm" onClick={handleDownloadImage} className="gap-2">
                    <Download className="h-4 w-4" /> Save as Image
                 </Button>
              </div>

              {/* Capture Area */}
              <div ref={resultRef} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Main Verdict Card */}
                    <Card className="result-card-item md:col-span-2 shadow-md border-slate-200 overflow-hidden dark:border-slate-800">
                    <div className={cn("h-2 w-full", getVerdictColor(result.verdict).split(' ')[1].replace('bg-', 'bg-'))} />
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-3 text-3xl">
                                    {result.verdict === 'True' && <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />}
                                    {result.verdict === 'False' && <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />}
                                    {result.verdict === 'Mixed' && <HelpCircle className="h-8 w-8 text-amber-600 dark:text-amber-500" />}
                                    {result.verdict === 'Unverified' && <HelpCircle className="h-8 w-8 text-slate-600 dark:text-slate-400" />}
                                    {result.verdict}
                                </CardTitle>
                                <CardDescription className="mt-2 text-base">
                                    Confidence: {result.confidence}%
                                </CardDescription>
                            </div>
                            <div className={cn("px-3 py-1 rounded-full text-sm font-medium border", getVerdictColor(result.verdict))}>
                                {result.verdict.toUpperCase()}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                            <h4 className="font-semibold text-slate-900 mb-2 dark:text-white">AI Analysis Summary</h4>
                            <p className="text-slate-700 leading-relaxed dark:text-slate-300">{result.summary}</p>
                        </div>
                    </CardContent>
                    </Card>

                    {/* Score & BERT Card */}
                    <div className="space-y-6">
                        <Card className="result-card-item shadow-md border-slate-200 dark:border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Credibility Score</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center pt-2">
                                <div className="h-32 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[{ value: result.score }, { value: 100 - result.score }]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={65}
                                                startAngle={180}
                                                endAngle={0}
                                                dataKey="value"
                                                stroke="none"
                                                isAnimationActive={true}
                                            >
                                                <Cell fill={getScoreColor(result.score)} />
                                                <Cell fill={emptyCellColor} />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pt-6">
                                        <span className="text-3xl font-bold text-slate-900 dark:text-white">{result.score}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* BERT Analysis Card */}
                        <Card className="result-card-item shadow-md border-slate-200 dark:border-slate-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <BrainCircuit className="h-4 w-4 text-purple-500" /> BERT Linguistic Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isBertLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Loader2 className="h-3 w-3 animate-spin" /> Analyzing tone...
                                    </div>
                                ) : bertResult ? (
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sentiment</span>
                                            <span className={cn(
                                                "text-xs font-bold px-2 py-0.5 rounded",
                                                bertResult.label === 'POSITIVE' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {bertResult.label}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5 dark:bg-slate-800 mt-2">
                                            <div 
                                                className={cn("h-1.5 rounded-full transition-all duration-1000 ease-out", bertResult.label === 'POSITIVE' ? "bg-green-500" : "bg-red-500")} 
                                                style={{ width: `${bertResult.score * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            {bertResult.intensity} Intensity ({Math.round(bertResult.score * 100)}%)
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400">Model failed to load.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* NewsAPI Results */}
                    {newsArticles.length > 0 && (
                        <Card className="result-card-item md:col-span-3 shadow-md border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Newspaper className="h-5 w-5 text-red-600" />
                                    Latest News Context
                                </CardTitle>
                                <CardDescription>Real-time articles used by AI to verify this claim</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {newsArticles.map((article, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm dark:bg-slate-950 dark:border-slate-800 flex flex-col h-full hover:border-blue-300 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{article.source.name}</span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(article.publishedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="font-medium text-slate-900 text-sm mb-2 line-clamp-2 dark:text-white">
                                                {article.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 mb-4 line-clamp-3 flex-grow dark:text-slate-400">
                                                {article.description}
                                            </p>
                                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline flex items-center gap-1 mt-auto">
                                                Read Article <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Google Fact Checks */}
                    {factChecks.length > 0 && (
                        <Card className="result-card-item md:col-span-3 shadow-md border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <SearchCheck className="h-5 w-5 text-blue-600" />
                                    Official Fact Checks
                                </CardTitle>
                                <CardDescription>Matches found in Google Fact Check Tools</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {factChecks.map((check, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm dark:bg-slate-950 dark:border-slate-800 hover:border-blue-300 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{check.publisher.name}</span>
                                                <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 rounded text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                    {check.textualRating}
                                                </span>
                                            </div>
                                            <h4 className="font-medium text-slate-900 text-sm mb-3 line-clamp-2 dark:text-white">
                                                {check.title}
                                            </h4>
                                            <a href={check.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline flex items-center gap-1">
                                                Read Full Report <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Sources Card */}
                    <Card className="result-card-item md:col-span-3 shadow-md border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Search className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            AI Cited Sources
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {result.sources.length > 0 ? (
                                result.sources.map((source) => (
                                    <div key={source.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all dark:hover:bg-slate-900 dark:hover:border-slate-800">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900 dark:text-slate-200">{source.name}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">Credibility: <span className="text-green-600 font-medium dark:text-green-500">{source.credibility}</span></span>
                                        </div>
                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium dark:text-blue-500 dark:hover:text-blue-400">
                                            Read Source <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-slate-500 dark:text-slate-400 italic">
                                    No specific sources cited by the AI model for this claim.
                                </div>
                            )}
                        </div>
                    </CardContent>
                    </Card>

                </div>
                
                {/* Branding Footer for Screenshot */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-400 text-xs">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Verified by Factify</span>
                    </div>
                    <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
}
