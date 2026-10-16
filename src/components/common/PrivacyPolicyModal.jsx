import React from 'react';
import { X, ShieldCheck, Lock, FileText, CheckCircle } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/constants.js';

export const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Política de Privacidad y Protección de Datos</h3>
              <p className="text-xs text-slate-500">Versión 1.0 — Actualizada 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 leading-relaxed">
          <section className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-500" /> 1. Responsable del Tratamiento
            </h4>
            <p>
              Los datos personales recabados a través de esta plataforma son tratados por {COMPANY_CONFIG.name},
              con domicilio en {COMPANY_CONFIG.address}, con la finalidad exclusiva de elaborar presupuestos técnicos,
              relevar requerimientos de conectividad o videovigilancia y coordinar visitas comerciales.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-500" /> 2. Finalidad y Uso de la Información
            </h4>
            <p>
              Los datos facilitados (nombre, teléfono, correo electrónico, dirección, tipo de cliente y necesidad informada)
              serán utilizados únicamente para contactarlo en respuesta a su solicitud expresa. No compartimos, vendemos ni cedemos
              sus datos personales a terceros con fines publicitarios o ajenos a la prestación de este servicio técnico.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-500" /> 3. Geolocalización y Coordenadas
            </h4>
            <p>
              El envío de coordenadas geográficas o referencias de mapa es completamente voluntario y solo se solicita
              para verificar la línea de vista satelital (ej. instalaciones Starlink) o la cobertura en zonas rurales y caminos sin numeración formal.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-500" /> 4. Derechos del Titular de los Datos
            </h4>
            <p>
              De conformidad con la Ley de Protección de Datos Personales (Ley 25.326 y estándares internacionales), usted tiene derecho
              a solicitar el acceso, rectificación, actualización o supresión de sus datos de nuestros registros escribiendo a{' '}
              <a href={`mailto:${COMPANY_CONFIG.email}`} className="text-brand-600 underline font-medium">
                {COMPANY_CONFIG.email}
              </a>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
