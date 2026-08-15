import React, { useState, useEffect } from 'react';
import { getEvents, createEvent, deleteEvent } from '../../services/event.service';

const EventsAdmin = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'MOVIE',
    durationMinutes: '',
    language: 'English',
    releaseDate: ''
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getEvents();
      setEvents(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // transform durationMinutes to duration (number) for backend
      const payload = { ...formData, duration: parseInt(formData.durationMinutes, 10) };
      await createEvent(payload);
      setSuccess('Event created successfully.');
      setFormData({
        title: '',
        description: '',
        category: 'MOVIE',
        durationMinutes: '',
        language: 'English',
        releaseDate: ''
      });
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate/delete this event?')) {
      try {
        await deleteEvent(id);
        setSuccess('Event deleted successfully.');
        fetchEvents();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  return (
    <div>
      <h2 className="admin-section-title">Manage Events</h2>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <div className="admin-card">
        <h3>Create New Event</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Title</label>
              <input type="text" name="title" className="admin-form-input" value={formData.title} onChange={handleInputChange} required />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Category</label>
              <select name="category" className="admin-form-select" value={formData.category} onChange={handleInputChange}>
                <option value="MOVIE">MOVIE</option>
                <option value="CONCERT">CONCERT</option>
                <option value="SPORTS">SPORTS</option>
                <option value="THEATRE">THEATRE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Duration (Minutes)</label>
              <input type="number" name="durationMinutes" className="admin-form-input" value={formData.durationMinutes} onChange={handleInputChange} required />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Language</label>
              <input type="text" name="language" className="admin-form-input" value={formData.language} onChange={handleInputChange} required />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Release Date (Optional)</label>
              <input type="date" name="releaseDate" className="admin-form-input" value={formData.releaseDate} onChange={handleInputChange} />
            </div>
          </div>
          <div className="admin-form-group" style={{ marginTop: '15px' }}>
            <label className="admin-form-label">Description</label>
            <textarea name="description" className="admin-form-input" value={formData.description} onChange={handleInputChange} rows="3" required></textarea>
          </div>
          <button type="submit" className="admin-btn admin-btn-primary">Create Event</button>
        </form>
      </div>

      <div className="admin-card">
        <h3>Existing Events</h3>
        {loading ? (
          <p>Loading...</p>
        ) : events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event._id}>
                    <td>{event.title}</td>
                    <td>{event.category}</td>
                    <td>{event.duration} mins</td>
                    <td>{event.language}</td>
                    <td>{event.isActive !== false ? 'Active' : 'Inactive'}</td>
                    <td>
                      <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(event._id)}>Deactivate</button>
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

export default EventsAdmin;
