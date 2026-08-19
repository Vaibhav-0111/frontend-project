import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

const CYCLE_MS   = 3000; // must match CSS driveCar animation duration
const MAX_VOL    = 0.75; // slightly louder for music

function getCycleVolume(p) {
  // Bell curve: 0 at edges, peak in middle section (35% – 65%)
  if (p < 0.22) return (p / 0.22);
  if (p < 0.65) return 1.0;
  return 1.0 - (p - 0.65) / 0.35;
}

function getCyclePitch(p) {
  if (p < 0.22) return 0.78 + (p / 0.22) * 0.35;
  if (p < 0.55) return 1.13;
  return 1.13 - ((p - 0.55) / 0.45) * 0.33;
}

export default function Loader() {
  const audioRef   = useRef(null);
  const rafRef     = useRef(null);
  const startRef   = useRef(null);
  const exitingRef = useRef(false);

  useEffect(() => {
    const audio      = new Audio('/loader_music.mp3');
    audio.loop       = true;
    audio.volume     = 0;       // start silent, fade in
    audioRef.current = audio;

    // Simple RAF loop: fade volume up quickly to MAX_VOL
    function syncLoop() {
      if (exitingRef.current) return;
      if (audio.volume < MAX_VOL) {
        audio.volume = Math.min(MAX_VOL, audio.volume + 0.02);
      }
      rafRef.current = requestAnimationFrame(syncLoop);
    }

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          rafRef.current = requestAnimationFrame(syncLoop);
        })
        .catch(() => {
          const unlock = () => {
            audio.play()
              .then(() => { rafRef.current = requestAnimationFrame(syncLoop); })
              .catch(() => {});
            window.removeEventListener('click',      unlock);
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('keydown',    unlock);
          };
          window.addEventListener('click',      unlock, { once: true });
          window.addEventListener('touchstart', unlock, { once: true });
          window.addEventListener('keydown',    unlock, { once: true });
        });
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Called by Framer Motion when exit animation BEGINS
  function handleAnimationStart(def) {
    if (def !== 'exit') return;
    exitingRef.current = true;
    cancelAnimationFrame(rafRef.current);

    const audio = audioRef.current;
    if (!audio) return;

    // Hard fade out in ~350ms
    const step = setInterval(() => {
      if (!audioRef.current) return clearInterval(step);
      if (audio.volume > 0.05) {
        audio.volume = Math.max(0, audio.volume - 0.07);
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(step);
      }
    }, 25);
  }

  return (
    <motion.div
      className="loader-overlay"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
      aria-label="Loading site assets"
      onAnimationStart={handleAnimationStart}
    >
      <div className="loader-scanlines" aria-hidden="true" />
      <div className="loader-road"     aria-hidden="true" />

      <div className="loader-dashes" aria-hidden="true">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="loader-dash" style={{ animationDelay: `${i * -0.45}s` }} />
        ))}
      </div>

      <div className="loader-track">
        <img src="/loading_car.svg" alt="Mustang loading" className="loader-car" />
      </div>

      <div className="loader-label" aria-live="polite">
        <span className="loader-label__text">LOADING</span>
        <span className="loader-label__dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </div>
    </motion.div>
  );
}
