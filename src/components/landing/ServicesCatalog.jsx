import React from 'react';
import { Camera, SunMedium, Satellite, Tv, Network, Check, ArrowRight, Info } from 'lucide-react';
import { INITIAL_SERVICES, SERVICE_CODES } from '../../config/constants.js';

export const ServicesCatalog = ({ onSelectService }) => {
  const iconMap = {
    Camera: Camera,
    SunMedium: SunMedium,
    Satellite: Satellite,
    Tv: Tv,
    Network: Network,
  };

  const handleSelect = (serviceCode) => {
    if (onSelectService) {
      onSelectService(serviceCode);
    }
    const element = document.getElementById('solicitar-presupuesto');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="servicios" className="py-20 bg-slate-100/70 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
            Nuestras Especialidades
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cinco soluciones integrales para tu seguridad y conectividad
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Trabajamos con equipamiento de primeras marcas y mano de obra calificada. Seleccioná el servicio que necesitás para cotizarlo a medida.
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {INITIAL_SERVICES.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Camera;
            const isLarge = index === 0 || index === 2; // Accent styling for key services

            return (
              <div
                key={service.code}
                className={`relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group ${
                  index === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                {/* Header Banner */}
                <div className={`p-6 bg-gradient-to-br ${service.gradient} text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 text-white">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-white leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs text-white/90 mt-1 line-clamp-2">
                    {service.shortDescription}
                  </p>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {service.longDescription}
                    </p>

                    {/* Benefits List */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Qué incluye:
                      </p>
                      <ul className="space-y-2">
                        {service.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Disclaimers if applicable */}
                    {service.code === SERVICE_CODES.STARLINK && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          La contratación del abono de internet y la compra del kit Starlink se efectúan según los términos y disponibilidad del proveedor oficial.
                        </span>
                      </div>
                    )}

                    {service.code === SERVICE_CODES.TV_STREAMING && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-start gap-2">
                        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <span>
                          Servicio técnico de configuración y optimización. No se comercializan cuentas ni accesos de terceros.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Button Action */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleSelect(service.code)}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-800 bg-slate-100 hover:bg-brand-600 hover:text-white transition-all group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:hover:bg-brand-600 group-hover:hover:text-white"
                    >
                      <span>Solicitar información</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
