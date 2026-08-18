import './SpecPanel.css';

function SpecRow({ label, value, unit }) {
  const displayValue = value === null || value === undefined ? 'Not specified' : `${value}${unit ? ' ' + unit : ''}`;
  const isMissing = value === null || value === undefined;
  return (
    <div className="spec-row">
      <span className="spec-row-label">{label}</span>
      <span className={`spec-row-value ${isMissing ? 'spec-row-value--null' : ''}`}>
        {displayValue}
      </span>
    </div>
  );
}

export default function SpecPanel({ car }) {
  const { specs, performance, year, name, trim, officialSpecsSource, performanceSource } = car;

  return (
    <div className="spec-panel">
      <div className="spec-panel-header">
        <span className="spec-panel-year">{year}</span>
        <h2 className="spec-panel-name">{name}</h2>
        <span className="spec-panel-trim">{trim}</span>
      </div>

      <div className="spec-panel-section">
        <h3 className="spec-section-heading">POWERTRAIN</h3>
        <SpecRow label="Engine" value={specs.engine} />
        <SpecRow label="Horsepower" value={specs.horsepower} unit="hp" />
        <SpecRow label="Torque" value={specs.torqueLbFt} unit="lb-ft" />
        <SpecRow label="Transmission" value={specs.transmission} />
        <SpecRow label="Drivetrain" value={specs.drivetrain} />
      </div>

      <div className="spec-panel-section">
        <h3 className="spec-section-heading">PERFORMANCE</h3>
        <SpecRow label="0–60 mph" value={performance.zeroTo60Mph} unit="s" />
        <SpecRow label="0–100 km/h" value={performance.zeroTo100Kph} unit="s" />
        <SpecRow label="0–200 km/h" value={performance.zeroTo200Kph} unit="s" />
        <SpecRow label="Top Speed" value={performance.topSpeedMph} unit="mph" />
      </div>

      <div className="spec-panel-sources">
        {officialSpecsSource && (
          <p className="spec-source">Specs: {officialSpecsSource}</p>
        )}
        {performanceSource && (
          <p className="spec-source">Performance: {performanceSource}</p>
        )}
      </div>
    </div>
  );
}
