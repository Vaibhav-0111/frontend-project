import { useEffect, useRef, useCallback } from 'react';
import './HeroReveal.css';

const mustangVideo = '/fd254ffc-503e-438e-86ee-da85ecd269f9.mp4';

export default function HeroReveal() {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const rafRef = useRef(null);
  const lastProgressRef = useRef(-1);
  const isReadyRef = useRef(false);

  /* ── Scroll → currentTime mapping ─────────────────────────── */
  const updateVideo = useCallback(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section || !isReadyRef.current) return;

    const { top, height } = section.getBoundingClientRect();
    const viewH = window.innerHeight;

    // Progress 0 when section top is at viewport top
    // Progress 1 when section bottom aligns with viewport bottom
    const scrollable = height - viewH;
    if (scrollable <= 0) return;

    const raw = -top;                      // px scrolled into section
    const progress = Math.min(1, Math.max(0, raw / scrollable));

    // Avoid redundant seeks — only update when changed meaningfully
    if (Math.abs(progress - lastProgressRef.current) < 0.0005) return;
    lastProgressRef.current = progress;

    const targetTime = progress * video.duration;
    // Clamp to valid range
    video.currentTime = Math.min(targetTime, video.duration - 0.001);
  }, []);

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateVideo);
  }, [updateVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    /* Necessary for iOS/Safari seek-without-play */
    video.load();

    const onReady = () => {
      isReadyRef.current = true;
      updateVideo(); // set initial frame
    };

    video.addEventListener('loadedmetadata', onReady);
    // If already loaded (cached)
    if (video.readyState >= 1) onReady();

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      video.removeEventListener('loadedmetadata', onReady);
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll, updateVideo]);

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
