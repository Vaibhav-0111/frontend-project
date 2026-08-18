import { useEffect, useRef, useState } from 'react';
import './InteriorSection.css';

export default function InteriorSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="interior" className="interior-section" aria-labelledby="interior-heading">
      <div className={`interior-section__inner ${isVisible ? 'is-visible' : ''}`}>
        {/* ── Visual Side ────────────────────────────────────── */}
        <div className="interior-section__visual" aria-hidden="true">
          <div className="interior-card">
            <div className="interior-card__bg" />
            <img 
              src="/interior.jpg" 
              alt="Mustang Interior" 
              className="interior-card__image" 
            />
            
            <div className="interior-card__label">
              <span>Interior</span>
              <span>Driver-First Design</span>
            </div>
          </div>
        </div>

        {/* ── Text Side ──────────────────────────────────────── */}
        <div className="interior-section__text">
          <p className="interior-section__label" aria-hidden="true">03 — Interior</p>
          <h2 id="interior-heading" className="interior-section__headline">
            The Driver<br />Comes First.
          </h2>
          <p className="interior-section__body">
            From the moment you sit down, the Mustang's cockpit orients itself around you.
            Every control, every display, every stitch in the seat — placed for the person
            behind the wheel.
          </p>

          <div className="interior-section__points">
            <div className="interior-point">
              <div className="interior-point__dot" aria-hidden="true" />
              <div>
                <h4 className="interior-point__title">12.4" Digital Instrument Cluster</h4>
                <p className="interior-point__body">
                  A fully configurable display centered directly in the driver's line of sight.
                </p>
              </div>
            </div>
            <div className="interior-point">
              <div className="interior-point__dot" aria-hidden="true" />
              <div>
                <h4 className="interior-point__title">13.2" SYNC® 4 Touchscreen</h4>
                <p className="interior-point__body">
                  Landscape infotainment with wireless connectivity and an intuitive interface.
                </p>
              </div>
            </div>
            <div className="interior-point">
              <div className="interior-point__dot" aria-hidden="true" />
              <div>
                <h4 className="interior-point__title">Drive Mode Selector</h4>
                <p className="interior-point__body">
                  Normal, Sport+, Track, Drag, and Snow/Wet — character on demand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
