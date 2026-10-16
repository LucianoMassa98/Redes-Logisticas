import React from 'react';
import { Shield, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';
import { COMPANY_CONFIG } from '../../config/constants.js';

export const Footer = ({ onOpenPrivacy }) => {
  return (
    <footer id="contacto" className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Empresa */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                {COMPANY_CONFIG.name}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Especialistas en instalaciones técnicas de alta confiabilidad: videovigilancia cableada y solar,
              enlaces Starlink y redes de datos corporativas y residenciales.
            </p>
          </div>

          {/* Col 2: Servicios */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Servicios</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#servicios" className="hover:text-brand-400 transition-colors">Cámaras de seguridad cableadas</a></li>
              <li><a href="#servicios" className="hover:text-brand-400 transition-colors">Cámaras con paneles solares</a></li>
              <li><a href="#servicios" className="hover:text-brand-400 transition-colors">Internet satelital Starlink</a></li>
              <li><a href="#servicios" className="hover:text-brand-400 transition-colors">Televisión y streaming</a></li>
              <li><a href="#servicios" className="hover:text-brand-400 transition-colors">Redes y conectividad Wi-Fi</a></li>
            </ul>
          </div>

          {/* Col 3: Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contacto Directo</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href={`tel:${COMPANY_CONFIG.phone}`} className="hover:text-white transition-colors">
                  {COMPANY_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${COMPANY_CONFIG.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Atención por WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href={`mailto:${COMPANY_CONFIG.email}`} className="hover:text-white transition-colors">
                  {COMPANY_CONFIG.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>{COMPANY_CONFIG.address} ({COMPANY_CONFIG.defaultLocality})</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Transparencia y Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Garantía & Legal</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Equipamiento homologado y mano de obra calificada. Las contrataciones de servicios de terceros
              (Starlink o suscripciones de streaming) se gestionan bajo las condiciones y coberturas de cada proveedor.
            </p>
            <button
              onClick={onOpenPrivacy}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 underline block"
            >
              Consultar Política de Privacidad
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {COMPANY_CONFIG.name}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <button onClick={onOpenPrivacy} className="hover:text-slate-300 transition-colors">
              Privacidad y Protección de Datos
            </button>
            <a href="#solicitar-presupuesto" className="hover:text-slate-300 transition-colors">
              Pedir Presupuesto
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
