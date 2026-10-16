import React from 'react';
import { LEAD_STATUS_CONFIG } from '../../config/constants.js';

export const StatusBadge = ({ status, className = '' }) => {
  const config = LEAD_STATUS_CONFIG[status] || {
    label: status,
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    dotColor: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
};
