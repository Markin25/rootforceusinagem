import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu, Target, LayoutGrid } from 'lucide-react';
import Section from '@ui/Section';
import infra1 from '@assets/Infra1.jpeg';
import infra2 from '@assets/Infra2.jpeg';
import infra3 from '@assets/Infra3.jpeg';

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    Icon: LayoutGrid,
    title: 'Infraestrutura moderna',
    desc: 'Ambiente planejado com máquinas e recursos que garantem eficiência produtiva.',
  },
  {
    Icon: Target,
    title: 'Alta precisão operacional',
    desc: 'Equipamentos e processos voltados para resultados consistentes e confiáveis.',
  },
  {
    Icon: Cpu,
    title: 'Organização e controle',
    desc: 'Layout estratégico que otimiza fluxo e reduz falhas operacionais.',
  },
];

const images = [
  { src: infra1, label: 'Alta precisão' },
  { src: infra2, label: 'Ambiente moderno' },
  { src: infra3, label: 'Organização do espaço' },
];

export default function Estrutura() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        const images = contentRef.current.querySelectorAll('.infra-image');
        const cards = contentRef.current.querySelectorAll('.infra-card');

        gsap.fromTo(
          images,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );

        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            delay: 0.3,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <Section title="Estrutura" subtitle="Conheça nosso ambiente de produção">
      <div ref={contentRef} className="max-w-6xl mx-auto">
        {/* Description */}
        <p className="text-center text-gray-300 text-lg mb-12 max-w-2xl mx-auto">
          Nossa estrutura foi planejada para oferecer máxima eficiência, organização e qualidade
          nos processos de usinagem. Cada detalhe do ambiente reflete nosso compromisso com
          precisão e alto desempenho.
        </p>

        {/* MOBILE: horizontal swipe carousel */}
        <div className="sm:hidden -mx-6 mb-14">
          <div
            className="flex gap-4 overflow-x-auto px-6 py-2"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            } as React.CSSProperties}
          >
            {images.map(({ src, label }) => (
              <div
                key={label}
                className="infra-image relative shrink-0 overflow-hidden rounded-2xl border border-gray-800/50"
                style={{ width: '82vw', maxWidth: '340px', scrollSnapAlign: 'start', aspectRatio: '4/3' }}
              >
                <img src={src} alt={label} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
                <span className="absolute bottom-3 left-3 text-xs font-semibold text-[#D4AF37] tracking-widest uppercase">
                  {label}
                </span>
              </div>
            ))}
            <div className="shrink-0 w-4" aria-hidden />
          </div>
          <p className="text-center text-gray-600 text-xs mt-1 select-none">
            ← deslize para ver mais →
          </p>
        </div>

        {/* DESKTOP: 3-column grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {images.map(({ src, label }) => (
            <div
              key={label}
              className="infra-image group relative overflow-hidden rounded-2xl aspect-[4/3] border border-gray-800/50 hover:border-[#D4AF37]/40 transition-colors duration-300"
            >
              <img
                src={src}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-400" />
              {/* Label */}
              <div className="absolute inset-0 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                <span className="text-sm font-semibold text-[#D4AF37] tracking-widest uppercase px-4 py-1.5 rounded-full border border-[#D4AF37]/40 bg-black/60 backdrop-blur-sm">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="infra-card group p-6 rounded-2xl bg-gray-900/30 border border-gray-800/50 hover:border-[#D4AF37]/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#D4AF37]/10 mb-4 group-hover:bg-[#D4AF37]/20 transition-colors duration-300">
                <Icon className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
