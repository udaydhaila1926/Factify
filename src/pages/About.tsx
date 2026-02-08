import React, { useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { ShieldCheck, Brain, Globe, Users } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';

export const About = () => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('.about-card', {
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.2,
      });
    },
    { scope: container }
  );

  return (
    <PageTransition>
      <div
        ref={container}
        className="container mx-auto max-w-4xl px-4 py-12"
      >
        {/* Header */}
        <div className="about-card mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
            About Factify
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Empowering the world with instant, AI-driven truth verification in an era of digital misinformation.
          </p>
        </div>

        {/* Mission & Technology */}
        <div className="mb-16 grid gap-8 md:grid-cols-2">
          {/* Mission */}
          <Card className="about-card border border-border bg-background/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                  <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Our Mission
                </h3>
              </div>
              <p className="leading-relaxed text-muted-foreground">
                To democratize access to fact-checking tools. We believe everyone deserves to know the truth behind the headlines, social media posts, and viral claims they encounter daily.
              </p>
            </CardContent>
          </Card>

          {/* Technology */}
          <Card className="about-card border border-border bg-background/80 backdrop-blur">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                  <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Our Technology
                </h3>
              </div>
              <p className="leading-relaxed text-muted-foreground">
                Factify combines the reasoning power of Large Language Models (Gemini) with real-time web indexing (Serper) and established fact-check databases (Google) to provide a comprehensive verdict.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Why It Matters */}
        <div className="about-card rounded-2xl border border-border bg-muted/50 p-8 text-center md:p-12">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Why It Matters
          </h2>

          <div className="grid gap-8 text-left md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <Globe className="h-5 w-5" />
                <span>Global Impact</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Misinformation spreads 6× faster than truth on social networks, affecting elections and public health.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <Users className="h-5 w-5" />
                <span>Community Driven</span>
              </div>
              <p className="text-sm text-muted-foreground">
                We are building a community of critical thinkers who value evidence over engagement.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <ShieldCheck className="h-5 w-5" />
                <span>Trust & Safety</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Creating a safer digital environment by flagging misleading content before it goes viral.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
