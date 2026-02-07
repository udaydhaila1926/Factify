import React, { useRef } from 'react';
import { cn } from '../../lib/utils';
import { gsap } from '../../lib/gsap';
import { useGSAP } from '@gsap/react';

interface TextRevealProps {
  text: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  delay?: number;
  trigger?: boolean; // If true, animates on scroll
}

export const TextReveal = ({ text, className, tag: Tag = 'div', delay = 0, trigger = true }: TextRevealProps) => {
  const container = useRef<HTMLElement>(null);
  
  // Split text into words for animation
  const words = text.split(' ');

  useGSAP(() => {
    if (!container.current) return;

    const wordElements = container.current.querySelectorAll('.word');

    const anim = gsap.fromTo(wordElements, 
      { 
        y: 50, 
        opacity: 0,
        rotateX: -45
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        stagger: 0.05,
        duration: 1.2,
        ease: 'power4.out',
        delay: delay,
        scrollTrigger: trigger ? {
          trigger: container.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        } : undefined
      }
    );

    return () => {
      anim.kill();
    };
  }, { scope: container });

  return (
    <Tag ref={container} className={cn("overflow-hidden leading-tight", className)} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] align-top">
          <span className="word inline-block transform-style-3d origin-bottom">
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
};
