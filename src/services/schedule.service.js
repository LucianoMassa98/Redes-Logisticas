import { api } from './api.js';

export const scheduleService = {
  /**
   * Obtiene la lista de instalaciones programadas
   * @param {Object} params - { startDate, endDate, status, serviceType, technician, search, leadId }
   */
  async getSchedules(params = {}) {
    const response = await api.get('/admin/schedules', { params });
    return response.data.data;
  },

  /**
   * Obtiene métricas resumidas para el calendario
   * @param {Object} params - { startDate, endDate }
   */
  async getCalendarStats(params = {}) {
    const response = await api.get('/admin/schedules/stats', { params });
    return response.data.data;
  },

  /**
   * Obtiene el detalle de una instalación programada
   * @param {string} id
   */
  async getScheduleById(id) {
    const response = await api.get(`/admin/schedules/${id}`);
    return response.data.data;
  },

  /**
   * Crea una nueva instalación programada
   * @param {Object} data
   */
  async createSchedule(data) {
    const response = await api.post('/admin/schedules', data);
    return response.data.data;
  },

  /**
   * Actualiza una instalación programada existente
   * @param {string} id
   * @param {Object} data
   */
  async updateSchedule(id, data) {
    const response = await api.put(`/admin/schedules/${id}`, data);
    return response.data.data;
  },

  /**
   * Actualización rápida del estado de una instalación
   * @param {string} id
   * @param {Object} payload - { status, notes }
   */
  async updateStatus(id, payload) {
    const response = await api.patch(`/admin/schedules/${id}/status`, payload);
    return response.data.data;
  },

  /**
   * Elimina una instalación programada
   * @param {string} id
   */
  async deleteSchedule(id) {
    const response = await api.delete(`/admin/schedules/${id}`);
    return response.data;
  },
};
