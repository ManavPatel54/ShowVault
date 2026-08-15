import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './Auth.css';

/**
 * Register page — Phase F2.
 *
 * Connects to the backend via AuthContext.
 */
function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await register({ name, email, password });
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth page-wrapper" aria-labelledby="register-heading">
      <div className="auth__bg" aria-hidden="true" />

      <div className="container auth__container">
        <div className="auth__card card-glass">

          {/* Header */}
          <div className="auth__header">
            <span className="auth__icon" aria-hidden="true">✨</span>
            <h1 id="register-heading" className="auth__title">Create account</h1>
            <p className="auth__subtitle">Join thousands of event-goers today</p>
          </div>

          {error && (
            <div style={{ color: 'var(--color-error)', backgroundColor: 'rgba(255, 101, 132, 0.1)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="auth__form" id="register-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                className="form-input"
                placeholder="Jane Smith"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                Email address
              </label>
              <input
                id="register-email"
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
              <label className="form-label" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                className="form-input"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">
                Confirm password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                className="form-input"
                placeholder="Repeat your password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="divider" />

          {/* Footer link */}
          <p className="auth__footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth__link" id="register-to-login-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;
