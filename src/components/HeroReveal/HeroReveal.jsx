import { useEffect, useRef, useState } from 'react';
import { useScroll, useSpring, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import './HeroReveal.css';

const mustangVideo = '/landingpage_video.mp4';

export default function HeroReveal({ onVideoReady }) {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const lastUpdateTime = useRef(0);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    const now = performance.now();
    if (now - lastUpdateTime.current < 33) return;

    const targetTime = Math.round((latest * video.duration) * 100) / 100;

    if (Math.abs(video.currentTime - targetTime) > 0.03) {
      lastUpdateTime.current = now;
      video.currentTime = Math.min(targetTime, video.duration - 0.05);
    }
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();

    const onReady = () => {
      setIsReady(true);
      video.currentTime = 0;
      if (onVideoReady) {
        setTimeout(onVideoReady, 1500);
      }
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
      <div className="hero-sticky">
        <div className="hero-grain" aria-hidden="true" />

        {/* Scroll-driven video */}
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

        <div className="hero-vignette" aria-hidden="true" />

        {/* Hero copy */}
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
          <div className="hero-cta-group">
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
            <Link to="/performance" className="hero-cta hero-cta--secondary">
              <span>EXPERIENCE MUSTANG PERFORMANCE →</span>
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll-hint" aria-label="Scroll to reveal the Mustang">
          <span className="hero-scroll-hint__line" aria-hidden="true" />
          <span className="hero-scroll-hint__text">Scroll to reveal</span>
        </div>
      </div>
    </section>
  );
}
