import { useEffect, useRef, useState } from 'react';
import { useScroll, useSpring, useMotionValueEvent } from 'framer-motion';
import './HeroReveal.css';

const mustangVideo = '/fd254ffc-503e-438e-86ee-da85ecd269f9.mp4';

export default function HeroReveal() {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Track the scroll progress of this section exactly as we did manually:
  // "start start" -> top of section hits top of viewport (0%)
  // "end end" -> bottom of section hits bottom of viewport (100%)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // Apply physics-based smoothing (LERP) to the chunky scroll values
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100, // Lower stiffness = softer spring
    damping: 30,    // High damping = less bouncy, more gliding
    restDelta: 0.001 // Precision to stop calculating
  });

  const lastUpdateTime = useRef(0);

  // Whenever the smoothed progress changes, update the video
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    // Throttle video seeking to ~30 FPS (every 33ms) to prevent video decoder choke
    const now = performance.now();
    if (now - lastUpdateTime.current < 33) return;
    
    // Round to 2 decimal places to help with browser frame caching
    const targetTime = Math.round((latest * video.duration) * 100) / 100;
    
    // Only seek if the difference is meaningful
    if (Math.abs(video.currentTime - targetTime) > 0.03) {
      lastUpdateTime.current = now;
      video.currentTime = Math.min(targetTime, video.duration - 0.05);
    }
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Necessary for iOS/Safari to allow programmatic seeking without playing
    video.load();

    const onReady = () => {
      setIsReady(true);
      // Set initial frame instantly without waiting for scroll
      video.currentTime = 0;
    };

    video.addEventListener('loadedmetadata', onReady);
    if (video.readyState >= 1) onReady();

    return () => {
      video.removeEventListener('loadedmetadata', onReady);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-scroll"
      id="hero"
      aria-label="Ford Mustang hero reveal — scroll to uncover the car"
    >
      {/* ── Sticky viewport ─────────────────────────────────────── */}
      <div className="hero-sticky">
        {/* Background subtle grain texture */}
        <div className="hero-grain" aria-hidden="true" />

        {/* ── Video ───────────────────────────────────────────────── */}
        <video
          ref={videoRef}
          className="hero-video"
          src={mustangVideo}
          muted
          playsInline
          preload="auto"
          aria-label="Ford Mustang reveal animation — cloth removed as you scroll"
          tabIndex={-1}
        />

        {/* ── Ambient vignette overlay ─────────────────────────── */}
        <div className="hero-vignette" aria-hidden="true" />

        {/* ── Hero copy ────────────────────────────────────────── */}
        <div className="hero-copy">
          <p className="hero-eyebrow" aria-hidden="true">Ford Motor Company</p>
          <h1 className="hero-title">
            <span className="hero-title__ford">Ford</span>
            <span className="hero-title__mustang">Mustang</span>
          </h1>
          <p className="hero-tagline">Born to be remembered.</p>
          <p className="hero-sub">
            An icon of American performance,<br className="hero-sub__br" />
            redesigned for the road ahead.
          </p>
          <a
            href="#design"
            className="hero-cta"
            id="hero-explore-btn"
            aria-label="Explore the Ford Mustang"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('design')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span>Explore Mustang</span>
            <svg
              className="hero-cta__arrow"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* ── Scroll hint ──────────────────────────────────────── */}
        <div className="hero-scroll-hint" aria-label="Scroll to reveal the Mustang">
          <span className="hero-scroll-hint__line" aria-hidden="true" />
          <span className="hero-scroll-hint__text">Scroll to reveal</span>
        </div>
      </div>
    </section>
  );
}
