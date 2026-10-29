import React from 'react';
import { formatLKR, toNumber } from '../../utils/format';
import type { Order } from '../../types/api';

export function OrderItemsTable({ order }: {order: Order;}) {
  const items = order.items ?? [];
  return (
    <div>
      <ul className="divide-y divide-line border-y border-line">
        {items.map((item) =>
        <li key={item.id} className="flex justify-between gap-4 py-4 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-fg">{item.product_name}</p>
              {item.variant_name && <p className="text-muted">{item.variant_name}</p>}
              <p className="text-xs text-subtle">
                {item.quantity} × {formatLKR(item.unit_price)}
                {item.warranty_snapshot ? ` · Warranty: ${item.warranty_snapshot}` : ''}
              </p>
            </div>
            <p className="whitespace-nowrap tabular-nums text-fg">{formatLKR(item.total_price)}</p>
          </li>
        )}
      </ul>
      <dl className="mt-4 space-y-2 text-sm">
        {order.subtotal &&
        <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums text-fg">{formatLKR(order.subtotal)}</dd>
          </div>
        }
        {toNumber(order.discount_amount) > 0 &&
        <div className="flex justify-between">
            <dt className="text-muted">Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</dt>
            <dd className="tabular-nums text-fg">−{formatLKR(order.discount_amount)}</dd>
          </div>
        }
        {order.delivery_charge !== undefined &&
        <div className="flex justify-between">
            <dt className="text-muted">Delivery</dt>
            <dd className="tabular-nums text-fg">
              {toNumber(order.delivery_charge) === 0 ? 'Free' : formatLKR(order.delivery_charge)}
            </dd>
          </div>
        }
        <div className="flex justify-between border-t border-line pt-3 text-base">
          <dt className="font-semibold text-fg">Total</dt>
          <dd className="font-semibold tabular-nums text-fg">{formatLKR(order.total_amount)}</dd>
        </div>
      </dl>
    </div>);

}