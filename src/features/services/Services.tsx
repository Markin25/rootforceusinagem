import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cog, CircleDot, Ruler, Factory, Lightbulb, Repeat } from 'lucide-react';
import Section from '@ui/Section';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    title: 'Fresamento CNC',
    details: 'Usinagem com controle rigoroso de tolerâncias e acabamento para peças de alta precisão.',
    Icon: Cog,
    highlight: true,
  },
  {
    title: 'Furação de Precisão',
    details: 'Perfis, diâmetros e posicionamentos conforme desenho técnico com exatidão milimétrica.',
    Icon: CircleDot,
  },
  {
    title: 'Ajustes Técnicos',
    details: 'Ajustes dimensionais e acabamento final conforme especificações do projeto.',
    Icon: Ruler,
  },
  {
    title: 'Componentes Industriais',
    details: 'Fabricação de peças técnicas sob medida para diversos setores industriais.',
    Icon: Factory,
  },
  {
    title: 'Protótipos',
    details: 'Desenvolvimento, validação e iteração rápida de produtos antes da produção em série.',
    Icon: Lightbulb,
  },
  {
    title: 'Séries',
    details: 'Produção recorrente com repetibilidade, consistência e controle de qualidade.',
    Icon: Repeat,
  },
];

export default function Services() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.service-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 60, rotateX: -10 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
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
    <Section title="Nossos Serviços" subtitle="Usinagem CNC e peças sob medida para sua indústria" dark>
      <div ref={gridRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map(({ title, details, Icon, highlight }) => (
          <div
            key={title}
            className={`service-card group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
              highlight ? 'md:col-span-2 lg:col-span-1' : ''
            }`}
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Card */}
            <div className="relative h-full p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl group-hover:border-[#D4AF37]/30 transition-all duration-500">
              {/* Icon container */}
              <div className="relative mb-6">
                <div className="absolute -inset-2 bg-[#D4AF37]/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20 group-hover:border-[#D4AF37]/40 transition-all duration-300">
                  <Icon className="w-7 h-7 text-[#D4AF37] transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#D4AF37] transition-colors duration-300">
                {title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {details}
              </p>

              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rotate-45 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 rounded-2xl glass-card">
          <div className="text-left">
            <p className="text-xl font-semibold text-white">Precisa de um orçamento?</p>
            <p className="text-gray-400 mt-1">Entre em contato e solicite sua cotação personalizada.</p>
          </div>
          <a
            href="#contato"
            className="shrink-0 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#b49328] text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AF37]/25 hover:-translate-y-0.5"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Solicitar orçamento
          </a>
        </div>
      </div>
    </Section>
  );
}
