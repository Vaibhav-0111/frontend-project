import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        {/* Top row */}
        <div className="footer__top">
          <div className="footer__brand">
            <p className="footer__brand-name">MUSTANG</p>
            <p className="footer__brand-tagline">Born to be remembered.</p>
            <Link to="/performance" className="footer__cta">
              EXPERIENCE PERFORMANCE →
            </Link>
          </div>

          <nav className="footer__nav" aria-label="Footer navigation">
            <div className="footer__nav-group">
              <p className="footer__nav-label">Explore</p>
              <ul role="list">
                <li>
                  <button className="footer__link" onClick={() => document.getElementById('design')?.scrollIntoView({ behavior: 'smooth' })}>Design</button>
                </li>
                <li>
                  <button className="footer__link" onClick={() => document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth' })}>Performance</button>
                </li>
                <li>
                  <button className="footer__link" onClick={() => document.getElementById('interior')?.scrollIntoView({ behavior: 'smooth' })}>Interior</button>
                </li>
              </ul>
            </div>
            <div className="footer__nav-group">
              <p className="footer__nav-label">Connect</p>
              <ul role="list">
                <li><a className="footer__link" href="https://www.ford.com/cars/mustang/" target="_blank" rel="noopener noreferrer">Ford.com</a></li>
                <li><a className="footer__link" href="https://twitter.com/ford" target="_blank" rel="noopener noreferrer">Twitter / X</a></li>
                <li><a className="footer__link" href="https://www.instagram.com/ford/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Divider */}
        <div className="footer__divider" aria-hidden="true" />

        {/* Bottom row */}
        <div className="footer__bottom">
          <p className="footer__legal">
            © {year} Ford Motor Company. Ford Mustang is a registered trademark.
            This is a concept design project — not an official Ford communication.
          </p>
          <p className="footer__credits">
            Concept design — for portfolio purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
