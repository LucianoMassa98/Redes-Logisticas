import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: '¿Cómo funcionan las cámaras de seguridad solares en días nublados o de lluvia?',
      a: 'Nuestros equipos solares incorporan baterías de litio de alta densidad que acumulan energía suficiente para operar de manera ininterrumpida durante varios días consecutivos de clima nublado o lluvia. Además, el panel fotovoltaico capta radiación difusa incluso con cielo cubierto.',
    },
    {
      q: '¿Qué se necesita para la instalación de una antena Starlink?',
      a: 'Se requiere contar previamente con el kit oficial de Starlink y que la ubicación elegida disponga de una vista despejada hacia el cielo norte/sur (según constelación). Nuestro equipo se encarga de la provisión y colocación del soporte o mástil en altura, el enrutamiento prolijo del cable hacia el interior y la configuración del router.',
    },
    {
      q: '¿Tengo que pagar un abono mensual por las cámaras de seguridad?',
      a: 'No. El sistema de cámaras (DVR/NVR) almacena las grabaciones localmente en el disco rígido instalado en tu propiedad. La aplicación para visualizarlas en vivo o consultar grabaciones pasadas desde tu celular es gratuita y no requiere ningún pago mensual.',
    },
    {
      q: '¿Es posible solicitar un presupuesto si no tengo claro exactamente qué equipamiento necesito?',
      a: '¡Por supuesto! Podés completar el formulario describiendo a grandes rasgos tu propiedad y qué deseás cubrir. Un asesor se comunicará con vos para orientarte sin cargo sobre la mejor opción técnico-económica.',
    },
    {
      q: '¿Cómo mejoran la señal de Wi-Fi en casas grandes o galpones?',
      a: 'Implementamos sistemas Wi-Fi Mesh de grado comercial conectados mediante cable Ethernet directo (backhaul cableado). Esto garantiza que la velocidad no se reduzca a la mitad como ocurre con los repetidores Wi-Fi convencionales y permite moverte por la propiedad manteniendo la misma red sin cortes.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-slate-100/60 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-14">
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-200">
            Dudas Frecuentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Preguntas frecuentes sobre nuestros servicios
          </h2>
          <p className="text-base text-slate-600">
            Respuestas claras y concretas a las consultas más habituales de nuestros clientes.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-base font-bold text-slate-900 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-brand-500 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
