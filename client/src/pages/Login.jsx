import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './Auth.css';

/**
 * Login page — Phase F2.
 *
 * Connects to the backend via AuthContext.
 */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login({ email, password });
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth page-wrapper" aria-labelledby="login-heading">
      <div className="auth__bg" aria-hidden="true" />

      <div className="container auth__container">
        <div className="auth__card card-glass">

          {/* Header */}
          <div className="auth__header">
            <span className="auth__icon" aria-hidden="true">🎟</span>
            <h1 id="login-heading" className="auth__title">Welcome back</h1>
            <p className="auth__subtitle">Sign in to your account to continue</p>
          </div>

          {error && (
            <div style={{ color: 'var(--color-error)', backgroundColor: 'rgba(255, 101, 132, 0.1)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="auth__form" id="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="divider" />

          {/* Footer link */}
          <p className="auth__footer-text">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="auth__link" id="login-to-register-link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
