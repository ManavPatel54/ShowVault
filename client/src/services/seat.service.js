import api from './api';

export const getSeats = async (screenId) => {
  const url = screenId ? `/seats?screenId=${screenId}` : '/seats';
  const response = await api.get(url);
  return response.data;
};

export const createSeat = async (data) => {
  const response = await api.post('/seats', data);
  return response.data;
};

export const generateSeatLayout = async (screenId, data) => {
  const response = await api.post(`/screens/${screenId}/generate-seats`, data);
  return response.data;
};

export const updateSeat = async (id, data) => {
  const response = await api.patch(`/seats/${id}`, data);
  return response.data;
};

export const deleteSeat = async (id) => {
  const response = await api.delete(`/seats/${id}`);
  return response.data;
};
