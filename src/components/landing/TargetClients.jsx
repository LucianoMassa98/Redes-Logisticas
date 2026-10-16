import React from 'react';
import { Home, Store, Building2, Hotel, Tractor } from 'lucide-react';

export const TargetClients = () => {
  const clients = [
    {
      icon: Home,
      title: 'Hogares y Residencias',
      description: 'Tranquilidad total para tu familia. Cámaras perimetrales con visión nocturna, visualización en el celular y Wi-Fi sin cortes en todos los ambientes.',
      tag: 'Residencial',
    },
    {
      icon: Store,
      title: 'Locales Comerciales',
      description: 'Protección de mercadería, monitoreo de cajas y accesos, y conectividad estable para que nunca se caigan los cobros electrónicos ni la facturación.',
      tag: 'Comercial',
    },
    {
      icon: Building2,
      title: 'Oficinas y Empresas',
      description: 'Cableado de red categoría 6, Wi-Fi corporativo con red de invitados aislada y seguridad en depósitos y áreas de trabajo.',
      tag: 'Corporativo',
    },
    {
      icon: Hotel,
      title: 'Hoteles y Alojamientos',
      description: 'Cobertura Wi-Fi fluida en habitaciones y cabañas, configuración de streaming en Smart TVs y vigilancia en accesos, piscinas y cocheras.',
      tag: 'Turismo',
    },
    {
      icon: Tractor,
      title: 'Campos y Galpones Rurales',
      description: 'Cámaras 100% solares sin cables para vigilar tranqueras y maquinaria, combinadas con internet Starlink para operar en cualquier punto remoto.',
      tag: 'Agro & Industria',
    },
  ];

  return (
    <section id="clientes" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
            A Quiénes Ayudamos
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Soluciones adaptadas a cada tipo de propiedad
          </h2>
          <p className="text-base text-slate-600">
            Cada instalación cuenta con requerimientos particulares. Diseñamos la infraestructura adecuada para tu necesidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clients.map((client, index) => {
            const Icon = client.icon;
            return (
              <div
                key={client.title}
                className={`p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/20 transition-all duration-200 space-y-4 ${
                  index === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/60 text-slate-700">
                    {client.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{client.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{client.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
