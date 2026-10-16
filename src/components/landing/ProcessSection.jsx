import React from 'react';
import { ClipboardList, Search, FileCheck, CheckCircle2 } from 'lucide-react';

export const ProcessSection = () => {
  const steps = [
    {
      number: '01',
      icon: ClipboardList,
      title: '1. Solicitud de Cotización',
      description: 'Completás el formulario web con los servicios de tu interés o nos escribís directamente por WhatsApp.',
    },
    {
      number: '02',
      icon: Search,
      title: '2. Evaluación y Asesoramiento',
      description: 'Analizamos la ubicación, la infraestructura existente, el tipo de cámaras o la línea de vista satelital requerida.',
    },
    {
      number: '03',
      icon: FileCheck,
      title: '3. Presupuesto Claro',
      description: 'Te enviamos una propuesta formal con detalle de equipamiento, costos y tiempos estimados de instalación.',
    },
    {
      number: '04',
      icon: CheckCircle2,
      title: '4. Instalación y Capacitación',
      description: 'Realizamos el montaje, cableado, configuración en tu celular y te enseñamos cómo usar todo el sistema.',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
            Paso a Paso
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cómo trabajamos juntos
          </h2>
          <p className="text-base text-slate-600">
            Un proceso transparente y ágil desde tu primera consulta hasta la entrega llave en mano.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-brand-200 font-mono">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
