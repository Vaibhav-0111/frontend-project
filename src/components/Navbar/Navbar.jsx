import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} role="banner">
      <nav className="navbar__inner" aria-label="Main navigation">
        {/* Logo / Brand */}
        <a href="#hero" className="navbar__brand" aria-label="Ford Mustang — return to top">
          <span className="navbar__brand-icon" aria-hidden="true">
            <svg width="28" height="18" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Stylised mustang galloping silhouette */}
              <path
                d="M2 14 C4 10, 8 8, 12 8 C14 8, 16 7, 17 5 C18 3, 20 2, 22 3 C24 4, 26 6, 25 9 C24 11, 21 12, 19 13 C16 14, 12 15, 8 16 C5 16.5, 2 16, 2 14Z"
                fill="white"
                opacity="0.9"
              />
              <circle cx="22" cy="3" r="1.5" fill="white" opacity="0.7" />
            </svg>
          </span>
          <span className="navbar__brand-name">MUSTANG</span>
        </a>

        {/* Desktop Nav Links */}
        <ul className="navbar__links" role="list">
          <li>
            <button
              className="navbar__link"
              onClick={() => handleNavClick('design')}
              aria-label="Go to Design section"
            >
              Design
            </button>
          </li>
          <li>
            <button
              className="navbar__link"
              onClick={() => handleNavClick('performance')}
              aria-label="Go to Performance section"
            >
              Performance
            </button>
          </li>
          <li>
            <button
              className="navbar__link"
              onClick={() => handleNavClick('interior')}
              aria-label="Go to Interior section"
            >
              Interior
            </button>
          </li>
        </ul>

        {/* Desktop CTA */}
        <a
          href="#design"
          className="navbar__cta"
          aria-label="Explore the Mustang"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('design');
          }}
        >
          Explore
        </a>

        {/* Mobile Hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`navbar__mobile${menuOpen ? ' navbar__mobile--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <ul role="list">
          {['design', 'performance', 'interior'].map((section) => (
            <li key={section}>
              <button
                className="navbar__mobile-link"
                onClick={() => handleNavClick(section)}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            </li>
          ))}
        </ul>
        <button
          className="navbar__mobile-cta"
          onClick={() => handleNavClick('design')}
        >
          Explore Mustang
        </button>
      </div>
    </header>
  );
}
