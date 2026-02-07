import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../lib/gsap';
import { cn } from '../../lib/utils';

interface MagneticLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export const MagneticLink = ({ to, children, className }: MagneticLinkProps) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const location = useLocation();
  const isActive = location.pathname === to;

  useGSAP(() => {
    const link = linkRef.current;
    const line = lineRef.current;
    if (!link || !line) return;

    const tl = gsap.timeline({ paused: true });
    
    tl.to(line, {
      scaleX: 1,
      transformOrigin: "left center",
      duration: 0.4,
      ease: "power3.out"
    });

    link.addEventListener("mouseenter", () => tl.play());
    link.addEventListener("mouseleave", () => tl.reverse());

    return () => {
      link.removeEventListener("mouseenter", () => tl.play());
      link.removeEventListener("mouseleave", () => tl.reverse());
    };
  }, { scope: linkRef });

  return (
    <Link 
      ref={linkRef} 
      to={to} 
      className={cn("relative inline-block py-1 font-medium text-sm transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground hover:text-foreground", className)}
    >
      {children}
      <span 
        ref={lineRef}
        className={cn(
          "absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 dark:bg-blue-400 scale-x-0",
          isActive && "scale-x-100"
        )} 
      />
    </Link>
  );
};
