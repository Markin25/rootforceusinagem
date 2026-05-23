import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { initReveal } from '@lib/reveal';
import Navbar from '@layout/Navbar';
import Footer from '@layout/Footer';
import SplashScreen from '@layout/SplashScreen';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

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
