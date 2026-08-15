import api from './api';

export const getShowSeats = async (showId) => {
  const response = await api.get(`/shows/${showId}/seats`);
  return response.data;
};
