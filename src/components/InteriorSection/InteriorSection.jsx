import './InteriorSection.css';

export default function InteriorSection() {
  return (
    <section id="interior" className="interior-section" aria-labelledby="interior-heading">
      <div className="interior-section__inner">
        {/* ── Visual Side ────────────────────────────────────── */}
        <div className="interior-section__visual" aria-hidden="true">
          <div className="interior-card">
            <div className="interior-card__bg" />
            {/* Dashboard graphic */}
            <svg
              className="interior-card__dash"
              viewBox="0 0 560 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Dashboard panel */}
              <rect x="0" y="80" width="560" height="200" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

              {/* Steering wheel */}
              <circle cx="140" cy="240" r="55" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
              <circle cx="140" cy="240" r="30" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="none" />
              <circle cx="140" cy="240" r="6" fill="rgba(255,255,255,0.2)" />
              {/* spokes */}
              <line x1="140" y1="185" x2="140" y2="210" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round" />
              <line x1="140" y1="270" x2="140" y2="295" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round" />
              <line x1="85" y1="240" x2="110" y2="240" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round" />
              <line x1="170" y1="240" x2="195" y2="240" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinecap="round" />

              {/* Digital instrument cluster */}
              <rect x="210" y="100" width="200" height="100" rx="6"
                fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              {/* Tachometer arc */}
              <path d="M 255 195 A 55 55 0 0 1 365 195"
                stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" strokeLinecap="round" />
              <path d="M 255 195 A 55 55 0 0 1 320 142"
                stroke="rgba(192,57,43,0.5)" strokeWidth="8" fill="none" strokeLinecap="round" />
              {/* Speed readout */}
              <text x="310" y="180" textAnchor="middle" fontFamily="monospace" fontSize="22"
                fill="rgba(255,255,255,0.8)">—</text>
              <text x="310" y="198" textAnchor="middle" fontFamily="monospace" fontSize="9"
                fill="rgba(255,255,255,0.25)" letterSpacing="3">ENGINE</text>

              {/* Center infotainment screen */}
              <rect x="240" y="210" width="160" height="90" rx="4"
                fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
              {/* Screen glow */}
              <rect x="242" y="212" width="156" height="86" rx="3"
                fill="rgba(20,40,60,0.3)" />
              <line x1="280" y1="230" x2="360" y2="230" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="260" y1="248" x2="380" y2="248" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <circle cx="261" cy="270" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
              <circle cx="285" cy="270" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />

              {/* Gear selector */}
              <rect x="430" y="220" width="24" height="60" rx="12"
                fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <circle cx="442" cy="235" r="6" fill="rgba(255,255,255,0.15)" />
              <text x="442" y="262" textAnchor="middle" fontFamily="monospace" fontSize="7"
                fill="rgba(255,255,255,0.2)">D</text>

              {/* Accent line at bottom */}
              <line x1="0" y1="279" x2="560" y2="279"
                stroke="rgba(192,57,43,0.25)" strokeWidth="0.75" />
            </svg>

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
