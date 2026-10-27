import React from 'react';
import { humanize, statusTone } from '../utils/format';

const toneClasses = {
  positive: 'bg-lime text-night',
  negative: 'bg-red-50 text-danger',
  pending: 'bg-amber-50 text-amber-800',
  neutral: 'bg-canvas text-ink'
};

export function StatusBadge({ status }: {status: string;}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[statusTone(status)]}`}>
      
      {humanize(status)}
    </span>);

}