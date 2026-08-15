import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEventById } from '../services/event.service';
import { getShows } from '../services/show.service';
import useAuth from '../hooks/useAuth';
import './EventDetails.css';

const EventDetails = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchDetails = async () => {
      try {
        const eventRes = await getEventById(eventId);
        setEvent(eventRes.data);

        // Fetch shows and filter by eventId (in case backend doesn't filter, though backend usually does via query params)
        const showsRes = await getShows({ event: eventId });
        
        let eventShows = showsRes.data || [];
        // Fallback filter if backend didn't filter it correctly by query
        eventShows = eventShows.filter(s => 
          (typeof s.event === 'object' ? s.event._id === eventId : s.event === eventId) && 
          s.status !== 'CANCELLED'
        );

        // Sort chronologically
        eventShows.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        
        setShows(eventShows);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [eventId, isAuthenticated, navigate]);

  if (loading) return <div className="event-details-container"><p className="loading-state">Loading details...</p></div>;
  if (error) return <div className="event-details-container"><p className="error-state">{error}</p></div>;
  if (!event) return <div className="event-details-container"><p className="empty-state">Event not found.</p></div>;

  // Group shows by date
  const showsByDate = shows.reduce((acc, show) => {
    const dateStr = new Date(show.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(show);
    return acc;
  }, {});

  return (
    <div className="event-details-container container">
      <div className="event-header">
        <h1 className="event-title">{event.title}</h1>
        <div className="event-meta">
          <span className="event-badge">{event.category}</span>
          <span className="event-badge">{event.language}</span>
          <span className="event-badge">{event.duration} mins</span>
          {event.releaseDate && <span className="event-badge">Release: {new Date(event.releaseDate).toLocaleDateString()}</span>}
        </div>
        {event.description && <p className="event-description">{event.description}</p>}
      </div>

      <div className="shows-section">
        <h2 className="shows-title">Available Shows</h2>
        
        {Object.keys(showsByDate).length === 0 ? (
          <p className="empty-state">No upcoming shows for this event.</p>
        ) : (
          Object.keys(showsByDate).map(date => (
            <div key={date} className="show-day-group">
              <h3 className="show-date-header">{date}</h3>
              <div className="shows-grid">
                {showsByDate[date].map(show => (
                  <div key={show._id} className="show-card">
                    <div className="show-time">
                      {new Date(show.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="show-info">
                      <span className="show-screen">{show.screen?.name || 'Unknown Screen'}</span>
                      <span className="show-price">₹{show.basePrice}</span>
                    </div>
                    <Link to={`/shows/${show._id}/seats`} className="btn btn-primary show-select-btn">
                      Select Seats
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventDetails;
