import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  Plus,
  X,
  UserPlus,
  CheckCircle2,
  MapPin,
  Building2,
} from 'lucide-react';
import { leadService } from '../../services/lead.service.js';
import { catalogService } from '../../services/catalog.service.js';
import { userService } from '../../services/user.service.js';
import { getApiErrorMessage } from '../../services/api.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { CustomerTypeBadge } from '../../components/common/CustomerTypeBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import {
  LEAD_STATUS_CONFIG,
  CUSTOMER_TYPE_OPTIONS,
  PREFERRED_CONTACT_OPTIONS,
  INITIAL_SERVICES,
} from '../../config/constants.js';

export const LeadsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [serviceCode, setServiceCode] = useState(searchParams.get('serviceCode') || '');
  const [customerType, setCustomerType] = useState(searchParams.get('customerType') || '');
  const [locality, setLocality] = useState(searchParams.get('locality') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get('limit')) || 10);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'DESC');

  // Data state
  const [data, setData] = useState({ total: 0, totalPages: 1, leads: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modal de creación de nuevo lead
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [availableServices, setAvailableServices] = useState(INITIAL_SERVICES);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [newLeadError, setNewLeadError] = useState('');
  const [successFeedback, setSuccessFeedback] = useState('');

  const initialFormState = {
    fullName: '',
    phone: '',
    email: '',
    address: '',
    locality: '',
    province: 'Argentina',
    customerType: 'HOGAR',
    services: [],
    status: 'NEW',
    assignedUserId: '',
    source: 'LLAMADA_DIRECTA',
    locationReference: '',
    description: '',
    preferredContactMethod: 'WHATSAPP',
    initialNote: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [servicesRes, usersRes] = await Promise.all([
          catalogService.getServices(),
          userService.getUsers().catch(() => []),
        ]);
        if (servicesRes && servicesRes.length > 0) {
          setAvailableServices(servicesRes);
        }
        if (usersRes && Array.isArray(usersRes)) {
          setAvailableUsers(usersRes);
        }
      } catch (err) {
        console.warn('Error al cargar metadatos de servicios/usuarios:', err);
      }
    };
    loadMetadata();
  }, []);

  const handleOpenCreateModal = () => {
    setFormData(initialFormState);
    setNewLeadError('');
    setIsCreateModalOpen(true);
  };

  const handleServiceToggle = (serviceIdentifier) => {
    setFormData((prev) => {
      const exists = prev.services.includes(serviceIdentifier);
      return {
        ...prev,
        services: exists
          ? prev.services.filter((s) => s !== serviceIdentifier)
          : [...prev.services, serviceIdentifier],
      };
    });
  };

  const handleCreateLeadSubmit = async (e) => {
    e.preventDefault();
    if (formData.services.length === 0) {
      setNewLeadError('Debe seleccionar al menos un servicio de interés.');
      return;
    }
    setIsSubmittingLead(true);
    setNewLeadError('');
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        locality: formData.locality.trim(),
        province: formData.province.trim() || 'Argentina',
        customerType: formData.customerType,
        services: formData.services,
        status: formData.status || 'NEW',
        assignedUserId: formData.assignedUserId || undefined,
        source: formData.source || 'LLAMADA_DIRECTA',
        locationReference: formData.locationReference.trim() || undefined,
        description: formData.description.trim() || undefined,
        preferredContactMethod: formData.preferredContactMethod || 'WHATSAPP',
        initialNote: formData.initialNote.trim() || undefined,
      };

      await leadService.createAdminLead(payload);
      setSuccessFeedback(`Lead "${payload.fullName}" registrado exitosamente.`);
      setIsCreateModalOpen(false);
      fetchLeads();
      setTimeout(() => setSuccessFeedback(''), 5000);
    } catch (err) {
      setNewLeadError(getApiErrorMessage(err, 'No se pudo crear el lead.'));
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    const params = {
      page,
      limit,
      search: search || undefined,
      status: status || undefined,
      serviceCode: serviceCode || undefined,
      customerType: customerType || undefined,
      locality: locality || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy,
      sortOrder,
    };

    try {
      const res = await leadService.getLeads(params);
      setData(res);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'Error al consultar leads.'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, status, serviceCode, customerType, locality, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle CSV export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await leadService.exportCsv({
        search,
        status,
        serviceCode,
        customerType,
        locality,
        startDate,
        endDate,
      });
    } catch (err) {
      alert('No se pudo generar la exportación CSV: ' + getApiErrorMessage(err));
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setServiceCode('');
    setCustomerType('');
    setLocality('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Leads
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Oportunidades comerciales registradas ({data.total} en total)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Lead</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting || data.total === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
          >
            {isExporting ? <LoadingSpinner size="sm" /> : <Download className="w-4 h-4 text-brand-600" />}
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successFeedback}</span>
          </div>
          <button
            onClick={() => setSuccessFeedback('')}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar Card */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre, teléfono, localidad o dirección..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Status filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Todos los estados</option>
              {Object.keys(LEAD_STATUS_CONFIG).map((k) => (
                <option key={k} value={k}>
                  {LEAD_STATUS_CONFIG[k].label}
                </option>
              ))}
            </select>
          </div>

          {/* Service filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Servicio
            </label>
            <select
              value={serviceCode}
              onChange={(e) => {
                setServiceCode(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Todos los servicios</option>
              {INITIAL_SERVICES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Customer type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Tipo Cliente
            </label>
            <select
              value={customerType}
              onChange={(e) => {
                setCustomerType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Todos los tipos</option>
              {CUSTOMER_TYPE_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Localidad */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Localidad
            </label>
            <input
              type="text"
              value={locality}
              onChange={(e) => {
                setLocality(e.target.value);
                setPage(1);
              }}
              placeholder="Filtro localidad"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Filter Reset Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpiar todos los filtros
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Leads Table Container */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <LoadingSpinner size="lg" className="text-brand-600" />
            <p className="text-xs text-slate-500 font-medium">Buscando leads en la base de datos...</p>
          </div>
        ) : data.leads.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-base font-bold text-slate-800">No se encontraron leads</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No hay oportunidades que coincidan con los criterios de búsqueda o filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Contacto</th>
                  <th className="py-3.5 px-4">Localidad</th>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th className="py-3.5 px-4">Servicios</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Responsable</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.leads.map((lead) => {
                  const dateStr = new Date(lead.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  const cleanPhoneDigits = lead.phone ? lead.phone.replace(/\D/g, '') : '';

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-brand-50/30 transition-colors group"
                    >
                      {/* Fecha */}
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Nombre */}
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/admin/leads/${lead.id}`}
                          className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors block text-sm"
                        >
                          {lead.fullName}
                        </Link>
                        {lead.email && (
                          <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                            {lead.email}
                          </span>
                        )}
                      </td>

                      {/* Teléfono */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-slate-700 block">{lead.phone}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`https://wa.me/${cleanPhoneDigits}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1"
                            title="Abrir WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-emerald-600" />
                            WhatsApp
                          </a>
                          <span className="text-slate-300">|</span>
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-slate-500 hover:text-slate-800 text-[11px] inline-flex items-center gap-1"
                            title="Llamar"
                          >
                            <Phone className="w-3 h-3" />
                            Llamar
                          </a>
                        </div>
                      </td>

                      {/* Localidad */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">{lead.locality}</span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                          {lead.address}
                        </span>
                      </td>

                      {/* Tipo */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <CustomerTypeBadge type={lead.customerType} />
                      </td>

                      {/* Servicios */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {lead.services?.map((s) => (
                            <span
                              key={s.id}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={lead.status} />
                      </td>

                      {/* Asignado */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {lead.assignedUser ? (
                          <span className="font-medium text-slate-800">{lead.assignedUser.fullName}</span>
                        ) : (
                          <span className="text-slate-400 italic">Sin asignar</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/leads/${lead.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-600 hover:text-white text-slate-700 font-semibold transition-all shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver detalle</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Mostrar</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="10">10 por página</option>
              <option value="25">25 por página</option>
              <option value="50">50 por página</option>
            </select>
            <span>de un total de {data.total} registros</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="font-semibold text-slate-800 px-2">
              Página {page} de {data.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= data.totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Registrar Nuevo Lead Comercial */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-sm">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    Registrar Nuevo Lead Comercial
                  </h3>
                  <p className="text-xs text-slate-400">
                    Carga manual de consultas telefónicas, visitas a local o recomendaciones.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {newLeadError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{newLeadError}</span>
              </div>
            )}

            <form onSubmit={handleCreateLeadSubmit} className="space-y-5 text-xs">
              {/* Sección 1: Información de Contacto */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                  <span>1. Datos del Cliente</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Roberto Gómez"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 11 5544-3322 o +54 9 351..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Correo Electrónico (Opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="cliente@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tipo de Cliente *
                    </label>
                    <select
                      value={formData.customerType}
                      onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-slate-800"
                    >
                      {CUSTOMER_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Contacto Preferido
                    </label>
                    <select
                      value={formData.preferredContactMethod}
                      onChange={(e) =>
                        setFormData({ ...formData, preferredContactMethod: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-slate-800"
                    >
                      {PREFERRED_CONTACT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección 2: Ubicación */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                  <span>2. Ubicación del Servicio</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Localidad / Ciudad *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Villa Carlos Paz, Pilar, etc."
                      value={formData.locality}
                      onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Dirección / Calle y Altura *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Av. San Martín 1420 o Ruta 20 Km 12"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Referencia o Punto de Interés (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Frente a la estación de servicio, portón negro con reflector"
                    value={formData.locationReference}
                    onChange={(e) =>
                      setFormData({ ...formData, locationReference: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                  />
                </div>
              </div>

              {/* Sección 3: Servicios de Interés */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                    3. Servicios de Interés * (Selecciona al menos uno)
                  </h4>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {formData.services.length} seleccionado(s)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableServices.map((svc) => {
                    const identifier = svc.id || svc.code;
                    const isChecked =
                      formData.services.includes(svc.id) || formData.services.includes(svc.code);

                    return (
                      <button
                        type="button"
                        key={identifier}
                        onClick={() => handleServiceToggle(identifier)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-brand-50/70 border-brand-500 text-brand-900 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-bold text-xs truncate">{svc.name}</span>
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked
                              ? 'bg-brand-600 border-brand-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sección 4: Gestión Comercial */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  4. Gestión Comercial
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Estado Inicial
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white font-medium"
                    >
                      {Object.keys(LEAD_STATUS_CONFIG).map((k) => (
                        <option key={k} value={k}>
                          {LEAD_STATUS_CONFIG[k].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Asignar a Asesor
                    </label>
                    <select
                      value={formData.assignedUserId}
                      onChange={(e) =>
                        setFormData({ ...formData, assignedUserId: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white font-medium"
                    >
                      <option value="">-- Sin asignar --</option>
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Canal de Origen
                    </label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white font-medium"
                    >
                      <option value="LLAMADA_DIRECTA">Llamada Telefónica</option>
                      <option value="WHATSAPP_DIRECT">WhatsApp Directo</option>
                      <option value="VISITA_LOCAL">Visita a Local / Oficina</option>
                      <option value="RECOMENDACION">Recomendación</option>
                      <option value="MANUAL_ADMIN">Carga Manual General</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nota Interna Inicial (Opcional)
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Detalles de la consulta, requerimientos específicos del cliente..."
                    value={formData.initialNote}
                    onChange={(e) => setFormData({ ...formData, initialNote: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="px-5 py-2.5 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingLead ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Registrar Lead</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
