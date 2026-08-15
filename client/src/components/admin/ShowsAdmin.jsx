import React, { useState, useEffect } from 'react';
import { getEvents } from '../../services/event.service';
import { getVenues } from '../../services/venue.service';
import { getScreens } from '../../services/screen.service';
import { getShows, createShow, deleteShow } from '../../services/show.service';

const ShowsAdmin = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [screens, setScreens] = useState([]);
  const [shows, setShows] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');
  
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    basePrice: ''
  });

  // Initial Data Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [eventsRes, venuesRes] = await Promise.all([
          getEvents(),
          getVenues()
        ]);
        setEvents(eventsRes.data || []);
        setVenues(venuesRes.data || []);
      } catch (err) {
        setError('Failed to load events and venues.');
      }
    };
    fetchInitialData();
    fetchShows();
  }, []);

  // Fetch Screens when Venue changes
  useEffect(() => {
    if (selectedVenue) {
      const fetchScreens = async () => {
        try {
          const res = await getScreens(selectedVenue);
          setScreens(res.data || []);
        } catch (err) {
          setError('Failed to load screens.');
        }
      };
      fetchScreens();
    } else {
      setScreens([]);
    }
    setSelectedScreen(''); // Reset screen
  }, [selectedVenue]);

  const fetchShows = async () => {
    setLoading(true);
    try {
      const res = await getShows({});
      setShows(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shows');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !selectedScreen) {
      setError('Please select an event and a screen.');
      return;
    }
    setError('');
    setSuccess('');
    
    try {
      const payload = {
        event: selectedEvent,
        screen: selectedScreen,
        startTime: formData.startTime,
        endTime: formData.endTime,
        basePrice: parseFloat(formData.basePrice)
      };
      
      await createShow(payload);
      setSuccess('Show scheduled successfully.');
      setFormData({ startTime: '', endTime: '', basePrice: '' });
      setSelectedEvent('');
      setSelectedVenue('');
      setSelectedScreen('');
      fetchShows();
    } catch (err) {
      if (err.response?.status === 409) {
        setError(err.response.data.message || 'Another show is already scheduled on this screen during the selected time.');
      } else {
        setError(err.response?.data?.message || 'Failed to create show');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this show?')) {
      try {
        await deleteShow(id);
        setSuccess('Show cancelled successfully.');
        fetchShows();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cancel show');
      }
    }
  };

  return (
    <div>
      <h2 className="admin-section-title">Manage Shows</h2>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <div className="admin-card">
        <h3>Schedule New Show</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Event</label>
              <select className="admin-form-select" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} required>
                <option value="">-- Select Event --</option>
                {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
              </select>
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Venue</label>
              <select className="admin-form-select" value={selectedVenue} onChange={(e) => setSelectedVenue(e.target.value)} required>
                <option value="">-- Select Venue --</option>
                {venues.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Screen</label>
              <select className="admin-form-select" value={selectedScreen} onChange={(e) => setSelectedScreen(e.target.value)} disabled={!selectedVenue} required>
                <option value="">-- Select Screen --</option>
                {screens.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Start Time</label>
              <input type="datetime-local" name="startTime" className="admin-form-input" value={formData.startTime} onChange={handleInputChange} required />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">End Time</label>
              <input type="datetime-local" name="endTime" className="admin-form-input" value={formData.endTime} onChange={handleInputChange} required />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Base Price</label>
              <input type="number" step="0.01" name="basePrice" className="admin-form-input" value={formData.basePrice} onChange={handleInputChange} required />
            </div>
          </div>

          <button type="submit" className="admin-btn admin-btn-primary" style={{ marginTop: '15px' }}>Schedule Show</button>
        </form>
      </div>

      <div className="admin-card">
        <h3>Existing Shows</h3>
        {loading ? (
          <p>Loading shows...</p>
        ) : shows.length === 0 ? (
          <p>No shows scheduled.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Screen</th>
                  <th>Start Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shows
                  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                  .map(show => (
                  <tr key={show._id}>
                    <td>{show.event?.title || 'Unknown Event'}</td>
                    <td>{show.screen?.name || 'Unknown Screen'}</td>
                    <td>{new Date(show.startTime).toLocaleString()}</td>
                    <td>
                      <span style={{ 
                        color: show.status === 'SCHEDULED' ? '#4CAF50' : 
                               show.status === 'CANCELLED' ? '#F44336' : '#FFC107' 
                      }}>
                        {show.status}
                      </span>
                    </td>
                    <td>
                      {show.status !== 'CANCELLED' && (
                        <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(show._id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowsAdmin;
