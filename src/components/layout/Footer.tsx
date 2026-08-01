import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Linkedin, Instagram, ArrowUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const socialLinks = [
  { Icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/rootforce-usinagem-4aa5a1391/' },
  { Icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/usinagem_rootforce/' },
];

const navLinks = [
  { label: 'Home', href: '#top' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Estrutura', href: '#estrutura' },
  // { label: 'Carreiras', href: '#carreiras' }, // pronto, mas ainda não vai ao ar
  { label: 'Contato', href: '#contato' },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (footerRef.current) {
        gsap.fromTo(
          footerRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: footerRef.current,
              start: 'top 95%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer ref={footerRef} className="relative mt-20 bg-gray-900/50 border-t border-gray-800/50">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-gradient-gold mb-4">Rootforce</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Usinagem CNC de alta precisão — peças técnicas sob medida com excelência e compromisso.
            </p>
            
            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navegação</h4>
            <nav className="flex flex-col gap-2">
              {navLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-gray-400 text-sm hover:text-[#D4AF37] transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>São José dos Pinhais – PR</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>(41) 98804-1664</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>producao@rootforceusinagem.com.br</span>
              </div>
            </div>
          </div>

          {/* Back to Top */}
          <div className="flex lg:justify-end">
            <button
              onClick={scrollToTop}
              className="group flex flex-col items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors duration-300"
              aria-label="Voltar ao topo"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-700 group-hover:border-[#D4AF37]/50 group-hover:bg-[#D4AF37]/10 transition-all duration-300">
                <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
              </div>
              <span className="text-xs">Voltar ao topo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800/50">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Rootforce Usinagem. Todos os direitos reservados.
          </p>
          <p className="text-gray-600 text-xs">
            Desenvolvido com excelência
          </p>
        </div>
      </div>
    </footer>
  );
}
