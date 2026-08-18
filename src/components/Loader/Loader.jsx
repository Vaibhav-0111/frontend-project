import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

const CAR_ANIM_DURATION_S = 3; // must match CSS @keyframes driveCar duration

export default function Loader() {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('/mustang_cinematic_v8_roar.mp3');
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    // Fade in volume over 600ms after first user interaction or attempt
    audio.play().catch(() => {
      // Autoplay blocked — attach a one-time click to try again
      const tryPlay = () => {
        audio.play().then(() => {
          fadeIn(audio);
        }).catch(() => {});
        document.removeEventListener('click', tryPlay);
        document.removeEventListener('touchstart', tryPlay);
      };
      document.addEventListener('click', tryPlay, { once: true });
      document.addEventListener('touchstart', tryPlay, { once: true });
    });

    // Try fade in immediately if play() was allowed
    audio.addEventListener('playing', () => fadeIn(audio), { once: true });

    return () => {
      fadeOut(audio);
    };
  }, []);

  return (
    <motion.div
      className="loader-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      aria-label="Loading site assets"
    >
      {/* Subtle scanlines for atmosphere */}
      <div className="loader-scanlines" aria-hidden="true" />

      {/* Road line at the bottom */}
      <div className="loader-road" aria-hidden="true" />

      {/* Road dashes animated */}
      <div className="loader-dashes" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="loader-dash" style={{ animationDelay: `${i * -0.5}s` }} />
        ))}
      </div>

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

function fadeIn(audio) {
  const target = 0.5;
  const step   = 0.05;
  const interval = setInterval(() => {
    if (audio.volume + step >= target) {
      audio.volume = target;
      clearInterval(interval);
    } else {
      audio.volume += step;
    }
  }, 60);
}

function fadeOut(audio) {
  const step = 0.05;
  const interval = setInterval(() => {
    if (audio.volume - step <= 0) {
      audio.volume = 0;
      audio.pause();
      clearInterval(interval);
    } else {
      audio.volume -= step;
    }
  }, 60);
}

