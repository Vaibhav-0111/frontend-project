import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mustangs } from '../data/mustangData';
import PerformanceSimulator from '../components/PerformanceSimulator/PerformanceSimulator';
import './PerformanceLab.css';

const VIEW_LABELS = { hero: 'HERO', front: 'FRONT', side: 'SIDE', interior: 'INTERIOR' };

// ── Icons (inline SVG so no external dep) ───────────────────────
const Icons = {
  engine:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="8" width="18" height="10" rx="2"/><path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/><path d="M12 12v2"/><path d="M8 12v2"/><path d="M16 12v2"/></svg>,
  horsepower:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  torque:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  transmission: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><circle cx="12" cy="12" r="2"/><path d="M5 7v5l7 0M19 7v5l-7 0M5 17v-2.5M19 17v-2.5M12 14v3"/></svg>,
  drivetrain:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M5 15V8l7-5 7 5v7"/></svg>,
  timer:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9.5 2.5h5M12 2v3"/></svg>,
  speed:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 12m-9 0a9 9 0 1 0 18 0"/><path d="M12 12l4-3"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>,
};

function SpecRow({ icon, label, value, unit, isDemo }) {
  const missing = value === null || value === undefined;
  const display = missing ? (isDemo ? 'Demo' : '—') : `${value}${unit ? ' ' + unit : ''}`;
  return (
    <div className="sp-row">
      <span className="sp-row-icon">{icon}</span>
      <div className="sp-row-body">
        <span className="sp-row-label">{label}</span>
        <span className={`sp-row-value${missing ? ' sp-row-value--null' : ''}`}>{display}</span>
      </div>
    </div>
  );
}

export default function PerformanceLab() {
  const [selectedCar, setSelectedCar] = useState(mustangs[0]);
  const [activeView,  setActiveView]  = useState('hero');
  const [isMuted,     setIsMuted]     = useState(false);

  const views = Object.keys(selectedCar.images);
  const isDemo = !selectedCar.performanceSource;

  return (
    <motion.div 
      className="pl-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >

      {/* ─── LEFT — Car Selector ──────────────────────────────── */}
      <aside className="pl-left">
        <div className="pl-left__header">
          <Link to="/" className="pl-back">← BACK</Link>
          <span className="pl-left__title">SELECT YOUR MUSTANG</span>
        </div>

        <div className="pl-car-list">
          {mustangs.map((car) => {
            const active = car.id === selectedCar.id;
            return (
              <button
                key={car.id}
                className={`pl-car-item${active ? ' pl-car-item--active' : ''}`}
                onClick={() => { setSelectedCar(car); setActiveView('hero'); }}
                aria-pressed={active}
              >
                {active && <span className="pl-car-item__badge" aria-hidden="true">✓</span>}
                <div className="pl-car-item__img">
                  <img src={car.images.side} alt={car.name} loading="lazy" />
                </div>
                <div className="pl-car-item__info">
                  <span className="pl-car-item__year">{car.year}</span>
                  <span className="pl-car-item__name">{car.name}</span>
                  <span className="pl-car-item__trim">{car.trim}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pl-sound-bar">
          <span className="pl-sound-bar__icon">🎧</span>
          <span className="pl-sound-bar__label">ENGINE SOUND</span>
          <button
            className={`pl-sound-toggle${isMuted ? '' : ' pl-sound-toggle--on'}`}
            onClick={() => setIsMuted(m => !m)}
            id="lab-mute-btn"
          >
            {isMuted ? 'OFF' : 'ON'}
          </button>
          {!isMuted && (
            <span className="pl-sound-wave" aria-hidden="true">
              {[1,2,3,4,5].map(i => <span key={i} style={{ animationDelay: `${i * 0.1}s` }} />)}
            </span>
          )}
        </div>
      </aside>

      {/* ─── CENTER — Simulator ────────────────────────────────── */}
      <main className="pl-center">
        {/* Car name + tagline */}
        <div className="pl-center__head">
          <span className="pl-center__year">{selectedCar.year} {selectedCar.name.toUpperCase()}</span>
          <h1 className="pl-center__tagline">FEEL THE POWER.<br />EXPERIENCE THE LEGEND.</h1>
          <div className="pl-center__accent" aria-hidden="true" />
        </div>

        {/* Angle switcher */}
        <div className="pl-view-tabs" role="tablist" aria-label="Car view angle">
          {views.map(v => (
            <button
              key={v}
              role="tab"
              aria-selected={activeView === v}
              className={`pl-view-tab${activeView === v ? ' pl-view-tab--active' : ''}`}
              onClick={() => setActiveView(v)}
            >
              {VIEW_LABELS[v] || v.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Simulator canvas (road + gauges + car) */}
        <div className="pl-simulator-wrap">
          <PerformanceSimulator
            car={selectedCar}
            activeView={activeView}
            isMuted={isMuted}
            externalMute={true}
          />
        </div>
      </main>

      {/* ─── RIGHT — Spec Panel ────────────────────────────────── */}
      <aside className="pl-right">
        <div className="pl-spec-header">
          <span className="pl-spec-year">{selectedCar.year}</span>
          <h2 className="pl-spec-name">{selectedCar.name.toUpperCase()}</h2>
          <span className="pl-spec-trim">{selectedCar.trim.toUpperCase()}</span>
          <div className="pl-spec-divider" />
        </div>

        <section className="pl-spec-section" aria-label="Powertrain">
          <h3 className="pl-spec-section-label">POWERTRAIN</h3>
          <SpecRow icon={Icons.engine}       label="ENGINE"       value={selectedCar.specs.engine} />
          <SpecRow icon={Icons.horsepower}   label="HORSEPOWER"   value={selectedCar.specs.horsepower}  unit="hp" />
          <SpecRow icon={Icons.torque}       label="TORQUE"       value={selectedCar.specs.torqueLbFt}  unit="lb-ft" />
          <SpecRow icon={Icons.transmission} label="TRANSMISSION" value={selectedCar.specs.transmission} />
          <SpecRow icon={Icons.drivetrain}   label="DRIVETRAIN"   value={selectedCar.specs.drivetrain} />
        </section>

        <section className="pl-spec-section" aria-label="Performance">
          <h3 className="pl-spec-section-label">
            PERFORMANCE
            {isDemo && <span className="pl-spec-demo-tag">DEMO</span>}
          </h3>
          <SpecRow icon={Icons.timer} label="0 – 60 MPH"    value={selectedCar.performance.zeroTo60Mph}   unit="s" isDemo={isDemo} />
          <SpecRow icon={Icons.timer} label="0 – 100 KM/H"  value={selectedCar.performance.zeroTo100Kph}  unit="s" isDemo={isDemo} />
          <SpecRow icon={Icons.speed} label="TOP SPEED"      value={selectedCar.performance.topSpeedMph}   unit="mph" isDemo={isDemo} />
        </section>

        {isDemo && (
          <div className="pl-disclaimer">
            <span className="pl-disclaimer-icon">ⓘ</span>
            <p>No verified performance data available. Figures shown are demo simulations only.</p>
          </div>
        )}

        {selectedCar.officialSpecsSource && (
          <p className="pl-source">Specs source: {selectedCar.officialSpecsSource}</p>
        )}
      </aside>
    </motion.div>
  );
}
