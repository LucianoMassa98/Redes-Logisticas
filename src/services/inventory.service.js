import { api } from './api.js';

export const inventoryService = {
  /**
   * Obtiene la lista de artículos del inventario con métricas y categorías
   * @param {Object} params - { search, category, lowStock, activeOnly, page, limit }
   */
  async getInventory(params = {}) {
    const response = await api.get('/admin/inventory', { params });
    return response.data;
  },

  /**
   * Obtiene el detalle de un artículo específico por su ID
   * @param {string} id
   */
  async getItemById(id) {
    const response = await api.get(`/admin/inventory/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo artículo de inventario
   * @param {Object} itemData
   */
  async createItem(itemData) {
    const response = await api.post('/admin/inventory', itemData);
    return response.data;
  },

  /**
   * Actualiza los datos de un artículo existente
   * @param {string} id
   * @param {Object} itemData
   */
  async updateItem(id, itemData) {
    const response = await api.patch(`/admin/inventory/${id}`, itemData);
    return response.data;
  },

  /**
   * Ajusta el stock de un artículo (+, -, SET)
   * @param {string} id
   * @param {Object} adjustData - { quantity: number, type: 'ADD'|'SUBTRACT'|'SET', reason: string }
   */
  async adjustStock(id, adjustData) {
    const response = await api.patch(`/admin/inventory/${id}/stock`, adjustData);
    return response.data;
  },

  /**
   * Realiza el cálculo automático de precio de instalación (Costo + 100% de .env)
   * @param {Object} payload - { items: [{ id, quantity }], laborCost, customMarkupPercent }
   */
  async calculateQuotePrice(payload) {
    const response = await api.post('/admin/inventory/calculate', payload);
    return response.data;
  },

  /**
   * Obtiene las variables de configuración del sistema (como INSTALLATION_MARKUP_PERCENT)
   */
  async getSystemConfig() {
    const response = await api.get('/admin/inventory/config');
    return response.data;
  },
};
