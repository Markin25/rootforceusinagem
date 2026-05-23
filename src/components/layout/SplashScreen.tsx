import { useEffect, useState } from 'react';
import gsap from 'gsap';
import logo from '@assets/logodefinitiva.png';

export default function SplashScreen() {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline();
    
    // Logo animation
    tl.fromTo(
      '.splash-logo',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo(
      '.splash-glow',
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' },
      '-=0.5'
    )
    .to('.splash-logo', {
      scale: 1.05,
      duration: 0.8,
      repeat: 1,
      yoyo: true,
      ease: 'power1.inOut',
    });

    // Auto-hide after animation (this is typically controlled by parent)
    const timer = setTimeout(() => setIsAnimating(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isAnimating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="splash-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl" />
        <div className="splash-glow absolute top-1/3 left-1/3 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-2xl" />
        <div className="splash-glow absolute bottom-1/3 right-1/3 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-2xl" />
      </div>
      
      {/* Logo */}
      <div className="relative">
        <div className="splash-glow absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-3xl scale-150" />
        <img
          src={logo}
          alt="Rootforce Usinagem"
          className="splash-logo relative h-56 w-56 sm:h-72 sm:w-72 object-contain drop-shadow-2xl"
        />
      </div>
      
      {/* Loading indicator */}
      <div className="absolute bottom-16 flex flex-col items-center gap-4">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <span className="text-gray-500 text-sm tracking-widest uppercase">Carregando</span>
      </div>
    </div>
  );
}
