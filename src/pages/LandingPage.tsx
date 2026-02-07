import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ShieldAlert, Search, Database, ArrowRight, CheckCircle2, Quote } from 'lucide-react';
import { gsap } from '../lib/gsap';
import { useGSAP } from '@gsap/react';
import { TextReveal } from '../components/ui/text-reveal';
import { useMagnetic } from '../hooks/use-magnetic';

// Magnetic Button Wrapper
const MagneticButton = ({ children }: { children: React.ReactNode }) => {
  const ref = useMagnetic();
  return <div ref={ref} className="inline-block">{children}</div>;
};

export const LandingPage = () => {
  const container = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Animation Timeline
    const tl = gsap.timeline();

    tl.fromTo('.hero-badge', 
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'sine.out' }
    )
    .fromTo('.hero-title-word',
      { y: 20, opacity: 0, rotateX: -20 },
      { y: 0, opacity: 1, rotateX: 0, stagger: 0.1, duration: 1.2, ease: 'power2.out' },
      "-=0.8"
    )
    .fromTo('.hero-desc',
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'sine.out' },
      "-=0.8"
    )
    .fromTo('.hero-cta',
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: 'sine.out' },
      "-=0.8"
    );

    // Parallax Effect for Background Elements
    gsap.to('.parallax-bg', {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Stats Section Reveal
    gsap.from('.stat-card', {
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 1.2,
      scrollTrigger: {
        trigger: '.stats-section',
        start: 'top 85%',
      }
    });

    // Feature Cards Stagger
    gsap.from('.feature-card', {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 1.2,
      scrollTrigger: {
        trigger: '.features-grid',
        start: 'top 80%',
      }
    });

  }, { scope: container });

  return (
    <div ref={container} className="flex flex-col min-h-screen overflow-hidden bg-background">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-32 lg:py-48 overflow-hidden">
        {/* Abstract Background - Subtle & Premium */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="parallax-bg absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="parallax-bg absolute top-[30%] -right-[5%] w-[30%] h-[50%] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
            <ShieldAlert className="h-4 w-4" />
            <span>AI-Powered Misinformation Detection</span>
          </div>
          
          <div className="max-w-4xl mx-auto mb-10">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-foreground">
              <span className="hero-title-word inline-block mr-3">Verify</span>
              <span className="hero-title-word inline-block mr-3">facts</span>
              <span className="hero-title-word inline-block mr-3">in</span>
              <span className="hero-title-word inline-block mr-3 text-blue-600 dark:text-blue-500 italic font-serif">seconds,</span>
              <span className="hero-title-word inline-block">not</span>
              <span className="hero-title-word inline-block ml-3">hours.</span>
            </h1>
            <p className="hero-desc text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Factify uses advanced AI to analyze text and URLs, cross-referencing thousands of trusted sources to give you a credibility score you can trust.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <MagneticButton>
              <Link to="/dashboard" className="hero-cta block">
                <Button size="lg" className="h-12 px-8 text-base rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                  Verify a Claim Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </MagneticButton>
            
            <MagneticButton>
              <Link to="/register" className="hero-cta block">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full border-border bg-transparent text-foreground hover:bg-secondary transition-all">
                  Create Free Account
                </Button>
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { val: "10x", label: "Faster spread of fake news" },
              { val: "94%", label: "Accuracy in detection" },
              { val: "24/7", label: "Real-time verification" }
            ].map((stat, idx) => (
              <div key={idx} className="stat-card p-8 rounded-2xl bg-background border border-border hover:border-blue-200 dark:hover:border-blue-800 transition-colors duration-500">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-500 mb-2">{stat.val}</div>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="quote-section py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          <Quote className="quote-icon h-12 w-12 text-blue-200 dark:text-blue-800 mx-auto mb-8" />
          <blockquote className="text-3xl md:text-4xl font-serif italic text-foreground mb-8 leading-tight">
            "Truth is the daughter of time, not of authority."
          </blockquote>
          <cite className="text-muted-foreground font-medium not-italic tracking-widest uppercase text-xs">— Francis Bacon</cite>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <TextReveal 
              tag="h2" 
              text="How Factify Works" 
              className="text-3xl font-bold text-foreground mb-4" 
            />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our multi-layered approach combines Large Language Models with real-time web search.
            </p>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Real-time Web Search",
                desc: "We scan trusted news outlets and fact-checking databases instantly."
              },
              {
                icon: Database,
                title: "Source Analysis",
                desc: "Every claim is backed by verified links and source credibility ratings."
              },
              {
                icon: CheckCircle2,
                title: "AI Verdict",
                desc: "Our LLM Judge synthesizes data to provide a clear True/False/Mixed verdict."
              }
            ].map((feature, idx) => (
              <div key={idx} className="feature-card group bg-background p-8 rounded-2xl border border-border hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-700">
                <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-105 transition-transform duration-500">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-blue-600 dark:bg-blue-700 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold mb-8">Ready to verify your first claim?</h2>
          <MagneticButton>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="h-12 px-10 text-base rounded-full shadow-lg hover:shadow-xl transition-all bg-white text-blue-600 hover:bg-slate-50 border-none">
                Get Started Now
              </Button>
            </Link>
          </MagneticButton>
        </div>
      </section>
    </div>
  );
};
