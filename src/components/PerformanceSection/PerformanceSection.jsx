import './PerformanceSection.css';

const FEATURES = [
  {
    id: 'engineering',
    number: '01',
    title: 'Performance-Focused Engineering',
    body:
      "The Mustang is built around driver engagement — not just straight-line speed. Every system, from the suspension geometry to the steering calibration, is tuned to make the driver feel connected to the road.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
        <line x1="16" y1="4" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="28" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="12" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'cockpit',
    number: '02',
    title: 'Driver-Centered Cockpit',
    body:
      "Sit down. Notice how everything angles toward you — the gauges, the controls, the display. The Mustang's interior was designed with a single principle: the driver is the priority.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="4" y="10" width="24" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <rect x="8" y="14" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <circle cx="22" cy="17" r="3" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="8" y1="7" x2="24" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: 'identity',
    number: '03',
    title: 'Iconic Mustang Identity',
    body:
      "Sixty years of recognition. The tri-bar tail lights. The running-pony grille badge. The fastback roofline. These aren't design choices — they're commitments to an identity that has outlasted trends.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M16 4 L19 13 L29 13 L21 19 L24 28 L16 22 L8 28 L11 19 L3 13 L13 13 Z"
          stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.7" />
        <path d="M16 8 L18.5 14.5 L25 14.5 L20 18.5 L22 25 L16 21 L10 25 L12 18.5 L7 14.5 L13.5 14.5 Z"
          fill="currentColor" opacity="0.12" />
      </svg>
    ),
  },
];

export default function PerformanceSection() {
  return (
    <section id="performance" className="perf-section" aria-labelledby="perf-heading">
      <div className="perf-section__inner">
        {/* Header */}
        <div className="perf-section__header">
          <p className="perf-section__label" aria-hidden="true">02 — Performance</p>
          <h2 id="perf-heading" className="perf-section__headline">
            Built for<br />the Drive.
          </h2>
          <p className="perf-section__subline">
            The Mustang was never just transportation. It was always a reason to drive.
          </p>
        </div>

        {/* Cards grid — ONE micro-interaction: hover lift */}
        <div className="perf-cards" role="list">
          {FEATURES.map((feat) => (
            <article
              key={feat.id}
              className="perf-card"
              id={`perf-card-${feat.id}`}
              role="listitem"
              aria-label={feat.title}
            >
              <div className="perf-card__inner">
                <div className="perf-card__top">
                  <span className="perf-card__number" aria-hidden="true">{feat.number}</span>
                  <span className="perf-card__icon">{feat.icon}</span>
                </div>
                <h3 className="perf-card__title">{feat.title}</h3>
                <p className="perf-card__body">{feat.body}</p>
                <div className="perf-card__bar" aria-hidden="true" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
