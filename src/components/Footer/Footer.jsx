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
          </div>

          <nav className="footer__nav" aria-label="Footer navigation">
            <ul role="list">
              <li>
                <button
                  className="footer__link"
                  onClick={() =>
                    document.getElementById('design')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Design
                </button>
              </li>
              <li>
                <button
                  className="footer__link"
                  onClick={() =>
                    document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Performance
                </button>
              </li>
              <li>
                <button
                  className="footer__link"
                  onClick={() =>
                    document.getElementById('interior')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Interior
                </button>
              </li>
            </ul>
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
