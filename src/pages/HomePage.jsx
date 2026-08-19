import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar';
import HeroReveal from '../components/HeroReveal/HeroReveal';
import DesignSection from '../components/DesignSection/DesignSection';
import PerformanceSection from '../components/PerformanceSection/PerformanceSection';
import InteriorSection from '../components/InteriorSection/InteriorSection';
import Footer from '../components/Footer/Footer';
import Loader from '../components/Loader/Loader';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  // Safety fallback in case video fails to load or takes too long
  useEffect(() => {
    const fallback = setTimeout(() => {
      setIsLoading(false);
    }, 6000); // Max 6 seconds of loading screen
    return () => clearTimeout(fallback);
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <AnimatePresence>
        {isLoading && <Loader key="loader" />}
      </AnimatePresence>

      <Navbar />
      <HeroReveal onVideoReady={() => setIsLoading(false)} />
      <DesignSection />
      <PerformanceSection />
      <InteriorSection />
      <Footer />
    </motion.main>
  );
}
