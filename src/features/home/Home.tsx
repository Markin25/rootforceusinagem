import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronDown } from 'lucide-react';
import Button from '@ui/Button';
import ServicesPortfolio from '@features/services/ServicesPortfolio';
import About from '@features/about/About';
import Contact from '@features/contact/Contact';
// import Careers from '@features/careers/Careers'; // pronto, mas ainda não vai ao ar
import Estrutura from '@features/estrutura/Estrutura';
import heroBg from '@assets/logodefinitiva.png';
import {
  prefersReducedMotion,
  splitTextIntoWords,
  animateScrollIndicator,
  buttonHoverIn,
  buttonHoverOut,
} from '@/animations';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const ctaButtonsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Respect prefers-reduced-motion
    if (prefersReducedMotion()) return;

    const tl = gsap.timeline();

    // Logo reveal - golden circle rotates in with milling cutter and gear scaling with bounce
    if (imageRef.current) {
      tl.fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.7, rotation: -15 },
        { 
          opacity: 1, 
          scale: 1, 
          rotation: 0, 
          duration: 1.2, 
          ease: 'expo.out',
        },
        0.3
      );
    }

    // Title animation - SplitText by words
    if (titleRef.current) {
      const titleWords = splitTextIntoWords(titleRef.current);
      gsap.set(titleWords, { opacity: 0, y: 40 });
      
      tl.to(titleWords, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.07,
        ease: 'power3.out',
      }, '+=0.2');
    }

    // Subtitle animation - same technique with smaller stagger
    if (subtitleRef.current) {
      const subtitleWords = splitTextIntoWords(subtitleRef.current);
      gsap.set(subtitleWords, { opacity: 0, y: 40 });
      
      tl.to(subtitleWords, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.05,
        ease: 'power3.out',
      }, '-=0.3');
    }

    // Decorative golden line - welding effect
    if (lineRef.current) {
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'left center' });
      
      tl.to(lineRef.current, {
        scaleX: 1,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.4');
    }

    // CTA buttons entrance
    if (ctaButtonsRef.current) {
      const buttons = ctaButtonsRef.current.querySelectorAll('button');
      gsap.set(buttons, { opacity: 0, y: 20 });
      
      tl.to(buttons, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      }, '-=0.3');
    }

    // Scroll indicator entrance and continuous pulse animation
    if (scrollIndicatorRef.current) {
      gsap.set(scrollIndicatorRef.current, { opacity: 0, y: -10 });
      
      tl.to(scrollIndicatorRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.2');

      // Scroll indicator pulse - vertical bounce in loop
      tl.add(() => {
        animateScrollIndicator(scrollIndicatorRef.current!);
      });
    }

    // Parallax effect on hero logo
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }, { scope: heroRef });

  // CTA button hover handlers
  const handleButtonMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    buttonHoverIn(e.currentTarget);
  };

  const handleButtonMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    buttonHoverOut(e.currentTarget);
  };

  const scrollToContact = () => {
    document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAbout = () => {
    document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="noise-overlay">
      {/* Hero Section */}
      <section
        ref={heroRef}
        id="top"
        className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-24 lg:pt-28"
      >
        {/* Radial gradient background - subtle gold glow from center like light on metal */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(212, 160, 23, 0.06) 0%, transparent 60%)',
          }}
        />
        
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#D4AF37]/3 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="container relative z-10">
          <div className="flex flex-col items-center justify-center text-center px-4">
            {/* Hero Image - Logo with rotation reveal */}
            <div
              ref={imageRef}
              className="relative flex justify-center"
            >
              {/* Glow behind image */}
              <div className="absolute inset-0 blur-3xl bg-[#D4AF37]/10 scale-125" />
              <img
                src={heroBg}
                alt="Rootforce imagem principal"
                className="relative max-h-[50vh] lg:max-h-[55vh] max-w-[80vw] w-auto h-auto object-contain drop-shadow-2xl"
              />
            </div>

            {/* Tagline - Frase de Impacto */}
            <div ref={taglineRef} className="mt-4 lg:mt-6 relative">
              {/* Glow effect behind tagline */}
              <div className="absolute inset-0 blur-2xl bg-[#D4AF37]/5 scale-150" />
              
              <div className="relative space-y-4">
                {/* Main impact phrase - animated with SplitText by words */}
                <h1 
                  ref={titleRef}
                  className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-gradient-gold"
                >
                  Precisão que transforma sua indústria
                </h1>
                
                {/* Decorative golden line - welding animation effect */}
                <div className="flex flex-col items-center gap-4">
                  <div 
                    ref={lineRef}
                    className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full" 
                  />
                </div>
              </div>
            </div>

            {/* CTA Content - buttons with hover scale effect */}
            <div ref={contentRef} className="mt-10 lg:mt-12 space-y-6">
              <div ref={ctaButtonsRef} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={scrollToContact}
                  onMouseEnter={handleButtonMouseEnter}
                  onMouseLeave={handleButtonMouseLeave}
                >
                  Solicite seu atendimento
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={scrollToAbout}
                  onMouseEnter={handleButtonMouseEnter}
                  onMouseLeave={handleButtonMouseLeave}
                >
                  Conheça a empresa
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
          onClick={scrollToAbout}
        >
          <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-5 h-5 text-[#D4AF37]" />
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Section dividers and content */}
      <div className="section-divider" />

      <div id="sobre">
        <About />
      </div>

      <div className="section-divider" />

      <div id="servicos">
        <ServicesPortfolio />
      </div>

      <div className="section-divider" />

      <div id="estrutura">
        <Estrutura />
      </div>

      <div className="section-divider" />

      {/* <div id="carreiras">
        <Careers />
      </div> */}

      <div id="contato">
        <Contact />
      </div>
    </div>
  );
}
