import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import SeatSelection from './pages/SeatSelection';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';

/**
 * App.jsx — Root component.
 *
 * BrowserRouter wraps the entire application so every child
 * component can use React Router hooks (useNavigate, useLocation, etc.).
 *
 * Routes is a container that renders only the first <Route>
 * whose path matches the current URL.
 */
function App() {
  return (
    <BrowserRouter>
      {/* Navbar is outside <Routes> so it renders on every page */}
      <Navbar />

      <Routes>
        {/* Home page — "/" */}
        <Route path="/" element={<Home />} />

        {/* Auth pages */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard — protected now (Phase F2) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Events & Booking flow */}
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/shows/:showId/seats" element={<SeatSelection />} />

        {/* Admin Dashboard */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
