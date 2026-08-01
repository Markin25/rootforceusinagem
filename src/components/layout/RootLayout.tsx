import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { initReveal } from '@lib/reveal';
import Navbar from '@layout/Navbar';
import Footer from '@layout/Footer';
import SplashScreen from '@layout/SplashScreen';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const done = () => setLoading(false);
    window.addEventListener('brand-applied', done);
    const timer = setTimeout(done, 1200);
    return () => {
      window.removeEventListener('brand-applied', done);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    initReveal();
  }, []);

  // Scrolls to the matching section whenever the URL carries a hash — covers
  // both nav clicks and redirects from legacy routes like /servicos → /#servicos.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
    return () => clearTimeout(t);
  }, [location]);

  return (
    <div className="min-h-dvh flex flex-col">
      {loading && <SplashScreen />}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
