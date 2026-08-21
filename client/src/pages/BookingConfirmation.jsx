import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBooking } from '../services/booking.service';
import useAuth from '../hooks/useAuth';
import './BookingConfirmation.css';

/**
 * BookingConfirmation.jsx — Phase 5
 *
 * Displays booking confirmation details after a successful payment.
 * Fetches the booking by ID (ownership enforced server-side).
 */
const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div className="confirm-page page-wrapper">
        <div className="confirm-loading">
          <div className="confirm-spinner" />
          <p>Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="confirm-page page-wrapper">
        <div className="confirm-error-card">
          <span>⚠️</span>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const show = booking?.show;
  const event = show?.event;
  const seats = booking?.showSeats || [];

  return (
    <div className="confirm-page page-wrapper">
      <div className="container confirm-container">

        {/* Success Hero */}
        <div className="confirm-hero animate-fade-in-up">
          <div className="confirm-checkmark">
            <svg viewBox="0 0 52 52" className="confirm-check-svg" aria-hidden="true">
              <circle className="confirm-check-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="confirm-check-tick" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <h1 className="confirm-title">Booking Confirmed!</h1>
          <p className="confirm-subtitle">
            Your tickets are reserved. Get ready for a great experience!
          </p>
        </div>

        {/* Ticket Card */}
        <div className="confirm-ticket animate-fade-in-up delay-200">

          {/* Ticket Stub Top */}
          <div className="confirm-ticket-top">
            <div className="confirm-event-section">
              <div className="confirm-event-name">{event?.title}</div>
              <div className="confirm-event-meta">
                {event?.category && (
                  <span className="confirm-badge">{event.category}</span>
                )}
                {event?.language && (
                  <span className="confirm-badge">{event.language}</span>
                )}
              </div>
            </div>

            <div className="confirm-details-grid">
              <div className="confirm-detail-item">
                <span className="confirm-detail-icon">📅</span>
                <div>
                  <span className="confirm-detail-label">Date & Time</span>
                  <span className="confirm-detail-value">
                    {show?.startTime
                      ? new Date(show.startTime).toLocaleString('en-IN', {
                          dateStyle: 'full',
                          timeStyle: 'short'
                        })
                      : '—'}
                  </span>
                </div>
              </div>

              {show?.screen && (
                <div className="confirm-detail-item">
                  <span className="confirm-detail-icon">🎬</span>
                  <div>
                    <span className="confirm-detail-label">Screen</span>
                    <span className="confirm-detail-value">{show.screen.name}</span>
                  </div>
                </div>
              )}

              <div className="confirm-detail-item">
                <span className="confirm-detail-icon">🎟️</span>
                <div>
                  <span className="confirm-detail-label">Tickets</span>
                  <span className="confirm-detail-value">{seats.length} seat{seats.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="confirm-detail-item">
                <span className="confirm-detail-icon">💳</span>
                <div>
                  <span className="confirm-detail-label">Total Paid</span>
                  <span className="confirm-detail-value confirm-amount">₹{booking?.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Perforated Border */}
          <div className="confirm-ticket-divider">
            <div className="confirm-ticket-circle confirm-ticket-circle--left" />
            <div className="confirm-ticket-dots" />
            <div className="confirm-ticket-circle confirm-ticket-circle--right" />
          </div>

          {/* Ticket Stub Bottom — Seat List */}
          <div className="confirm-ticket-bottom">
            <h3 className="confirm-seats-heading">Seats</h3>
            <div className="confirm-seats-list">
              {seats.map((ss) => (
                <div key={ss._id} className="confirm-seat-item">
                  <div className="confirm-seat-name">
                    {ss.seat?.rowLabel}{ss.seat?.seatNumber}
                  </div>
                  <div className="confirm-seat-type">{ss.seat?.seatType}</div>
                  <div className="confirm-seat-price">₹{ss.price}</div>
                </div>
              ))}
            </div>

            <div className="confirm-booking-id-row">
              <span className="confirm-booking-id-label">Booking ID</span>
              <code className="confirm-booking-id-value">{booking?._id}</code>
            </div>

            <div className="confirm-status-badge">
              <span className="confirm-status-dot" />
              CONFIRMED
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="confirm-actions animate-fade-in-up delay-300">
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            Go to Dashboard
          </Link>
          <Link to="/events" className="btn btn-outline btn-lg">
            Book More Events
          </Link>
        </div>

      </div>
    </div>
  );
};

export default BookingConfirmation;
