import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertTriangle, Search, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Magnetic } from '../components/ui/Magnetic';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Landing() {
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // 1. Hero Animation Sequence
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Initial state set via CSS or set here to ensure no flash
        gsap.set(".hero-element", { y: 50, opacity: 0 });
        gsap.set(".hero-bg", { scale: 0.8, opacity: 0 });

        tl.to(".hero-bg", { scale: 1, opacity: 0.3, duration: 1.5 })
            .to(".hero-element", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 }, "-=1");

        // 2. Stats Counter Animation
        const stats = gsap.utils.toArray('.stat-number');
        stats.forEach((stat: any) => {
            const targetValue = parseInt(stat.getAttribute('data-value'));
            const suffix = stat.getAttribute('data-suffix') || '';

            ScrollTrigger.create({
                trigger: stat,
                start: "top 85%",
                once: true,
                onEnter: () => {
                    gsap.to(stat, {
                        innerHTML: targetValue,
                        duration: 2,
                        snap: { innerHTML: 1 },
                        ease: "power1.inOut",
                        onUpdate: function () {
                            stat.innerHTML = Math.ceil(this.targets()[0].innerHTML) + suffix;
                        }
                    });
                }
            });
        });

        // 3. Features Staggered Reveal
        gsap.from(".feature-card", {
            scrollTrigger: {
                trigger: featuresRef.current,
                start: "top 80%",
            },
            y: 60,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)"
        });
        gsap.to('.hero-badge', {
            y: -6,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
        });

        // 4. Parallax Background
        gsap.to(".parallax-bg", {
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: 1
            },
            y: 200,
            ease: "none"


        });

    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Hero Section */}
            <section ref={heroRef} className="relative pt-20 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">

                        <div className="hero-element inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-6 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 dark:bg-blue-500 animate-pulse"></span>
                            AI-Powered Misinformation Detection
                        </div>

                        <h1 className="hero-element text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 dark:text-white leading-tight">
                            Verify facts in <span className="text-blue-600 dark:text-blue-500 inline-block">seconds</span>, not hours.
                        </h1>

                        <p className="hero-element text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed dark:text-slate-400">
                            Factify uses advanced AI to analyze text and URLs, cross-referencing thousands of trusted sources to give you a credibility score you can trust.
                        </p>

                        <div className="hero-element flex flex-col sm:flex-row gap-4 justify-center">
                            <Magnetic>
                                <Link to="/dashboard">
                                    <Button size="lg" className="w-full sm:w-auto gap-2 text-base h-12 rounded-full px-8 shadow-blue-500/20 shadow-lg hover:shadow-blue-500/30 transition-all">
                                        Verify a Claim Now <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </Magnetic>
                            <Magnetic strength={0.2}>
                                <Link to="/login">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 rounded-full px-8">
                                        Create Free Account
                                    </Button>
                                </Link>
                            </Magnetic>
                        </div>

                    </div>
                </div>

                {/* Background decoration with Parallax */}
                <div className="absolute top-0 inset-x-0 h-full -z-10 overflow-hidden pointer-events-none">
                    <div className="parallax-bg absolute left-[calc(50%-11rem)] top-[calc(50%-30rem)] transform-gpu blur-3xl sm:left-[calc(50%-30rem)] hero-bg opacity-30 dark:opacity-20" aria-hidden="true">
                        <div className="aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#3b82f6] to-[#93c5fd] sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section ref={statsRef} className="py-16 bg-white border-y border-slate-200 dark:bg-slate-900 dark:border-slate-800 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <div className="text-4xl font-bold text-slate-900 mb-2 dark:text-white flex justify-center items-center">
                                <span className="stat-number" data-value="10" data-suffix="x">0x</span>
                            </div>
                            <div className="text-slate-600 dark:text-slate-400">Faster spread of fake news compared to factual news.</div>
                        </div>
                        <div className="p-6 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800">
                            <div className="text-4xl font-bold text-blue-600 mb-2 dark:text-blue-500 flex justify-center items-center">
                                <span className="stat-number" data-value="94" data-suffix="%">0%</span>
                            </div>
                            <div className="text-slate-600 dark:text-slate-400">Accuracy in detecting AI-generated misinformation.</div>
                        </div>
                        <div className="p-6 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800">
                            <div className="text-4xl font-bold text-slate-900 mb-2 dark:text-white flex justify-center items-center">
                                <span className="stat-number" data-value="24" data-suffix="/7">0/7</span>
                            </div>
                            <div className="text-slate-600 dark:text-slate-400">Real-time monitoring and verification API availability.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section ref={featuresRef} className="py-24 bg-slate-50 dark:bg-slate-950 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why choose Factify?</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Comprehensive tools for journalists, researchers, and curious minds, built with state-of-the-art technology.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Search, title: "Deep Web Search", desc: "We scan millions of indexed pages and academic papers to find the origin of a claim." },
                            { icon: Shield, title: "Source Credibility", desc: "Every source is ranked based on historical accuracy and bias patterns." },
                            { icon: AlertTriangle, title: "Bias Detection", desc: "Our AI identifies emotional manipulation and logical fallacies in text." }
                        ].map((feature, i) => (
                            <div key={i} className="feature-card bg-white p-8 rounded-2xl shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group">
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3 dark:text-white">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
