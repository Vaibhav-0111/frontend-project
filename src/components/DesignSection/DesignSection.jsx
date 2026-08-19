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
      { threshold: 0.12 }
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
            Every curve, every crease — deliberate.
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

        {/* Visual column — cinematic Mustang photo */}
        <div className="design-section__visual">
          <div className="design-photo-wrap">
            <img
              src="/custom_mustang.png"
              alt="2026 Ford Mustang — sculpted design"
              className="design-photo"
            />
            <div className="design-photo__overlay" aria-hidden="true" />
            <div className="design-photo__accent" aria-hidden="true" />
            <div className="design-photo__label">
              <span>Mustang</span>
              <span>S650 · 2026</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
