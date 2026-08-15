import api from './api';

export const getShowSeats = async (showId) => {
  const response = await api.get(`/shows/${showId}/seats`);
  return response.data;
};

/**
 * Temporarily lock a ShowSeat for the authenticated user.
 * The hold lasts SEAT_HOLD_MINUTES (configured server-side, default 5 min).
 */
export const lockShowSeat = async (showSeatId) => {
  const response = await api.post(`/show-seats/${showSeatId}/lock`);
  return response.data;
};

/**
 * Release the authenticated user's hold on a ShowSeat.
 * Only the holding user may call this; returns 403 otherwise.
 */
export const releaseShowSeat = async (showSeatId) => {
  const response = await api.post(`/show-seats/${showSeatId}/release`);
  return response.data;
};
