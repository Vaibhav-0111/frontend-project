import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

const CYCLE_MS = 3000; // must match CSS @keyframes driveCar duration

/**
 * Bell-curve volume based on car position in the 3-second cycle.
 * Car enters right-side, peaks ~35-55% through, exits left.
 *   progress 0.00 → 0.20 : ramp up   (car approaching from right)
 *   progress 0.20 → 0.65 : full blast (car passing)
 *   progress 0.65 → 1.00 : ramp down  (car receding left)
 */
function getCycleVolume(progress) {
  if (progress < 0.18) return progress / 0.18;           // 0 → 1 rise
  if (progress < 0.65) return 1.0;                       // full
  return 1.0 - (progress - 0.65) / 0.35;                // 1 → 0 fall
}

/**
 * Pitch (playbackRate) rises as car approaches, peaks, then falls back.
 * Range: 0.75 (distant) → 1.15 (passing) → 0.80 (receding)
 */
function getCyclePitch(progress) {
  if (progress < 0.18) return 0.75 + (progress / 0.18) * 0.40;
  if (progress < 0.45) return 1.15;
  if (progress < 0.65) return 1.15 - ((progress - 0.45) / 0.20) * 0.35;
  return 0.80;
}

export default function Loader() {
  const audioRef    = useRef(null);
  const rafRef      = useRef(null);
  const startTsRef  = useRef(null);   // when the current cycle started
  const exitingRef  = useRef(false);  // true once exit anim begins

  useEffect(() => {
    const audio = new Audio('/mustang_cinematic_v8_roar.mp3');
    audio.loop          = false;   // we control looping manually for sync
    audio.volume        = 0;
    audio.playbackRate  = 0.75;
    audioRef.current    = audio;

    let started = false;

    function startSync() {
      if (started) return;
      started = true;
      startTsRef.current = performance.now();

      // Play and immediately start the sync loop
      audio.play().catch(() => {});
      scheduleLoop();
    }

    function scheduleLoop() {
      rafRef.current = requestAnimationFrame((ts) => {
        if (!audioRef.current || exitingRef.current) return;

        const elapsed  = ts - (startTsRef.current ?? ts);
        const progress = (elapsed % CYCLE_MS) / CYCLE_MS;

        // Restart audio each cycle to stay in sync with the CSS animation
        if (elapsed % CYCLE_MS < 50 && elapsed > 50) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }

        const vol   = getCycleVolume(progress);
        const pitch = getCyclePitch(progress);

        audio.volume       = Math.max(0, Math.min(1, vol * 0.55));
        audio.playbackRate = Math.max(0.5, Math.min(2.5, pitch));

        scheduleLoop();
      });
    }

    // Try autoplay immediately; fallback to first interaction
    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        startSync();
      })
      .catch(() => {
        const unlock = () => {
          startSync();
          window.removeEventListener('click',      unlock);
          window.removeEventListener('touchstart', unlock);
          window.removeEventListener('keydown',    unlock);
        };
        window.addEventListener('click',      unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
        window.addEventListener('keydown',    unlock, { once: true });
      });

    return () => {
      cancelAnimationFrame(rafRef.current);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Called the moment Framer Motion starts the exit animation
  function handleAnimationStart(definition) {
    if (definition !== 'exit') return;
    exitingRef.current = true;

    const audio = audioRef.current;
    if (!audio) return;
    cancelAnimationFrame(rafRef.current);

    // Fade out over ~400ms (faster than exit anim 0.7s so it goes silent first)
    const fadeOut = setInterval(() => {
      if (!audioRef.current) return clearInterval(fadeOut);
      if (audio.volume > 0.04) {
        audio.volume = Math.max(0, audio.volume - 0.06);
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fadeOut);
      }
    }, 30);
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
