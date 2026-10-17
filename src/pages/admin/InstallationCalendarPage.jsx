import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Phone,
  MapPin,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Edit,
  Trash2,
  Search,
  Filter,
  Layers,
  Wrench,
  Shield,
  CheckCheck,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { scheduleService } from '../../services/schedule.service.js';
import { leadService } from '../../services/lead.service.js';
import { presetService } from '../../services/preset.service.js';
import { getApiErrorMessage } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import {
  INSTALLATION_STATUS_CONFIG,
  INSTALLATION_PRIORITY_CONFIG,
  INITIAL_SERVICES,
} from '../../config/constants.js';

// Nombres de los meses y días en español
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const InstallationCalendarPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Fecha actual visualizada en el calendario (año y mes)
  const [currentDate, setCurrentDate] = useState(() => {
    const paramDate = searchParams.get('date');
    if (paramDate && /^\d{4}-\d{2}-\d{2}$/.test(paramDate)) {
      return new Date(paramDate);
    }
    return new Date();
  });

  // Vista activa: 'MONTH' o 'AGENDA'
  const [viewMode, setViewMode] = useState('MONTH');

  // Datos
  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState(null);
  const [leadsList, setLeadsList] = useState([]);
  const [presetsList, setPresetsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterService, setFilterService] = useState('ALL');
  const [filterTechnician, setFilterTechnician] = useState('ALL');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE'); // 'CREATE' | 'EDIT'
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State para Crear / Editar
  const initialFormState = {
    id: null,
    leadId: '',
    presetId: '',
    title: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    locality: '',
    serviceType: 'STARLINK',
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    durationMinutes: 120,
    technicianName: '',
    status: 'CONFIRMED',
    priority: 'NORMAL',
    estimatedPrice: 0,
    notes: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  // Cargar datos principales
  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      // Calcular rango de fechas para el mes mostrado (+ días colindantes)
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month - 1, 20).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 15).toISOString().split('T')[0];

      const [schedulesData, statsData, presetsData] = await Promise.all([
        scheduleService.getSchedules({ startDate: firstDay, endDate: lastDay }),
        scheduleService.getCalendarStats(),
        presetService.getPresets({ activeOnly: true }).catch(() => []),
      ]);

      setSchedules(schedulesData || []);
      setStats(statsData || null);
      setPresetsList(presetsData || []);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Error al cargar las instalaciones del calendario.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar lista ligera de leads para autocompletar si se abre el modal
  const loadLeadsForPicker = async () => {
    if (leadsList.length === 0) {
      try {
        const leadsData = await leadService.getLeads({ limit: 100 });
        setLeadsList(leadsData.leads || []);
      } catch (err) {
        console.warn('No se pudieron cargar leads para el selector:', err);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [currentDate.getFullYear(), currentDate.getMonth()]);

  // Chequear parámetros URL para abrir modal prellenado (ej: desde Lead Detail o Cotizador)
  useEffect(() => {
    const isNew = searchParams.get('new') === '1';
    if (isNew) {
      loadLeadsForPicker();
      const leadId = searchParams.get('leadId') || '';
      const name = searchParams.get('name') || '';
      const phone = searchParams.get('phone') || '';
      const address = searchParams.get('address') || '';
      const locality = searchParams.get('locality') || '';
      const service = searchParams.get('service') || 'STARLINK';
      const price = Number(searchParams.get('price')) || 0;
      const title = searchParams.get('title') || (name ? `Instalación - ${name}` : 'Nueva Instalación');
      const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

      setFormData({
        ...initialFormState,
        leadId,
        clientName: name,
        clientPhone: phone,
        clientAddress: address,
        locality,
        serviceType: service,
        estimatedPrice: price,
        title,
        scheduledDate: date,
      });
      setModalMode('CREATE');
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // Navegación de mes
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  // Filtrado de instalaciones
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      // Búsqueda libre
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(term);
        const matchName = item.clientName?.toLowerCase().includes(term);
        const matchPhone = item.clientPhone?.toLowerCase().includes(term);
        const matchAddress = item.clientAddress?.toLowerCase().includes(term);
        const matchLocality = item.locality?.toLowerCase().includes(term);
        const matchTech = item.technicianName?.toLowerCase().includes(term);
        if (!matchTitle && !matchName && !matchPhone && !matchAddress && !matchLocality && !matchTech) {
          return false;
        }
      }

      // Filtro de Estado
      if (filterStatus !== 'ALL' && item.status !== filterStatus) {
        return false;
      }

      // Filtro de Servicio
      if (filterService !== 'ALL' && item.serviceType !== filterService) {
        return false;
      }

      // Filtro de Técnico
      if (filterTechnician !== 'ALL' && item.technicianName !== filterTechnician) {
        return false;
      }

      return true;
    });
  }, [schedules, searchTerm, filterStatus, filterService, filterTechnician]);

  // Agrupamiento por fecha para la cuadrícula del calendario
  const schedulesByDate = useMemo(() => {
    const map = new Map();
    filteredSchedules.forEach((item) => {
      const dateKey = item.scheduledDate;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(item);
    });
    return map;
  }, [filteredSchedules]);

  // Lista de técnicos únicos
  const availableTechnicians = useMemo(() => {
    const set = new Set();
    schedules.forEach((s) => {
      if (s.technicianName) set.add(s.technicianName);
    });
    return Array.from(set).sort();
  }, [schedules]);

  // Cálculo de los días de la grilla mensual (Lunes a Domingo)
  const calendarGridDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // En JS: 0=Domingo, 1=Lunes, ..., 6=Sábado.
    // Lo convertimos a 0=Lunes, ..., 6=Domingo:
    let startingDayIndex = firstDayOfMonth.getDay() - 1;
    if (startingDayIndex === -1) startingDayIndex = 6;

    const totalDaysInMonth = lastDayOfMonth.getDate();
    const days = [];

    // Días del mes anterior para completar la primera semana
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateString = prevDate.toISOString().split('T')[0];
      days.push({
        dayNumber: dayNum,
        dateString,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Días del mes actual
    const todayStr = new Date().toISOString().split('T')[0];
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const thisDate = new Date(year, month, d);
      // Evitar desfase de zona horaria usando componentes locales
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateString,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
      });
    }

    // Días del próximo mes para completar las 5 o 6 semanas (múltiplo de 7)
    const remainingSlots = 7 - (days.length % 7);
    if (remainingSlots < 7) {
      for (let d = 1; d <= remainingSlots; d++) {
        const nextDate = new Date(year, month + 1, d);
        const dateString = nextDate.toISOString().split('T')[0];
        days.push({
          dayNumber: d,
          dateString,
          isCurrentMonth: false,
          isToday: false,
        });
      }
    }

    return days;
  }, [currentDate]);

  // Abrir Modal para crear en un día específico
  const handleOpenCreateForDate = (dateString) => {
    loadLeadsForPicker();
    setFormData({
      ...initialFormState,
      scheduledDate: dateString,
    });
    setModalMode('CREATE');
    setIsModalOpen(true);
  };

  // Abrir Modal para editar
  const handleOpenEdit = (schedule) => {
    loadLeadsForPicker();
    setFormData({
      id: schedule.id,
      leadId: schedule.leadId || '',
      presetId: schedule.presetId || '',
      title: schedule.title || '',
      clientName: schedule.clientName || '',
      clientPhone: schedule.clientPhone || '',
      clientEmail: schedule.clientEmail || '',
      clientAddress: schedule.clientAddress || '',
      locality: schedule.locality || '',
      serviceType: schedule.serviceType || 'STARLINK',
      scheduledDate: schedule.scheduledDate,
      startTime: schedule.startTime || '09:00',
      durationMinutes: schedule.durationMinutes || 120,
      technicianName: schedule.technicianName || '',
      status: schedule.status || 'CONFIRMED',
      priority: schedule.priority || 'NORMAL',
      estimatedPrice: schedule.estimatedPrice || 0,
      notes: schedule.notes || '',
    });
    setModalMode('EDIT');
    setIsDetailOpen(false);
    setIsModalOpen(true);
  };

  // Abrir Detalle de Instalación
  const handleOpenDetail = (schedule) => {
    setDetailItem(schedule);
    setIsDetailOpen(true);
  };

  // Manejar selección de Lead existente en el formulario
  const handleLeadSelected = (leadId) => {
    if (!leadId) {
      setFormData((prev) => ({ ...prev, leadId: '' }));
      return;
    }
    const found = leadsList.find((l) => l.id === leadId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        leadId: found.id,
        clientName: found.fullName || prev.clientName,
        clientPhone: found.phone || prev.clientPhone,
        clientEmail: found.email || prev.clientEmail,
        clientAddress: found.address || prev.clientAddress,
        locality: found.locality || prev.locality,
        title: prev.title || `Instalación - ${found.fullName}`,
      }));
    }
  };

  // Manejar selección de Plantilla Rápida
  const handlePresetSelected = (presetId) => {
    if (!presetId) {
      setFormData((prev) => ({ ...prev, presetId: '' }));
      return;
    }
    const found = presetsList.find((p) => p.id === presetId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        presetId: found.id,
        title: prev.title ? prev.title : found.name,
        estimatedPrice: found.laborCost ? Number(found.laborCost) * 2 : prev.estimatedPrice,
        notes: prev.notes ? prev.notes : `Kit base: ${found.name}`,
      }));
    }
  };

  // Enviar formulario (Crear o Actualizar)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMessage('');

      if (modalMode === 'CREATE') {
        await scheduleService.createSchedule(formData);
        setActionSuccess('¡Instalación programada agendada con éxito!');
      } else {
        await scheduleService.updateSchedule(formData.id, formData);
        setActionSuccess('¡Instalación actualizada correctamente!');
      }

      setIsModalOpen(false);
      await loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Error al guardar la instalación.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualización rápida de estado
  const handleQuickStatusChange = async (scheduleId, newStatus) => {
    try {
      setIsSubmitting(true);
      await scheduleService.updateStatus(scheduleId, { status: newStatus });
      setActionSuccess(`Estado cambiado a ${INSTALLATION_STATUS_CONFIG[newStatus]?.label || newStatus}`);
      await loadData();

      // Si el detalle está abierto, actualizarlo también
      if (detailItem && detailItem.id === scheduleId) {
        const updated = await scheduleService.getScheduleById(scheduleId);
        setDetailItem(updated);
      }
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'No se pudo actualizar el estado de la instalación.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar instalación
  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta instalación programada?')) {
      return;
    }
    try {
      setIsSubmitting(true);
      await scheduleService.deleteSchedule(id);
      setActionSuccess('Instalación eliminada del calendario.');
      setIsDetailOpen(false);
      await loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Error al eliminar la instalación.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generar link de WhatsApp directo para confirmación
  const getWhatsAppReminderUrl = (item) => {
    if (!item?.clientPhone) return '#';
    const cleanPhone = item.clientPhone.replace(/\D/g, '');
    const dateFormatted = new Date(`${item.scheduledDate}T00:00:00`).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    const message = encodeURIComponent(
      `Hola ${item.clientName}! Te escribimos de TechConnect Seguridad & Redes para confirmar la visita técnica programada para el ${dateFormatted} a las ${item.startTime} hs en ${item.clientAddress}. ¿Nos confirmás si va a haber alguien para recibir al técnico ${item.technicianName || ''}? ¡Muchas gracias!`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>Operaciones & Logística en Terreno</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Calendario de Instalaciones
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Programación de visitas técnicas, asignación de cuadrillas y órdenes de instalación activas.
          </p>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-3">
          {/* Toggle de Vista */}
          <div className="bg-slate-200 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'MONTH'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('AGENDA')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'AGENDA'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lista / Agenda
            </button>
          </div>

          <button
            onClick={() => {
              loadLeadsForPicker();
              setFormData(initialFormState);
              setModalMode('CREATE');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-700 hover:to-cyan-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Instalación</span>
          </button>
        </div>
      </div>

      {/* Alertas de Éxito o Error */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-semibold animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Cards del Mes */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total en Mes</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.total || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">Confirmadas</p>
              <p className="text-2xl font-black text-blue-900 mt-1">{stats.confirmed || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase">Pendientes</p>
              <p className="text-2xl font-black text-amber-900 mt-1">{stats.pending || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase">Completadas</p>
              <p className="text-2xl font-black text-emerald-900 mt-1">{stats.completed || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <p className="text-xs font-semibold text-cyan-600 uppercase">Próximas</p>
              <p className="text-2xl font-black text-cyan-900 mt-1">{stats.upcoming || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Barra de Filtros y Navegación de Mes */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Controles de Mes (Anterior, Mes Actual, Siguiente, Hoy) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleGoToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-white rounded-lg transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <span className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
        </div>

        {/* Filtros de Búsqueda */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Buscador */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente, dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Filtro de Estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="PENDING">Pendiente</option>
            <option value="IN_PROGRESS">En Curso</option>
            <option value="COMPLETED">Completada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>

          {/* Filtro de Técnico */}
          {availableTechnicians.length > 0 && (
            <select
              value={filterTechnician}
              onChange={(e) => setFilterTechnician(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="ALL">Todos los Técnicos</option>
              {availableTechnicians.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Renderizado de Vista: Calendario Mensual vs Agenda */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" className="text-cyan-500" />
          <p className="text-sm font-semibold text-slate-500 mt-4">Cargando instalaciones programadas...</p>
        </div>
      ) : viewMode === 'MONTH' ? (
        /* VISTA MENSUAL EN CUADRÍCULA */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Cabecera de Días de la Semana */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
            {WEEKDAY_NAMES.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Grilla de Días */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {calendarGridDays.map((day, idx) => {
              const daySchedules = schedulesByDate.get(day.dateString) || [];

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] sm:min-h-[135px] p-2 flex flex-col justify-between group transition-colors relative ${
                    !day.isCurrentMonth
                      ? 'bg-slate-50/50 text-slate-400'
                      : day.isToday
                      ? 'bg-cyan-50/30'
                      : 'bg-white hover:bg-slate-50/70'
                  }`}
                >
                  {/* Encabezado del Día */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        day.isToday
                          ? 'bg-brand-600 text-white font-extrabold shadow-sm'
                          : day.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {/* Botón flotante para agendar en esta fecha */}
                    {day.isCurrentMonth && (
                      <button
                        onClick={() => handleOpenCreateForDate(day.dateString)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-slate-200 hover:bg-brand-600 hover:text-white text-slate-600 transition-all text-xs"
                        title={`Agendar para el ${day.dateString}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Chips de Instalaciones en este día */}
                  <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px] scrollbar-thin">
                    {daySchedules.map((schedule) => {
                      const statusConfig =
                        INSTALLATION_STATUS_CONFIG[schedule.status] ||
                        INSTALLATION_STATUS_CONFIG.CONFIRMED;

                      return (
                        <div
                          key={schedule.id}
                          onClick={() => handleOpenDetail(schedule)}
                          className={`cursor-pointer px-2 py-1 rounded-md text-[11px] font-semibold transition-all shadow-xs ${statusConfig.chip}`}
                          title={`${schedule.title} - ${schedule.clientName}`}
                        >
                          <div className="flex items-center justify-between gap-1 leading-tight">
                            <span className="font-extrabold text-[10px] text-slate-700">
                              {schedule.startTime}
                            </span>
                            <span className="truncate text-slate-900 font-medium">
                              {schedule.clientName || schedule.title}
                            </span>
                          </div>
                          {schedule.technicianName && (
                            <p className="text-[9px] text-slate-500 truncate mt-0.5">
                              {schedule.technicianName}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VISTA LISTA / AGENDA CRONOLÓGICA */
        <div className="space-y-3">
          {filteredSchedules.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No hay instalaciones programadas</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No se encontraron visitas que coincidan con los filtros seleccionados o el mes visualizado.
              </p>
            </div>
          ) : (
            filteredSchedules.map((item) => {
              const statusConfig =
                INSTALLATION_STATUS_CONFIG[item.status] ||
                INSTALLATION_STATUS_CONFIG.CONFIRMED;
              const priorityConfig =
                INSTALLATION_PRIORITY_CONFIG[item.priority] ||
                INSTALLATION_PRIORITY_CONFIG.NORMAL;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Fecha & Horario */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-100 flex flex-col items-center justify-center flex-shrink-0 text-center">
                      <span className="text-[10px] font-bold text-cyan-600 uppercase">
                        {new Date(`${item.scheduledDate}T00:00:00`).toLocaleDateString('es-AR', {
                          weekday: 'short',
                        })}
                      </span>
                      <span className="text-xl font-black text-slate-900 leading-none">
                        {item.scheduledDate.split('-')[2]}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {MONTH_NAMES[Number(item.scheduledDate.split('-')[1]) - 1]?.substring(0, 3)}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-extrabold text-cyan-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.startTime} hs ({item.durationMinutes} min)
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusConfig.badge}`}>
                          {statusConfig.label}
                        </span>
                        {item.priority && item.priority !== 'NORMAL' && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base">{item.title}</h3>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 mt-1.5">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {item.clientName}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {item.clientAddress} {item.locality ? `(${item.locality})` : ''}
                        </span>
                        {item.technicianName && (
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Wrench className="w-3.5 h-3.5 text-cyan-600" />
                            Técnico: {item.technicianName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {/* Botón WhatsApp */}
                    {item.clientPhone && (
                      <a
                        href={getWhatsAppReminderUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                        title="Enviar recordatorio por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}

                    {/* Botón Llamar */}
                    {item.clientPhone && (
                      <a
                        href={`tel:${item.clientPhone}`}
                        className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        title="Llamar al cliente"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}

                    {/* Botón Detalle */}
                    <button
                      onClick={() => handleOpenDetail(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-sm"
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL: PROGRAMAR / EDITAR INSTALACIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative my-8 border border-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {modalMode === 'CREATE' ? 'Programar Nueva Instalación' : 'Modificar Instalación'}
                </h2>
                <p className="text-xs text-slate-500">
                  Completa los datos técnicos y de contacto para la orden de trabajo.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Opciones de Precarga Rápida (Lead o Plantilla) */}
              {modalMode === 'CREATE' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Asociar Lead Existente (Opcional)
                    </label>
                    <select
                      value={formData.leadId}
                      onChange={(e) => handleLeadSelected(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">-- Sin asociar / Cliente Directo --</option>
                      {leadsList.map((lead) => (
                        <option key={lead.id} value={lead.id}>
                          {lead.fullName} ({lead.locality})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Precargar Kit / Plantilla (Opcional)
                    </label>
                    <select
                      value={formData.presetId}
                      onChange={(e) => handlePresetSelected(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">-- Personalizado / A Medida --</option>
                      {presetsList.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Título de la Instalación */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título / Trabajo a Realizar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Montaje Starlink Satelital - Casa Principal"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Datos del Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Juan Pérez"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+54 9 341 555-1234"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Dirección & Localidad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dirección de Instalación *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ruta 9 Km 285 o Calle y N°"
                    value={formData.clientAddress}
                    onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Localidad</label>
                  <input
                    type="text"
                    placeholder="Rosario / Funes"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Fecha, Hora y Duración */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fecha Programada *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duración Estimada
                  </label>
                  <select
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value={60}>1 hora (60 min)</option>
                    <option value={90}>1 hora y media (90 min)</option>
                    <option value={120}>2 horas (120 min)</option>
                    <option value={180}>3 horas (180 min)</option>
                    <option value={240}>4 horas (Medio día)</option>
                    <option value={360}>6 horas (Día completo)</option>
                  </select>
                </div>
              </div>

              {/* Servicio, Técnico y Prioridad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Servicio
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  >
                    {INITIAL_SERVICES.map((srv) => (
                      <option key={srv.code} value={srv.code}>
                        {srv.name}
                      </option>
                    ))}
                    <option value="OTRO">Otro Servicio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Técnico / Cuadrilla
                  </label>
                  <input
                    type="text"
                    placeholder="Marcos Rodríguez"
                    value={formData.technicianName}
                    onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="LOW">Baja</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>

              {/* Estado y Monto Estimado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="CONFIRMED">Confirmada</option>
                    <option value="PENDING">Pendiente de Confirmación</option>
                    <option value="IN_PROGRESS">En Curso</option>
                    <option value="COMPLETED">Completada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monto / Presupuesto Total ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.estimatedPrice}
                    onChange={(e) => setFormData({ ...formData, estimatedPrice: Number(e.target.value) })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Notas Técnicas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Requerimientos Técnicos y Herramientas
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Llevar escalera telescópica 6m, adaptador de caño Starlink y percutora..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-700 hover:to-cyan-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {isSubmitting && <LoadingSpinner size="sm" />}
                  <span>{modalMode === 'CREATE' ? 'Guardar en Agenda' : 'Actualizar Instalación'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETALLE Y ACCIONES DE LA INSTALACIÓN */}
      {isDetailOpen && detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 relative border border-slate-100">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabecera del Detalle */}
            <div className="mb-5 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                    INSTALLATION_STATUS_CONFIG[detailItem.status]?.badge || ''
                  }`}
                >
                  {INSTALLATION_STATUS_CONFIG[detailItem.status]?.label || detailItem.status}
                </span>

                {detailItem.priority && detailItem.priority !== 'NORMAL' && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      INSTALLATION_PRIORITY_CONFIG[detailItem.priority]?.color || ''
                    }`}
                  >
                    Prioridad {INSTALLATION_PRIORITY_CONFIG[detailItem.priority]?.label}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {detailItem.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fecha:{' '}
                <strong className="text-slate-800">
                  {new Date(`${detailItem.scheduledDate}T00:00:00`).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>{' '}
                a las <strong className="text-slate-800">{detailItem.startTime} hs</strong> (
                {detailItem.durationMinutes} minutos estimados)
              </p>
            </div>

            {/* Información del Cliente y Lugar */}
            <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Cliente</p>
                  <p className="text-sm font-extrabold text-slate-900">{detailItem.clientName}</p>
                </div>
                {detailItem.estimatedPrice > 0 && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Monto Total</p>
                    <p className="text-sm font-black text-emerald-600">
                      ${Number(detailItem.estimatedPrice).toLocaleString('es-AR')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Phone className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <span className="font-semibold">{detailItem.clientPhone}</span>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-700">
                <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                <span>
                  {detailItem.clientAddress} {detailItem.locality ? `- ${detailItem.locality}` : ''}
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${detailItem.clientAddress}, ${detailItem.locality || ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-cyan-600 hover:underline flex items-center gap-0.5 text-[11px] font-bold"
                >
                  <span>Mapa</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {detailItem.technicianName && (
                <div className="flex items-center gap-2 text-xs text-slate-700 pt-2 border-t border-slate-200/60">
                  <Wrench className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>
                    Técnico Asignado:{' '}
                    <strong className="text-slate-900">{detailItem.technicianName}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Requerimientos y Notas */}
            {detailItem.notes && (
              <div className="mb-5">
                <h4 className="text-xs font-bold text-slate-600 uppercase mb-1">
                  Notas Técnicas y Herramientas
                </h4>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {detailItem.notes}
                </p>
              </div>
            )}

            {/* Cambio Rápido de Estado */}
            <div className="mb-6">
              <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">
                Actualizar Estado de la Visita:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((stKey) => {
                  const cfg = INSTALLATION_STATUS_CONFIG[stKey];
                  const isCurrent = detailItem.status === stKey;

                  return (
                    <button
                      key={stKey}
                      type="button"
                      disabled={isCurrent || isSubmitting}
                      onClick={() => handleQuickStatusChange(detailItem.id, stKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isCurrent
                          ? `${cfg.badge} ring-2 ring-cyan-500`
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botones de Acción Primaria (WhatsApp, Llamar, Editar, Eliminar) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {detailItem.clientPhone && (
                  <a
                    href={getWhatsAppReminderUrl(detailItem)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {detailItem.leadId && (
                  <Link
                    to={`/admin/leads/${detailItem.leadId}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Ver Lead</span>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(detailItem)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => handleDeleteSchedule(detailItem.id)}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Eliminar instalación"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
