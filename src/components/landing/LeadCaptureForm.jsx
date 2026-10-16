import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Send,
  CheckCircle,
  MapPin,
  Phone,
  User,
  Mail,
  Home,
  FileText,
  AlertCircle,
  ShieldCheck,
  MessageSquare,
  Navigation,
  RotateCcw,
} from 'lucide-react';
import { leadService } from '../../services/lead.service.js';
import { getApiErrorMessage } from '../../services/api.js';
import { LoadingSpinner } from '../common/LoadingSpinner.jsx';
import {
  CUSTOMER_TYPE_OPTIONS,
  PREFERRED_CONTACT_OPTIONS,
  INITIAL_SERVICES,
  COMPANY_CONFIG,
} from '../../config/constants.js';

export const LeadCaptureForm = ({ preselectedService = null, onOpenPrivacy }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoNotice, setGeoNotice] = useState('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      address: '',
      locality: COMPANY_CONFIG.defaultLocality || '',
      province: 'Argentina',
      customerType: 'HOGAR',
      services: preselectedService ? [preselectedService] : ['CAMARAS_CABLEADAS'],
      latitude: null,
      longitude: null,
      locationReference: '',
      description: '',
      preferredContactMethod: 'WHATSAPP',
      privacyAccepted: false,
    },
  });

  const selectedServices = watch('services') || [];
  const coordsLat = watch('latitude');
  const coordsLng = watch('longitude');

  // Si cambia el preselectedService desde el catálogo, actualizar el formulario
  useEffect(() => {
    if (preselectedService && !selectedServices.includes(preselectedService)) {
      setValue('services', [...selectedServices, preselectedService]);
    }
  }, [preselectedService, setValue]);

  // Manejador para togglear servicios en el multi-select
  const toggleService = (code) => {
    if (selectedServices.includes(code)) {
      if (selectedServices.length === 1) return; // Mínimo 1
      setValue(
        'services',
        selectedServices.filter((s) => s !== code),
        { shouldValidate: true }
      );
    } else {
      setValue('services', [...selectedServices, code], { shouldValidate: true });
    }
  };

  // Geolocalización voluntaria
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice('La geolocalización no está soportada por su navegador.');
      return;
    }
    setGeoLoading(true);
    setGeoNotice('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('latitude', pos.coords.latitude);
        setValue('longitude', pos.coords.longitude);
        setGeoNotice(`Coordenadas registradas con éxito: (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setGeoNotice('No se pudo obtener la ubicación o se denegó el permiso en el navegador.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return; // Prevenir envíos dobles

    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const payload = {
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        email: data.email ? data.email.trim() : null,
        address: data.address.trim(),
        locality: data.locality.trim(),
        province: data.province ? data.province.trim() : 'Argentina',
        customerType: data.customerType,
        services: data.services,
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null,
        locationReference: data.locationReference ? data.locationReference.trim() : null,
        description: data.description ? data.description.trim() : null,
        preferredContactMethod: data.preferredContactMethod,
        privacyAccepted: !!data.privacyAccepted,
      };

      const result = await leadService.submitPublicLead(payload);
      setSubmitSuccess(result.data);
    } catch (err) {
      const msg = getApiErrorMessage(err, 'No se pudo enviar la solicitud. Por favor verifique los campos.');
      setGlobalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setSubmitSuccess(null);
    setGlobalError(null);
  };

  // Pantalla de Confirmación de Éxito
  if (submitSuccess) {
    const whatsappText = encodeURIComponent(
      `Hola! Acabo de enviar una solicitud de presupuesto para ${submitSuccess.fullName} (ID de Solicitud: ${submitSuccess.id}). Me gustaría recibir más información.`
    );

    return (
      <section id="solicitar-presupuesto" className="py-20 bg-slate-900 text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-slate-800/90 border border-slate-700 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-md space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                ¡Solicitud Registrada Exitosamente!
              </h3>
              <p className="text-slate-300 text-sm sm:text-base">
                Gracias, <strong className="text-white">{submitSuccess.fullName}</strong>. Un especialista técnico se pondrá en contacto a la brevedad para evaluar tu instalación y enviarte el presupuesto formal.
              </p>
            </div>

            {/* Request ID identifier badge */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 max-w-md mx-auto text-left space-y-1">
              <p className="text-xs uppercase font-mono tracking-wider text-slate-400">
                Identificador de Solicitud (Lead ID):
              </p>
              <p className="font-mono text-sm sm:text-base font-bold text-cyan-400 break-all select-all">
                {submitSuccess.id}
              </p>
              <p className="text-[11px] text-slate-500">
                Guardá este código para agilizar cualquier consulta con nuestro equipo.
              </p>
            </div>

            {/* Direct WhatsApp Call to Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`https://wa.me/${COMPANY_CONFIG.whatsappNumber}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all hover:scale-102"
              >
                <MessageSquare className="w-5 h-5 fill-white" />
                <span>Contactar ahora por WhatsApp</span>
              </a>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 border border-slate-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Enviar otra solicitud</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="solicitar-presupuesto" className="py-20 bg-gradient-to-b from-slate-900 via-navy-950 to-slate-900 text-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Form Title & Introduction */}
        <div className="text-center space-y-3 mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/70 px-3.5 py-1.5 rounded-full border border-cyan-800/60">
            <ShieldCheck className="w-4 h-4" /> Presupuesto Sin Compromiso
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Solicitá tu cotización técnica personalizada
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Completá el formulario para que un especialista técnico analice la factibilidad de tu proyecto y se comunique con vos sin cargo.
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-3xl bg-slate-800/80 border border-slate-700/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {globalError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{globalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            {/* Paso 1: Servicios de Interés (Multi-select) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-white uppercase tracking-wider">
                  1. Servicios de Interés <span className="text-cyan-400">*</span>
                </label>
                <span className="text-xs text-slate-400">Podés elegir más de uno</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {INITIAL_SERVICES.map((s) => {
                  const isChecked = selectedServices.includes(s.code);
                  return (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => toggleService(s.code)}
                      className={`p-3.5 rounded-2xl text-left border text-sm font-semibold transition-all flex items-start justify-between gap-2 ${
                        isChecked
                          ? 'bg-brand-600/30 border-cyan-400 text-white shadow-md shadow-brand-500/20'
                          : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span>{s.name}</span>
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                            : 'border-slate-600 bg-slate-800'
                        }`}
                      >
                        {isChecked && <CheckCircle className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.services && (
                <p className="text-xs text-red-400 mt-1">{errors.services.message}</p>
              )}
            </div>

            {/* Paso 2: Datos del Contacto */}
            <div className="space-y-4 pt-4 border-t border-slate-700/80">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Datos de Contacto
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Nombre y Apellido */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nombre y Apellido <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                        errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-slate-700'
                      }`}
                      {...register('fullName', {
                        required: 'El nombre y apellido son obligatorios',
                        minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                      })}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Teléfono / WhatsApp <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Ej. 11 4455-6677 o +54 9 351..."
                      className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                        errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-700'
                      }`}
                      {...register('phone', {
                        required: 'El teléfono es obligatorio para contactarte',
                        minLength: { value: 6, message: 'Ingresá un número de teléfono válido' },
                      })}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">Soporta números argentinos y prefijo internacional.</p>
                </div>

                {/* Correo Electrónico (Opcional) */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Correo Electrónico <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      placeholder="nombre@ejemplo.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      {...register('email')}
                    />
                  </div>
                </div>

                {/* Preferencia de Contacto */}
                <div>
                  <label htmlFor="preferredContactMethod" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Preferencia de contacto
                  </label>
                  <select
                    id="preferredContactMethod"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    {...register('preferredContactMethod')}
                  >
                    {PREFERRED_CONTACT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-900">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Paso 3: Ubicación y Propiedad */}
            <div className="space-y-4 pt-4 border-t border-slate-700/80">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                3. Lugar y Tipo de Instalación
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Tipo de Cliente */}
                <div>
                  <label htmlFor="customerType" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tipo de Inmueble <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Home className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="customerType"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      {...register('customerType', { required: true })}
                    >
                      {CUSTOMER_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-slate-900">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Localidad */}
                <div>
                  <label htmlFor="locality" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Localidad / Ciudad <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    id="locality"
                    type="text"
                    placeholder="Ej. Córdoba, Villa Carlos Paz..."
                    className={`w-full px-4 py-3 rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                      errors.locality ? 'border-red-500' : 'border-slate-700'
                    }`}
                    {...register('locality', { required: 'La localidad es obligatoria' })}
                  />
                  {errors.locality && (
                    <p className="text-xs text-red-400 mt-1">{errors.locality.message}</p>
                  )}
                </div>

                {/* Dirección */}
                <div>
                  <label htmlFor="address" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Dirección o Paraje <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    id="address"
                    type="text"
                    placeholder="Ej. San Martín 450 o Ruta 5 Km 12"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                      errors.address ? 'border-red-500' : 'border-slate-700'
                    }`}
                    {...register('address', { required: 'La dirección es obligatoria' })}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-400 mt-1">{errors.address.message}</p>
                  )}
                </div>
              </div>

              {/* Geolocalización Voluntaria */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Coordenadas geográficas (Opcional y Voluntario)
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Útil para verificar cobertura en fincas, zonas rurales o línea de vista Starlink.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={geoLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-800 transition-colors shrink-0"
                  >
                    {geoLoading ? <LoadingSpinner size="sm" /> : <Navigation className="w-3.5 h-3.5" />}
                    <span>{coordsLat ? 'Actualizar ubicación' : 'Compartir ubicación actual'}</span>
                  </button>
                </div>

                {geoNotice && (
                  <p className="text-xs text-cyan-400">{geoNotice}</p>
                )}

                {/* Referencia de cómo llegar */}
                <div>
                  <label htmlFor="locationReference" className="block text-xs text-slate-400 mb-1">
                    Referencias de ubicación o cómo llegar (Opcional):
                  </label>
                  <input
                    id="locationReference"
                    type="text"
                    placeholder="Ej. Portón blanco frente al arroyo, a 300m de la escuela"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-brand-500"
                    {...register('locationReference')}
                  />
                </div>
              </div>

              {/* Descripción de la necesidad */}
              <div>
                <label htmlFor="description" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Detalles adicionales de tu necesidad <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <div className="relative">
                  <FileText className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Contanos cuántos puntos deseás cubrir, si ya contás con equipamiento previo, horarios de preferencia para la visita..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    {...register('description')}
                  />
                </div>
              </div>
            </div>

            {/* Checkbox de Política de Privacidad */}
            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-900"
                  {...register('privacyAccepted', {
                    required: 'Debes aceptar la política de privacidad para enviar la solicitud',
                  })}
                />
                <span className="text-xs text-slate-300 leading-snug">
                  Acepto la{' '}
                  <button
                    type="button"
                    onClick={onOpenPrivacy}
                    className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                  >
                    política de privacidad y protección de datos
                  </button>
                  . Entiendo que mis datos serán tratados únicamente para la confección del presupuesto solicitado.
                </span>
              </label>
              {errors.privacyAccepted && (
                <p className="text-xs text-red-400">{errors.privacyAccepted.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-brand-500 via-cyan-500 to-brand-600 hover:from-brand-600 hover:via-cyan-600 hover:to-brand-700 shadow-xl shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="md" />
                    <span>Procesando solicitud...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar solicitud de presupuesto</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                No solicitamos creación de cuenta ni cobramos por el asesoramiento inicial.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
