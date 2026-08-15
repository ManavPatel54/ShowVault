import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

/**
 * Home page — Landing page for the Event Booking Engine.
 *
 * Sections:
 *  1. Hero       — Title, tagline, and CTA buttons
 *  2. Features   — Three feature cards (no real functionality yet)
 *
 * Phase F1: Static placeholder content only.
 */

// Feature card data — easy to extend later
const FEATURES = [
  {
    id: 'feature-booking',
    icon: '🎫',
    title: 'Easy Booking',
    description:
      'Browse events, pick your seats, and confirm your booking in just a few clicks. No friction, no fuss.',
  },
  {
    id: 'feature-payments',
    icon: '🔒',
    title: 'Secure Payments',
    description:
      'Your transactions are encrypted end-to-end. Pay confidently knowing your financial data is protected.',
  },
  {
    id: 'feature-availability',
    icon: '📡',
    title: 'Real-time Availability',
    description:
      'Live seat maps update instantly as others book. You always see accurate, up-to-the-second availability.',
  },
];

function Home() {
  return (
    <main className="home page-wrapper">
      {/* ───────── Hero Section ───────── */}
      <section className="home__hero" aria-labelledby="hero-heading">
        <div className="home__hero-bg" aria-hidden="true" />

        <div className="container home__hero-content">
          <span className="badge badge-primary animate-fade-in-up">Phase F1 — Foundation</span>

          <h1
            id="hero-heading"
            className="home__hero-title animate-fade-in-up delay-100"
          >
            Book Events<br />
            <span className="gradient-text">Seamlessly.</span>
          </h1>

          <p className="home__hero-subtitle animate-fade-in-up delay-200">
            Discover concerts, movies, sports, and more — then book your seats
            in seconds with real-time availability.
          </p>

          <div className="home__hero-actions animate-fade-in-up delay-300">
            <Link to="/dashboard" className="btn btn-primary btn-lg" id="hero-browse-btn">
              Browse Events
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg" id="hero-login-btn">
              Sign In
            </Link>
          </div>

          {/* Decorative stats strip */}
          <div className="home__stats animate-fade-in-up delay-400">
            <div className="home__stat">
              <span className="home__stat-value">10k+</span>
              <span className="home__stat-label">Events Listed</span>
            </div>
            <div className="home__stat-divider" aria-hidden="true" />
            <div className="home__stat">
              <span className="home__stat-value">500k+</span>
              <span className="home__stat-label">Tickets Sold</span>
            </div>
            <div className="home__stat-divider" aria-hidden="true" />
            <div className="home__stat">
              <span className="home__stat-value">99.9%</span>
              <span className="home__stat-label">Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Features Section ───────── */}
      <section className="home__features" aria-labelledby="features-heading">
        <div className="container">
          <div className="home__features-header">
            <h2 id="features-heading" className="section-title">
              Why choose us?
            </h2>
            <p className="section-subtitle">
              Everything you need to discover and attend amazing events.
            </p>
          </div>

          <div className="home__features-grid">
            {FEATURES.map((feature, index) => (
              <article
                key={feature.id}
                id={feature.id}
                className={`home__feature-card card animate-fade-in-up delay-${(index + 1) * 100}`}
              >
                <div className="home__feature-icon" aria-hidden="true">
                  {feature.icon}
                </div>
                <h3 className="home__feature-title">{feature.title}</h3>
                <p className="home__feature-desc">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CTA Banner ───────── */}
      <section className="home__cta-banner" aria-labelledby="cta-heading">
        <div className="container home__cta-inner">
          <h2 id="cta-heading" className="home__cta-title">
            Ready to get started?
          </h2>
          <p className="home__cta-subtitle">
            Create a free account and book your first event today.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg" id="cta-register-btn">
            Create Free Account
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
