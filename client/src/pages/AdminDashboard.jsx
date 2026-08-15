import React, { useState } from 'react';
import Overview from '../components/admin/Overview';
import VenuesAdmin from '../components/admin/VenuesAdmin';
import ScreensAdmin from '../components/admin/ScreensAdmin';
import SeatsAdmin from '../components/admin/SeatsAdmin';
import EventsAdmin from '../components/admin/EventsAdmin';
import ShowsAdmin from '../components/admin/ShowsAdmin';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'venues', label: 'Venues' },
    { id: 'screens', label: 'Screens' },
    { id: 'seats', label: 'Seats' },
    { id: 'events', label: 'Events' },
    { id: 'shows', label: 'Shows' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview />;
      case 'venues': return <VenuesAdmin />;
      case 'screens': return <ScreensAdmin />;
      case 'seats': return <SeatsAdmin />;
      case 'events': return <EventsAdmin />;
      case 'shows': return <ShowsAdmin />;
      default: return <Overview />;
    }
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Admin Panel</h2>
        <nav className="admin-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="admin-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
