import React, { useState, useEffect } from 'react';
import { getVenues } from '../../services/venue.service';
import { getScreens, createScreen, deleteScreen } from '../../services/screen.service';

const ScreensAdmin = () => {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    screenNumber: '',
    totalRows: '',
    totalColumns: ''
  });

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await getVenues();
        setVenues(res.data || []);
      } catch (err) {
        setError('Failed to load venues.');
      }
    };
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenue) {
      fetchScreens();
    } else {
      setScreens([]);
    }
  }, [selectedVenue]);

  const fetchScreens = async () => {
    setLoading(true);
    try {
      const res = await getScreens(selectedVenue);
      setScreens(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch screens');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVenue) {
      setError('Please select a venue first.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await createScreen({ ...formData, venue: selectedVenue });
      setSuccess('Screen created successfully.');
      setFormData({ name: '', screenNumber: '', totalRows: '', totalColumns: '' });
      fetchScreens();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create screen');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate/delete this screen?')) {
      try {
        await deleteScreen(id);
        setSuccess('Screen deleted successfully.');
        fetchScreens();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete screen');
      }
    }
  };

  return (
    <div>
      <h2 className="admin-section-title">Manage Screens</h2>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <div className="admin-card">
        <h3>Select Venue</h3>
        <div className="admin-form-group" style={{ marginTop: '15px' }}>
          <select 
            className="admin-form-select" 
            value={selectedVenue} 
            onChange={(e) => { setSelectedVenue(e.target.value); setError(''); setSuccess(''); }}
          >
            <option value="">-- Select a Venue --</option>
            {venues.map(v => (
              <option key={v._id} value={v._id}>{v.name} ({v.city})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedVenue && (
        <>
          <div className="admin-card">
            <h3>Create New Screen</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Screen Name</label>
                <input type="text" name="name" className="admin-form-input" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Screen Number</label>
                <input type="number" name="screenNumber" className="admin-form-input" value={formData.screenNumber} onChange={handleInputChange} required />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Total Rows (e.g. 10)</label>
                <input type="number" name="totalRows" className="admin-form-input" value={formData.totalRows} onChange={handleInputChange} required />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Total Columns (e.g. 15)</label>
                <input type="number" name="totalColumns" className="admin-form-input" value={formData.totalColumns} onChange={handleInputChange} required />
              </div>
              <button type="submit" className="admin-btn admin-btn-primary">Create Screen</button>
            </form>
          </div>

          <div className="admin-card">
            <h3>Existing Screens</h3>
            {loading ? (
              <p>Loading...</p>
            ) : screens.length === 0 ? (
              <p>No screens found for this venue.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Number</th>
                      <th>Rows x Cols</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {screens.map(screen => (
                      <tr key={screen._id}>
                        <td>{screen.name}</td>
                        <td>{screen.screenNumber}</td>
                        <td>{screen.totalRows} x {screen.totalColumns}</td>
                        <td>{screen.isActive !== false ? 'Active' : 'Inactive'}</td>
                        <td>
                          <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(screen._id)}>Deactivate</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ScreensAdmin;
