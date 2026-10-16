import React from 'react';
import { CUSTOMER_TYPE_OPTIONS } from '../../config/constants.js';

export const CustomerTypeBadge = ({ type, className = '' }) => {
  const match = CUSTOMER_TYPE_OPTIONS.find((c) => c.value === type);
  const label = match ? match.label : type;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
    >
      {label}
    </span>
  );
};
