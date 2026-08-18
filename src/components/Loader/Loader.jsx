import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

export default function Loader({ onExitStart }) {
  const audioRef    = useRef(null);
  const fadeIntRef  = useRef(null);
  const fadeOutIntRef = useRef(null);

  useEffect(() => {
    // --- Create audio ONLY for this loader ---
    const audio = new Audio('/mustang_cinematic_v8_roar.mp3');
    audio.loop   = true;
    audio.volume = 0;
    audioRef.current = audio;

    function startFadeIn() {
      clearInterval(fadeIntRef.current);
      fadeIntRef.current = setInterval(() => {
        if (audio.volume < 0.45) {
          audio.volume = Math.min(0.45, audio.volume + 0.04);
        } else {
          clearInterval(fadeIntRef.current);
        }
      }, 50);
    }

    audio.play()
      .then(startFadeIn)
      .catch(() => {
        // Autoplay blocked — wait for first interaction
        const unlock = () => {
          audio.play().then(startFadeIn).catch(() => {});
          window.removeEventListener('click',      unlock);
          window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('click',      unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
      });

    return () => {
      // Cleanup in case component forcefully unmounts
      clearInterval(fadeIntRef.current);
      clearInterval(fadeOutIntRef.current);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Called by parent when the fade-out visual animation BEGINS
  function stopAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    clearInterval(fadeIntRef.current);

    fadeOutIntRef.current = setInterval(() => {
      if (audio.volume > 0.04) {
        audio.volume = Math.max(0, audio.volume - 0.05);
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeOutIntRef.current);
      }
    }, 40);
  }

  return (
    <motion.div
      className="loader-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
      aria-label="Loading site assets"
      onAnimationStart={(def) => {
        // 'exit' animation is starting — begin audio fade NOW
        if (def === 'exit') stopAudio();
      }}
    >
      {/* Subtle CRT scanlines */}
      <div className="loader-scanlines" aria-hidden="true" />

      {/* Road stripe */}
      <div className="loader-road" aria-hidden="true" />

      {/* Road dashes */}
      <div className="loader-dashes" aria-hidden="true">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="loader-dash" style={{ animationDelay: `${i * -0.45}s` }} />
        ))}
      </div>

      {/* Car */}
      <div className="loader-track">
        <img
          src="/loading_car.svg"
          alt="Mustang loading"
          className="loader-car"
        />
      </div>

      {/* Loading label */}
      <div className="loader-label" aria-live="polite">
        <span className="loader-label__text">LOADING</span>
        <span className="loader-label__dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </div>
    </motion.div>
  );
}
