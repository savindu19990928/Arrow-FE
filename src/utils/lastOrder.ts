import type { Order } from '../types/api';

const KEY = 'av_last_order';

export interface StoredOrder {
  order: Order;
  contact: string;
}

export function saveLastOrder(value: StoredOrder): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {

    // Storage may be unavailable in private browsing.
  }}

export function readLastOrder(orderNumber: string): StoredOrder | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredOrder;
    return parsed.order?.order_number === orderNumber ? parsed : null;
  } catch {
    return null;
  }
}