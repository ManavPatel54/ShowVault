import React, { useState, useEffect } from 'react';
import { getVenues } from '../../services/venue.service';
import { getScreens } from '../../services/screen.service';
import { getEvents } from '../../services/event.service';
import { getShows } from '../../services/show.service';

const Overview = () => {
  const [counts, setCounts] = useState({
    venues: 0,
    screens: 0,
    events: 0,
    shows: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [venuesRes, eventsRes, showsRes] = await Promise.all([
          getVenues(),
          getEvents(),
          getShows({})
        ]);

        // Screens API requires venueId, so we would technically need to fetch screens for all venues
        // If the backend doesn't have a get all screens without venueId, we'll estimate or sum them up
        let totalScreens = 0;
        if (venuesRes.data && venuesRes.data.length > 0) {
          const screensPromises = venuesRes.data.map(v => getScreens(v._id));
          const screensResults = await Promise.all(screensPromises);
          totalScreens = screensResults.reduce((acc, res) => acc + (res.data ? res.data.length : 0), 0);
        }

        setCounts({
          venues: venuesRes.data ? venuesRes.data.length : 0,
          screens: totalScreens,
          events: eventsRes.data ? eventsRes.data.length : 0,
          shows: showsRes.data ? showsRes.data.length : 0
        });
      } catch (error) {
        console.error("Error fetching overview counts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading) return <p>Loading overview data...</p>;

  return (
    <div>
      <h2 className="admin-section-title">Dashboard Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#aaa', marginBottom: '10px' }}>Total Venues</h3>
          <p style={{ fontSize: '2.5rem', color: '#646cff', fontWeight: 'bold' }}>{counts.venues}</p>
        </div>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#aaa', marginBottom: '10px' }}>Total Screens</h3>
          <p style={{ fontSize: '2.5rem', color: '#4CAF50', fontWeight: 'bold' }}>{counts.screens}</p>
        </div>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#aaa', marginBottom: '10px' }}>Total Events</h3>
          <p style={{ fontSize: '2.5rem', color: '#FFC107', fontWeight: 'bold' }}>{counts.events}</p>
        </div>
        <div className="admin-card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#aaa', marginBottom: '10px' }}>Total Shows</h3>
          <p style={{ fontSize: '2.5rem', color: '#F44336', fontWeight: 'bold' }}>{counts.shows}</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
