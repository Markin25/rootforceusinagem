import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Section from '@ui/Section';

// Import all part images
import peca1 from '@assets/Peça 1.jpeg';
import peca2 from '@assets/Peça 2.jpeg';
import peca3 from '@assets/Peça 3.jpeg';
import peca4 from '@assets/Peça 4.jpeg';
import peca5 from '@assets/Peça 5.jpeg';
import peca6 from '@assets/Peça 6.jpeg';
import peca7 from '@assets/Peça 7.jpeg';

gsap.registerPlugin(ScrollTrigger);

// ========================================
// CONFIGURAÇÃO DAS PEÇAS - FÁCIL DE EDITAR
// Para adicionar novas peças:
// 1. Importe a imagem acima
// 2. Adicione um objeto no array abaixo
// ========================================
const portfolioItems = [
  { id: 1, src: peca1 },
  { id: 2, src: peca2 },
  { id: 3, src: peca3 },
  { id: 4, src: peca4 },
  { id: 5, src: peca5 },
  { id: 6, src: peca6 },
  { id: 7, src: peca7 },
];

export default function Portfolio() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
      return () => slider.removeEventListener('scroll', updateScrollButtons);
    }
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (trackRef.current) {
        const items = trackRef.current.querySelectorAll('.portfolio-item');
        gsap.fromTo(
          items,
          { opacity: 0, x: 40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: trackRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = 320;
    const newPosition = sliderRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
    gsap.to(sliderRef.current, {
      scrollLeft: newPosition,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  return (
    <Section
      title="Nossos Trabalhos"
      subtitle="Conheça algumas das peças de alta precisão fabricadas pela Rootforce"
    >
      {/* Slider container */}
      <div className="relative -mx-6 lg:-mx-8">
        {/* Navigation buttons */}
        <button
          onClick={() => scrollSlider('left')}
          className={`absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/80 border border-gray-700 flex items-center justify-center text-white transition-all duration-300 ${
            canScrollLeft
              ? 'opacity-100 hover:bg-gray-900 hover:border-[#D4AF37]/50'
              : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => scrollSlider('right')}
          className={`absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/80 border border-gray-700 flex items-center justify-center text-white transition-all duration-300 ${
            canScrollRight
              ? 'opacity-100 hover:bg-gray-900 hover:border-[#D4AF37]/50'
              : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Próximo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-[5] pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-[5] pointer-events-none" />

        {/* Slider track */}
        <div
          ref={sliderRef}
          className="overflow-x-auto scrollbar-hide scroll-smooth px-6 lg:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div
            ref={trackRef}
            className="flex gap-5 py-4"
            style={{ width: 'max-content' }}
          >
            {portfolioItems.map((item) => (
              <div
                key={item.id}
                className="portfolio-item group relative w-72 lg:w-80 shrink-0 overflow-hidden rounded-2xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
                  <img
                    src={item.src}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gold border on hover */}
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-[#D4AF37]/50 transition-all duration-300 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint for mobile */}
      <p className="text-center text-gray-600 text-sm mt-4 lg:hidden">
        Deslize para ver mais →
      </p>
    </Section>
  );
}