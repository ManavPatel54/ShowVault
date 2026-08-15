import React from 'react';
import './SeatMap.css';

const SeatMap = ({ showSeats, selectedSeats, onSeatClick }) => {
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
                  const isSelected = selectedSeats.includes(ss._id);
                  const isAvailable = ss.status === 'AVAILABLE';
                  
                  let seatClass = 'seat-btn';
                  if (isSelected) seatClass += ' seat-selected';
                  else if (ss.status === 'HELD') seatClass += ' seat-held';
                  else if (ss.status === 'BOOKED') seatClass += ' seat-booked';
                  else if (isAvailable) seatClass += ' seat-available';

                  return (
                    <button
                      key={ss._id}
                      className={seatClass}
                      disabled={!isAvailable}
                      onClick={() => isAvailable && onSeatClick(ss._id)}
                      title={`${rowLabel}${ss.seat.seatNumber} - ₹${ss.price}`}
                      aria-label={`Seat ${rowLabel}${ss.seat.seatNumber}, Status: ${ss.status}, Price: ₹${ss.price}`}
                    >
                      {ss.seat.seatNumber}
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
          <span className="legend-color legend-selected"></span> Selected
        </div>
        <div className="legend-item">
          <span className="legend-color legend-held"></span> Held
        </div>
        <div className="legend-item">
          <span className="legend-color legend-booked"></span> Booked
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
