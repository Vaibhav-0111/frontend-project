import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar';
import HeroReveal from '../components/HeroReveal/HeroReveal';
import DesignSection from '../components/DesignSection/DesignSection';
import PerformanceSection from '../components/PerformanceSection/PerformanceSection';
import InteriorSection from '../components/InteriorSection/InteriorSection';
import Footer from '../components/Footer/Footer';
import Loader from '../components/Loader/Loader';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  // No video to wait for — dismiss loader after a short branded pause
  useEffect(() => {
    const fallback = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <main>
      <AnimatePresence>
        {isLoading && <Loader key="loader" />}
      </AnimatePresence>

      <Navbar />
      <HeroReveal />
      <DesignSection />
      <PerformanceSection />
      <InteriorSection />
      <Footer />
    </main>
  );
}
