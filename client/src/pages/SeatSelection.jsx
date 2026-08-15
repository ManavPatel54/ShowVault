import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShowSeats, lockShowSeat, releaseShowSeat } from '../services/showSeat.service';
import useAuth from '../hooks/useAuth';
import SeatMap from '../components/SeatMap';
import ShowSummary from '../components/ShowSummary';
import CountdownTimer from '../components/CountdownTimer';
import './SeatSelection.css';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Track seats currently undergoing lock/release requests
  const [pendingActionSeats, setPendingActionSeats] = useState(new Set());

  // Helper to check ownership regardless of whether heldBy is populated or a string ID
  const checkIsHeldByMe = (heldBy, u) => {
    if (!heldBy || !u) return false;
    const heldId = typeof heldBy === 'object' ? (heldBy._id || heldBy.id)?.toString() : heldBy?.toString();
    const userId = (u.id || u._id)?.toString();
    return heldId && userId && heldId === userId;
  };

  // Derive held seats from the authoritative backend state
  const heldSeats = seats.filter(
    s => s.status === 'HELD' && checkIsHeldByMe(s.heldBy, user)
  );

  const fetchSeats = useCallback(async () => {
    try {
      const res = await getShowSeats(showId);
      setShow(res.data.show);
      setSeats(res.data.seats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch seat inventory');
    } finally {
      setLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchSeats();
  }, [fetchSeats, isAuthenticated, navigate]);

  const handleSeatClick = async (seatId) => {
    if (pendingActionSeats.has(seatId)) return; // Prevent duplicate clicks
    
    const seat = seats.find(s => s._id === seatId);
    if (!seat) return;

    const isAvailable = seat.status === 'AVAILABLE';
    const isHeldByMe = seat.status === 'HELD' && checkIsHeldByMe(seat.heldBy, user);

    if (!isAvailable && !isHeldByMe) return;

    setPendingActionSeats(prev => new Set(prev).add(seatId));
    setError(''); // clear general errors

    try {
      if (isAvailable) {
        // Try to lock
        const res = await lockShowSeat(seatId);
        if (res.success && res.data) {
          // The backend lock response is partial (missing full populated `show`/`seat`).
          // We MUST NOT replace our rich state with a partial object.
          // Instead, refetch the canonical full seat map:
          await fetchSeats();
        }
      } else if (isHeldByMe) {
        // Try to release
        const res = await releaseShowSeat(seatId);
        if (res.success && res.data) {
          // Same here, refetch to guarantee perfect state sync:
          await fetchSeats();
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 409) {
        setError('Sorry, this seat was just taken by another user.');
        fetchSeats(); // Refresh map to show reality
      } else {
        setError(err.response?.data?.message || 'An error occurred.');
      }
    } finally {
      setPendingActionSeats(prev => {
        const next = new Set(prev);
        next.delete(seatId);
        return next;
      });
    }
  };

  const handleExpire = (seatId) => {
    setError('Your hold on a seat has expired.');
    // Force a fresh fetch from backend to ensure we have exactly correct state
    fetchSeats();
  };

  const calculateTotal = () => {
    return heldSeats.reduce((total, seat) => total + seat.price, 0);
  };

  if (loading) return <div className="seat-selection-container"><p className="loading-state">Loading seat map...</p></div>;
  if (!seats || seats.length === 0) return <div className="seat-selection-container"><p className="empty-state">No seats available for this show.</p></div>;

  return (
    <div className="seat-selection-container container">
      <h1 className="page-title">Select Your Seats</h1>
      
      {error && <div className="error-banner">{error}</div>}
      
      <ShowSummary show={show} />

      <div className="seat-map-wrapper">
        <SeatMap 
          showSeats={seats} 
          selectedSeats={[]} 
          onSeatClick={handleSeatClick}
          currentUser={user}
          pendingActionSeats={pendingActionSeats}
        />
      </div>

      {heldSeats.length > 0 && (
        <div className="selection-summary">
          <div className="selection-details">
            <h3 className="selection-title">Held Seats ({heldSeats.length})</h3>
            <ul className="held-seats-list">
              {heldSeats.map(seat => (
                <li key={seat._id} className="held-seat-item">
                  <span className="held-seat-label">{seat.seat.rowLabel}{seat.seat.seatNumber}</span>
                  <span className="held-seat-type">{seat.seat.seatType}</span>
                  <span className="held-seat-price">₹{seat.price}</span>
                  <span className="held-seat-timer">
                    Expires in: <CountdownTimer expiresAt={seat.holdExpiresAt} onExpire={() => handleExpire(seat._id)} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="selection-total">
            <span className="total-label">Total Amount</span>
            <span className="total-price">₹{calculateTotal()}</span>
            <button className="checkout-btn" disabled>Continue to Booking</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
