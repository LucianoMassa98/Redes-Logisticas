import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  Layers,
  DollarSign,
  Filter,
  RefreshCw,
  Edit,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Calculator,
  X,
  AlertCircle,
  Boxes,
  Trash2,
  ShoppingCart,
} from 'lucide-react';
import { inventoryService } from '../../services/inventory.service.js';
import { getApiErrorMessage } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';

const formatCurrency = (val) => {
  return `$ ${Number(val || 0).toLocaleString('es-AR')}`;
};

const getMarkupBadgeStyle = (percent) => {
  const val = Number(percent || 0);
  if (val <= 0) return 'bg-slate-100 text-slate-700 border-slate-300';
  if (val <= 10) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (val <= 20) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  if (val <= 30) return 'bg-teal-50 text-teal-700 border-teal-200';
  if (val <= 40) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (val <= 50) return 'bg-green-50 text-green-700 border-green-200';
  if (val <= 60) return 'bg-lime-50 text-lime-800 border-lime-300';
  if (val <= 70) return 'bg-amber-50 text-amber-800 border-amber-300';
  if (val <= 80) return 'bg-orange-50 text-orange-800 border-orange-300';
  if (val <= 90) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (val <= 100) return 'bg-purple-50 text-purple-700 border-purple-300 font-bold';
  if (val <= 150) return 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold';
  return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-300 font-black';
};

export const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [systemMarkup, setSystemMarkup] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Modal para eliminar producto
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados de formulario de creación / edición
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'MATERIALES',
    costPrice: '',
    stockQuantity: 0,
    minStockAlert: 5,
    unit: 'UNIDAD',
    markupPercent: '',
    description: '',
    isActive: true,
  });

  // Estado para ajuste de stock
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'ADD',
    quantity: 1,
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (onlyLowStock) params.lowStock = 'true';

      const res = await inventoryService.getInventory(params);
      const data = res.data;
      setItems(data.items || []);
      setMetrics(data.metrics || null);
      setCategories(data.categories || []);
      if (data.systemDefaultMarkupPercent) {
        setSystemMarkup(data.systemDefaultMarkupPercent);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error al cargar el inventario.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, onlyLowStock]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleOpenCreate = () => {
    setFormData({
      code: '',
      name: '',
      category: 'CÁMARAS',
      costPrice: '',
      stockQuantity: 0,
      minStockAlert: 5,
      unit: 'UNIDAD',
      markupPercent: '',
      description: '',
      isActive: true,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      category: item.category,
      costPrice: item.costPrice,
      stockQuantity: item.stockQuantity,
      minStockAlert: item.minStockAlert,
      unit: item.unit,
      markupPercent: item.markupPercent !== null ? item.markupPercent : '',
      description: item.description || '',
      isActive: item.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenStockAdjust = (item) => {
    setSelectedItem(item);
    setStockAdjustment({
      type: 'ADD',
      quantity: 1,
      reason: '',
    });
    setIsStockModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category.trim(),
        costPrice: Number(formData.costPrice),
        stockQuantity: Number(formData.stockQuantity) || 0,
        minStockAlert: Number(formData.minStockAlert) || 0,
        unit: formData.unit.trim().toUpperCase(),
        markupPercent: formData.markupPercent !== '' ? Number(formData.markupPercent) : null,
        description: formData.description.trim() || null,
        isActive: formData.isActive,
      };

      await inventoryService.createItem(payload);
      setSuccessMessage(`Artículo "${payload.name}" agregado con éxito.`);
      setIsCreateModalOpen(false);
      fetchInventory();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      alert(getApiErrorMessage(err, 'No se pudo crear el artículo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category.trim(),
        costPrice: Number(formData.costPrice),
        stockQuantity: Number(formData.stockQuantity) >= 0 ? Number(formData.stockQuantity) : 0,
        minStockAlert: Number(formData.minStockAlert) || 0,
        unit: formData.unit.trim().toUpperCase(),
        markupPercent: formData.markupPercent !== '' ? Number(formData.markupPercent) : null,
        description: formData.description.trim() || null,
        isActive: formData.isActive,
      };

      await inventoryService.updateItem(selectedItem.id, payload);
      setSuccessMessage(`Artículo "${payload.name}" actualizado correctamente.`);
      setIsEditModalOpen(false);
      fetchInventory();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      alert(getApiErrorMessage(err, 'No se pudo actualizar el artículo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await inventoryService.adjustStock(selectedItem.id, {
        type: stockAdjustment.type,
        quantity: Number(stockAdjustment.quantity),
        reason: stockAdjustment.reason.trim() || undefined,
      });
      setSuccessMessage(`Stock de "${selectedItem.name}" actualizado.`);
      setIsStockModalOpen(false);
      fetchInventory();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      alert(getApiErrorMessage(err, 'Error al ajustar el stock.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (item) => {
    setDeleteTarget(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await inventoryService.deleteItem(deleteTarget.id);
      setSuccessMessage(`Artículo "${deleteTarget.name}" (${deleteTarget.code}) eliminado del inventario.`);
      setDeleteTarget(null);
      if (isEditModalOpen && selectedItem?.id === deleteTarget.id) {
        setIsEditModalOpen(false);
      }
      fetchInventory();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      alert(getApiErrorMessage(err, 'No se pudo eliminar el artículo.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Control de Inventario y Costos
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-3 h-3" /> Margen Base: +{systemMarkup}%
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de stock, insumos técnicos, precios de costo y cálculo automático de venta.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/calculator"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>Calculador de Precios</span>
          </Link>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Artículo</span>
          </button>
        </div>
      </div>

      {/* Success notification banner */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Artículos</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{metrics.totalItems || 0}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{metrics.totalUnits ?? 0} unidades en stock</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Crítico</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{metrics.lowStockItems || 0}</p>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5">Requieren reposición</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Costo Stock Mínimo</p>
              <p className="text-2xl font-black text-rose-600 mt-1">
                {formatCurrency(metrics.totalReplenishCost ?? metrics.totalMinStockCost)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5" title="Dinero necesario para alcanzar el mínimo de stock de todos los artículos">
                Para cubrir faltantes ({metrics.totalReplenishUnits || 0} u.)
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor al Costo</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(metrics.totalCostValue ?? metrics.totalInventoryCostValue)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Capital hoy en stock</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm flex items-center justify-between border border-slate-700">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Margen Automático</p>
              <p className="text-2xl font-black text-cyan-400 mt-1">+{systemMarkup}%</p>
              <p className="text-[11px] text-slate-300 mt-0.5">Configurado en .env</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, SKU o nombre del material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center gap-1.5"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">Todas las Categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={(e) => setOnlyLowStock(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
            />
            <span className="text-xs font-semibold text-slate-700">Solo Bajo Stock</span>
          </label>

          <button
            onClick={fetchInventory}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all border border-slate-200"
            title="Recargar inventario"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading && items.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" className="text-brand-600" />
            <p className="text-xs font-medium text-slate-500">Cargando inventario...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-slate-900">{error}</p>
            <button
              onClick={fetchInventory}
              className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl"
            >
              Reintentar
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No se encontraron artículos</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No hay artículos que coincidan con la búsqueda o filtro seleccionado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 whitespace-nowrap min-w-[120px]">Código / SKU</th>
                  <th className="py-3 px-4 min-w-[200px]">Artículo & Detalle</th>
                  <th className="py-3 px-4 whitespace-nowrap min-w-[120px]">Categoría</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap min-w-[150px]">Stock / Mínimo</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap min-w-[170px] w-48">Precio Costo</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap min-w-[120px] w-32">Margen</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap min-w-[170px] w-48">Precio Venta (Calc)</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap min-w-[110px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {items.map((item) => {
                  const isOut = item.stockQuantity <= 0;
                  const isCritical = item.stockQuantity <= item.minStockAlert && !isOut;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Código */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {item.code}
                      </td>

                      {/* Nombre y descripción */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Unidad: {item.unit}
                        </span>
                      </td>

                      {/* Categoría */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                      </td>

                      {/* Stock y alerta */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs ${
                              isOut
                                ? 'bg-red-100 text-red-700'
                                : isCritical
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.stockQuantity} {item.unit}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Mínimo: {item.minStockAlert} {item.unit}
                        </div>
                        {item.stockQuantity < item.minStockAlert && (
                          <div
                            className="text-[10px] font-semibold text-rose-600 mt-0.5 whitespace-nowrap"
                            title="Capital necesario para alcanzar el stock mínimo requerido de este artículo"
                          >
                            Faltan {item.minStockAlert - item.stockQuantity} ({formatCurrency((item.minStockAlert - item.stockQuantity) * item.costPrice)})
                          </div>
                        )}
                      </td>

                      {/* Costo */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap min-w-[170px]">
                        <div className="font-semibold text-slate-800 text-sm whitespace-nowrap">
                          {formatCurrency(item.costPrice)}
                        </div>
                        <div
                          className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap"
                          title="Capital invertido en este artículo (Costo x Stock actual)"
                        >
                          Total stock: {formatCurrency(Number(item.costPrice || 0) * Number(item.stockQuantity || 0))}
                        </div>
                      </td>

                      {/* Margen */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap min-w-[120px]">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors whitespace-nowrap ${getMarkupBadgeStyle(item.effectiveMarkupPercent)}`}
                          title={
                            item.markupPercent !== null
                              ? `Margen específico asignado: +${item.effectiveMarkupPercent}%`
                              : `Margen general del sistema (.env): +${item.effectiveMarkupPercent}%`
                          }
                        >
                          +{item.effectiveMarkupPercent}%
                        </span>
                        {item.markupPercent !== null && (
                          <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-tighter">
                            Específico
                          </div>
                        )}
                      </td>

                      {/* Precio de Venta Calculado (Costo + 100%) */}
                      <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm whitespace-nowrap min-w-[170px]">
                        <span className="whitespace-nowrap">{formatCurrency(item.calculatedSalePrice)}</span>
                        <div className="text-[10px] text-emerald-700/70 font-medium whitespace-nowrap mt-0.5">
                          Venta unitaria
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenStockAdjust(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Ajustar Stock"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Editar Artículo"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Eliminar Artículo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 text-xs font-bold text-slate-700">
                <tr>
                  <td colSpan="3" className="py-3 px-4 text-slate-500 uppercase tracking-wider text-[11px] whitespace-nowrap">
                    Totales (en pantalla)
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-xs">
                      {items.reduce((acc, curr) => acc + Number(curr.stockQuantity || 0), 0)} unidades
                    </span>
                    {items.some((i) => i.stockQuantity < i.minStockAlert) && (
                      <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                        Faltan: {items.reduce((acc, curr) => acc + Math.max(0, Number(curr.minStockAlert || 0) - Number(curr.stockQuantity || 0)), 0)} u.
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap min-w-[170px]">
                    <span className="text-[10px] text-slate-400 block font-normal">Valor al Costo actual:</span>
                    <span className="text-slate-900 font-black">
                      {formatCurrency(items.reduce((acc, curr) => acc + (Number(curr.costPrice || 0) * Number(curr.stockQuantity || 0)), 0))}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap min-w-[120px]">
                    <span className="text-[10px] text-slate-400 block font-normal">Costo reposición mín:</span>
                    <span className="text-rose-700 font-black">
                      {formatCurrency(items.reduce((acc, curr) => acc + (Math.max(0, Number(curr.minStockAlert || 0) - Number(curr.stockQuantity || 0)) * Number(curr.costPrice || 0)), 0))}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap min-w-[170px]">
                    <span className="text-[10px] text-slate-400 block font-normal">Venta total stock:</span>
                    <span className="text-emerald-700 font-black">
                      {formatCurrency(items.reduce((acc, curr) => acc + (Number(curr.calculatedSalePrice || 0) * Number(curr.stockQuantity || 0)), 0))}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] text-slate-400 font-normal whitespace-nowrap">
                    {items.length} artículos
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Crear Artículo */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Nuevo Artículo de Inventario</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código / SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. CAM-SOLAR-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. CÁMARAS, REDES, ACCESORIOS"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Material o Equipo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cámara de Seguridad Solar 4G HD con Panel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Precio Costo ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unidad</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
                  >
                    <option value="UNIDAD">UNIDAD</option>
                    <option value="METRO">METRO</option>
                    <option value="ROLLO">ROLLO</option>
                    <option value="KIT">KIT</option>
                    <option value="HORA">HORA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alerta Stock Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Margen % (Opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={`Por defecto: ${systemMarkup}%`}
                    value={formData.markupPercent}
                    onChange={(e) => setFormData({ ...formData, markupPercent: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Vista previa de precio calculado */}
              {formData.costPrice && Number(formData.costPrice) > 0 && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                  <span className="text-[11px] font-semibold">
                    Precio de Venta Automático (+{formData.markupPercent ? formData.markupPercent : systemMarkup}%):
                  </span>
                  <span className="text-sm font-black text-emerald-700">
                    {formatCurrency(
                      Number(formData.costPrice) *
                        (1 + (formData.markupPercent ? Number(formData.markupPercent) : systemMarkup) / 100)
                    )}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción / Especificación Técnica</label>
                <textarea
                  rows="2"
                  placeholder="Detalles técnicos, marca, compatibilidad..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Artículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Artículo */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Editar Artículo</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedItem.code}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white uppercase font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Precio de Costo ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Stock Actual ({formData.unit || 'Unidades'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alerta Stock Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Margen % Personalizado</label>
                <input
                  type="number"
                  min="0"
                  placeholder={`Vacío = estándar ${systemMarkup}%`}
                  value={formData.markupPercent}
                  onChange={(e) => setFormData({ ...formData, markupPercent: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                />
              </div>

              {/* Vista previa de precio calculado */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                <span className="text-[11px] font-semibold">
                  Precio de Venta Automático (+{formData.markupPercent ? formData.markupPercent : systemMarkup}%):
                </span>
                <span className="text-sm font-black text-emerald-700">
                  {formatCurrency(
                    Number(formData.costPrice) *
                      (1 + (formData.markupPercent ? Number(formData.markupPercent) : systemMarkup) / 100)
                  )}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenDelete(selectedItem);
                  }}
                  className="px-3 py-2 rounded-xl font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Artículo</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 transition-all disabled:opacity-50 text-xs"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ajustar Stock */}
      {isStockModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ArrowUpDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Ajuste Rápido de Stock</h3>
                  <p className="text-[11px] text-slate-500">{selectedItem.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-600">Stock Actual:</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {selectedItem.stockQuantity} {selectedItem.unit}
              </span>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Operación</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockAdjustment({ ...stockAdjustment, type: 'ADD' })}
                    className={`py-2 px-3 rounded-xl font-bold border text-center transition-all ${
                      stockAdjustment.type === 'ADD'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    + Sumar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAdjustment({ ...stockAdjustment, type: 'SUBTRACT' })}
                    className={`py-2 px-3 rounded-xl font-bold border text-center transition-all ${
                      stockAdjustment.type === 'SUBTRACT'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    - Restar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockAdjustment({ ...stockAdjustment, type: 'SET' })}
                    className={`py-2 px-3 rounded-xl font-bold border text-center transition-all ${
                      stockAdjustment.type === 'SET'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    = Fijar
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {stockAdjustment.type === 'SET' ? 'Nuevo Stock Total' : 'Cantidad a Modificar'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-extrabold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Ingreso de compra proveedor, Instalación en cliente #104"
                  value={stockAdjustment.reason}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Aplicando...' : 'Confirmar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar Eliminación de Artículo */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Eliminar del Inventario</h3>
                  <p className="text-[11px] text-slate-400">Esta acción no se puede deshacer.</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                disabled={isDeleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Artículo:</span>
                <strong className="text-slate-900 font-bold">{deleteTarget.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Código / SKU:</span>
                <span className="font-mono font-bold text-slate-800">{deleteTarget.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Categoría:</span>
                <span className="font-semibold text-slate-700">{deleteTarget.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stock Actual:</span>
                <span className="font-bold text-slate-800">{deleteTarget.stockQuantity} {deleteTarget.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Precio Costo:</span>
                <span className="font-bold text-slate-800">{formatCurrency(deleteTarget.costPrice)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente este producto del inventario? Ya no estará disponible para presupuestar ni en el stock general.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Producto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

