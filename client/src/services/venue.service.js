import api from './api';

export const getVenues = async () => {
  const response = await api.get('/venues');
  return response.data;
};

export const getVenueById = async (id) => {
  const response = await api.get(`/venues/${id}`);
  return response.data;
};

export const createVenue = async (data) => {
  const response = await api.post('/venues', data);
  return response.data;
};

export const updateVenue = async (id, data) => {
  const response = await api.patch(`/venues/${id}`, data);
  return response.data;
};

export const deleteVenue = async (id) => {
  const response = await api.delete(`/venues/${id}`);
  return response.data;
};
