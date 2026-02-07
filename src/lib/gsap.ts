import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register GSAP plugins globally
gsap.registerPlugin(ScrollTrigger, useGSAP);

// Configure default settings for calmer, premium feel
gsap.defaults({
  duration: 1.2, // Slower, more deliberate
  ease: 'sine.out', // Softest easing, no bounce
});

export { gsap, ScrollTrigger };
