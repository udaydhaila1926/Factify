import { useRef } from 'react';
import { gsap } from '../lib/gsap';
import { useGSAP } from '@gsap/react';

export const useMagnetic = () => {
  const ref = useRef<HTMLButtonElement | HTMLDivElement | null>(null);
  
  useGSAP(() => {
    const element = ref.current;
    if (!element) return;

    // Reduced intensity for subtle, premium feel
    const xTo = gsap.quickTo(element, "x", { duration: 1.5, ease: "sine.out" });
    const yTo = gsap.quickTo(element, "y", { duration: 1.5, ease: "sine.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = element.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      // Drastically reduced movement factor (0.35 -> 0.15)
      xTo(x * 0.15);
      yTo(y * 0.15);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, { scope: ref });

  return ref;
};
