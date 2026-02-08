import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { About } from './pages/About';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Trending } from './pages/Trending';
import { ThemeProvider } from './components/theme-provider';
import { SmoothScroll } from './components/layout/SmoothScroll';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="factify-ui-theme">
      <SmoothScroll>
        <Router>
          <div className="min-h-screen flex flex-col bg-background text-foreground font-sans transition-colors duration-300">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-center" richColors />
          </div>
        </Router>
      </SmoothScroll>
    </ThemeProvider>
  );
}

export default App;
