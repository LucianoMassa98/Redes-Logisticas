import React from 'react';
import { ShieldCheck, ArrowRight, Wifi, Sun, Camera, Satellite, CheckCircle2 } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/constants.js';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-brand-950 to-slate-900 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/30 text-brand-300 text-xs sm:text-sm font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Instalaciones Técnicas Certificadas</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Seguridad Electrónica,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-cyan-300 to-sky-400">
                Internet Starlink
              </span>{' '}
              y Redes de Alta Velocidad
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Protegemos y conectamos hogares, campos, comercios, hoteles y oficinas. Soluciones profesionales
              en cámaras cableadas, videovigilancia solar autónoma y enlaces de red sin cortes.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs sm:text-sm text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Monitoreo remoto en tu celular
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cero cables a la vista
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Presupuestos personalizados
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#solicitar-presupuesto"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 shadow-xl shadow-brand-500/30 hover:shadow-cyan-500/40 transition-all hover:-translate-y-0.5"
              >
                <span>Solicitar presupuesto sin cargo</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href="#servicios"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all"
              >
                <span>Ver catálogo de servicios</span>
              </a>
            </div>
          </div>

          {/* Right Column: Visual Tech Card Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Card */}
              <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-800/90 to-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Sistemas Operativos 24/7
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                    HD & 4K Ready
                  </span>
                </div>

                {/* Service Highlights Box */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Camera className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-400">CCTV Cableado</p>
                    <p className="text-sm font-bold text-white">Acceso Remoto Seguro</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Sun className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-400">Cámaras Solares</p>
                    <p className="text-sm font-bold text-white">100% Autónomas</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <Satellite className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-400">Antenas Starlink</p>
                    <p className="text-sm font-bold text-white">Fijación Profesional</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-400">Redes Wi-Fi Mesh</p>
                    <p className="text-sm font-bold text-white">Sin Zonas Muertas</p>
                  </div>
                </div>

                {/* Callout box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-900/60 to-cyan-950/60 border border-brand-500/30 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-300">¿Tenés una necesidad puntual?</p>
                    <p className="text-sm font-bold text-white">Te asesoramos por WhatsApp</p>
                  </div>
                  <a
                    href={`https://wa.me/${COMPANY_CONFIG.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
                  >
                    Chatear ahora
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
