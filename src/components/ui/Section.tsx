import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion, splitTextIntoWords, revealLine } from '@/animations';

gsap.registerPlugin(ScrollTrigger);

type SectionProps = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  dark?: boolean;
};

export default function Section({ title, subtitle, children, className = '', dark = false }: SectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Respect prefers-reduced-motion
    if (prefersReducedMotion()) return;

    // Title animation with SplitText by words
    if (titleRef.current) {
      const titleWords = splitTextIntoWords(titleRef.current);
      gsap.set(titleWords, { opacity: 0, y: 30 });
      
      gsap.to(titleWords, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Subtitle animation
    if (subtitleRef.current) {
      gsap.set(subtitleRef.current, { opacity: 0, y: 20 });
      
      gsap.to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: subtitleRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Decorative line reveal animation - scaleX: 0 → 1
    if (lineRef.current) {
      revealLine(lineRef.current, {
        direction: 'left',
        duration: 0.8,
        scrollTrigger: {
          trigger: lineRef.current,
        },
      });
    }

    // Content fade in
    if (contentRef.current) {
      gsap.set(contentRef.current, { opacity: 0, y: 30 });
      
      gsap.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className={`relative py-20 lg:py-28 ${
        dark ? 'bg-gray-900/50' : ''
      } ${className}`}
    >
      {/* Decorative orbs — isolated so overflow doesn't clip fixed children */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#D4AF37]/3 rounded-full blur-3xl" />
      </div>
      
      <div className="container relative">
        {(title || subtitle) && (
          <div className="mb-12 lg:mb-16">
            {title && (
              <h2 
                ref={titleRef}
                className="text-center text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gradient-gold"
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p 
                ref={subtitleRef}
                className="text-center text-gray-400 mt-4 text-lg max-w-2xl mx-auto"
              >
                {subtitle}
              </p>
            )}
            {/* Decorative line - animated welding effect */}
            <div className="flex justify-center mt-6">
              <div 
                ref={lineRef}
                className="w-20 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full" 
              />
            </div>
          </div>
        )}
        <div ref={contentRef}>{children}</div>
      </div>
    </section>
  );
}
