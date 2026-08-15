import axios from 'axios';

/**
 * api.js — Pre-configured Axios instance.
 *
 * All API calls in this project should import this instance
 * instead of using `axios` directly. This keeps the base URL
 * and future configuration (interceptors, auth headers) in
 * one central place.
 *
 * baseURL is read from the Vite environment variable
 * VITE_API_URL (set in the .env file).
 *
 * Phase F1: No API calls are made yet.
 *           Interceptors will be added in a later phase.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
