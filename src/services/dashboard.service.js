import { api } from './api.js';

export const dashboardService = {
  async getMetrics() {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },
};
