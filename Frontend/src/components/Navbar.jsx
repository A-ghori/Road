import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/map', label: 'Map' },
    { path: '/report/upload', label: 'Report' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 50;
          font-family: 'Outfit', sans-serif;
          transition: all 0.3s ease;
        }

        .navbar-inner {
          background: rgba(10, 14, 26, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: ${scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none'};
          transition: box-shadow 0.3s ease;
        }

        .navbar-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo */
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.4);
          transition: box-shadow 0.3s;
        }

        .logo-icon:hover {
          box-shadow: 0 0 24px rgba(99, 102, 241, 0.6);
        }

        .logo-text {
          font-size: 1.2rem;
          font-weight: 700;
          background: linear-gradient(90deg, #60a5fa, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.02em;
        }

        /* Nav links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          position: relative;
          padding: 8px 14px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.55);
          transition: color 0.2s ease, background 0.2s ease;
          letter-spacing: 0.01em;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 60%;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #818cf8);
          border-radius: 2px;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nav-link:hover {
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.06);
        }

        .nav-link.active {
          color: #fff;
          background: rgba(59, 130, 246, 0.12);
        }

        .nav-link.active::after {
          transform: translateX(-50%) scaleX(1);
        }

        /* Authority button */
        .authority-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 8px;
          text-decoration: none;
          color: #fff;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          border: none;
          cursor: pointer;
          margin-left: 8px;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(99, 102, 241, 0.3);
        }

        .authority-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.45);
        }

        .authority-btn:active {
          transform: translateY(0);
        }

        /* Mobile hamburger */
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 4px;
        }

        .hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: rgba(255,255,255,0.7);
          border-radius: 2px;
          transition: all 0.3s;
        }

        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Mobile menu */
        .mobile-menu {
          display: none;
          background: rgba(10, 14, 26, 0.95);
          backdrop-filter: blur(16px);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 1rem 1.5rem;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-menu.open { display: flex; }

        .mobile-link {
          padding: 10px 14px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          transition: background 0.2s, color 0.2s;
        }

        .mobile-link:hover, .mobile-link.active {
          background: rgba(59,130,246,0.12);
          color: #fff;
        }

        .mobile-authority {
          margin-top: 8px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .nav-links, .authority-btn { display: none; }
          .hamburger { display: flex; }
        }
      `}</style>

      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-container">

            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <div className="logo-icon">🛣️</div>
              <span className="logo-text">Road Analysis</span>
            </Link>

            {/* Desktop Links */}
            <ul className="nav-links">
              {navLinks.map(({ path, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Authority Button (desktop) */}
            <Link to="/authority/login" className="authority-btn">
              🔐 Authority
            </Link>

            {/* Mobile Hamburger */}
            <button
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>

          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`mobile-link ${location.pathname === path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="mobile-authority">
            <Link
              to="/authority/login"
              className="authority-btn"
              onClick={() => setMenuOpen(false)}
            >
              🔐 Authority
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;