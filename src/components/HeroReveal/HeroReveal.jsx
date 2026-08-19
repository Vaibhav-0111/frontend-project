import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './HeroReveal.css';

const mustangImg = '/custom_mustang.png';

export default function HeroReveal() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // Cinematic zoom and fade
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.1, 1]);

  return (
    <section
      ref={sectionRef}
      className="hero-scroll"
      id="hero"
      aria-label="Ford Mustang hero reveal"
    >
      <div className="hero-sticky">
        
        {/* Cinematic Mustang Image */}
        <motion.img
          className="hero-car-img"
          src={mustangImg}
          alt="Ford Mustang"
          style={{ scale, opacity }}
        />

        {/* Ambient vignette overlay */}
        <div className="hero-vignette" aria-hidden="true" />

        {/* Machine info layer */}
        <div className="hero-machine-info">
          5.0L V8<br/>
          480 HP<br/>
          <hr className="hero-machine-info__hr" />
          PURE PERFORMANCE
        </div>

        {/* Hero copy */}
        <div className="hero-copy">
          <h1 className="hero-title">
            <span className="hero-title__eyebrow">01 — DESIGN</span>
            <span className="hero-title__mustang">SCULPTED TO<br/>COMMAND<br/>ATTENTION.</span>
          </h1>
          <p className="hero-sub">
            Every curve, every crease — deliberate.<br/>
            The Mustang's silhouette announces itself<br/>
            before the engine does.
          </p>
          <div className="hero-cta-group">
            <Link to="/performance" className="hero-cta">
              <span>EXPERIENCE PERFORMANCE →</span>
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll-hint" aria-label="Scroll to explore">
          <span className="hero-scroll-hint__line" aria-hidden="true" />
          <span className="hero-scroll-hint__text">SCROLL TO EXPLORE</span>
        </div>
      </div>
    </section>
  );
}
