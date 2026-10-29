import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2Icon, DownloadIcon } from 'lucide-react';
import { getErrorMessage } from '../utils/apiClient';
import { formatDate, formatLKR, paymentLabel } from '../utils/format';
import { readLastOrder } from '../utils/lastOrder';
import { orderApi } from '../utils/shopApi';
import { BankTransferPanel } from '../components/orders/BankTransferPanel';
import { OrderItemsTable } from '../components/orders/OrderItemsTable';
import { PaymentRetryButton } from '../components/orders/PaymentRetryButton';
import { Button, buttonClasses } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { Order, PaymentMethod } from '../types/api';

export function OrderConfirmation() {
  const { orderNumber = '' } = useParams();
  const location = useLocation();
  const state = location.state as {order?: Order;contact?: string;} | null;
  const stored = state?.order ? { order: state.order, contact: state.contact ?? '' } : readLastOrder(orderNumber);
  const [downloading, setDownloading] = useState(false);

  if (!stored) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase text-fg">Order {orderNumber}</h1>
        <p className="mt-3 text-sm text-muted">Look up the latest status of this order with the email or phone used at checkout.</p>
        <Link to={`/track-order?order_number=${encodeURIComponent(orderNumber)}`} className={`${buttonClasses('primary')} mt-8`}>
          Track this order
        </Link>
      </div>);

  }

  const { order, contact } = stored;
  const paymentPending = order.payment_status === 'PENDING';
  const isBank = order.payment_method === 'BANK_TRANSFER';

  const downloadInvoice = async () => {
    setDownloading(true);
    try {
      await orderApi.invoice(order.id, order.order_number, contact);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full bg-bg">
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-14 sm:px-6">
        <CheckCircle2Icon className="h-10 w-10 text-fg" aria-hidden="true" />
        <h1 className="mt-5 break-words font-display text-3xl font-extrabold uppercase tracking-tight text-fg sm:text-4xl md:text-5xl">
          Order placed
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          Thank you{order.customer_name ? `, ${order.customer_name.split(' ')[0]}` : ''}. Your order number is{' '}
          <span className="font-mono text-fg">{order.order_number}</span>. Keep it handy to track your delivery.
        </p>

        <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-line py-6 text-sm md:grid-cols-4">
          <div>
            <dt className="text-subtle">Total</dt>
            <dd className="mt-1 font-semibold tabular-nums text-fg">{formatLKR(order.total_amount)}</dd>
          </div>
          <div>
            <dt className="text-subtle">Payment</dt>
            <dd className="mt-1 text-fg">{paymentLabel(order.payment_method)}</dd>
          </div>
          <div>
            <dt className="text-subtle">Payment status</dt>
            <dd className="mt-1">
              <StatusBadge status={order.payment_status} />
            </dd>
          </div>
          <div>
            <dt className="text-subtle">Estimated arrival</dt>
            <dd className="mt-1 text-fg">{formatDate(order.estimated_arrival_date)}</dd>
          </div>
        </dl>

        {paymentPending && !isBank &&
        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-fg">Payment not completed yet</p>
              <p className="mt-1 text-sm text-muted">Continue to {paymentLabel(order.payment_method)} to finish paying for this order.</p>
            </div>
            <PaymentRetryButton orderNumber={order.order_number} method={order.payment_method as PaymentMethod} />
          </div>
        }

        {paymentPending && isBank &&
        <div className="mt-8">
            <BankTransferPanel orderNumber={order.order_number} amount={order.total_amount} />
          </div>
        }

        {order.items && order.items.length > 0 &&
        <section className="mt-12" aria-labelledby="items-heading">
            <h2 id="items-heading" className="mb-4 text-lg font-semibold text-fg">
              Items
            </h2>
            <OrderItemsTable order={order} />
          </section>
        }

        <div className="mt-12 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={downloadInvoice} loading={downloading}>
            <DownloadIcon className="h-4 w-4" aria-hidden="true" />
            Download invoice
          </Button>
          <Link
            to={`/track-order?order_number=${encodeURIComponent(order.order_number)}&contact=${encodeURIComponent(contact)}`}
            className={buttonClasses('secondary')}>
            
            Track order
          </Link>
          <Link to="/catalog" className={buttonClasses('ghost')}>
            Continue shopping
          </Link>
        </div>
      </div>
    </div>);

}