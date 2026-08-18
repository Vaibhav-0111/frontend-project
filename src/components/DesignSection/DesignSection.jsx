import { useEffect, useRef, useState } from 'react';
import './DesignSection.css';

export default function DesignSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="design" className="design-section" aria-labelledby="design-heading">
      {/* Section label */}
      <div className="design-section__label" aria-hidden="true">01 — Design</div>

      <div className={`design-section__inner ${isVisible ? 'is-visible' : ''}`}>
        {/* Text column */}
        <div className="design-section__text">
          <h2 id="design-heading" className="design-section__headline">
            Sculpted to<br />Command<br />Attention.
          </h2>
          <p className="design-section__body">
            Every curve, every crease — deliberate. The Mustang's silhouette has always
            announced itself before the engine does. Long hood, wide haunches, and a fastback
            roofline that flatters every angle.
          </p>
          <p className="design-section__body">
            The seventh generation refines what generations before it established.
            Sharper headlights. A lower, wider stance. Tri-bar LEDs that are unmistakably Mustang.
          </p>
          <ul className="design-section__details" aria-label="Design highlights">
            <li>
              <span className="design-section__detail-label">Signature</span>
              <span className="design-section__detail-value">Tri-bar LED lighting</span>
            </li>
            <li>
              <span className="design-section__detail-label">Profile</span>
              <span className="design-section__detail-value">Fastback silhouette</span>
            </li>
            <li>
              <span className="design-section__detail-label">Stance</span>
              <span className="design-section__detail-value">Wider. Lower. Bolder.</span>
            </li>
          </ul>
        </div>

        {/* Visual column */}
        <div className="design-section__visual">
          {/* Abstract design card with gradient */}
          <div className="design-card" aria-hidden="true">
            <div className="design-card__bg" />
            <div className="design-card__lines">
              {/* Decorative silhouette lines */}
              <svg
                className="design-card__svg"
                viewBox="0 0 600 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Mustang body outline - simplified artistic silhouette */}
                <path
                  d="M30 210 C60 210 80 200 100 190 C130 175 160 168 200 165
                     C230 163 260 155 300 150 C340 145 380 140 420 142
                     C460 144 490 148 510 155 C530 160 545 168 555 175
                     C560 178 562 182 560 185 C555 190 545 192 530 193
                     C520 194 510 193 500 193 L100 193 C85 193 60 200 40 210 Z"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                  fill="none"
                />
                {/* Hood line */}
                <path
                  d="M30 210 C40 190, 60 175, 90 165 C120 155, 160 148, 200 145"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Roofline */}
                <path
                  d="M200 145 C240 140, 300 132, 370 140 C410 145, 450 155, 480 165"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Front wheel arch */}
                <circle cx="130" cy="200" r="28" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
                <circle cx="130" cy="200" r="18" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
                {/* Rear wheel arch */}
                <circle cx="430" cy="200" r="28" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
                <circle cx="430" cy="200" r="18" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
                {/* Speed accent line */}
                <line x1="0" y1="180" x2="600" y2="180" stroke="rgba(192,57,43,0.2)" strokeWidth="0.5" />
              </svg>
            </div>
            <div className="design-card__accent" />
            <div className="design-card__label">
              <span>Mustang</span>
              <span>S650 · 2025</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
