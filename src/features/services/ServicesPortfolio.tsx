import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronLeft, ChevronRight, X, Cog, CircleDot, Ruler, Factory, Lightbulb, Repeat } from 'lucide-react';
import Section from '@ui/Section';
import { prefersReducedMotion, cardHoverIn, cardHoverOut } from '@/animations';

// Import all part images
import peca1 from '@assets/Peça 1.jpeg';
import peca2 from '@assets/Peça 2.jpeg';
import peca3 from '@assets/Peça 3.jpeg';
import peca4 from '@assets/Peça 4.jpeg';
import peca5 from '@assets/Peça 5.jpeg';
import peca6 from '@assets/Peça 6.jpeg';
import peca7 from '@assets/Peça 7.jpeg';

gsap.registerPlugin(ScrollTrigger);

const services = [
  { title: 'Fresamento CNC', Icon: Cog },
  { title: 'Furação de Precisão', Icon: CircleDot },
  { title: 'Ajustes Técnicos', Icon: Ruler },
  { title: 'Componentes Industriais', Icon: Factory },
  { title: 'Protótipos', Icon: Lightbulb },
  { title: 'Séries', Icon: Repeat },
];

const portfolioItems = [
  { id: 1, src: peca1, title: 'Fresamento CNC' },
  { id: 2, src: peca2, title: 'Componente Industrial' },
  { id: 3, src: peca3, title: 'Fresamento CNC' },
  { id: 4, src: peca4, title: 'Estampo' },
  { id: 5, src: peca5, title: 'Fresamento CNC' },
  { id: 6, src: peca6, title: 'Componente Industrial' },
  { id: 7, src: peca7, title: 'Série' },
];

export default function ServicesPortfolio() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  };

  const goToPrev = () =>
    setLightboxIndex((i) => (i === null ? null : (i - 1 + portfolioItems.length) % portfolioItems.length));

  const goToNext = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % portfolioItems.length));

  const duplicatedItems = [...portfolioItems, ...portfolioItems];

  const handleCardHoverIn = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    cardHoverIn(e.currentTarget);
    const img = e.currentTarget.querySelector('img');
    if (img) gsap.to(img, { scale: 1.05, duration: 0.5, ease: 'power2.out' });
  };

  const handleCardHoverOut = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    cardHoverOut(e.currentTarget);
    const img = e.currentTarget.querySelector('img');
    if (img) gsap.to(img, { scale: 1, duration: 0.5, ease: 'power2.out' });
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex]);

  // Restore scroll on unmount
  useEffect(() => () => { document.body.style.overflow = ''; }, []);

  useEffect(() => {
    if (!trackRef.current || prefersReducedMotion()) return;

    const track = trackRef.current;
    const itemWidth = 320 + 20;
    const totalWidth = itemWidth * portfolioItems.length;

    animationRef.current = gsap.to(track, {
      x: -totalWidth,
      duration: 30,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => parseFloat(x) % totalWidth),
      },
    });

    return () => {
      animationRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (animationRef.current) {
      if (isPaused) {
        animationRef.current.pause();
      } else {
        animationRef.current.play();
      }
    }
  }, [isPaused]);

  useGSAP(() => {
    if (prefersReducedMotion()) return;

    if (servicesRef.current) {
      const items = servicesRef.current.querySelectorAll('.service-item');
      gsap.set(items, { opacity: 0, y: 60 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: servicesRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }
  }, { scope: sectionRef });

  return (
    <div ref={sectionRef}>
      <Section
        title="Serviços & Portfólio"
        subtitle="Usinagem CNC de alta precisão — veja o que fazemos e como fazemos"
        dark
      >
        {/* Services grid */}
        <div ref={servicesRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 lg:gap-4 mb-12">
          {services.map(({ title, Icon }) => (
            <div
              key={title}
              className="service-item group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-900/40 border border-gray-800/50 hover:border-[#D4AF37]/30 hover:bg-gray-900/60 transition-colors duration-300"
              onMouseEnter={handleCardHoverIn}
              onMouseLeave={handleCardHoverOut}
            >
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors duration-300">
                <Icon className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <span className="text-xs text-center text-gray-400 group-hover:text-white transition-colors duration-300 leading-tight">
                {title}
              </span>
            </div>
          ))}
        </div>

        {/* Portfolio slider ─────────────────────────────────────── */}

        {/* MOBILE: native horizontal swipe with scroll-snap */}
        <div className="lg:hidden -mx-6">
          <div
            className="flex gap-4 overflow-x-auto px-6 py-4"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            } as React.CSSProperties}
          >
            {portfolioItems.map((item, idx) => (
              <div
                key={item.id}
                className="relative shrink-0 overflow-hidden rounded-2xl border border-gray-800/50 cursor-pointer"
                style={{ width: '82vw', maxWidth: '310px', scrollSnapAlign: 'start' }}
                onClick={() => openLightbox(idx)}
                role="button"
                aria-label={`Ver ${item.title}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
                  <span className="absolute bottom-3 left-3 text-xs font-semibold text-[#D4AF37] tracking-wide uppercase">
                    {item.title}
                  </span>
                </div>
              </div>
            ))}
            {/* trailing space so last card snaps cleanly */}
            <div className="shrink-0 w-4" aria-hidden />
          </div>
          <p className="text-center text-gray-600 text-xs mt-0.5 pb-2 select-none">
            ← deslize para ver mais →
          </p>
        </div>

        {/* DESKTOP: GSAP infinite auto-scroll */}
        <div
          className="hidden lg:block relative -mx-8 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-[5] pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-[5] pointer-events-none" />

          <div ref={sliderRef} className="px-8">
            <div
              ref={trackRef}
              className="flex gap-5 py-4"
              style={{ width: 'max-content' }}
            >
              {duplicatedItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="portfolio-item group relative w-80 shrink-0 overflow-hidden rounded-2xl cursor-pointer"
                  onMouseEnter={handleCardHoverIn}
                  onMouseLeave={handleCardHoverOut}
                  onClick={() => openLightbox(item.id - 1)}
                  role="button"
                  aria-label={`Ver ${item.title}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-[#D4AF37]/50 transition-all duration-300 pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href="#contato"
            className="inline-flex px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#b49328] text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AF37]/25 hover:-translate-y-0.5"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Solicitar orçamento
          </a>
        </div>
      </Section>

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.93)', animation: 'lightboxIn 0.18s ease' }}
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 border border-[#D4AF37]/30 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-200"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev */}
          <button
            className="absolute left-3 sm:left-6 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 border border-[#D4AF37]/30 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-200 disabled:opacity-30"
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Image */}
          <div
            className="flex flex-col items-center gap-4 px-16 sm:px-24"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={lightboxIndex}
              src={portfolioItems[lightboxIndex].src}
              alt={portfolioItems[lightboxIndex].title}
              className="max-w-[90vw] max-h-[78vh] w-auto h-auto object-contain rounded-2xl"
              style={{
                boxShadow: '0 0 80px rgba(212,175,55,0.18), 0 4px 40px rgba(0,0,0,0.8)',
                border: '1px solid rgba(212,175,55,0.18)',
                animation: 'lightboxIn 0.15s ease',
              }}
            />
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-[#D4AF37] tracking-widest uppercase">
                {portfolioItems[lightboxIndex].title}
              </span>
              <span className="text-xs text-gray-600">
                {lightboxIndex + 1} / {portfolioItems.length}
              </span>
            </div>
          </div>

          {/* Next */}
          <button
            className="absolute right-3 sm:right-6 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 border border-[#D4AF37]/30 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-200"
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            aria-label="Próxima"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}