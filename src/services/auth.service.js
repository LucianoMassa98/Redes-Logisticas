import { api } from './api.js';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken } = response.data.data;
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    return { user, accessToken };
  },

  async refresh() {
    const response = await api.post('/auth/refresh');
    const { user, accessToken } = response.data.data;
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    return { user, accessToken };
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  getStoredUser() {
    try {
      const stored = localStorage.getItem('user_data');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getStoredToken() {
    return localStorage.getItem('access_token');
  },
};
