// src/api.js (API helper with Axios)
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // Assuming Spring Boot runs on port 8080

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notificationAPI = {
  getAll: () => api.get('/notification/all'),
  getUnread: () => api.get('/notification/unread'),
  markRead: () => api.get('/notification/read'),
};

export default api;