import api from './api';

/**
 * Create a booking from held seats.
 * @param {string} showId
 * @param {string[]} showSeatIds
 */
export const createBooking = async (showId, showSeatIds) => {
  const response = await api.post('/bookings', { showId, showSeatIds });
  return response.data;
};

/**
 * Get a single booking by ID (ownership enforced server-side).
 * @param {string} bookingId
 */
export const getBooking = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

/**
 * Get all bookings for the authenticated user.
 */
export const getMyBookings = async () => {
  const response = await api.get('/bookings');
  return response.data;
};
