import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './Dashboard.css';

/**
 * Dashboard page — Phase F2.
 *
 * Shows real user data from context and includes a logout button.
 */

// Placeholder booking statistics
const STATS = [
  { id: 'stat-total',    icon: '🎫', label: 'Total Bookings',    value: '—'    },
  { id: 'stat-upcoming', icon: '📅', label: 'Upcoming Events',   value: '—'    },
  { id: 'stat-spent',    icon: '💳', label: 'Amount Spent',      value: '—'    },
  { id: 'stat-saved',    icon: '❤️', label: 'Saved Events',      value: '—'    },
];

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <main className="dashboard page-wrapper" aria-labelledby="dashboard-heading">
      <div className="dashboard__bg" aria-hidden="true" />

      <div className="container dashboard__container">

        {/* Phase Notice Banner */}
        <div className="dashboard__phase-notice animate-fade-in-up" role="status">
          <span>🚧</span>
          <span>
            <strong>Phase F2 — Authentication connected.</strong> Displaying actual user data.
            Other features (stats, bookings) are coming in later phases.
          </span>
        </div>

        {/* Welcome Header */}
        <header className="dashboard__header animate-fade-in-up delay-100">
          <div className="dashboard__user-info" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
              <div className="dashboard__avatar" aria-label="User avatar">
                <span>👤</span>
              </div>
              <div>
                <h1 id="dashboard-heading" className="dashboard__welcome">
                  Welcome, {user?.name || 'User'}
                </h1>
                <p className="dashboard__username">
                  <span className="badge badge-primary">{user?.role || 'Guest'}</span>
                  &nbsp; {user?.email}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-outline" id="dashboard-logout-btn">
              Logout
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="dashboard__stats-section" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="dashboard__section-title">
            Booking Statistics
          </h2>
          <div className="dashboard__stats-grid">
            {STATS.map((stat, index) => (
              <div
                key={stat.id}
                id={stat.id}
                className={`dashboard__stat-card card animate-fade-in-up delay-${(index + 1) * 100}`}
              >
                <span className="dashboard__stat-icon" aria-hidden="true">{stat.icon}</span>
                <span className="dashboard__stat-value">{stat.value}</span>
                <span className="dashboard__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Placeholder User Card */}
        <section className="dashboard__user-card-section" aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="dashboard__section-title">
            My Profile
          </h2>
          <div className="dashboard__user-card card animate-fade-in-up delay-200">
            <div className="dashboard__user-card-avatar" aria-hidden="true">👤</div>
            <div className="dashboard__user-card-info">
              <div className="dashboard__field">
                <span className="dashboard__field-label">Name</span>
                <span className="dashboard__field-value">
                  {user?.name}
                </span>
              </div>
              <div className="dashboard__field">
                <span className="dashboard__field-label">Email</span>
                <span className="dashboard__field-value">
                  {user?.email}
                </span>
              </div>
              <div className="dashboard__field">
                <span className="dashboard__field-label">Member since</span>
                <span className="dashboard__field-value dashboard__field-value--placeholder">
                  Will be loaded from backend
                </span>
              </div>
              <div className="dashboard__field">
                <span className="dashboard__field-label">Role</span>
                <span className="badge badge-success">{user?.role}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Placeholder Recent Bookings */}
        <section className="dashboard__bookings-section" aria-labelledby="bookings-heading">
          <h2 id="bookings-heading" className="dashboard__section-title">
            Recent Bookings
          </h2>
          <div className="dashboard__empty-state card animate-fade-in-up delay-300">
            <span className="dashboard__empty-icon" aria-hidden="true">📋</span>
            <p className="dashboard__empty-title">No bookings yet</p>
            <p className="dashboard__empty-desc">
              Your booking history will appear here once authentication is integrated.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}

export default Dashboard;
