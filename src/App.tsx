import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Toaster } from 'sonner';
import { SmoothScroll } from './components/layout/SmoothScroll';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

function App() {
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!bgRef.current) return;

    gsap.to(bgRef.current, {
      x: 80,
      y: -60,
      duration: 20,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  });

  return (
    <Router>
      <SmoothScroll>
        <div className="relative min-h-screen font-sans text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-950 overflow-hidden">

          {/* GLOBAL ANIMATED BACKGROUND */}
          <div
            ref={bgRef}
            className="pointer-events-none absolute inset-0 -z-10 opacity-30"
          >
            <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-500 via-cyan-400 to-indigo-500 blur-3xl" />
          </div>

          <Navbar />

          <main>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>

          <footer className="relative z-10 border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-950">
            <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 dark:text-slate-400">
              © 2025 Factify Inc. Fighting misinformation with AI.
            </div>
          </footer>

          <Toaster position="bottom-right" theme="system" richColors closeButton />
        </div>
      </SmoothScroll>
    </Router>
  );
}

export default App;
