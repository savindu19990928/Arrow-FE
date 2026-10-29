import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, PackageIcon } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { formatDate, formatLKR, paymentLabel } from '../../utils/format';
import { orderApi } from '../../utils/shopApi';
import { buttonClasses } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { Spinner } from '../ui/Spinner';
import { StatusBadge } from '../ui/StatusBadge';
import { OrderDetailPanel } from './OrderDetailPanel';

export function OrdersTab() {
  const orders = useApi(() => orderApi.list(), []);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (selectedId) {
    return (
      <OrderDetailPanel
        orderId={selectedId}
        onBack={() => {
          setSelectedId(null);
          orders.reload();
        }} />);


  }

  if (orders.loading) return <Spinner label="Loading orders" />;
  if (orders.error) return <ErrorState message={orders.error} onRetry={orders.reload} />;
  if (!orders.data?.length) {
    return (
      <EmptyState
        icon={PackageIcon}
        title="No orders yet"
        message="When you place an order, it will appear here."
        action={
        <Link to="/catalog" className={buttonClasses('primary')}>
            Start shopping
          </Link>
        } />);


  }

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full text-left text-sm">
        <thead className="hidden border-b border-line bg-surface text-xs text-subtle md:table-header-group">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Order</th>
            <th scope="col" className="px-4 py-3 font-medium">Placed</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            <th scope="col" className="px-4 py-3 font-medium">Payment</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
            <th scope="col" className="w-10 px-4 py-3"><span className="sr-only">Open</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.data.map((order) =>
          <tr
            key={order.id}
            onClick={() => setSelectedId(order.id)}
            className="cursor-pointer transition-colors duration-150 hover:bg-surface">
            
              <td className="px-4 py-4">
                <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(order.id);
                }}
                className="font-mono text-fg hover:underline">
                
                  {order.order_number}
                </button>
                <p className="mt-1 text-xs text-subtle md:hidden">
                  {formatDate(order.placed_at)} · {formatLKR(order.total_amount)}
                </p>
                <div className="mt-2 md:hidden">
                  <StatusBadge status={order.status} />
                </div>
              </td>
              <td className="hidden px-4 py-4 text-muted md:table-cell">{formatDate(order.placed_at)}</td>
              <td className="hidden px-4 py-4 md:table-cell">
                <StatusBadge status={order.status} />
              </td>
              <td className="hidden px-4 py-4 text-muted md:table-cell">
                {paymentLabel(order.payment_method)}
                <span className="block text-xs text-subtle">{order.payment_status.toLowerCase()}</span>
              </td>
              <td className="hidden px-4 py-4 text-right tabular-nums text-fg md:table-cell">{formatLKR(order.total_amount)}</td>
              <td className="px-4 py-4 text-subtle">
                <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}