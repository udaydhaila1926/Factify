import React, { useEffect, useState, useRef } from 'react';
import { fetchTrendingNews } from '../services/newsService';
import { verifyClaim } from '../services/verification';
import { NewsArticle, ClaimResult } from '../types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PageTransition } from '../components/layout/PageTransition';
import {
  Loader2,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';

export const Trending = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, ClaimResult>>({});
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const news = await fetchTrendingNews();
      setArticles(news);
    } catch {
      toast.error('Failed to load trending news.');
    } finally {
      setLoading(false);
    }
  };

  useGSAP(
    () => {
      if (!loading && articles.length > 0) {
        gsap.fromTo(
          '.news-card',
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power2.out',
          }
        );
      }
    },
    { scope: container, dependencies: [loading, articles] }
  );

  const handleVerify = async (article: NewsArticle) => {
    const id = article.url;
    setVerifying((p) => ({ ...p, [id]: true }));

    try {
      const claim = `${article.title}. ${article.description ?? ''}`;
      const result = await verifyClaim(claim);
      setResults((p) => ({ ...p, [id]: result }));
      toast.success('Fact check complete');
    } catch {
      toast.error('Verification failed');
    } finally {
      setVerifying((p) => ({ ...p, [id]: false }));
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'True':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" /> True
          </Badge>
        );
      case 'False':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> False
          </Badge>
        );
      case 'Mixed':
        return (
          <Badge variant="warning" className="gap-1">
            <HelpCircle className="h-3 w-3" /> Mixed
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unverified</Badge>;
    }
  };

  return (
    <PageTransition>
      <div
        ref={container}
        className="container mx-auto max-w-7xl px-4 py-8"
      >
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Trending News
            </h1>
            <p className="text-muted-foreground">
              Latest headlines, instantly fact-checked by AI.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, idx) => {
              const result = results[article.url];
              const isVerifying = verifying[article.url];

              return (
                <Card
                  key={idx}
                  className="news-card flex flex-col overflow-hidden border border-border bg-background/90 backdrop-blur transition-shadow hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-muted">
                    {article.urlToImage ? (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/600x400?text=News';
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <TrendingUp className="h-12 w-12 opacity-20" />
                      </div>
                    )}

                    {/* Source badge */}
                    <div className="absolute right-3 top-3">
                      <Badge className="bg-background/80 text-foreground backdrop-blur">
                        {article.source.name}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2 text-lg transition-colors hover:text-primary">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {article.title}
                      </a>
                    </CardTitle>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-grow flex-col gap-4">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {article.description}
                    </p>

                    {/* Result */}
                    {result ? (
                      <div className="mt-auto space-y-2 border-t border-border pt-4">
                        <div className="flex items-center justify-between">
                          {getVerdictBadge(result.verdict)}
                          <span
                            className={`text-sm font-bold ${
                              result.credibility_score > 80
                                ? 'text-green-500'
                                : result.credibility_score > 50
                                ? 'text-yellow-500'
                                : 'text-red-500'
                            }`}
                          >
                            {result.credibility_score}% Credible
                          </span>
                        </div>
                        <p className="rounded-md border border-border bg-muted/50 p-2 text-xs text-muted-foreground">
                          {result.explanation}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-auto pt-4">
                        <Button
                          onClick={() => handleVerify(article)}
                          disabled={isVerifying}
                          variant="outline"
                          className="w-full gap-2"
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Verifying…
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4" />
                              Verify with AI
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
};