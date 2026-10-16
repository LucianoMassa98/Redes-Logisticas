import React from 'react';
import { Award, Wrench, Shield, Headphones } from 'lucide-react';

export const BenefitsSection = () => {
  const benefits = [
    {
      icon: Award,
      title: 'Equipamiento de Primer Nivel',
      description: 'Discos rígidos diseñados para videovigilancia 24/7, anclajes de antena de alta resistencia eólica y cables 100% cobre.',
    },
    {
      icon: Wrench,
      title: 'Instalaciones Prolijas y Seguras',
      description: 'Cero cables sueltos ni desprolijidades. Sellado estanco contra filtraciones en techos y fijaciones firmes a prueba de tormentas.',
    },
    {
      icon: Shield,
      title: 'Garantía Real de Instalación',
      description: 'Todos nuestros trabajos cuentan con garantía escrita en materiales y mano de obra para tu total tranquilidad.',
    },
    {
      icon: Headphones,
      title: 'Soporte y Asistencia Técnica',
      description: 'Te dejamos todas las aplicaciones configuradas en tus dispositivos y te asistimos ante cualquier duda operativa.',
    },
  ];

  return (
    <section id="beneficios" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
            Nuestra Propuesta de Valor
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Por qué elegir nuestro servicio técnico
          </h2>
          <p className="text-base text-slate-600">
            Combinamos conocimiento técnico, herramientas específicas y compromiso comercial para entregarte una solución confiable y duradera.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{b.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{b.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
