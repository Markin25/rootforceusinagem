import gsap from 'gsap';

export function initReveal() {
  const elements: Element[] = Array.from(document.querySelectorAll('.reveal'));
  if (!elements.length) return;

  elements.forEach((el) => gsap.set(el, { opacity: 0, y: 24 }));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => io.observe(el));
}
