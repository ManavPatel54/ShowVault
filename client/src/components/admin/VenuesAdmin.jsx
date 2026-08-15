import React, { useState, useEffect } from 'react';
import { getVenues, createVenue, deleteVenue } from '../../services/venue.service';

const VenuesAdmin = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: ''
  });

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await getVenues();
      setVenues(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createVenue(formData);
      setSuccess('Venue created successfully.');
      setFormData({ name: '', address: '', city: '' });
      fetchVenues();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create venue');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate/delete this venue?')) {
      try {
        await deleteVenue(id);
        setSuccess('Venue deleted/deactivated successfully.');
        fetchVenues();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete venue');
      }
    }
  };

  return (
    <div>
      <h2 className="admin-section-title">Manage Venues</h2>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <div className="admin-card">
        <h3>Create New Venue</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Name</label>
            <input type="text" name="name" className="admin-form-input" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Address</label>
            <input type="text" name="address" className="admin-form-input" value={formData.address} onChange={handleInputChange} required />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">City</label>
            <input type="text" name="city" className="admin-form-input" value={formData.city} onChange={handleInputChange} required />
          </div>
          <button type="submit" className="admin-btn admin-btn-primary">Create Venue</button>
        </form>
      </div>

      <div className="admin-card">
        <h3>Existing Venues</h3>
        {loading ? (
          <p>Loading...</p>
        ) : venues.length === 0 ? (
          <p>No venues found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {venues.map(venue => (
                  <tr key={venue._id}>
                    <td>{venue.name}</td>
                    <td>{venue.city}</td>
                    <td>{venue.isActive !== false ? 'Active' : 'Inactive'}</td>
                    <td>
                      <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(venue._id)}>Deactivate</button>
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

export default VenuesAdmin;
