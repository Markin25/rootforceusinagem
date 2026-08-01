import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, Heart, TrendingUp, Send } from 'lucide-react';
import Section from '@ui/Section';
import Button from '@ui/Button';

gsap.registerPlugin(ScrollTrigger);

const benefits = [
  {
    Icon: Users,
    title: 'Ambiente colaborativo',
    desc: 'Trabalhe com profissionais experientes e aprenda diariamente.',
  },
  {
    Icon: Heart,
    title: 'Segurança em primeiro lugar',
    desc: 'Priorizamos o bem-estar e a segurança de toda a equipe.',
  },
  {
    Icon: TrendingUp,
    title: 'Crescimento profissional',
    desc: 'Oportunidades de desenvolvimento e capacitação técnica.',
  },
];

export default function Careers() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        const cards = contentRef.current.querySelectorAll('.benefit-card');
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
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
    <Section title="Carreiras" subtitle="Faça parte da nossa equipe">
      <div ref={contentRef} className="max-w-4xl mx-auto">
        {/* Intro text */}
        <p className="text-center text-gray-300 text-lg mb-12 max-w-2xl mx-auto">
          Buscamos profissionais comprometidos com qualidade e segurança. Se você tem paixão por usinagem 
          e deseja fazer parte de uma equipe de excelência, queremos conhecer você.
        </p>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {benefits.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="benefit-card group p-6 rounded-2xl bg-gray-900/30 border border-gray-800/50 hover:border-[#D4AF37]/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#D4AF37]/10 mb-4 group-hover:bg-[#D4AF37]/20 transition-colors duration-300">
                <Icon className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center glass-card rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-white mb-3">Envie seu currículo</h3>
          <p className="text-gray-400 mb-6">
            Cadastre seu currículo para oportunidades futuras.
          </p>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => window.location.href = 'mailto:producao@rootforceusinagem.com.br?subject=Currículo - Oportunidade de trabalho'}
          >
            <Send className="w-4 h-4" />
            Enviar currículo por email
          </Button>
        </div>
      </div>
    </Section>
  );
}
