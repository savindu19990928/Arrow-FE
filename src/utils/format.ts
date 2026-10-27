import { format, parseISO } from 'date-fns';

export function formatLKR(value: string | number | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : value ?? 0;
  if (Number.isNaN(num)) return 'LKR —';
  const hasCents = Math.round(num * 100) % 100 !== 0;
  return `LKR ${num.toLocaleString('en-LK', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2
  })}`;
}

export function formatDate(value: string | null | undefined, pattern = 'd MMM yyyy'): string {
  if (!value) return '—';
  try {
    return format(parseISO(value), pattern);
  } catch {
    return value;
  }
}

export function humanize(value: string | null | undefined): string {
  if (!value) return '';
  return value.
  toLowerCase().
  split('_').
  map((part) => part.charAt(0).toUpperCase() + part.slice(1)).
  join(' ');
}

export function paymentMethodLabel(method: string): string {
  if (method === 'KOKO') return 'Koko';
  if (method === 'MINTPAY') return 'Mintpay';
  if (method === 'BANK_TRANSFER') return 'Bank transfer';
  return humanize(method);
}

export function statusTone(status: string): 'positive' | 'negative' | 'pending' | 'neutral' {
  const s = status.toUpperCase();
  if (['DELIVERED', 'SUCCESSFUL', 'CONFIRMED', 'APPROVED', 'COMPLETED'].includes(s)) return 'positive';
  if (['CANCELLED', 'FAILED', 'REJECTED', 'REFUNDED', 'RETURNED'].includes(s)) return 'negative';
  if (['PENDING', 'REQUESTED'].includes(s)) return 'pending';
  return 'neutral';
}