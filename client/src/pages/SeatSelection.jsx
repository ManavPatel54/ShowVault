import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShowSeats } from '../services/showSeat.service';
import useAuth from '../hooks/useAuth';
import SeatMap from '../components/SeatMap';
import ShowSummary from '../components/ShowSummary';
import './SeatSelection.css';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchSeats = async () => {
      try {
        const res = await getShowSeats(showId);
        // Assuming response structure { success: true, data: { show, seats } }
        setShow(res.data.show);
        setSeats(res.data.seats);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch seat inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [showId, isAuthenticated, navigate]);

  const handleSeatClick = (seatId) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, id) => {
      const seat = seats.find(s => s._id === id);
      return total + (seat ? seat.price : 0);
    }, 0);
  };

  if (loading) return <div className="seat-selection-container"><p className="loading-state">Loading seat map...</p></div>;
  if (error) return <div className="seat-selection-container"><p className="error-state">{error}</p></div>;
  if (!seats || seats.length === 0) return <div className="seat-selection-container"><p className="empty-state">No seats available for this show.</p></div>;

  return (
    <div className="seat-selection-container container">
      <h1 className="page-title">Select Your Seats</h1>
      
      <ShowSummary show={show} />

      <div className="seat-map-wrapper">
        <SeatMap 
          showSeats={seats} 
          selectedSeats={selectedSeats} 
          onSeatClick={handleSeatClick} 
        />
      </div>

      {selectedSeats.length > 0 && (
        <div className="selection-summary">
          <div className="selection-details">
            <h3 className="selection-title">Selected Seats ({selectedSeats.length})</h3>
            <p className="selected-labels">
              {selectedSeats.map(id => {
                const s = seats.find(ss => ss._id === id);
                return s ? `${s.seat.rowLabel}${s.seat.seatNumber}` : '';
              }).join(', ')}
            </p>
          </div>
          <div className="selection-total">
            <span className="total-label">Total Amount</span>
            <span className="total-price">₹{calculateTotal()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
