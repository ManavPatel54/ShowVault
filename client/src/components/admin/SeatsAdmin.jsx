import React, { useState, useEffect } from 'react';
import { getVenues } from '../../services/venue.service';
import { getScreens } from '../../services/screen.service';
import { getSeats, createSeat, generateSeatLayout, deleteSeat } from '../../services/seat.service';

const SeatsAdmin = () => {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [screens, setScreens] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState('');
  const [seats, setSeats] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    rowLabel: '',
    seatNumber: '',
    seatType: 'REGULAR',
    priceMultiplier: 1
  });

  const [bulkData, setBulkData] = useState({
    startRow: 'A',
    rows: 10,
    seatsPerRow: 10,
    seatType: 'REGULAR',
    priceMultiplier: 1
  });

  // Fetch Venues on mount
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

  // Update default bulk parameters when screen changes
  useEffect(() => {
    if (selectedScreen) {
      const screenObj = screens.find(s => s._id === selectedScreen);
      if (screenObj) {
        setBulkData(prev => ({
          ...prev,
          rows: screenObj.totalRows || 10,
          seatsPerRow: screenObj.totalColumns || 10
        }));
      }
      fetchSeats();
    } else {
      setSeats([]);
    }
  }, [selectedScreen]);

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const res = await getSeats(selectedScreen);
      setSeats(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch seats');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBulkInputChange = (e) => {
    setBulkData({ ...bulkData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScreen) {
      setError('Please select a screen first.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      await createSeat({ ...formData, screen: selectedScreen });
      setSuccess('Seat created successfully.');
      setFormData({ rowLabel: '', seatNumber: '', seatType: 'REGULAR', priceMultiplier: 1 });
      fetchSeats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create seat. (Note: rowLabel + seatNumber must be unique per screen)');
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScreen) {
      setError('Please select a screen first.');
      return;
    }
    if (Number(bulkData.rows) <= 0 || Number(bulkData.seatsPerRow) <= 0) {
      setError('Rows and Seats Per Row must be positive numbers.');
      return;
    }
    if (!bulkData.startRow || bulkData.startRow.trim() === '') {
      setError('Starting Row is required.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const res = await generateSeatLayout(selectedScreen, bulkData);
      const { created, skipped, total } = res.data || {};
      setSuccess(res.message || `Seat layout generated: ${created} created, ${skipped} skipped out of ${total}.`);
      fetchSeats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate seat layout.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate/delete this seat?')) {
      try {
        await deleteSeat(id);
        setSuccess('Seat deleted successfully.');
        fetchSeats();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete seat');
      }
    }
  };

  // Group seats by rowLabel for display
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.rowLabel]) acc[seat.rowLabel] = [];
    acc[seat.rowLabel].push(seat);
    return acc;
  }, {});

  const sortedRows = Object.keys(rows).sort();

  return (
    <div>
      <h2 className="admin-section-title">Manage Seats</h2>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <div className="admin-card">
        <h3>Select Location</h3>
        <div style={{ display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap' }}>
          <div className="admin-form-group" style={{ flex: 1 }}>
            <label className="admin-form-label">Venue</label>
            <select 
              className="admin-form-select" 
              value={selectedVenue} 
              onChange={(e) => { setSelectedVenue(e.target.value); setError(''); setSuccess(''); }}
            >
              <option value="">-- Select a Venue --</option>
              {venues.map(v => (
                <option key={v._id} value={v._id}>{v.name}</option>
              ))}
            </select>
          </div>
          
          <div className="admin-form-group" style={{ flex: 1 }}>
            <label className="admin-form-label">Screen</label>
            <select 
              className="admin-form-select" 
              value={selectedScreen} 
              onChange={(e) => { setSelectedScreen(e.target.value); setError(''); setSuccess(''); }}
              disabled={!selectedVenue}
            >
              <option value="">-- Select a Screen --</option>
              {screens.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.totalRows}x{s.totalColumns})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedScreen && (
        <>
          <div className="admin-card">
            <h3>Generate Seat Layout</h3>
            <form onSubmit={handleBulkSubmit} style={{ marginTop: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Starting Row</label>
                  <input type="text" name="startRow" className="admin-form-input" value={bulkData.startRow} onChange={handleBulkInputChange} required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Rows</label>
                  <input type="number" min="1" name="rows" className="admin-form-input" value={bulkData.rows} onChange={handleBulkInputChange} required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Seats Per Row</label>
                  <input type="number" min="1" name="seatsPerRow" className="admin-form-input" value={bulkData.seatsPerRow} onChange={handleBulkInputChange} required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Seat Type</label>
                  <select name="seatType" className="admin-form-select" value={bulkData.seatType} onChange={handleBulkInputChange}>
                    <option value="REGULAR">REGULAR</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Price Multiplier</label>
                  <input type="number" step="0.1" min="0" name="priceMultiplier" className="admin-form-input" value={bulkData.priceMultiplier} onChange={handleBulkInputChange} required />
                </div>
              </div>
              <button type="submit" className="admin-btn admin-btn-primary" style={{ marginTop: '15px' }}>Generate Seat Layout</button>
            </form>
          </div>

          <div className="admin-card">
            <h3>Create New Seat (Manual)</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Row Label (e.g., A)</label>
                  <input type="text" name="rowLabel" className="admin-form-input" value={formData.rowLabel} onChange={handleInputChange} required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Seat Number</label>
                  <input type="number" name="seatNumber" className="admin-form-input" value={formData.seatNumber} onChange={handleInputChange} required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Seat Type</label>
                  <select name="seatType" className="admin-form-select" value={formData.seatType} onChange={handleInputChange}>
                    <option value="REGULAR">REGULAR</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Price Multiplier</label>
                  <input type="number" step="0.1" name="priceMultiplier" className="admin-form-input" value={formData.priceMultiplier} onChange={handleInputChange} required />
                </div>
              </div>
              <button type="submit" className="admin-btn admin-btn-primary" style={{ marginTop: '10px' }}>Create Seat</button>
            </form>
          </div>

          <div className="admin-card">
            <h3>Existing Seats</h3>
            {loading ? (
              <p>Loading...</p>
            ) : seats.length === 0 ? (
              <p>No seats found for this screen.</p>
            ) : (
              <div style={{ marginTop: '20px' }}>
                {sortedRows.map(rowLabel => (
                  <div key={rowLabel} style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#aaa', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>
                      Row {rowLabel}
                    </h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Seat</th>
                            <th>Type</th>
                            <th>Multiplier</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows[rowLabel]
                            .sort((a, b) => a.seatNumber - b.seatNumber)
                            .map(seat => (
                            <tr key={seat._id}>
                              <td>{seat.rowLabel}{seat.seatNumber}</td>
                              <td>{seat.seatType}</td>
                              <td>{seat.priceMultiplier}x</td>
                              <td>{seat.isActive !== false ? 'Active' : 'Inactive'}</td>
                              <td>
                                <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(seat._id)}>Deactivate</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SeatsAdmin;
