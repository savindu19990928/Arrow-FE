const amountFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatLKR(value: string | number | null | undefined): string {
  return `LKR ${amountFormatter.format(toNumber(value))}`;
}

export function formatDate(iso?: string | null, withTime = false): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
}

export function humanize(value?: string | null): string {
  if (!value) return '';
  return value.
  toLowerCase().
  split('_').
  map((word) => word ? word[0].toUpperCase() + word.slice(1) : word).
  join(' ');
}

export const PAYMENT_LABELS: Record<string, string> = {
  KOKO: 'Koko',
  MINTPAY: 'Mintpay',
  BANK_TRANSFER: 'Bank transfer'
};

export function paymentLabel(method?: string | null): string {
  if (!method) return '—';
  return PAYMENT_LABELS[method] ?? humanize(method);
}