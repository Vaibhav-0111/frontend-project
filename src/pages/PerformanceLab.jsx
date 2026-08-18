import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mustangs } from '../data/mustangData';
import MustangCatalog from '../components/MustangCatalog/MustangCatalog';
import PerformanceSimulator from '../components/PerformanceSimulator/PerformanceSimulator';
import SpecPanel from '../components/SpecPanel/SpecPanel';
import './PerformanceLab.css';

export default function PerformanceLab() {
  const [selectedCar, setSelectedCar] = useState(mustangs[0]);

  // Lock body scroll horizontally specifically for this page
  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflowX = '';
    };
  }, []);

  return (
    <div className="performance-lab">
      <header className="lab-header">
        <Link to="/" className="lab-back-link">
          ← BACK TO SHOWROOM
        </Link>
        <h1 className="lab-title">PERFORMANCE LAB</h1>
      </header>

      <div className="lab-grid">
        <aside className="lab-catalog-col">
          <MustangCatalog 
            mustangs={mustangs} 
            selectedCar={selectedCar} 
            onSelect={setSelectedCar} 
          />
        </aside>

        <main className="lab-simulator-col">
          <PerformanceSimulator car={selectedCar} />
        </main>

        <aside className="lab-specs-col">
          <SpecPanel car={selectedCar} />
        </aside>
      </div>
    </div>
  );
}
