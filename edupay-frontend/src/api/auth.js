// src/api/auth.js
import api from './axios';

// Named exports
export function loginUser({ email, password }) {
  return api.post('/user/login', { email, password });
}

export function registerUser({ name, email, password }) {
  return api.post('/user/register', { name, email, password });
}
