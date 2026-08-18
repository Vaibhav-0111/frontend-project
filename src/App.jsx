import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar/Navbar';
import HeroReveal from './components/HeroReveal/HeroReveal';
import DesignSection from './components/DesignSection/DesignSection';
import PerformanceSection from './components/PerformanceSection/PerformanceSection';
import InteriorSection from './components/InteriorSection/InteriorSection';
import Footer from './components/Footer/Footer';
import Loader from './components/Loader/Loader';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Safety fallback in case video fails to load or takes too long
  useEffect(() => {
    const fallback = setTimeout(() => {
      setIsLoading(false);
    }, 6000); // Max 6 seconds of loading screen
    return () => clearTimeout(fallback);
  }, []);

  return (
    <main>
      <AnimatePresence>
        {isLoading && <Loader key="loader" />}
      </AnimatePresence>

      <Navbar />
      <HeroReveal onVideoReady={() => setIsLoading(false)} />
      <DesignSection />
      <PerformanceSection />
      <InteriorSection />
      <Footer />
    </main>
  );
}
