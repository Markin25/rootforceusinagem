import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type RevealOptions = {
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  duration?: number;
  stagger?: number;
  ease?: string;
  triggerStart?: string;
};

export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    direction = 'up',
    delay = 0,
    duration = 0.8,
    stagger = 0.1,
    ease = 'power3.out',
    triggerStart = 'top 85%',
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fromVars: gsap.TweenVars = { opacity: 0 };
    if (direction === 'up') fromVars.y = 60;
    if (direction === 'down') fromVars.y = -60;
    if (direction === 'left') fromVars.x = 60;
    if (direction === 'right') fromVars.x = -60;

    const ctx = gsap.context(() => {
      gsap.from(el.children.length > 0 ? el.children : el, {
        ...fromVars,
        duration,
        delay,
        stagger,
        ease,
        scrollTrigger: {
          trigger: el,
          start: triggerStart,
          toggleActions: 'play none none none',
        },
      });
    }, el);

    return () => ctx.revert();
  }, [direction, delay, duration, stagger, ease, triggerStart]);

  return ref;
}

export function useGsapParallax<T extends HTMLElement = HTMLDivElement>(speed = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [speed]);

  return ref;
}

export function useGsapFadeIn<T extends HTMLElement = HTMLDivElement>(
  delay = 0,
  duration = 1
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration, delay, ease: 'power2.out' }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, duration]);

  return ref;
}

export function useGsapStaggerChildren<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    direction = 'up',
    delay = 0,
    duration = 0.6,
    stagger = 0.15,
    ease = 'power3.out',
    triggerStart = 'top 80%',
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const children = el.querySelectorAll('[data-animate]');
    if (children.length === 0) return;

    const fromVars: gsap.TweenVars = { opacity: 0 };
    if (direction === 'up') fromVars.y = 50;
    if (direction === 'down') fromVars.y = -50;
    if (direction === 'left') fromVars.x = 50;
    if (direction === 'right') fromVars.x = -50;

    const ctx = gsap.context(() => {
      gsap.from(children, {
        ...fromVars,
        duration,
        delay,
        stagger,
        ease,
        scrollTrigger: {
          trigger: el,
          start: triggerStart,
          toggleActions: 'play none none none',
        },
      });
    }, el);

    return () => ctx.revert();
  }, [direction, delay, duration, stagger, ease, triggerStart]);

  return ref;
}
