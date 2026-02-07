import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Toaster } from 'sonner';
import { SmoothScroll } from './components/layout/SmoothScroll';

function App() {
  return (
    <Router>
      <SmoothScroll>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-50">
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
          <footer className="bg-white border-t border-slate-200 py-8 mt-auto dark:bg-slate-950 dark:border-slate-800 relative z-10">
              <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm dark:text-slate-400">
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
