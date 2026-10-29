import React from 'react';
import { humanize } from '../../utils/format';

const tone: Record<string, string> = {
  DELIVERED: 'border-success/40 text-success',
  SUCCESSFUL: 'border-success/40 text-success',
  CONFIRMED: 'border-fg/40 text-fg',
  PROCESSING: 'border-fg/40 text-fg',
  SHIPPED: 'border-fg/40 text-fg',
  PENDING: 'border-warn/40 text-warn',
  REQUESTED: 'border-warn/40 text-warn',
  CANCELLED: 'border-danger/40 text-danger',
  FAILED: 'border-danger/40 text-danger',
  REFUNDED: 'border-line text-muted',
  RETURNED: 'border-line text-muted'
};

export function StatusBadge({ status }: {status: string;}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${
      tone[status] ?? 'border-line text-muted'}`
      }>
      
      {humanize(status)}
    </span>);

}