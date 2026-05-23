/**
 * Rootforce Usinagem - Animation Helpers
 * 
 * Central animation utilities for GSAP animations with ScrollTrigger.
 * All animations respect prefers-reduced-motion for accessibility.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ========================================
// ACCESSIBILITY: Check reduced motion preference
// ========================================
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ========================================
// CUSTOM SPLIT TEXT IMPLEMENTATION
// Since GSAP SplitText is a premium plugin, we implement a simple alternative
// ========================================
export const splitTextIntoWords = (element: HTMLElement): HTMLSpanElement[] => {
  const text = element.textContent || '';
  const words = text.split(/\s+/).filter(word => word.length > 0);
  
  // Check if parent has gradient text class - need to apply gradient to each span
  const hasGradient = element.classList.contains('text-gradient-gold');
  
  element.innerHTML = '';
  const spans: HTMLSpanElement[] = [];
  
  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.style.display = 'inline-block';
    span.style.whiteSpace = 'pre';
    
    // Apply gradient styles to each span if parent had gradient class
    if (hasGradient) {
      span.style.background = 'linear-gradient(135deg, #D4AF37 0%, #f5d989 50%, #D4AF37 100%)';
      span.style.backgroundClip = 'text';
      span.style.webkitBackgroundClip = 'text';
      span.style.webkitTextFillColor = 'transparent';
      span.style.color = 'transparent';
    }
    
    element.appendChild(span);
    spans.push(span);
    
    // Add space after each word except the last
    if (index < words.length - 1) {
      element.appendChild(document.createTextNode(' '));
    }
  });
  
  return spans;
};

export const splitTextIntoLines = (element: HTMLElement): HTMLSpanElement[] => {
  const html = element.innerHTML;
  const lines = html.split(/<br\s*\/?>/gi);
  
  element.innerHTML = '';
  const spans: HTMLSpanElement[] = [];
  
  lines.forEach((line, index) => {
    const span = document.createElement('span');
    span.innerHTML = line;
    span.style.display = 'block';
    element.appendChild(span);
    spans.push(span);
  });
  
  return spans;
};

// ========================================
// REVEAL ANIMATIONS
// ========================================

/**
 * Reveal text with word-by-word animation
 * Used for titles and important headings
 */
export const revealText = (
  element: HTMLElement,
  options: {
    stagger?: number;
    duration?: number;
    delay?: number;
    ease?: string;
    y?: number;
    scrollTrigger?: ScrollTrigger.Vars;
  } = {}
): gsap.core.Timeline | null => {
  if (prefersReducedMotion()) return null;
  
  const {
    stagger = 0.07,
    duration = 0.8,
    delay = 0,
    ease = 'power3.out',
    y = 40,
    scrollTrigger,
  } = options;

  const words = splitTextIntoWords(element);
  
  // Set initial state
  gsap.set(words, { opacity: 0, y });
  
  const tl = gsap.timeline({
    delay,
    scrollTrigger: scrollTrigger ? {
      trigger: element,
      start: 'top 85%',
      toggleActions: 'play none none none',
      ...scrollTrigger,
    } : undefined,
  });
  
  // Animate each word - y: y → 0 and opacity: 0 → 1
  tl.to(words, {
    opacity: 1,
    y: 0,
    duration,
    stagger,
    ease,
  });
  
  return tl;
};

/**
 * Reveal image with clip-path animation
 * Creates a "wipe" reveal effect
 */
export const revealImage = (
  element: HTMLElement,
  options: {
    direction?: 'top' | 'bottom' | 'left' | 'right';
    duration?: number;
    ease?: string;
    delay?: number;
    scrollTrigger?: ScrollTrigger.Vars;
  } = {}
): gsap.core.Tween | null => {
  if (prefersReducedMotion()) return null;
  
  const {
    direction = 'top',
    duration = 0.9,
    ease = 'expo.out',
    delay = 0,
    scrollTrigger,
  } = options;

  // Define clip-path based on direction
  const clipPaths: Record<string, { from: string; to: string }> = {
    top: { from: 'inset(100% 0 0 0)', to: 'inset(0% 0 0 0)' },
    bottom: { from: 'inset(0 0 100% 0)', to: 'inset(0 0 0% 0)' },
    left: { from: 'inset(0 100% 0 0)', to: 'inset(0 0% 0 0)' },
    right: { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0%)' },
  };

  const { from, to } = clipPaths[direction];

  gsap.set(element, { clipPath: from });

  return gsap.to(element, {
    clipPath: to,
    duration,
    ease,
    delay,
    scrollTrigger: scrollTrigger ? {
      trigger: element,
      start: 'top 75%',
      toggleActions: 'play none none none',
      ...scrollTrigger,
    } : undefined,
  });
};

/**
 * Reveal cards with staggered entrance
 * Used for service cards and similar grid elements
 */
export const revealCards = (
  elements: HTMLElement[] | NodeListOf<Element>,
  options: {
    stagger?: number;
    duration?: number;
    ease?: string;
    y?: number;
    delay?: number;
    scrollTrigger?: ScrollTrigger.Vars;
  } = {}
): gsap.core.Tween | null => {
  if (prefersReducedMotion()) return null;
  
  const {
    stagger = 0.12,
    duration = 0.8,
    ease = 'power3.out',
    y = 60,
    delay = 0,
    scrollTrigger,
  } = options;

  gsap.set(elements, { opacity: 0, y });

  return gsap.to(elements, {
    opacity: 1,
    y: 0,
    duration,
    stagger,
    ease,
    delay,
    scrollTrigger: scrollTrigger ? {
      trigger: elements[0],
      start: 'top 85%',
      toggleActions: 'play none none none',
      ...scrollTrigger,
    } : undefined,
  });
};

/**
 * Animate counter from 0 to target value
 * Used for experience years and statistics
 */
export const animateCounter = (
  element: HTMLElement,
  targetValue: number,
  options: {
    duration?: number;
    ease?: string;
    suffix?: string;
    prefix?: string;
    scrollTrigger?: ScrollTrigger.Vars;
  } = {}
): gsap.core.Tween | null => {
  if (prefersReducedMotion()) {
    element.textContent = `${options.prefix || ''}${targetValue}${options.suffix || ''}`;
    return null;
  }
  
  const {
    duration = 2,
    ease = 'power2.out',
    suffix = '',
    prefix = '',
    scrollTrigger,
  } = options;

  const counter = { val: 0 };

  return gsap.to(counter, {
    val: targetValue,
    duration,
    ease,
    onUpdate: () => {
      element.textContent = `${prefix}${Math.round(counter.val)}${suffix}`;
    },
    scrollTrigger: scrollTrigger ? {
      trigger: element,
      start: 'top 80%',
      toggleActions: 'play none none none',
      ...scrollTrigger,
    } : undefined,
  });
};

/**
 * Animate decorative line reveal
 * Creates a "welding" effect for gold lines
 */
export const revealLine = (
  element: HTMLElement,
  options: {
    duration?: number;
    ease?: string;
    delay?: number;
    direction?: 'left' | 'center' | 'right';
    scrollTrigger?: ScrollTrigger.Vars;
  } = {}
): gsap.core.Tween | null => {
  if (prefersReducedMotion()) return null;
  
  const {
    duration = 0.8,
    ease = 'power3.out',
    delay = 0,
    direction = 'left',
    scrollTrigger,
  } = options;

  const origins: Record<string, string> = {
    left: 'left center',
    center: 'center center',
    right: 'right center',
  };

  gsap.set(element, { scaleX: 0, transformOrigin: origins[direction] });

  return gsap.to(element, {
    scaleX: 1,
    duration,
    ease,
    delay,
    scrollTrigger: scrollTrigger ? {
      trigger: element,
      start: 'top 85%',
      toggleActions: 'play none none none',
      ...scrollTrigger,
    } : undefined,
  });
};

/**
 * Logo reveal animation with rotation and scale
 * Specific to the Rootforce logo with golden circle, milling cutter and gear
 */
export const revealLogo = (
  logoElement: HTMLElement,
  options: {
    delay?: number;
  } = {}
): gsap.core.Timeline | null => {
  if (prefersReducedMotion()) return null;
  
  const { delay = 0 } = options;
  
  const tl = gsap.timeline({ delay });
  
  // Golden circle reveal - rotation effect
  tl.fromTo(
    logoElement,
    { 
      opacity: 0, 
      scale: 0.7,
      rotation: -15,
    },
    { 
      opacity: 1, 
      scale: 1,
      rotation: 0,
      duration: 1.2, 
      ease: 'expo.out',
    }
  );
  
  return tl;
};

/**
 * CTA buttons entrance animation
 */
export const revealButtons = (
  elements: HTMLElement[] | NodeListOf<Element>,
  options: {
    delay?: number;
    stagger?: number;
  } = {}
): gsap.core.Tween | null => {
  if (prefersReducedMotion()) return null;
  
  const { delay = 0, stagger = 0.1 } = options;
  
  gsap.set(elements, { opacity: 0, y: 20 });
  
  return gsap.to(elements, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger,
    delay,
    ease: 'power3.out',
  });
};

/**
 * Scroll indicator pulse animation
 */
export const animateScrollIndicator = (
  element: HTMLElement
): gsap.core.Tween | null => {
  if (prefersReducedMotion()) return null;
  
  return gsap.to(element, {
    y: 8,
    duration: 1.4,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
};

/**
 * Card hover animation
 */
export const cardHoverIn = (element: HTMLElement): gsap.core.Tween | null => {
  if (prefersReducedMotion()) return null;
  
  return gsap.to(element, {
    y: -6,
    duration: 0.3,
    ease: 'power2.out',
  });
};

export const cardHoverOut = (element: HTMLElement): gsap.core.Tween | null => {
  if (prefersReducedMotion()) return null;
  
  return gsap.to(element, {
    y: 0,
    duration: 0.3,
    ease: 'power2.out',
  });
};

/**
 * Button hover animation
 */
export const buttonHoverIn = (element: HTMLElement): gsap.core.Tween | null => {
  if (prefersReducedMotion()) return null;
  
  return gsap.to(element, {
    scale: 1.03,
    duration: 0.25,
    ease: 'power2.out',
  });
};

export const buttonHoverOut = (element: HTMLElement): gsap.core.Tween | null => {
  if (prefersReducedMotion()) return null;
  
  return gsap.to(element, {
    scale: 1,
    duration: 0.25,
    ease: 'power2.out',
  });
};

/**
 * Navbar shrink animation on scroll
 */
export const setupNavbarScroll = (
  navbar: HTMLElement,
  options: {
    shrinkPadding?: string;
    expandPadding?: string;
  } = {}
): ScrollTrigger | null => {
  if (prefersReducedMotion()) return null;
  
  const { shrinkPadding = '8px', expandPadding = '16px' } = options;
  
  return ScrollTrigger.create({
    trigger: document.body,
    start: 'top -50',
    onEnter: () => {
      gsap.to(navbar, {
        paddingTop: shrinkPadding,
        paddingBottom: shrinkPadding,
        duration: 0.3,
        ease: 'power2.out',
      });
      navbar.classList.add('navbar-scrolled');
    },
    onLeaveBack: () => {
      gsap.to(navbar, {
        paddingTop: expandPadding,
        paddingBottom: expandPadding,
        duration: 0.3,
        ease: 'power2.out',
      });
      navbar.classList.remove('navbar-scrolled');
    },
  });
};

/**
 * SVG arc animation for counter decoration
 */
export const animateArc = (
  svgPath: SVGPathElement,
  options: {
    duration?: number;
    ease?: string;
    delay?: number;
    scrollTrigger?: ScrollTrigger.Vars;
  } = {}
): gsap.core.Tween | null => {
  if (prefersReducedMotion()) return null;
  
  const {
    duration = 2,
    ease = 'power2.out',
    delay = 0,
    scrollTrigger,
  } = options;

  const length = svgPath.getTotalLength();
  
  gsap.set(svgPath, {
    strokeDasharray: length,
    strokeDashoffset: length,
  });

  return gsap.to(svgPath, {
    strokeDashoffset: 0,
    duration,
    ease,
    delay,
    scrollTrigger: scrollTrigger ? {
      trigger: svgPath,
      start: 'top 80%',
      toggleActions: 'play none none none',
      ...scrollTrigger,
    } : undefined,
  });
};

/**
 * Reveal paragraphs with stagger
 */
export const revealParagraphs = (
  elements: HTMLElement[] | NodeListOf<Element>,
  options: {
    stagger?: number;
    duration?: number;
    y?: number;
    delay?: number;
    scrollTrigger?: ScrollTrigger.Vars;
  } = {}
): gsap.core.Tween | null => {
  if (prefersReducedMotion()) return null;
  
  const {
    stagger = 0.15,
    duration = 0.8,
    y = 30,
    delay = 0,
    scrollTrigger,
  } = options;

  gsap.set(elements, { opacity: 0, y });

  return gsap.to(elements, {
    opacity: 1,
    y: 0,
    duration,
    stagger,
    ease: 'power3.out',
    delay,
    scrollTrigger: scrollTrigger ? {
      trigger: elements[0],
      start: 'top 85%',
      toggleActions: 'play none none none',
      ...scrollTrigger,
    } : undefined,
  });
};
