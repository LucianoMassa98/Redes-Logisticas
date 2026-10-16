import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Sparkles,
  PhoneCall,
  FileCheck,
  Trophy,
  XCircle,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboard.service.js';
import { getApiErrorMessage } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';

export const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getMetrics();
      setMetrics(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar las métricas.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (isLoading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <LoadingSpinner size="lg" className="text-brand-600" />
        <p className="text-sm font-medium text-slate-500">Cargando métricas comerciales...</p>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-red-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Error de Conexión</h3>
        <p className="text-sm text-slate-600">{error}</p>
        <button
          onClick={fetchMetrics}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Leads',
      value: metrics?.totalLeads ?? 0,
      icon: Users,
      color: 'from-blue-600 to-cyan-500',
      badge: 'Histórico',
      link: '/admin/leads',
    },
    {
      title: 'Leads Nuevos',
      value: metrics?.newLeads ?? 0,
      icon: Sparkles,
      color: 'from-brand-500 to-sky-400',
      badge: 'Por atender',
      link: '/admin/leads?status=NEW',
    },
    {
      title: 'En Contacto',
      value: metrics?.contactedLeads ?? 0,
      icon: PhoneCall,
      color: 'from-amber-500 to-yellow-400',
      badge: 'En gestión',
      link: '/admin/leads?status=CONTACTED',
    },
    {
      title: 'Presupuestos Enviados',
      value: metrics?.quoteSentLeads ?? 0,
      icon: FileCheck,
      color: 'from-indigo-600 to-purple-500',
      badge: 'Pendiente respuesta',
      link: '/admin/leads?status=QUOTE_SENT',
    },
    {
      title: 'Convertidos (Ganados)',
      value: metrics?.wonLeads ?? 0,
      icon: Trophy,
      color: 'from-emerald-500 to-teal-400',
      badge: 'Instalaciones',
      link: '/admin/leads?status=WON',
    },
    {
      title: 'Descartados',
      value: metrics?.lostLeads ?? 0,
      icon: XCircle,
      color: 'from-slate-500 to-slate-400',
      badge: 'Sin concretar',
      link: '/admin/leads?status=LOST',
    },
  ];

  const totalServices = metrics?.serviceDistribution?.reduce((acc, s) => acc + s.count, 0) || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Comercial
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Métricas de captación y flujo de oportunidades en tiempo real.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-brand-300 transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {stat.badge}
                </span>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${stat.color} text-white flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="my-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.title}</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600 group-hover:text-brand-700">
                <span>Ver filtrados</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Secondary Row: Time Trends & Service Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity Window (7 & 30 days) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-900 text-base">Volumen Reciente de Solicitudes</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Últimos 7 Días</p>
                <p className="text-xs text-slate-400">Leads entrantes esta semana</p>
              </div>
              <p className="text-2xl font-black text-brand-600">{metrics?.last7DaysLeads ?? 0}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Últimos 30 Días</p>
                <p className="text-xs text-slate-400">Leads captados en el último mes</p>
              </div>
              <p className="text-2xl font-black text-cyan-600">{metrics?.last30DaysLeads ?? 0}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 text-xs text-brand-800 space-y-1">
            <p className="font-semibold">💡 Consejo comercial:</p>
            <p className="text-slate-600">
              Contactar a los leads durante las primeras 2 horas posteriores al envío incrementa la tasa de conversión en más de un 60%.
            </p>
          </div>
        </div>

        {/* Distribution by Service */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-slate-900 text-base">Distribución de Interés por Servicio</h3>
            </div>
            <span className="text-xs text-slate-400">Base histórica</span>
          </div>

          <div className="space-y-4">
            {metrics?.serviceDistribution && metrics.serviceDistribution.length > 0 ? (
              metrics.serviceDistribution.map((serv) => {
                const percentage = Math.round((serv.count / totalServices) * 100) || 0;
                return (
                  <div key={serv.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{serv.name}</span>
                      <span className="text-slate-500">
                        {serv.count} consultas ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Aún no hay suficientes solicitudes para graficar la distribución.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
