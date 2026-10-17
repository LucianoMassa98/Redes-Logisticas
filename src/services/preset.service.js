import { api } from './api.js';

export const presetService = {
  /**
   * Obtiene la lista de plantillas de instalación preconfiguradas
   * @param {Object} params - { category, search, activeOnly }
   */
  async getPresets(params = {}) {
    const response = await api.get('/admin/presets', { params });
    return response.data.data;
  },

  /**
   * Obtiene una plantilla por su ID
   * @param {string} id
   */
  async getPresetById(id) {
    const response = await api.get(`/admin/presets/${id}`);
    return response.data.data;
  },

  /**
   * Crea una nueva plantilla de instalación
   * @param {Object} presetData
   */
  async createPreset(presetData) {
    const response = await api.post('/admin/presets', presetData);
    return response.data.data;
  },

  /**
   * Actualiza una plantilla existente
   * @param {string} id
   * @param {Object} presetData
   */
  async updatePreset(id, presetData) {
    const response = await api.patch(`/admin/presets/${id}`, presetData);
    return response.data.data;
  },

  /**
   * Elimina una plantilla
   * @param {string} id
   */
  async deletePreset(id) {
    const response = await api.delete(`/admin/presets/${id}`);
    return response.data;
  },
};
