import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { inventoryService } from '../../services/inventory.service.js';
import { getApiErrorMessage } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { COMPANY_CONFIG } from '../../config/constants.js';

const formatCurrency = (val) => {
  return `$ ${Number(val || 0).toLocaleString('es-AR')}`;
};

export const PriceCalculatorPage = () => {
  const [inventoryList, setInventoryList] = useState([]);
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

  // 1. Cargar inventario y configuración del sistema (.env)
  useEffect(() => {
    const initData = async () => {
      setIsLoadingInventory(true);
      try {
        const [configRes, invRes] = await Promise.all([
          inventoryService.getSystemConfig(),
          inventoryService.getInventory({ limit: 100 }),
        ]);

        const markup = configRes.data?.installationMarkupPercent || 100;
        setDefaultEnvMarkup(markup);
        setCustomMarkup(markup);

        setInventoryList(invRes.data?.items || []);

        // Precargar con materiales modelo sugeridos (ej. 2 cámaras + UTP + conectores)
        const items = invRes.data?.items || [];
        const initialPicks = [];

        const cam = items.find((i) => i.code.includes('CAM') || i.code.includes('CCTV'));
        if (cam) initialPicks.push({ ...cam, quantity: 2 });

        const utp = items.find((i) => i.code.includes('UTP') || i.code.includes('CABLE'));
        if (utp) initialPicks.push({ ...utp, quantity: 40 });

        const balun = items.find((i) => i.code.includes('BALUN') || i.code.includes('RJ45'));
        if (balun) initialPicks.push({ ...balun, quantity: 2 });

        if (initialPicks.length > 0) {
          setSelectedItems(initialPicks);
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

  // Presets rápidos para cotizaciones comunes
  const applyPreset = (presetName) => {
    if (presetName === 'cctv2') {
      const cam = inventoryList.find((i) => i.code.includes('CCTV') || i.code.includes('CAM-IP'));
      const dvr = inventoryList.find((i) => i.code.includes('DVR'));
      const hdd = inventoryList.find((i) => i.code.includes('HDD'));
      const utp = inventoryList.find((i) => i.code.includes('UTP'));
      const balun = inventoryList.find((i) => i.code.includes('BALUN'));

      const picks = [];
      if (cam) picks.push({ ...cam, quantity: 2 });
      if (dvr) picks.push({ ...dvr, quantity: 1 });
      if (hdd) picks.push({ ...hdd, quantity: 1 });
      if (utp) picks.push({ ...utp, quantity: 50 });
      if (balun) picks.push({ ...balun, quantity: 2 });

      setSelectedItems(picks);
      setLaborCost(45000);
    } else if (presetName === 'starlink') {
      const mount = inventoryList.find((i) => i.code.includes('STARLINK') || i.code.includes('SOPORTE'));
      const utp = inventoryList.find((i) => i.code.includes('UTP'));
      const rj45 = inventoryList.find((i) => i.code.includes('RJ45'));
      const ap = inventoryList.find((i) => i.code.includes('WIFI') || i.code.includes('ROUTER'));

      const picks = [];
      if (mount) picks.push({ ...mount, quantity: 1 });
      if (utp) picks.push({ ...utp, quantity: 30 });
      if (rj45) picks.push({ ...rj45, quantity: 4 });
      if (ap) picks.push({ ...ap, quantity: 1 });

      setSelectedItems(picks);
      setLaborCost(40000);
    } else if (presetName === 'solar') {
      const camSolar = inventoryList.find((i) => i.code.includes('SOLAR'));
      const picks = [];
      if (camSolar) picks.push({ ...camSolar, quantity: 1 });

      setSelectedItems(picks);
      setLaborCost(28000);
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

      {/* Preset Buttons */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="font-bold text-slate-700 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-brand-600" />
          Plantillas Rápidas:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => applyPreset('cctv2')}
            className="px-3 py-1.5 rounded-xl font-semibold bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 border border-slate-200 transition-all"
          >
            📹 Kit CCTV 2 Cámaras + Disco
          </button>
          <button
            onClick={() => applyPreset('starlink')}
            className="px-3 py-1.5 rounded-xl font-semibold bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 text-slate-700 border border-slate-200 transition-all"
          >
            🛰️ Montaje e Instalación Starlink
          </button>
          <button
            onClick={() => applyPreset('solar')}
            className="px-3 py-1.5 rounded-xl font-semibold bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 border border-slate-200 transition-all"
          >
            ☀️ Cámara Solar Rural 4G
          </button>
        </div>
      </div>

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
    </div>
  );
};
