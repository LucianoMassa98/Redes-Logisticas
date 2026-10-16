import { api } from './api.js';

export const leadService = {
  // Envío público desde la landing page
  async submitPublicLead(data) {
    const response = await api.post('/leads', data);
    return response.data;
  },

  // Panel administrativo - Listado con filtros
  async getLeads(params = {}) {
    const response = await api.get('/admin/leads', { params });
    return response.data.data;
  },

  // Panel administrativo - Creación manual de lead
  async createAdminLead(data) {
    const response = await api.post('/admin/leads', data);
    return response.data.data;
  },

  // Detalle de un lead
  async getLeadById(id) {
    const response = await api.get(`/admin/leads/${id}`);
    return response.data.data;
  },

  // Actualización general
  async updateLead(id, data) {
    const response = await api.patch(`/admin/leads/${id}`, data);
    return response.data.data;
  },

  // Transición de estado comercial
  async updateStatus(id, status, note = null) {
    const response = await api.patch(`/admin/leads/${id}/status`, { status, note });
    return response.data.data;
  },

  // Reasignación de operador
  async updateAssignment(id, assignedUserId) {
    const response = await api.patch(`/admin/leads/${id}/assignment`, { assignedUserId });
    return response.data.data;
  },

  // Notas internas
  async addNote(id, content) {
    const response = await api.post(`/admin/leads/${id}/notes`, { content });
    return response.data.data;
  },

  async getNotes(id) {
    const response = await api.get(`/admin/leads/${id}/notes`);
    return response.data.data;
  },

  // Actividades y contactos
  async addActivity(id, activityData) {
    const response = await api.post(`/admin/leads/${id}/activities`, activityData);
    return response.data.data;
  },

  async getActivities(id) {
    const response = await api.get(`/admin/leads/${id}/activities`);
    return response.data.data;
  },

  // Exportar a CSV
  async exportCsv(params = {}) {
    const response = await api.get('/admin/leads/export', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
