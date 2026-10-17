import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Calculator,
  Trash2,
  Edit,
  DollarSign,
  Package,
  Wrench,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Filter,
  Copy,
} from 'lucide-react';
import { presetService } from '../../services/preset.service.js';
import { inventoryService } from '../../services/inventory.service.js';
import { getApiErrorMessage } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';

const formatCurrency = (val) => {
  return `$ ${Number(val || 0).toLocaleString('es-AR')}`;
};

export const PresetsManagementPage = () => {
  const navigate = useNavigate();
  const [presets, setPresets] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [systemMarkup, setSystemMarkup] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    code: '',
    category: 'CÁMARAS',
    icon: 'Layers',
    laborCost: 35000,
    markupPercent: '',
    description: '',
    items: [],
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);
  const [itemToAdd, setItemToAdd] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPresets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory) params.category = selectedCategory;

      const [presetsData, invData, configData] = await Promise.all([
        presetService.getPresets(params),
        inventoryService.getInventory({ limit: 100 }),
        inventoryService.getSystemConfig(),
      ]);

      setPresets(presetsData || []);
      setInventoryList(invData.data?.items || []);
      if (configData.data?.installationMarkupPercent) {
        setSystemMarkup(configData.data.installationMarkupPercent);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al cargar las plantillas rápidas.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPresets();
  };

  const handleOpenCreate = () => {
    setEditingPreset(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (preset) => {
    setEditingPreset(preset);
    setFormData({
      name: preset.name,
      code: preset.code,
      category: preset.category,
      icon: preset.icon || 'Layers',
      laborCost: preset.laborCost,
      markupPercent: preset.markupPercent !== null ? preset.markupPercent : '',
      description: preset.description || '',
      items: preset.items.map((it) => ({
        id: it.id,
        code: it.code,
        name: it.name,
        quantity: it.quantity,
        costPrice: it.costPrice,
        unit: it.unit,
      })),
      isActive: preset.isActive,
    });
    setIsModalOpen(true);
  };

  const handleAddItemToPreset = (itemId) => {
    if (!itemId) return;
    const invItem = inventoryList.find((i) => i.id === itemId);
    if (!invItem) return;

    const existingIndex = formData.items.findIndex((i) => i.id === itemId);
    if (existingIndex >= 0) {
      const updated = [...formData.items];
      updated[existingIndex].quantity += 1;
      setFormData({ ...formData, items: updated });
    } else {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            id: invItem.id,
            code: invItem.code,
            name: invItem.name,
            costPrice: invItem.costPrice,
            unit: invItem.unit,
            quantity: 1,
          },
        ],
      });
    }
    setItemToAdd('');
  };

  const handleUpdateItemQty = (itemId, qty) => {
    const val = Math.max(1, Number(qty) || 1);
    setFormData({
      ...formData,
      items: formData.items.map((i) => (i.id === itemId ? { ...i, quantity: val } : i)),
    });
  };

  const handleRemoveItem = (itemId) => {
    setFormData({
      ...formData,
      items: formData.items.filter((i) => i.id !== itemId),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('El nombre y el código de la plantilla son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        category: formData.category.trim(),
        icon: formData.icon.trim(),
        laborCost: Number(formData.laborCost) || 0,
        markupPercent: formData.markupPercent !== '' ? Number(formData.markupPercent) : null,
        description: formData.description.trim() || null,
        items: formData.items.map((it) => ({
          id: it.id,
          code: it.code,
          quantity: Number(it.quantity) || 1,
        })),
        isActive: formData.isActive,
      };

      if (editingPreset) {
        await presetService.updatePreset(editingPreset.id, payload);
        setSuccessMessage(`Plantilla "${payload.name}" actualizada con éxito.`);
      } else {
        await presetService.createPreset(payload);
        setSuccessMessage(`Plantilla "${payload.name}" creada con éxito.`);
      }

      setIsModalOpen(false);
      fetchPresets();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      alert(getApiErrorMessage(err, 'No se pudo guardar la plantilla.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (preset) => {
    if (!window.confirm(`¿Estás seguro de eliminar la plantilla "${preset.name}"?`)) {
      return;
    }

    try {
      await presetService.deletePreset(preset.id);
      setSuccessMessage(`Plantilla "${preset.name}" eliminada.`);
      fetchPresets();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      alert(getApiErrorMessage(err, 'Error al eliminar la plantilla.'));
    }
  };

  const handleUseInCalculator = (preset) => {
    navigate('/admin/calculator', { state: { presetToLoad: preset } });
  };

  const categoriesList = ['TODAS', 'CÁMARAS', 'STARLINK', 'REDES', 'ENERGIA_SOLAR', 'GENERAL'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Plantillas Rápidas de Instalación
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
              <Sparkles className="w-3.5 h-3.5" /> Precargas Automáticas
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona kits de materiales y costos de mano de obra predefinidos para cotizar en un clic.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/calculator"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>Ir al Calculador</span>
          </Link>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Plantilla</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar plantilla por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
          {categoriesList.map((cat) => {
            const isSelected = (cat === 'TODAS' && !selectedCategory) || selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat === 'TODAS' ? '' : cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Presets Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" className="text-brand-600" />
          <p className="text-xs font-medium text-slate-500">Cargando plantillas predefinidas...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-3 bg-white rounded-3xl border border-red-200">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm font-bold text-slate-900">{error}</p>
          <button onClick={fetchPresets} className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl">
            Reintentar
          </button>
        </div>
      ) : presets.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No hay plantillas registradas</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Crea tu primera plantilla de instalación para agilizar el cotizador de presupuestos.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 text-xs font-bold bg-brand-600 text-white rounded-xl shadow-md"
          >
            + Crear Plantilla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {presets.map((preset) => {
            const markup = preset.markupPercent !== null ? preset.markupPercent : systemMarkup;
            const totalEstimatedSale = Math.round(preset.summary.totalEstimatedBaseCost * (1 + markup / 100));

            return (
              <div
                key={preset.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
              >
                {/* Header Card */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                          {preset.name}
                        </h3>
                        <span className="font-mono text-[10px] text-slate-400 font-bold">
                          {preset.code}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {preset.category}
                    </span>
                  </div>

                  {preset.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  )}
                </div>

                {/* Items preview list */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Materiales Incluidos ({preset.items?.length || 0})
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {preset.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-700 truncate max-w-[240px]">
                          • {it.quantity}x {it.name}
                        </span>
                        <span className="font-semibold text-slate-500 text-[11px]">
                          {formatCurrency(it.lineCost)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Mano de Obra Técnica:</span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(preset.laborCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Costo Base Total (Materiales + Labor):</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(preset.summary.totalEstimatedBaseCost)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-700">
                        Precio Sugerido (+{markup}%)
                      </span>
                      <span className="text-base font-black text-emerald-800">
                        {formatCurrency(totalEstimatedSale)}
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      +{markup}% Margen
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(preset)}
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Editar Plantilla"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(preset)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar Plantilla"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUseInCalculator(preset)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
                  >
                    <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cotizar con esta plantilla</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Crear / Editar Plantilla */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingPreset ? 'Editar Plantilla Rápida' : 'Nueva Plantilla Rápida'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define los materiales e insumos necesarios y el honorario de mano de obra base.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre de la Plantilla *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Kit CCTV 4 Cámaras DVR + Disco"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código / Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. CCTV_4CAM_DVR"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white font-medium"
                  >
                    <option value="CÁMARAS">CÁMARAS</option>
                    <option value="STARLINK">STARLINK</option>
                    <option value="REDES">REDES</option>
                    <option value="ENERGIA_SOLAR">ENERGIA_SOLAR</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mano de Obra ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.laborCost}
                    onChange={(e) => setFormData({ ...formData, laborCost: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Margen % (Opcional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder={`Por defecto: ${systemMarkup}%`}
                    value={formData.markupPercent}
                    onChange={(e) => setFormData({ ...formData, markupPercent: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción / Alcance</label>
                <textarea
                  rows="2"
                  placeholder="Detalles sobre qué incluye la instalación..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white resize-none"
                />
              </div>

              {/* Selector de Materiales del Inventario */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-900 uppercase text-[11px]">
                    Materiales e Insumos Incluidos ({formData.items.length})
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={itemToAdd}
                    onChange={(e) => setItemToAdd(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-xs cursor-pointer"
                  >
                    <option value="">-- Seleccionar insumo para agregar a la plantilla --</option>
                    {inventoryList.map((item) => (
                      <option key={item.id} value={item.id}>
                        [{item.code}] {item.name} - Costo: {formatCurrency(item.costPrice)} /{item.unit}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddItemToPreset(itemToAdd)}
                    disabled={!itemToAdd}
                    className="px-3.5 py-2 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white shadow-xs transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>

                {formData.items.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400">
                    No has agregado materiales aún. Puedes seleccionar insumos arriba.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                    {formData.items.map((it) => (
                      <div key={it.id} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-800 truncate block">{it.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{it.code}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500">Cantidad:</span>
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => handleUpdateItemQty(it.id, e.target.value)}
                            className="w-14 text-center py-1 rounded-lg border border-slate-200 font-bold bg-white text-xs"
                          />
                          <span className="text-[10px] text-slate-400">{it.unit}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : editingPreset ? 'Actualizar Plantilla' : 'Crear Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
