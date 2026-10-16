import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  User,
  Clock,
  Shield,
  Send,
  PlusCircle,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Edit,
} from 'lucide-react';
import { leadService } from '../../services/lead.service.js';
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

export const LeadDetailPage = () => {
  const { id } = useParams();

  const [lead, setLead] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals & form state
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'activities' | 'quote' | 'edit'
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Status transition state
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Assignee state
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [isUpdatingAssignee, setIsUpdatingAssignee] = useState(false);

  // Edit Lead State
  const [editForm, setEditForm] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Quote State
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);

  const fetchLeadDetails = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await leadService.getLeadById(id);
      setLead(data);
      setSelectedStatus(data.status);
      setSelectedAssignee(data.assignedUserId || '');
      setEditForm({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || '',
        address: data.address,
        locality: data.locality,
        customerType: data.customerType,
        description: data.description || '',
        locationReference: data.locationReference || '',
        preferredContactMethod: data.preferredContactMethod,
        services: data.services ? data.services.map((s) => s.id) : [],
      });
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'No se pudo cargar el detalle del lead.'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const u = await userService.getUsers();
      setUsers(u);
    } catch (err) {
      // Ignorar si no tiene permisos
    }
  };

  useEffect(() => {
    fetchLeadDetails();
    fetchUsers();
  }, [id]);

  // Handle Note Submission
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    try {
      await leadService.addNote(id, newNote);
      setNewNote('');
      setActionSuccess('Nota interna registrada exitosamente.');
      await fetchLeadDetails();
    } catch (err) {
      alert('Error al agregar nota: ' + getApiErrorMessage(err));
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle Status Change
  const handleStatusChange = async (newStatus) => {
    if (newStatus === lead.status) return;
    setIsUpdatingStatus(true);
    try {
      await leadService.updateStatus(id, newStatus, statusNote);
      setStatusNote('');
      setActionSuccess(`Estado cambiado a ${LEAD_STATUS_CONFIG[newStatus]?.label || newStatus}.`);
      await fetchLeadDetails();
    } catch (err) {
      alert('Error al actualizar estado: ' + getApiErrorMessage(err));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Assignee Change
  const handleAssigneeChange = async (e) => {
    const val = e.target.value;
    setSelectedAssignee(val);
    setIsUpdatingAssignee(true);
    try {
      await leadService.updateAssignment(id, val || null);
      setActionSuccess('Responsable asignado correctamente.');
      await fetchLeadDetails();
    } catch (err) {
      alert('Error al asignar responsable: ' + getApiErrorMessage(err));
    } finally {
      setIsUpdatingAssignee(false);
    }
  };

  // Handle Edit Save
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      await leadService.updateLead(id, editForm);
      setActionSuccess('Datos del lead actualizados correctamente.');
      await fetchLeadDetails();
      setActiveTab('notes');
    } catch (err) {
      alert('Error al guardar cambios: ' + getApiErrorMessage(err));
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Quick Activity helper (Contact made or visit scheduled)
  const handleRegisterContact = async (type, desc) => {
    try {
      await leadService.addActivity(id, {
        activityType: type,
        description: desc,
      });
      setActionSuccess('Actividad registrada en la línea de tiempo.');
      await fetchLeadDetails();
    } catch (err) {
      alert('Error: ' + getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <LoadingSpinner size="lg" className="text-brand-600" />
        <p className="text-sm font-medium text-slate-500">Cargando información del lead...</p>
      </div>
    );
  }

  if (errorMessage || !lead) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-red-200 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">No se pudo cargar el lead</h3>
        <p className="text-sm text-slate-600">{errorMessage || 'El registro no existe o fue eliminado.'}</p>
        <Link
          to="/admin/leads"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al listado
        </Link>
      </div>
    );
  }

  const cleanDigits = lead.phone ? lead.phone.replace(/\D/g, '') : '';
  const dateFormatted = new Date(lead.createdAt).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <Link
          to="/admin/leads"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a listado de leads
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>✓ {actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-600 hover:underline">
            Cerrar
          </button>
        </div>
      )}

      {/* Main Header Card with Quick Contact Buttons */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {lead.fullName}
            </h1>
            <StatusBadge status={lead.status} />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
            <span>ID: {lead.id}</span>
            <span>•</span>
            <span>Ingreso: {dateFormatted}</span>
            <span>•</span>
            <span>Origen: {lead.source}</span>
          </div>
        </div>

        {/* Quick Communication CTAs */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href={`https://wa.me/${cleanDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleRegisterContact('CONTACT_MADE', 'Contacto iniciado vía WhatsApp')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Abrir WhatsApp</span>
          </a>

          <a
            href={`tel:${lead.phone}`}
            onClick={() => handleRegisterContact('CONTACT_MADE', 'Llamada telefónica realizada')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200"
          >
            <Phone className="w-4 h-4 text-slate-600" />
            <span>Llamar</span>
          </a>
        </div>
      </div>

      {/* Interactive Status Pipeline Stepper */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Flujo de Estado Comercial
          </h2>
          <span className="text-xs text-slate-400">Hacé click en un estado para avanzar</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.keys(LEAD_STATUS_CONFIG).map((st) => {
            const isCurrent = lead.status === st;
            const cfg = LEAD_STATUS_CONFIG[st];

            return (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusChange(st)}
                disabled={isUpdatingStatus}
                className={`p-3 rounded-2xl text-left border text-xs font-semibold transition-all relative ${
                  isCurrent
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-brand-400 hover:bg-brand-50/40'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                  <span className="truncate">{cfg.label}</span>
                </div>
                {isCurrent && (
                  <span className="text-[10px] text-cyan-400 font-mono block">Actual</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lead Info & Assignment */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Contact Details */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Datos del Potencial Cliente</h3>
              <button
                onClick={() => setActiveTab('edit')}
                className="text-xs text-brand-600 hover:underline font-semibold flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" /> Editar
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block">Teléfono / WhatsApp:</span>
                  <span className="font-mono text-slate-900 font-semibold">{lead.phone}</span>
                </div>
              </div>

              {lead.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Correo Electrónico:</span>
                    <span className="text-slate-900">{lead.email}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block">Dirección & Localidad:</span>
                  <span className="text-slate-900 font-medium">
                    {lead.address}, {lead.locality}
                  </span>
                  {lead.locationReference && (
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Ref: {lead.locationReference}
                    </span>
                  )}
                </div>
              </div>

              {lead.latitude && lead.longitude && (
                <div className="flex items-start gap-3">
                  <Navigation className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block">Coordenadas GPS:</span>
                    <a
                      href={`https://www.google.com/maps?q=${lead.latitude},${lead.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-cyan-600 hover:underline block"
                    >
                      {lead.latitude}, {lead.longitude} ↗
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block">Tipo de Inmueble:</span>
                  <div className="mt-1">
                    <CustomerTypeBadge type={lead.customerType} />
                  </div>
                </div>
              </div>

              {lead.description && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block mb-1 font-semibold">Necesidad informada:</span>
                  <p className="p-3 rounded-xl bg-slate-50 text-slate-700 italic border border-slate-100 text-xs">
                    "{lead.description}"
                  </p>
                </div>
              )}
            </div>

            {/* Asignación de Responsable */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-900">
                Operador Comercial Asignado
              </label>
              <select
                value={selectedAssignee}
                onChange={handleAssigneeChange}
                disabled={isUpdatingAssignee}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Sin asignar</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Card: Servicios de Interés */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Servicios Solicitados</h3>
            <div className="space-y-2">
              {lead.services?.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-2xl bg-brand-50/50 border border-brand-100 text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-brand-900">{s.name}</span>
                  <span className="font-mono text-[10px] text-brand-600 bg-white px-2 py-0.5 rounded border border-brand-200">
                    {s.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Tabs (Notas Internas | Historial de Actividades | Editar | Presupuestos) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Navigation Tab Bar */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Notas Internas ({lead.notes?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('activities')}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'activities'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Historial & Auditoría ({lead.activities?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('edit')}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'edit'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Edit className="w-4 h-4" />
              <span>Editar Datos</span>
            </button>
          </div>

          {/* TAB 1: NOTAS INTERNAS */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Agregar Nota Confidencial
                </h4>
                <p className="text-[11px] text-slate-500">
                  Las notas internas son privadas del equipo y nunca se exponen al cliente.
                </p>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    rows={3}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Escribí notas sobre la conversación, requerimientos técnicos, horarios o acuerdos..."
                    className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isAddingNote || !newNote.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {isAddingNote ? <LoadingSpinner size="sm" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Guardar Nota Interna</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Note Thread List */}
              <div className="space-y-3">
                {lead.notes && lead.notes.length > 0 ? (
                  lead.notes.map((note) => {
                    const noteDate = new Date(note.createdAt).toLocaleString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={note.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">
                            {note.author?.fullName || 'Operador'}
                          </span>
                          <span className="font-mono text-slate-400">{noteDate}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-8 text-center bg-white rounded-2xl border border-slate-200">
                    Aún no hay notas registradas para este lead.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HISTORIAL DE ACTIVIDADES (TIMELINE) */}
          {activeTab === 'activities' && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Línea de Tiempo de Auditoría y Contactos
              </h4>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {lead.activities?.map((act) => {
                  const actDate = new Date(act.createdAt).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={act.id} className="relative flex items-start gap-4 text-xs">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 border-2 border-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{act.activityType}</span>
                          <span className="font-mono text-slate-400 text-[10px]">{actDate}</span>
                        </div>
                        <p className="text-slate-600">{act.description}</p>
                        {act.user && (
                          <span className="text-[10px] text-slate-400 block">
                            Por: {act.user.fullName}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: EDITAR LEAD */}
          {activeTab === 'edit' && editForm && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Editar Datos de Contacto y Ubicación
              </h4>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Nombre</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Localidad</label>
                    <input
                      type="text"
                      value={editForm.locality}
                      onChange={(e) => setEditForm({ ...editForm, locality: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Dirección</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Referencia</label>
                    <input
                      type="text"
                      value={editForm.locationReference}
                      onChange={(e) => setEditForm({ ...editForm, locationReference: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('notes')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
                  >
                    {isSavingEdit ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
