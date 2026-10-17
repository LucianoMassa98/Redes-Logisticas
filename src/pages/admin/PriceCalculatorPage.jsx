import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calculator,
  Package,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Copy,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Info,
  Wrench,
  ChevronDown,
  Settings,
  BookmarkPlus,
  Calendar,
  X,
} from 'lucide-react';
import { inventoryService } from '../../services/inventory.service.js';
import { presetService } from '../../services/preset.service.js';
import { getApiErrorMessage } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { COMPANY_CONFIG } from '../../config/constants.js';

const formatCurrency = (val) => {
  return `$ ${Number(val || 0).toLocaleString('es-AR')}`;
};

export const PriceCalculatorPage = () => {
  const location = useLocation();
  const [inventoryList, setInventoryList] = useState([]);
  const [dbPresets, setDbPresets] = useState([]);
  const [defaultEnvMarkup, setDefaultEnvMarkup] = useState(100);
  const [customMarkup, setCustomMarkup] = useState(100);
  const [useCustomMarkup, setUseCustomMarkup] = useState(false);

  // Materiales seleccionados para la instalación: array de { id, quantity, name, unitCost, unit, code }
  const [selectedItems, setSelectedItems] = useState([]);
  const [laborCost, setLaborCost] = useState(35000); // Costo base mano de obra inicial sugerido

  const [calculationResult, setCalculationResult] = useState(null);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [selectedItemToAdd, setSelectedItemToAdd] = useState('');

  // Modal para guardar como nueva plantilla
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [savePresetForm, setSavePresetForm] = useState({
    name: '',
    code: '',
    category: 'CÁMARAS',
    description: '',
  });
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [saveSuccessFeedback, setSaveSuccessFeedback] = useState('');

  const applyDbPreset = (preset) => {
    if (!preset || !preset.items) return;
    const formattedItems = preset.items.map((it) => ({
      id: it.id,
      code: it.code,
      name: it.name,
      costPrice: it.costPrice,
      unit: it.unit,
      quantity: Number(it.quantity) || 1,
    }));
    setSelectedItems(formattedItems);
    setLaborCost(Number(preset.laborCost) || 0);
    if (preset.markupPercent !== null && preset.markupPercent !== undefined) {
      setCustomMarkup(Number(preset.markupPercent));
      setUseCustomMarkup(true);
    } else {
      setUseCustomMarkup(false);
      setCustomMarkup(defaultEnvMarkup);
    }
  };

  // 1. Cargar inventario, plantillas de la BD y configuración del sistema (.env)
  useEffect(() => {
    const initData = async () => {
      setIsLoadingInventory(true);
      try {
        const [configRes, invRes, presetsData] = await Promise.all([
          inventoryService.getSystemConfig(),
          inventoryService.getInventory({ limit: 100 }),
          presetService.getPresets().catch(() => []),
        ]);

        const markup = configRes.data?.installationMarkupPercent || 100;
        setDefaultEnvMarkup(markup);
        setCustomMarkup(markup);

        const items = invRes.data?.items || [];
        setInventoryList(items);

        const presets = presetsData || [];
        setDbPresets(presets);

        // Si se envió una plantilla específica por navegación desde /admin/presets
        if (location.state?.presetToLoad) {
          applyDbPreset(location.state.presetToLoad);
        } else if (presets.length > 0) {
          // Aplicar la primera plantilla guardada en la base de datos
          applyDbPreset(presets[0]);
        }
      } catch (err) {
        console.error('Error al inicializar calculador:', err);
      } finally {
        setIsLoadingInventory(false);
      }
    };

    initData();
  }, []);

  // 2. Ejecutar cálculo cada vez que cambien los materiales, mano de obra o margen
  useEffect(() => {
    if (selectedItems.length === 0 && laborCost === 0) {
      setCalculationResult(null);
      return;
    }

    const runCalculation = async () => {
      setIsCalculating(true);
      try {
        const payload = {
          items: selectedItems.map((item) => ({
            id: item.id,
            quantity: Number(item.quantity) || 1,
          })),
          laborCost: Number(laborCost) || 0,
          customMarkupPercent: useCustomMarkup ? Number(customMarkup) : null,
        };

        const res = await inventoryService.calculateQuotePrice(payload);
        setCalculationResult(res.data);
      } catch (err) {
        // En caso de que no haya items de base de datos
        console.warn('Error en cálculo en backend:', err);
      } finally {
        setIsCalculating(false);
      }
    };

    const timeout = setTimeout(runCalculation, 250);
    return () => clearTimeout(timeout);
  }, [selectedItems, laborCost, customMarkup, useCustomMarkup]);

  // Manejadores de items
  const handleAddItem = (itemId) => {
    if (!itemId) return;
    const invItem = inventoryList.find((i) => i.id === itemId);
    if (!invItem) return;

    const existingIndex = selectedItems.findIndex((i) => i.id === itemId);
    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, { ...invItem, quantity: 1 }]);
    }
    setSelectedItemToAdd('');
  };

  const handleUpdateQuantity = (itemId, newQty) => {
    const qty = Math.max(1, Number(newQty) || 1);
    setSelectedItems(
      selectedItems.map((item) => (item.id === itemId ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
  };

  const handleReset = () => {
    setSelectedItems([]);
    setLaborCost(30000);
    setUseCustomMarkup(false);
    setCustomMarkup(defaultEnvMarkup);
  };

  const handleOpenSaveModal = () => {
    if (selectedItems.length === 0) return;
    const autoCode = `KIT_${Date.now().toString().slice(-6)}`;
    setSavePresetForm({
      name: `Instalación Personalizada (${selectedItems.length} materiales)`,
      code: autoCode,
      category: 'GENERAL',
      description: 'Plantilla guardada desde el calculador de precios.',
    });
    setIsSaveModalOpen(true);
  };

  const handleSavePresetSubmit = async (e) => {
    e.preventDefault();
    if (!savePresetForm.name.trim() || !savePresetForm.code.trim()) {
      alert('Nombre y código son obligatorios.');
      return;
    }
    setIsSavingPreset(true);
    try {
      const payload = {
        name: savePresetForm.name.trim(),
        code: savePresetForm.code.trim().toUpperCase(),
        category: savePresetForm.category,
        laborCost: Number(laborCost) || 0,
        markupPercent: useCustomMarkup ? Number(customMarkup) : null,
        description: savePresetForm.description.trim() || null,
        items: selectedItems.map((it) => ({
          id: it.id,
          code: it.code,
          quantity: Number(it.quantity) || 1,
        })),
        isActive: true,
      };

      await presetService.createPreset(payload);
      const updatedPresets = await presetService.getPresets();
      setDbPresets(updatedPresets || []);
      setSaveSuccessFeedback(`Plantilla "${payload.name}" guardada con éxito en la base de datos.`);
      setIsSaveModalOpen(false);
      setTimeout(() => setSaveSuccessFeedback(''), 5000);
    } catch (err) {
      alert(getApiErrorMessage(err, 'No se pudo guardar la plantilla.'));
    } finally {
      setIsSavingPreset(false);
    }
  };

  // Generador de texto para WhatsApp
  const handleCopyWhatsAppQuote = () => {
    if (!calculationResult) return;

    const summary = calculationResult.summary;
    const itemsList = calculationResult.items
      .map((it) => `• ${it.quantity}x ${it.name} (${it.unit})`)
      .join('\n');

    const text = `🛠️ *PRESUPUESTO TÉCNICO DE INSTALACIÓN*
*${COMPANY_CONFIG.name}*
${COMPANY_CONFIG.tagline}

📦 *Equipos y Materiales Incluidos:*
${itemsList || '• Materiales de instalación según especificación'}

🔧 *Servicio de Mano de Obra Especializada:*
• Montaje profesional, cableado prolijo y canalizado.
• Configuración de red, apertura de puertos y conexión a app móvil.
• Puesta en marcha y prueba de funcionamiento con el cliente.
• Garantía escrita sobre mano de obra y materiales.

💵 *TOTAL FINAL DE LA INSTALACIÓN:*
*${formatCurrency(summary.totalFinalSalePrice)}*

_Presupuesto válido por 15 días. Factura y garantía oficial._
¿Querés que coordinemos la visita de instalación esta semana?`;

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 3000);
  };

  const activeMarkup = useCustomMarkup ? customMarkup : defaultEnvMarkup;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Calculador Automático de Instalaciones
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
              <Sparkles className="w-3.5 h-3.5" /> Margen .env: +{defaultEnvMarkup}%
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Calcula presupuestos precisos basados en el costo real de materiales + mano de obra con margen configurable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/inventory"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Package className="w-4 h-4 text-slate-500" />
            <span>Ver Inventario</span>
          </Link>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
            title="Reiniciar cotizador"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Preset Buttons cargados dinámicamente desde PostgreSQL */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700 flex items-center gap-1.5 mr-1">
            <Layers className="w-4 h-4 text-brand-600" />
            Plantillas Rápidas:
          </span>
          {dbPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyDbPreset(preset)}
              className="px-3 py-1.5 rounded-xl font-semibold bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
              title={`Cargar ${preset.name} (${preset.items?.length || 0} materiales)`}
            >
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenSaveModal}
            disabled={selectedItems.length === 0}
            className="px-3 py-1.5 rounded-xl font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
            title="Guardar los materiales y labor actuales como una plantilla rápida en la base de datos"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Guardar como Plantilla</span>
          </button>

          <Link
            to="/admin/presets"
            className="px-3 py-1.5 rounded-xl font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5"
            title="Administrar todas las plantillas"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Gestionar Plantillas</span>
          </Link>
        </div>
      </div>

      {saveSuccessFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{saveSuccessFeedback}</span>
          </div>
          <button onClick={() => setSaveSuccessFeedback('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Builder (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card: Selector de Materiales del Inventario */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  Materiales e Insumos de Instalación
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {selectedItems.length} seleccionados
              </span>
            </div>

            {/* Selector dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedItemToAdd}
                  onChange={(e) => setSelectedItemToAdd(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 cursor-pointer"
                >
                  <option value="">-- Seleccionar insumo desde el inventario --</option>
                  {inventoryList.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.code}] {item.name} - Costo: {formatCurrency(item.costPrice)} (Stock: {item.stockQuantity} {item.unit})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => handleAddItem(selectedItemToAdd)}
                disabled={!selectedItemToAdd}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>

            {/* Table of selected items */}
            {selectedItems.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-xs text-slate-400">
                  No hay materiales agregados. Selecciona insumos o carga una plantilla rápida.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-hidden">
                {selectedItems.map((item) => {
                  const lineCost = (Number(item.costPrice) || 0) * item.quantity;
                  const lineSale = lineCost * (1 + activeMarkup / 100);

                  return (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-400">
                            {item.code}
                          </span>
                          <span className="font-bold text-slate-800 truncate">
                            {item.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Costo unitario: {formatCurrency(item.costPrice)} /{item.unit}
                        </p>
                      </div>

                      {/* Cantidad Stepper */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                          className="w-12 text-center py-1 rounded-lg border border-slate-200 font-bold text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right w-24">
                        <div className="font-bold text-slate-900">
                          {formatCurrency(lineCost)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          Venta: {formatCurrency(lineSale)}
                        </div>
                      </div>

                      {/* Eliminar */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                        title="Quitar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card: Mano de Obra / Instalación */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  Costo de Mano de Obra Técnica
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Honorarios / Técnicos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Costo Base de Mano de Obra ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm font-extrabold bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Ajuste rápido de labor:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setLaborCost(25000)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Básica ($25k)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLaborCost(45000)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Media ($45k)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLaborCost(75000)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    Compleja ($75k)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Margen de Ganancia (.env + 100%) */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Margen de Ganancia Comercial
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Definido globalmente en .env: <strong className="text-slate-700">+{defaultEnvMarkup}%</strong>
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomMarkup}
                  onChange={(e) => {
                    setUseCustomMarkup(e.target.checked);
                    if (!e.target.checked) setCustomMarkup(defaultEnvMarkup);
                  }}
                  className="rounded text-brand-600 focus:ring-brand-500 h-3.5 w-3.5"
                />
                <span>Personalizar Margen</span>
              </label>
            </div>

            {useCustomMarkup ? (
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-purple-900">Margen Personalizado para esta cotización:</span>
                  <span className="text-purple-700 text-base">+{customMarkup}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="250"
                  step="5"
                  value={customMarkup}
                  onChange={(e) => setCustomMarkup(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-purple-500 font-semibold">
                  <span>20% (Mínimo)</span>
                  <span>100% (Estándar .env)</span>
                  <span>250% (Premium)</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Aplicando regla automática: <strong>Costo + {defaultEnvMarkup}%</strong>
                </span>
                <span className="font-extrabold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-md">
                  +{defaultEnvMarkup}% Automático
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Price Breakdown & WhatsApp Share (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Price Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-xl border border-slate-800 relative overflow-hidden space-y-5">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    Precio Sugerido de Instalación
                  </h3>
                  <span className="text-[10px] text-cyan-400 font-semibold tracking-wide">
                    COSTO + {activeMarkup}% DE UTILIDAD
                  </span>
                </div>
              </div>
              {isCalculating && (
                <LoadingSpinner size="sm" className="text-cyan-400" />
              )}
            </div>

            {/* Total Sale Price Hero */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Cotización al Cliente
              </p>
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-white">
                {calculationResult
                  ? formatCurrency(calculationResult.summary.totalFinalSalePrice)
                  : formatCurrency(0)}
              </div>
              <p className="text-[11px] text-slate-400">
                IVA / Factura y garantía incluida
              </p>
            </div>

            {/* Breakdown summary */}
            {calculationResult && (
              <div className="space-y-2.5 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Costo Total Materiales:</span>
                  <span className="font-mono font-semibold">
                    {formatCurrency(calculationResult.summary.totalMaterialCost)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Costo Mano de Obra:</span>
                  <span className="font-mono font-semibold">
                    {formatCurrency(calculationResult.summary.totalLaborCost)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Costo Base Total (Inversión):</span>
                  <span className="font-mono font-bold text-slate-200">
                    {formatCurrency(calculationResult.summary.totalBaseCost)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Ganancia Bruta Estimada (+{activeMarkup}%):</span>
                  <span className="font-mono font-bold">
                    +{formatCurrency(calculationResult.summary.totalGrossProfit)}
                  </span>
                </div>
              </div>
            )}

            {/* WhatsApp Quote Generator Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopyWhatsAppQuote}
                disabled={!calculationResult || selectedItems.length === 0}
                className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                  copyFeedback
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20'
                } disabled:opacity-40`}
              >
                {copyFeedback ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Copiado para WhatsApp!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Cotización para WhatsApp</span>
                  </>
                )}
              </button>

              {/* Botón Agendar Instalación directamente */}
              {calculationResult && selectedItems.length > 0 && (
                <Link
                  to={`/admin/calendar?new=1&price=${calculationResult.summary.totalFinalSalePrice}&title=${encodeURIComponent(clientName ? `Instalación - ${clientName}` : 'Instalación Cotizada')}&name=${encodeURIComponent(clientName || '')}`}
                  className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-700 hover:to-cyan-600 text-white shadow-md transition-all mt-2.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar Instalación con este Presupuesto</span>
                </Link>
              )}
            </div>
          </div>

          {/* Guarantee and Commercial Value Explainer */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Shield className="w-4 h-4 text-cyan-600" />
              <span>Garantía de Rentabilidad</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              El margen del <strong>+{defaultEnvMarkup}%</strong> asegura cubrir los gastos operativos, traslados técnicos, imprevistos de instalación y garantiza un margen neto sustentable para la empresa.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                Para modificar el margen estándar de forma permanente en todo el sistema, edita la variable <code className="bg-slate-200 px-1 rounded text-slate-800">INSTALLATION_MARKUP_PERCENT</code> en el archivo <code className="bg-slate-200 px-1 rounded text-slate-800">.env</code> del backend.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Guardar como Plantilla Rápida */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BookmarkPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Guardar como Plantilla Rápida
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Se guardarán los {selectedItems.length} materiales y la mano de obra actual (${Number(laborCost).toLocaleString()}).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePresetSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre de la Plantilla *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Kit 4 Cámaras DVR + Instalación"
                  value={savePresetForm.name}
                  onChange={(e) =>
                    setSavePresetForm({ ...savePresetForm, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Código / Identificador *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. KIT_4CAM"
                    value={savePresetForm.code}
                    onChange={(e) =>
                      setSavePresetForm({
                        ...savePresetForm,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={savePresetForm.category}
                    onChange={(e) =>
                      setSavePresetForm({ ...savePresetForm, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white font-medium"
                  >
                    <option value="CÁMARAS">CÁMARAS</option>
                    <option value="STARLINK">STARLINK</option>
                    <option value="REDES">REDES</option>
                    <option value="ENERGIA_SOLAR">ENERGIA_SOLAR</option>
                    <option value="GENERAL">GENERAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Detalles sobre el uso recomendado de esta plantilla..."
                  value={savePresetForm.description}
                  onChange={(e) =>
                    setSavePresetForm({ ...savePresetForm, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPreset}
                  className="px-5 py-2 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingPreset ? 'Guardando...' : 'Guardar Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
