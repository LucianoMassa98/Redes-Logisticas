import React from 'react';
import { ArrowRight, MessageSquare, PhoneCall } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/constants.js';

export const CtaBanner = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-brand-900 via-brand-800 to-navy-950 text-white relative overflow-hidden">
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="space-y-3 max-w-2xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ¿Listo para asegurar tu propiedad o mejorar tu conexión a internet?
            </h3>
            <p className="text-sm sm:text-base text-slate-300">
              Solicitá hoy mismo tu relevamiento técnico sin cargo. Nuestro equipo te enviará una cotización a medida.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
            <a
              href="#solicitar-presupuesto"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-xl transition-all hover:scale-102"
            >
              <PhoneCall className="w-5 h-5 text-brand-600" />
              <span>Pedir Presupuesto</span>
            </a>

            <a
              href={`https://wa.me/${COMPANY_CONFIG.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-950/40 transition-all hover:scale-102"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              <span>Chatear por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
