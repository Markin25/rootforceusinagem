import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Target, Star, Cpu, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import Section from '@ui/Section';
import kleberImg from '@assets/kleber.jpg';
import adrianoImg from '@assets/adriano.jpg';
import { 
  prefersReducedMotion, 
  animateCounter, 
  animateArc, 
  cardHoverIn, 
  cardHoverOut 
} from '@/animations';

gsap.registerPlugin(ScrollTrigger);

// Anos de experiência - valor real extraído do código existente
const ANOS_DE_EXPERIENCIA = 15;

const features = [
  {
    title: 'Precisão CNC',
    desc: 'Peças técnicas sob medida com tolerâncias controladas.',
    Icon: Target,
  },
  {
    title: 'Experiência',
    desc: 'Mais de 15 anos em soluções industriais.',
    Icon: Star,
    isExperience: true, // Flag para identificar o card com contador
  },
  {
    title: 'Tecnologia',
    desc: 'Edgecam, Powermill e processos CAM.',
    Icon: Cpu,
  },
  {
    title: 'Confiabilidade',
    desc: 'Qualidade, prazos e parceria transparente.',
    Icon: Shield,
  },
];

const founders = [
  {
    name: 'Kleber Andrade',
    image: kleberImg,
    bio: 'Iniciei minha trajetória na usinagem em 2008, em Rio do Sul (SC), atuando em uma indústria de grande porte. Desde então, consolidei minha carreira em Curitiba, com foco em desenvolvimento técnico e constante qualificação. Possuo sólida experiência em comandos CNC, programação manual ISO, parametrizada e CAM, com domínio dos softwares Edgecam e Powermill.',
  },
  {
    name: 'Adriano Rodrigo',
    image: adrianoImg,
    bio: 'Especialista em usinagem com mais de 15 anos de experiência, atuando no desenvolvimento de soluções industriais de alta precisão. À frente da Rootforce Usinagem, trabalho com projetos, fabricação e usinagem sob medida, atendendo empresas que buscam qualidade, confiabilidade e excelência técnica, sempre com compromisso com prazos e resultados.',
  },
];

export default function About() {
  const [showMore, setShowMore] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const foundersRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const experienceCounterRef = useRef<HTMLSpanElement>(null);
  const experienceArcRef = useRef<SVGPathElement>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Card hover handlers
  const handleCardHoverIn = (e: React.MouseEvent<HTMLDivElement>) => {
    cardHoverIn(e.currentTarget);
  };

  const handleCardHoverOut = (e: React.MouseEvent<HTMLDivElement>) => {
    cardHoverOut(e.currentTarget);
  };

  // Image load handler for founder images - reveal with clip-path
  const handleImageLoad = (name: string, imgElement: HTMLImageElement) => {
    if (loadedImages.has(name) || prefersReducedMotion()) return;
    
    setLoadedImages(prev => new Set(prev).add(name));
    
    // Image reveal with clip-path from top to bottom
    gsap.fromTo(
      imgElement,
      { clipPath: 'inset(0 0 100% 0)' },
      { 
        clipPath: 'inset(0 0 0% 0)', 
        duration: 1, 
        ease: 'expo.out',
      }
    );
  };

  useGSAP(() => {
    // Respect prefers-reduced-motion
    if (prefersReducedMotion()) return;

    // Animate feature cards with stagger
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.feature-card');
      gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });
      
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Counter animation for years of experience
    if (experienceCounterRef.current) {
      animateCounter(experienceCounterRef.current, ANOS_DE_EXPERIENCIA, {
        duration: 2,
        suffix: '+',
        scrollTrigger: {
          trigger: experienceCounterRef.current,
        },
      });
    }

    // SVG arc animation around counter
    if (experienceArcRef.current) {
      animateArc(experienceArcRef.current, {
        duration: 2,
        delay: 0.2,
        scrollTrigger: {
          trigger: experienceArcRef.current,
        },
      });
    }

    // Animate founders cards with reveal
    if (foundersRef.current) {
      const founderCards = foundersRef.current.querySelectorAll('.founder-card');
      gsap.set(founderCards, { opacity: 0, x: (i) => (i === 0 ? -50 : 50) });
      
      gsap.to(founderCards, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: foundersRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });

      // Animate paragraphs inside founder cards with stagger
      const bios = foundersRef.current.querySelectorAll('.founder-bio');
      gsap.set(bios, { opacity: 0, y: 30 });
      
      gsap.to(bios, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: foundersRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });
    }
  }, { scope: sectionRef });

  useEffect(() => {
    if (showMore && detailsRef.current) {
      gsap.fromTo(
        detailsRef.current,
        { opacity: 0, height: 0 },
        { opacity: 1, height: 'auto', duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [showMore]);

  return (
    <div ref={sectionRef}>
      <Section title="Sobre a Rootforce" subtitle="Excelência técnica, responsabilidade e resultados">
        {/* Feature Cards with counter animation on experience card */}
        <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map(({ title, desc, Icon, isExperience }) => (
            <div
              key={title}
              className="feature-card group relative rounded-2xl p-6 transition-colors duration-300"
              onMouseEnter={handleCardHoverIn}
              onMouseLeave={handleCardHoverOut}
            >
              {/* Card background with gradient border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-[1px] rounded-2xl bg-gray-900/80 backdrop-blur-sm" />
              
              {/* Gold border */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-[#D4AF37]/20 group-hover:ring-[#D4AF37]/40 transition-all duration-300" />
              
              {/* Content */}
              <div className="relative z-10">
                {isExperience ? (
                  // Experience card with counter and SVG arc
                  <div className="flex flex-col items-center">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
                      {/* SVG arc decoration - golden arc around counter */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
                        <path
                          ref={experienceArcRef}
                          d="M 40 8 A 32 32 0 1 1 39.99 8"
                          fill="none"
                          stroke="#D4AF37"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Counter number */}
                      <span 
                        ref={experienceCounterRef}
                        className="text-3xl font-bold text-[#D4AF37]"
                      >
                        0
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed text-center">{desc}</p>
                  </div>
                ) : (
                  // Regular feature card
                  <>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#D4AF37]/10 mb-4 group-hover:bg-[#D4AF37]/20 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Founders Section with image reveal animations */}
        <div className="mb-16">
          <h3 className="text-center text-2xl sm:text-3xl font-bold mb-10">
            <span className="text-gradient-gold">Sócios Fundadores</span>
          </h3>
          
          <div ref={foundersRef} className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {founders.map((founder) => (
              <div
                key={founder.name}
                className="founder-card group relative rounded-2xl overflow-hidden"
              >
                {/* Card with glass effect */}
                <div className="relative p-6 lg:p-8 glass-card rounded-2xl">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Image with border and clip-path reveal on load */}
                    <div className="relative shrink-0">
                      <div className="absolute -inset-1 bg-gradient-to-br from-[#D4AF37] via-transparent to-[#D4AF37] rounded-xl opacity-50" />
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden">
                        <img
                          src={founder.image}
                          alt={founder.name}
                          className="w-full h-full object-cover"
                          onLoad={(e) => handleImageLoad(founder.name, e.currentTarget)}
                        />
                      </div>
                    </div>
                    
                    {/* Bio with paragraph animation */}
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-white mb-3">{founder.name}</h4>
                      <p className="founder-bio text-gray-400 text-sm leading-relaxed">{founder.bio}</p>
                    </div>
                  </div>
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Details */}
      <div className="max-w-4xl mx-auto">
        <button
          className="group flex items-center gap-3 mx-auto px-6 py-3 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-medium transition-all duration-300 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50"
          onClick={() => setShowMore((s) => !s)}
        >
          <span>{showMore ? 'Ocultar detalhes' : 'Conheça nossa história'}</span>
          {showMore ? (
            <ChevronUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          ) : (
            <ChevronDown className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
          )}
        </button>

        {showMore && (
          <div ref={detailsRef} className="mt-8 overflow-hidden">
            <div className="glass-card rounded-2xl p-8 space-y-6">
              <p className="text-gray-300 leading-relaxed">
                A <span className="text-[#D4AF37] font-semibold">Rootforce</span> é uma empresa especializada em usinagem CNC de alta precisão, criada para
                atender as demandas da indústria com excelência técnica, responsabilidade e compromisso com
                resultados. Atuando com foco em peças técnicas sob medida, desenvolvemos soluções conforme
                projeto, respeitando rigorosamente padrões de qualidade, acabamento e tolerâncias dimensionais.
              </p>
              <p className="text-gray-300 leading-relaxed">
                A Rootforce nasce da experiência e do conhecimento de seus sócios, <strong className="text-white">Adriano Rodrigo</strong> e
                <strong className="text-white"> Kleber Andrade</strong>, profissionais com mais de 15 anos de atuação no setor industrial e de
                usinagem. Ao longo de suas trajetórias, ambos construíram sólida experiência prática e técnica,
                o que se reflete diretamente na qualidade dos serviços prestados e na confiança transmitida aos
                clientes.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Com processos bem definidos, atenção aos detalhes e controle em todas as etapas da produção,
                a Rootforce Usinagem atua com <strong className="text-white">fresamento</strong>, <strong className="text-white">furação</strong>, <strong className="text-white">ajustes técnicos</strong> e
                <strong className="text-white"> fabricação de componentes industriais</strong>, atendendo <strong className="text-white">protótipos</strong> e <strong className="text-white">séries</strong>, sempre conforme a
                necessidade de cada projeto.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Localizada em <strong className="text-white">São José dos Pinhais – PR</strong>, a empresa tem como pilares a qualidade, o
                cumprimento de prazos e a confiabilidade, entendendo que a usinagem é parte fundamental do
                desempenho e da segurança dos sistemas industriais. Mais do que fabricar peças, a Rootforce
                busca construir parcerias duradouras, baseadas em transparência, competência técnica e entrega
                consistente de resultados.
              </p>
            </div>
          </div>
        )}
        </div>
      </Section>
    </div>
  );
}
