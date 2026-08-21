import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBooking } from '../services/booking.service';
import { processPayment } from '../services/payment.service';
import useAuth from '../hooks/useAuth';
import './Payment.css';

/**
 * Payment.jsx — Phase 5
 *
 * Displays booking summary and provides two payment simulation buttons.
 *
 * Idempotency key:
 *   Generated once using crypto.randomUUID() and stored in a useRef.
 *   This guarantees:
 *     - The same key is reused if the user clicks a button twice (double-click safe).
 *     - A re-render never regenerates the key mid-attempt.
 *     - A new key is only created when this component mounts (i.e. a new payment attempt).
 */
const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null); // 'success' | 'failed'

  // Generate idempotency key once per component mount (once per payment attempt)
  const idempotencyKeyRef = useRef(crypto.randomUUID());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchBooking = async () => {
      try {
        const res = await getBooking(bookingId);
        if (res.success) {
          setBooking(res.data);
        } else {
          setError('Failed to load booking details.');
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Access denied: this booking does not belong to you.');
        } else if (err.response?.status === 404) {
          setError('Booking not found.');
        } else {
          setError(err.response?.data?.message || 'Failed to load booking.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, isAuthenticated, navigate]);

  const handlePayment = async (result) => {
    if (processing) return; // Prevent concurrent clicks
    setProcessing(true);
    setError('');

    try {
      // Always use the same idempotencyKey for this payment attempt
      const res = await processPayment(bookingId, result, idempotencyKeyRef.current);

      if (res.success) {
        if (result === 'SUCCESS') {
          setPaymentResult('success');
          // Navigate to confirmation page after short delay for animation
          setTimeout(() => {
            navigate(`/booking-confirmation/${bookingId}`);
          }, 1200);
        } else {
          setPaymentResult('failed');
        }
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setError(err.response.data?.message || 'Booking is no longer available.');
      } else if (status === 403) {
        setError('Access denied.');
      } else {
        setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  // ── Render states ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="payment-page page-wrapper">
        <div className="payment-loading">
          <div className="payment-spinner" />
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="payment-page page-wrapper">
        <div className="payment-error-card">
          <span className="payment-error-icon">⚠️</span>
          <h2>Unable to Load Booking</h2>
          <p>{error}</p>
          <button className="btn btn-outline" onClick={() => navigate('/events')}>
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const show = booking?.show;
  const event = show?.event;
  const seats = booking?.showSeats || [];

  return (
    <div className="payment-page page-wrapper">
      <div className="container payment-container">

        {/* Header */}
        <div className="payment-header animate-fade-in-up">
          <div className="payment-step-badge">Step 2 of 2</div>
          <h1 className="payment-title">Complete Your Payment</h1>
          <p className="payment-subtitle">Review your order and simulate payment below</p>
        </div>

        <div className="payment-layout">

          {/* Left: Order Summary */}
          <div className="payment-summary-card animate-fade-in-up delay-100">
            <h2 className="payment-section-title">
              <span className="payment-section-icon">🎟️</span>
              Order Summary
            </h2>

            {/* Event info */}
            <div className="payment-event-info">
              <div className="payment-event-name">{event?.title || 'Loading...'}</div>
              <div className="payment-event-meta">
                <span className="payment-meta-chip">{event?.category}</span>
                {event?.language && <span className="payment-meta-chip">{event?.language}</span>}
              </div>
              <div className="payment-show-time">
                📅 {show?.startTime
                  ? new Date(show.startTime).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })
                  : '—'}
              </div>
              {show?.screen && (
                <div className="payment-screen">🎬 {show.screen.name}</div>
              )}
            </div>

            <div className="payment-divider" />

            {/* Seats */}
            <div className="payment-seats-section">
              <h3 className="payment-seats-title">Selected Seats ({seats.length})</h3>
              <div className="payment-seats-grid">
                {seats.map((ss) => (
                  <div key={ss._id} className="payment-seat-chip">
                    <span className="payment-seat-label">
                      {ss.seat?.rowLabel}{ss.seat?.seatNumber}
                    </span>
                    <span className="payment-seat-type">{ss.seat?.seatType}</span>
                    <span className="payment-seat-price">₹{ss.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="payment-divider" />

            {/* Total */}
            <div className="payment-total-row">
              <span className="payment-total-label">Total Amount</span>
              <span className="payment-total-amount">₹{booking?.totalAmount}</span>
            </div>

            {/* Booking ID */}
            <div className="payment-booking-id">
              Booking ID: <code>{booking?._id}</code>
            </div>
          </div>

          {/* Right: Payment Actions */}
          <div className="payment-actions-card animate-fade-in-up delay-200">
            <h2 className="payment-section-title">
              <span className="payment-section-icon">💳</span>
              Payment Simulation
            </h2>

            <div className="payment-simulator-notice">
              <span>🔬</span>
              <p>This is a <strong>development simulator</strong>. Choose the outcome you want to test.</p>
            </div>

            {/* Result states */}
            {paymentResult === 'success' && (
              <div className="payment-result payment-result--success">
                <span className="payment-result-icon">✅</span>
                <div>
                  <strong>Payment Successful!</strong>
                  <p>Redirecting to confirmation...</p>
                </div>
              </div>
            )}

            {paymentResult === 'failed' && (
              <div className="payment-result payment-result--failed">
                <span className="payment-result-icon">❌</span>
                <div>
                  <strong>Payment Failed</strong>
                  <p>Your seat hold has been released. The seats are now available for others.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="payment-result payment-result--error">
                <span className="payment-result-icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {/* Show buttons only if no terminal result yet */}
            {!paymentResult && (
              <div className="payment-buttons">
                <button
                  id="btn-pay-success"
                  className="payment-btn payment-btn--success"
                  onClick={() => handlePayment('SUCCESS')}
                  disabled={processing}
                >
                  {processing ? (
                    <span className="payment-btn-spinner" />
                  ) : (
                    <span>✅</span>
                  )}
                  Simulate Successful Payment
                </button>

                <button
                  id="btn-pay-fail"
                  className="payment-btn payment-btn--fail"
                  onClick={() => handlePayment('FAILED')}
                  disabled={processing}
                >
                  {processing ? (
                    <span className="payment-btn-spinner" />
                  ) : (
                    <span>❌</span>
                  )}
                  Simulate Failed Payment
                </button>
              </div>
            )}

            {/* Back to Dashboard after failure */}
            {paymentResult === 'failed' && (
              <div className="payment-failure-actions">
                <button className="btn btn-outline" onClick={() => navigate('/events')}>
                  Browse More Events
                </button>
                <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </button>
              </div>
            )}

            {/* Security note */}
            <div className="payment-security-note">
              <span>🔒</span>
              <span>Idempotency-Key ensures no duplicate payments on retry</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
