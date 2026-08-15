import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './Navbar.css';

/**
 * Navbar — Reusable top navigation bar.
 *
 * Uses NavLink (from React Router) so the active link gets
 * an "active" class automatically without any manual logic.
 *
 * The navbar adds a "scrolled" class when the user scrolls
 * down, which applies a glassmorphism background effect.
 */
function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const location                  = useLocation();
  const navigate                  = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Add class when user scrolls past 20px
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">

        {/* Brand / Logo */}
        <Link to="/" className="navbar__brand" id="nav-brand">
          <span className="navbar__brand-icon">🎟</span>
          <span className="navbar__brand-text">Event Booking Engine</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar__links" aria-label="Main navigation">
          <NavLink to="/" className="navbar__link" id="nav-home" end>Home</NavLink>
          <NavLink to="/events" className="navbar__link" id="nav-events">Events</NavLink>
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className="navbar__link" id="nav-login">Login</NavLink>
              <NavLink to="/register" className="navbar__link" id="nav-register">Register</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className="navbar__link navbar__link--dashboard" id="nav-dashboard">Dashboard</NavLink>
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin" className="navbar__link" id="nav-admin">Admin</NavLink>
              )}
              <button onClick={handleLogout} className="navbar__link" id="nav-logout" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Logout</button>
            </>
          )}
        </nav>

        {/* Hamburger (mobile) */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          id="nav-hamburger"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Drawer */}
      <nav className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`} aria-label="Mobile navigation">
        <NavLink to="/" className="navbar__mobile-link" id="mobile-nav-home" end>Home</NavLink>
        <NavLink to="/events" className="navbar__mobile-link" id="mobile-nav-events">Events</NavLink>
        {!isAuthenticated ? (
          <>
            <NavLink to="/login" className="navbar__mobile-link" id="mobile-nav-login">Login</NavLink>
            <NavLink to="/register" className="navbar__mobile-link" id="mobile-nav-register">Register</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className="navbar__mobile-link" id="mobile-nav-dashboard">Dashboard</NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink to="/admin" className="navbar__mobile-link" id="mobile-nav-admin">Admin</NavLink>
            )}
            <button onClick={handleLogout} className="navbar__mobile-link" id="mobile-nav-logout" style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
