import { api } from './api.js';
import { INITIAL_SERVICES } from '../config/constants.js';

export const catalogService = {
  async getServices() {
    try {
      const response = await api.get('/services');
      if (response.data?.data && response.data.data.length > 0) {
        return response.data.data;
      }
      return INITIAL_SERVICES;
    } catch (err) {
      console.warn('[CATALOG] No se pudo conectar al endpoint de servicios, utilizando catálogo inicial local.');
      return INITIAL_SERVICES;
    }
  },
};
