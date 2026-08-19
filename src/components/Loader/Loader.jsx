import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

const AUDIO_SRC = '/loader_music.mp3';

/* Real length of loader_music.mp3. Only used until the browser reports
   the true duration via `loadedmetadata` — after that we use the real value,
   so the car and the music can never drift apart. */
export const LOADER_FALLBACK_MS = 7872;

const MAX_VOL     = 0.75;
const FADE_IN_MS  = 500;  // volume ramp at the start of the cycle
const FADE_OUT_MS = 350;  // volume ramp when the loader exits

const LOADER_VARIANTS = {
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Loader({ onCycleComplete }) {
  const audioRef     = useRef(null);
  const carRef       = useRef(null);
  const trackRef     = useRef(null);
  const rafRef       = useRef(null);
  const startRef     = useRef(0);
  const durationRef  = useRef(LOADER_FALLBACK_MS / 1000);
  const exitingRef   = useRef(false);
  const cycleDoneRef = useRef(false);
  const cycleCbRef   = useRef(onCycleComplete);

  // Keep the callback fresh without re-running the main effect.
  useEffect(() => { cycleCbRef.current = onCycleComplete; }, [onCycleComplete]);

  useEffect(() => {
    const reduced = prefersReducedMotion();

    // These refs outlive the effect. React StrictMode runs mount -> cleanup ->
    // mount in dev, so they MUST be reset here or the second mount starts in a
    // torn-down state (frozen car, no audio). `cancelled` below is scoped to
    // this closure and is the real loop guard, so a stale ref can never again
    // stall the animation.
    let cancelled = false;
    exitingRef.current   = false;
    cycleDoneRef.current = false;

    const audio    = new Audio(AUDIO_SRC);
    audio.loop     = false;   // plays through exactly once
    audio.preload  = 'auto';
    audio.volume   = 0;
    audio.autoplay = false;
    audioRef.current = audio;

    startRef.current = performance.now();

    const onMeta = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        durationRef.current = audio.duration;
      }
    };
    audio.addEventListener('loadedmetadata', onMeta);

    // The track plays once; its natural end is the authoritative "one full
    // pass is done" signal.
    const onEnded = () => {
      if (cancelled || cycleDoneRef.current) return;
      cycleDoneRef.current = true;
      cycleCbRef.current?.();
    };
    audio.addEventListener('ended', onEnded);

    /* ---------- car geometry ---------- */
    // Travel = full track width + the car's own width, so the car enters
    // fully off-screen right and leaves fully off-screen left with no dead air.
    let travel = 0;
    const measure = () => {
      const track = trackRef.current;
      const car   = carRef.current;
      if (!track || !car) return;
      travel = track.offsetWidth + car.offsetWidth;
    };
    measure();
    window.addEventListener('resize', measure);
    carRef.current?.addEventListener('load', measure);

    /* ---------- the one loop that drives everything ---------- */
    let prevT = 0;
    function frame() {
      if (cancelled || exitingRef.current) return;

      // Geometry may not have been measurable on the first pass (e.g. the SVG
      // had no layout yet). Recover rather than leaving the car parked
      // off-screen forever.
      if (travel <= 0) {
        measure();
        if (travel <= 0) travel = window.innerWidth * 1.3;
      }

      const duration = durationRef.current;

      // Position is a function of the AUDIO clock whenever the audio is
      // actually playing. That is what makes the car and the music exact.
      // If autoplay was refused we fall back to the wall clock at the same
      // period, so the car still drives at the music's speed.
      const playing = !audio.paused && !audio.ended;
      const t = playing
        ? audio.currentTime
        : ((performance.now() - startRef.current) / 1000);

      const p = duration > 0 ? (t % duration) / duration : 0;

      if (carRef.current && !reduced) {
        carRef.current.style.transform = `translate3d(${-p * travel}px, 0, 0)`;
      }

      // Ramp the volume in over the first FADE_IN_MS of playback.
      if (playing && audio.volume < MAX_VOL) {
        const ramp = Math.min(1, (audio.currentTime * 1000) / FADE_IN_MS);
        audio.volume = Math.min(MAX_VOL, ramp * MAX_VOL);
      }

      // Backstop for the silent fallback (and for a track that never fires
      // `ended`): the wall clock is monotonic, so crossing `duration` marks a
      // completed pass. `wrapped` catches a clock reset from unlock().
      
      const wrapped = t < prevT - duration / 2;
      if (!cycleDoneRef.current && (wrapped || t >= duration)) {
        cycleDoneRef.current = true;
        cycleCbRef.current?.();
      }
      prevT = t;

      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    /* ---------- autoplay ---------- */
    // Chrome refuses play() until the document has user activation. Listeners
    // are registered BEFORE the attempt so a click landing during the
    // (async) play() promise is not lost.
    const unlockEvents = ['pointerdown', 'touchstart', 'keydown'];

    const removeUnlock = () => {
      unlockEvents.forEach((e) =>
        window.removeEventListener(e, unlock, { capture: true })
      );
    };

    function unlock() {
      removeUnlock();
      if (cancelled || !audioRef.current) return;
      // Restart the audio clock so the car re-syncs to the music from zero.
      audio.currentTime = 0;
      startRef.current  = performance.now();
      prevT             = 0;
      audio.play().catch(() => {});
    }

    unlockEvents.forEach((e) =>
      window.addEventListener(e, unlock, { capture: true, passive: true })
    );

    audio.play()
      .then(() => {
        removeUnlock();
        // Re-anchor the wall clock to the moment sound actually started.
        startRef.current = performance.now() - audio.currentTime * 1000;
      })
      .catch(() => {
        // Chrome refused autoplay (cold tab, no user activation yet). Nothing
        // can force sound here, so stay silent and let `unlock` start the
        // track on the visitor's first interaction — no prompt, no banner.
        // The car keeps driving on the wall clock meanwhile.
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      removeUnlock();
      window.removeEventListener('resize', measure);
      carRef.current?.removeEventListener('load', measure);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // Fired by Framer Motion when the exit animation BEGINS.
  function handleAnimationStart(def) {
    const isExit =
      def === 'exit' ||
      (def && typeof def === 'object' && def.opacity === 0);
    if (!isExit) return;
    exitingRef.current = true;
    cancelAnimationFrame(rafRef.current);

    const audio = audioRef.current;
    if (!audio) return;

    const from  = audio.volume;
    const steps = Math.max(1, Math.round(FADE_OUT_MS / 25));
    let   i     = 0;

    const step = setInterval(() => {
      i += 1;
      if (!audioRef.current) return clearInterval(step);
      if (i >= steps) {
        audio.volume = 0;
        audio.pause();
        clearInterval(step);
      } else {
        audio.volume = Math.max(0, from * (1 - i / steps));
      }
    }, 25);
  }

  return (
    <motion.div
      className="loader-overlay"
      /* Named variants (not inline objects) so onAnimationStart receives the
         string "exit" and the audio fade-out can be started in step with the
         visual fade. */
      variants={LOADER_VARIANTS}
      initial="visible"
      animate="visible"
      exit="exit"
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

      <div className="loader-track" ref={trackRef}>
        <img
          ref={carRef}
          src="/loading_car.svg"
          alt=""
          className="loader-car"
          aria-hidden="true"
          draggable="false"
        />
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
