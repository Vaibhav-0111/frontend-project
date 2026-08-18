import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

const CYCLE_MS   = 3000; // must match CSS driveCar animation duration
const MAX_VOL    = 0.60;
const BASE_PITCH = 0.85;

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
    const audio       = new Audio('/intro.mp3');
    audio.loop        = true;   // just loop it; RAF handles volume sync
    audio.volume      = 0;
    audio.playbackRate = BASE_PITCH;
    audioRef.current  = audio;

    // RAF loop — runs every frame, adjusts volume & pitch to car position
    function syncLoop(ts) {
      if (exitingRef.current) return;

      if (startRef.current === null) startRef.current = ts;
      const elapsed  = ts - startRef.current;
      const progress = (elapsed % CYCLE_MS) / CYCLE_MS;

      const targetVol   = getCycleVolume(progress) * MAX_VOL;
      const targetPitch = getCyclePitch(progress);

      // Smooth to target instead of snapping (lerp)
      audio.volume       = Math.max(0, Math.min(1, audio.volume + (targetVol   - audio.volume)   * 0.08));
      audio.playbackRate = Math.max(0.5, Math.min(2.5, audio.playbackRate + (targetPitch - audio.playbackRate) * 0.06));

      rafRef.current = requestAnimationFrame(syncLoop);
    }

    // Try to play immediately
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay allowed — start sync loop
          startRef.current = null;
          rafRef.current   = requestAnimationFrame(syncLoop);
        })
        .catch(() => {
          // Autoplay blocked by browser — wait for any user gesture
          const unlock = () => {
            audio.play()
              .then(() => {
                startRef.current = null;
                rafRef.current   = requestAnimationFrame(syncLoop);
              })
              .catch(() => {}); // still blocked — give up silently
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
