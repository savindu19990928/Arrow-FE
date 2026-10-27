import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeftIcon, DownloadIcon } from 'lucide-react';
import { OrderProgress } from '../components/orders/OrderProgress';
import { OrderRequestDialog } from '../components/orders/OrderRequestDialog';
import { BankTransferPanel } from '../components/orders/BankTransferPanel';
import { StatusBadge } from '../components/StatusBadge';
import { StateMessage } from '../components/StateMessage';
import { useApi } from '../hooks/useApi';
import { errorMessage } from '../utils/apiClient';
import { downloadInvoice } from '../utils/invoice';
import { formatDate, formatLKR, humanize, paymentMethodLabel } from '../utils/format';
import { orderApi, paymentApi } from '../utils/storeApi';

const CANCELLABLE = ['PENDING', 'CONFIRMED', 'PROCESSING'];
const RETURNABLE = ['DELIVERED', 'COMPLETED'];

export function AccountOrderDetail() {
  const { id = '' } = useParams();
  const { data: order, loading, error, reload } = useApi(() => orderApi.get(id), [id]);
  const [dialog, setDialog] = useState<'cancel' | 'return' | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [paying, setPaying] = useState(false);

  if (error) {
    return (
      <div className="mx-auto max-w-site px-5 py-20 md:px-10">
        <StateMessage tone="error" title="We couldn’t load this order" description={error} onRetry={reload} action={<Link to="/account" className="btn-primary">Back to orders</Link>} />
      </div>);

  }
  if (loading || !order) {
    return <div className="mx-auto max-w-site px-5 py-14 md:px-10"><div className="h-64 animate-pulse rounded-md bg-canvas" /></div>;
  }

  const status = order.status.toUpperCase();
  const getInvoice = async () => {
    setDownloading(true);
    try {
      await downloadInvoice(order.id, order.order_number);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDownloading(false);
    }
  };
  const pay = async () => {
    setPaying(true);
    try {
      const init = await paymentApi.initiate(order.order_number, order.payment_method);
      if (init.checkout_url) window.location.href = init.checkout_url;else
      toast(init.message);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  const address = [order.shipping_address_line1, order.shipping_address_line2, order.shipping_city, order.shipping_state, order.shipping_postal_code, order.shipping_country].
  filter(Boolean).
  join(', ');

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-site px-5 pb-20 pt-10 md:px-10">
        <Link to="/account?tab=orders" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeftIcon className="h-4 w-4" aria-hidden /> All orders
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-[36px] md:text-[52px]">{order.order_number}</h1>
            <p className="mt-2 text-muted">Placed {formatDate(order.placed_at, 'd MMM yyyy, h:mm a')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {order.payment_status === 'PENDING' && order.payment_method !== 'BANK_TRANSFER' &&
            <button type="button" className="btn-primary" onClick={pay} disabled={paying}>
                {paying ? 'Redirecting…' : `Pay with ${paymentMethodLabel(order.payment_method)}`}
              </button>
            }
            <button type="button" className="btn-secondary" onClick={getInvoice} disabled={downloading}>
              <DownloadIcon className="h-4 w-4" aria-hidden /> {downloading ? 'Preparing…' : 'Invoice'}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-md bg-white p-6" aria-label="Progress">
              <OrderProgress status={order.status} />
              {order.courier_name &&
              <p className="mt-5 text-[15px] text-muted">
                  Shipped with <span className="text-ink">{order.courier_name}</span> · Tracking <span className="text-ink">{order.tracking_number}</span>
                </p>
              }
            </section>

            <section className="rounded-md bg-white p-6" aria-labelledby="items-h">
              <h2 id="items-h" className="text-lg font-semibold">Items</h2>
              <ul className="mt-4 divide-y divide-line">
                {order.items.map((item) =>
                <li key={item.id} className="flex justify-between gap-4 py-4 text-[15px]">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      {item.variant_name && <p className="text-sm text-muted">{item.variant_name}</p>}
                      <p className="text-sm text-muted">{formatLKR(item.unit_price)} × {item.quantity}</p>
                      {item.warranty_snapshot && <p className="mt-1 text-sm text-muted">Warranty: {item.warranty_snapshot}</p>}
                    </div>
                    <p className="whitespace-nowrap font-medium">{formatLKR(item.total_price)}</p>
                  </li>
                )}
              </ul>
            </section>

            {order.payment_method === 'BANK_TRANSFER' && order.payment_status === 'PENDING' &&
            <BankTransferPanel orderNumber={order.order_number} amount={order.total_amount} onSubmitted={reload} />
            }

            {order.status_history && order.status_history.length > 0 &&
            <section className="rounded-md bg-white p-6" aria-labelledby="history-h">
                <h2 id="history-h" className="text-lg font-semibold">History</h2>
                <ol className="mt-4 space-y-4 border-l border-line pl-5">
                  {order.status_history.map((h) =>
                <li key={h.id} className="relative text-[15px]">
                      <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-lime-bright" aria-hidden />
                      <p className="font-medium">{humanize(h.status)}</p>
                      <p className="text-muted">{h.note}</p>
                      <p className="text-sm text-subtle">{formatDate(h.created_at, 'd MMM yyyy, h:mm a')}</p>
                    </li>
                )}
                </ol>
              </section>
            }
          </div>

          <aside className="space-y-6">
            <section className="rounded-md bg-white p-6 text-[15px]" aria-labelledby="sum-h">
              <h2 id="sum-h" className="text-lg font-semibold">Summary</h2>
              <dl className="mt-4 space-y-2.5">
                <div className="flex justify-between"><dt className="text-muted">Status</dt><dd><StatusBadge status={order.status} /></dd></div>
                <div className="flex justify-between"><dt className="text-muted">Payment</dt><dd className="flex items-center gap-2">{paymentMethodLabel(order.payment_method)} <StatusBadge status={order.payment_status} /></dd></div>
                <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatLKR(order.subtotal)}</dd></div>
                {parseFloat(order.discount_amount) > 0 &&
                <div className="flex justify-between text-leaf"><dt>Discount {order.coupon_code && `(${order.coupon_code})`}</dt><dd>−{formatLKR(order.discount_amount)}</dd></div>
                }
                <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{parseFloat(order.delivery_charge) > 0 ? formatLKR(order.delivery_charge) : 'Free'}</dd></div>
                <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total</dt><dd>{formatLKR(order.total_amount)}</dd></div>
              </dl>
              <p className="mt-4 text-muted">Estimated arrival: <span className="text-ink">{formatDate(order.estimated_arrival_date)}</span></p>
            </section>

            {address &&
            <section className="rounded-md bg-white p-6 text-[15px]" aria-labelledby="addr-h">
                <h2 id="addr-h" className="text-lg font-semibold">Delivery</h2>
                <p className="mt-3">{order.shipping_recipient_name}</p>
                <p className="text-muted">{address}</p>
                <p className="text-muted">{order.shipping_phone}</p>
                {order.delivery_notes && <p className="mt-2 text-sm text-muted">Note: {order.delivery_notes}</p>}
              </section>
            }

            {(CANCELLABLE.includes(status) || RETURNABLE.includes(status)) &&
            <section className="rounded-md bg-white p-6 text-[15px]" aria-labelledby="help-h">
                <h2 id="help-h" className="text-lg font-semibold">Need help with this order?</h2>
                <div className="mt-4 flex flex-col gap-2">
                  {CANCELLABLE.includes(status) &&
                <button type="button" className="btn-secondary" onClick={() => setDialog('cancel')}>Request cancellation</button>
                }
                  {RETURNABLE.includes(status) &&
                <button type="button" className="btn-secondary" onClick={() => setDialog('return')}>Request return / refund</button>
                }
                </div>
              </section>
            }
          </aside>
        </div>
      </div>
      <OrderRequestDialog
        order={order}
        kind={dialog}
        onClose={() => setDialog(null)}
        onDone={() => {
          setDialog(null);
          reload();
        }} />
      
    </div>);

}