import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents } from '../services/event.service';
import useAuth from '../hooks/useAuth';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchEvents = async () => {
      try {
        const res = await getEvents();
        // Assuming res.data contains array of events
        // Filter out inactive events if needed, but backend should handle it ideally.
        const activeEvents = res.data.filter(e => e.isActive !== false);
        setEvents(activeEvents);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isAuthenticated, navigate]);

  if (loading) return <div className="events-container"><p className="loading-state">Loading events...</p></div>;
  if (error) return <div className="events-container"><p className="error-state">{error}</p></div>;
  if (events.length === 0) return <div className="events-container"><p className="empty-state">No active events found at the moment.</p></div>;

  return (
    <div className="events-container container">
      <h1 className="events-title">Upcoming Events</h1>
      <div className="events-grid">
        {events.map(event => (
          <div key={event._id} className="event-card">
            <h2 className="event-card-title">{event.title}</h2>
            <div className="event-card-meta">
              <span className="event-category">{event.category}</span>
              <span className="event-language">{event.language}</span>
              <span className="event-duration">{event.duration} mins</span>
            </div>
            {event.description && <p className="event-card-description">{event.description}</p>}
            
            <Link to={`/events/${event._id}`} className="btn btn-primary mt-3 event-view-btn">
              View Shows
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
