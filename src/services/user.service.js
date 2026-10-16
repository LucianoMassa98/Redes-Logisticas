import { api } from './api.js';

export const userService = {
  async getUsers() {
    const response = await api.get('/admin/users');
    return response.data.data;
  },

  async createUser(userData) {
    const response = await api.post('/admin/users', userData);
    return response.data.data;
  },

  async updateUser(id, userData) {
    const response = await api.patch(`/admin/users/${id}`, userData);
    return response.data.data;
  },
};
