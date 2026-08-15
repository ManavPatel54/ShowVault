import React from 'react';
import './ShowSummary.css';

const ShowSummary = ({ show }) => {
  if (!show) return null;

  return (
    <div className="show-summary-card">
      <h3 className="summary-title">{show.event?.title || 'Unknown Event'}</h3>
      <div className="summary-details">
        <div className="summary-item">
          <span className="summary-label">Start:</span>
          <span className="summary-value">
            {new Date(show.startTime).toLocaleString(undefined, {
              weekday: 'short', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">End:</span>
          <span className="summary-value">
            {new Date(show.endTime).toLocaleTimeString(undefined, {
              hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Screen:</span>
          <span className="summary-value">{show.screen?.name || 'Unknown Screen'}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Base Price:</span>
          <span className="summary-value">₹{show.basePrice}</span>
        </div>
      </div>
    </div>
  );
};

export default ShowSummary;
