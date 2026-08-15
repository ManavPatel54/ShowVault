import React from 'react';
import './SeatMap.css';

const SeatMap = ({ showSeats, selectedSeats, onSeatClick, currentUser, pendingActionSeats }) => {
  // Group seats by rowLabel
  const rows = showSeats.reduce((acc, ss) => {
    const row = ss.seat?.rowLabel || 'Unknown';
    if (!acc[row]) acc[row] = [];
    acc[row].push(ss);
    return acc;
  }, {});

  // Sort rows alphabetically and seats within rows by seatNumber
  const sortedRows = Object.keys(rows).sort();

  return (
    <div className="seat-map-container">
      <div className="screen-indicator">
        <div className="screen-line"></div>
        <span className="screen-text">SCREEN</span>
      </div>
      
      <div className="seat-grid">
        {sortedRows.map(rowLabel => (
          <div key={rowLabel} className="seat-row">
            <span className="row-label">{rowLabel}</span>
            <div className="row-seats">
              {rows[rowLabel]
                .sort((a, b) => a.seat.seatNumber - b.seat.seatNumber)
                .map(ss => {
                  const isAvailable = ss.status === 'AVAILABLE';
                  
                  const heldById = typeof ss.heldBy === 'object' ? (ss.heldBy?._id || ss.heldBy?.id)?.toString() : ss.heldBy?.toString();
                  const currentUserId = (currentUser?.id || currentUser?._id)?.toString();
                  const isHeldByMe = ss.status === 'HELD' && heldById && currentUserId && heldById === currentUserId;
                  const isPending = pendingActionSeats.has(ss._id);
                  
                  // A seat is clickable if it's available or held by the current user
                  const isClickable = (isAvailable || isHeldByMe) && !isPending;
                  
                  let seatClass = 'seat-btn';
                  if (isHeldByMe) seatClass += ' seat-held-by-me';
                  else if (ss.status === 'HELD') seatClass += ' seat-held-other';
                  else if (ss.status === 'BOOKED') seatClass += ' seat-booked';
                  else if (isAvailable) seatClass += ' seat-available';

                  if (isPending) seatClass += ' seat-pending';

                  let tooltip = `Seat ${rowLabel}${ss.seat.seatNumber}\nType: ${ss.seat.seatType}\nPrice: ₹${ss.price}\nStatus: ${ss.status}`;
                  
                  let buttonText = ss.seat.seatNumber;
                  if (isPending) {
                    buttonText = isHeldByMe ? '...' : '...'; // Small placeholder for Locking/Releasing
                  }

                  return (
                    <button
                      key={ss._id}
                      className={seatClass}
                      disabled={!isClickable}
                      onClick={() => isClickable && onSeatClick(ss._id)}
                      title={tooltip}
                      aria-label={`Seat ${rowLabel}${ss.seat.seatNumber}, Status: ${ss.status}, Price: ₹${ss.price}`}
                    >
                      {buttonText}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="seat-legend">
        <div className="legend-item">
          <span className="legend-color legend-available"></span> Available
        </div>
        <div className="legend-item">
          <span className="legend-color legend-held-by-me"></span> Held by you
        </div>
        <div className="legend-item">
          <span className="legend-color legend-held-other"></span> Held (Other)
        </div>
        <div className="legend-item">
          <span className="legend-color legend-booked"></span> Booked
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
