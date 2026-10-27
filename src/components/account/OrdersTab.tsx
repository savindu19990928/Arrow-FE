import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { StateMessage } from '../StateMessage';
import { useApi } from '../../hooks/useApi';
import { formatDate, formatLKR, paymentMethodLabel } from '../../utils/format';
import { orderApi } from '../../utils/storeApi';

export function OrdersTab() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(() => orderApi.list(page), [page]);

  if (error) return <StateMessage tone="error" title="We couldn’t load your orders" description={error} onRetry={reload} />;
  if (loading || !data) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((i) =>
        <div key={i} className="h-20 animate-pulse rounded-md bg-white" />
        )}
      </div>);

  }
  if (data.results.length === 0) {
    return (
      <StateMessage
        title="No orders yet"
        description="When you place an order, you’ll be able to track it here."
        action={<Link to="/shop" className="btn-primary">Shop now</Link>} />);


  }

  return (
    <div>
      <div className="overflow-hidden rounded-md bg-white">
        <table className="w-full text-left text-[15px]">
          <thead className="hidden border-b border-line text-sm text-muted md:table-header-group">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Placed</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Payment</th>
              <th className="px-5 py-3 text-right font-medium">Total</th>
              <th className="px-5 py-3"><span className="sr-only">View</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.results.map((o) =>
            <tr key={o.id} className="grid grid-cols-2 gap-2 p-5 md:table-row md:p-0">
                <td className="col-span-2 md:px-5 md:py-4">
                  <span className="font-medium">{o.order_number}</span>
                  <span className="block text-sm text-muted">{o.items_count} item{o.items_count === 1 ? '' : 's'}</span>
                </td>
                <td className="text-muted md:px-5 md:py-4">{formatDate(o.placed_at)}</td>
                <td className="text-right md:px-5 md:py-4 md:text-left"><StatusBadge status={o.status} /></td>
                <td className="md:px-5 md:py-4">
                  <span className="text-sm text-muted">{paymentMethodLabel(o.payment_method)}</span>
                  <span className="ml-2"><StatusBadge status={o.payment_status} /></span>
                </td>
                <td className="text-right font-medium md:px-5 md:py-4">{formatLKR(o.total_amount)}</td>
                <td className="col-span-2 md:px-5 md:py-4 md:text-right">
                  <Link to={`/account/orders/${o.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-leaf hover:underline" aria-label={`View order ${o.order_number}`}>
                    View <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {(data.next || data.previous) &&
      <div className="mt-6 flex gap-3">
          <button type="button" className="btn-secondary" disabled={!data.previous} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <button type="button" className="btn-secondary" disabled={!data.next} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      }
    </div>);

}