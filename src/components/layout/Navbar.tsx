import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Home as HomeIcon, CircleHelp, Wrench, Phone, Briefcase, Building } from 'lucide-react';
import { prefersReducedMotion } from '@/animations';

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('#top');
  const [isScrolled, setIsScrolled] = useState(false);
  
  const items = [
    { href: '#top', label: 'Home', Icon: HomeIcon },
    { href: '#sobre', label: 'Quem somos', Icon: CircleHelp },
    { href: '#servicos', label: 'Serviços', Icon: Wrench },
    { href: '#estrutura', label: 'Estrutura', Icon: Building },
    // { href: '#carreiras', label: 'Carreiras', Icon: Briefcase },
    { href: '#contato', label: 'Contato', Icon: Phone },
  ];

  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useGSAP(() => {
    // Respect prefers-reduced-motion
    if (prefersReducedMotion()) return;

    // Navbar entrance animation - y: -80 → 0, first element to appear
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -80 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );
    }
    
    // Stagger animation for nav items
    if (itemsRef.current.length > 0) {
      gsap.fromTo(
        itemsRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.3, ease: 'power2.out' }
      );
    }

    // Scroll behavior - detect when scrolled and update state
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top -50',
      onEnter: () => setIsScrolled(true),
      onLeaveBack: () => setIsScrolled(false),
    });

    // Active section detection
    const sections = ['top', 'sobre', 'servicos', /* 'carreiras', */ 'estrutura', 'contato'];
    
    sections.forEach((section) => {
      const el = document.getElementById(section);
      if (el) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveSection(`#${section}`),
          onEnterBack: () => setActiveSection(`#${section}`),
        });
      }
    });
  }, { scope: headerRef });

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-2' 
          : 'py-4'
      }`}
      style={{
        // Scrolled state styles applied via inline for smooth transition
        backdropFilter: isScrolled ? 'blur(12px)' : 'blur(0px)',
        background: isScrolled ? 'rgba(0,0,0,0.85)' : 'transparent',
        borderBottom: isScrolled ? '1px solid rgba(212,160,23,0.3)' : '1px solid transparent',
      }}
    >
      <div ref={navRef} className="container flex justify-center">
        <nav 
          className={`flex items-center gap-1 sm:gap-2 rounded-full px-3 sm:px-6 py-2.5 transition-all duration-500 ${
            isScrolled
              ? 'bg-black/80 backdrop-blur-xl shadow-lg shadow-black/20 ring-1 ring-[#D4AF37]/30'
              : 'bg-black/40 backdrop-blur-md ring-1 ring-[#D4AF37]/20'
          }`}
          aria-label="Navegação principal"
        >
          {items.map(({ href, label, Icon }, index) => {
            const isActive = activeSection === href;
            return (
              <a
                key={href}
                href={href}
                ref={(el) => { itemsRef.current[index] = el; }}
                onClick={(e) => handleClick(e, href)}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-[#D4AF37]/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <Icon 
                  className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${
                    isActive 
                      ? 'text-[#D4AF37]' 
                      : 'text-[#D4AF37]/70 group-hover:text-[#D4AF37]'
                  }`} 
                />
                <span 
                  className={`hidden sm:inline text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-white/80 group-hover:text-white'
                  }`}
                >
                  {label}
                </span>
                
                {/* Active indicator */}
                <span 
                  className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent transition-all duration-300 ${
                    isActive ? 'w-12' : 'w-0 group-hover:w-8'
                  }`} 
                />
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
