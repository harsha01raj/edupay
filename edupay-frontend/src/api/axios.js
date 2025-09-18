// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000',
  timeout: 15000,
});

// helper to set or remove token header programmatically
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// Initialize token from storage (called at startup)
const initialToken = localStorage.getItem('edupay_token');
if (initialToken) setAuthToken(initialToken);

export default api;
