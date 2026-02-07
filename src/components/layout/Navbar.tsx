import React, { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Menu, X, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { ModeToggle } from '../mode-toggle';
import { useAuth } from '../../hooks/useAuth';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const navRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(navRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
    });
  }, { scope: navRef });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'History', href: '/history' },
  ];

  return (
    <nav ref={navRef} className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 dark:bg-slate-950/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <ShieldCheck className="h-8 w-8 text-blue-600 transition-transform group-hover:rotate-12" />
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Factify</span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-500 relative py-1",
                  location.pathname === link.href ? "text-blue-600 dark:text-blue-500" : "text-slate-600 dark:text-slate-400"
                )}
              >
                {link.name}
                {location.pathname === link.href && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-500 rounded-full" />
                )}
              </Link>
            ))}
            <ModeToggle />
            
            {user ? (
              <div className="flex items-center gap-4">
                 <Link to="/profile" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                        <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="hidden lg:inline-block max-w-[100px] truncate">{user.email}</span>
                 </Link>
                 <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                    <LogOut className="h-4 w-4" />
                 </Button>
              </div>
            ) : (
              <Link to="/login">
                  <Button variant="outline" size="sm">Log in</Button>
              </Link>
            )}
            
            <Link to="/dashboard">
                <Button size="sm">Verify Claim</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-4">
            <ModeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white dark:bg-slate-950 dark:border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-blue-500"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2 px-3">
                {user ? (
                   <>
                     <Link to="/profile" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full gap-2 justify-start">
                           <Settings className="h-4 w-4" /> Profile Settings
                        </Button>
                     </Link>
                     <Button variant="outline" className="w-full gap-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4" /> Sign out
                     </Button>
                   </>
                ) : (
                   <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Log in</Button>
                   </Link>
                )}
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Verify Claim</Button>
                </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
