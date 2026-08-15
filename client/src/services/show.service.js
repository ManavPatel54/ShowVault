import api from './api';

export const getShows = async (params) => {
  const response = await api.get('/shows', { params });
  return response.data;
};

export const getShowById = async (id) => {
  const response = await api.get(`/shows/${id}`);
  return response.data;
};

export const createShow = async (data) => {
  const response = await api.post('/shows', data);
  return response.data;
};

export const updateShow = async (id, data) => {
  const response = await api.patch(`/shows/${id}`, data);
  return response.data;
};

export const deleteShow = async (id) => {
  const response = await api.delete(`/shows/${id}`);
  return response.data;
};
