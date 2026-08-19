import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/Navbar/Navbar';
import HeroReveal from '../components/HeroReveal/HeroReveal';
import DesignSection from '../components/DesignSection/DesignSection';
import PerformanceSection from '../components/PerformanceSection/PerformanceSection';
import InteriorSection from '../components/InteriorSection/InteriorSection';
import Footer from '../components/Footer/Footer';
import Loader, { LOADER_FALLBACK_MS } from '../components/Loader/Loader';

// Hard ceiling — the loader never outstays this, even if the video stalls.
const MAX_LOADER_MS = LOADER_FALLBACK_MS + 4000;

export default function HomePage() {
  const [videoReady, setVideoReady] = useState(false);
  const [cycleDone,  setCycleDone]  = useState(false);
  const [timedOut,   setTimedOut]   = useState(false);

  // The loader leaves once the car has completed a full pass (one whole play
  // of loader_music.mp3) AND the hero video is ready — so the track is never
  // cut off mid-phrase. `timedOut` is the escape hatch.
  const isLoading = !timedOut && !(videoReady && cycleDone);

  useEffect(() => {
    const cap = setTimeout(() => setTimedOut(true), MAX_LOADER_MS);
    return () => clearTimeout(cap);
  }, []);

  const handleVideoReady   = useCallback(() => setVideoReady(true), []);
  const handleCycleComplete = useCallback(() => setCycleDone(true), []);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <AnimatePresence>
        {isLoading && <Loader key="loader" onCycleComplete={handleCycleComplete} />}
      </AnimatePresence>

      <Navbar />
      <HeroReveal onVideoReady={handleVideoReady} />
      <DesignSection />
      <PerformanceSection />
      <InteriorSection />
      <Footer />
    </motion.main>
  );
}
