import React, { useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2Icon, DownloadIcon, ExternalLinkIcon, Loader2Icon } from 'lucide-react';
import { BankTransferPanel } from '../components/orders/BankTransferPanel';
import { OrderProgress } from '../components/orders/OrderProgress';
import { StatusBadge } from '../components/StatusBadge';
import { StateMessage } from '../components/StateMessage';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { errorMessage } from '../utils/apiClient';
import { downloadInvoice } from '../utils/invoice';
import { formatDate, formatLKR, paymentMethodLabel } from '../utils/format';
import { orderApi, paymentApi } from '../utils/storeApi';
import type { Order } from '../types/api';

export function OrderConfirmation() {
  const { orderNumber = '' } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const placedOrder = (location.state as {order?: Order;} | null)?.order;
  const stored = JSON.parse(sessionStorage.getItem(`av.order.${orderNumber}`) ?? 'null') as {id: number;contact: string;} | null;
  const contact = params.get('contact') ?? stored?.contact ?? user?.email ?? '';
  const [paying, setPaying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data, loading, error, reload } = useApi(() => orderApi.track(orderNumber, contact), [orderNumber, contact], !!contact);

  const startPayment = async () => {
    if (!data) return;
    setPaying(true);
    try {
      const init = await paymentApi.initiate(data.order_number, data.payment_method);
      if (init.checkout_url) window.location.href = init.checkout_url;else
      toast(init.message);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  const getInvoice = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      await downloadInvoice(data.id, data.order_number, user ? undefined : contact);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  if (!contact) {
    return (
      <div className="mx-auto max-w-site px-5 py-20 md:px-10">
        <StateMessage
          title="Look up your order"
          description="Enter your order number and the email or phone used at checkout to view this order."
          action={<Link to={`/track?order_number=${orderNumber}`} className="btn-primary">Track order</Link>} />
        
      </div>);

  }

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-[920px] px-5 pb-20 pt-12 md:px-10">
        {error ?
        <StateMessage tone="error" title="We couldn’t load this order" description={error} onRetry={reload} /> :
        loading || !data ?
        <div className="flex items-center gap-2 text-muted" role="status">
            <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden /> Loading your order…
          </div> :

        <>
            <div className="flex items-start gap-4">
              <CheckCircle2Icon className="mt-2 h-8 w-8 shrink-0 text-leaf" aria-hidden />
              <div>
                <h1 className="display text-[40px] md:text-[56px]">Thank you{placedOrder?.customer_name ? `, ${placedOrder.customer_name.split(' ')[0]}` : ''}</h1>
                <p className="mt-3 text-[17px] text-muted">
                  Order <strong className="text-ink">{data.order_number}</strong> has been placed. A confirmation has been sent to {contact}.
                </p>
              </div>
            </div>

            <section className="mt-10 rounded-md bg-white p-6 md:p-8" aria-label="Order status">
              <OrderProgress status={data.status} />
              <dl className="mt-8 grid gap-6 text-[15px] sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <dt className="text-muted">Total</dt>
                  <dd className="mt-1 text-lg font-semibold">{formatLKR(data.total_amount)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Payment</dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-2">
                    {paymentMethodLabel(data.payment_method)} <StatusBadge status={data.payment_status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Estimated arrival</dt>
                  <dd className="mt-1">{formatDate(data.estimated_arrival_date)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Courier</dt>
                  <dd className="mt-1">{data.courier_name ? `${data.courier_name} · ${data.tracking_number ?? ''}` : 'Assigned on dispatch'}</dd>
                </div>
              </dl>
              <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6">
                {data.payment_status === 'PENDING' && data.payment_method !== 'BANK_TRANSFER' &&
              <button type="button" className="btn-primary" onClick={startPayment} disabled={paying}>
                    {paying ? 'Redirecting…' : `Pay with ${paymentMethodLabel(data.payment_method)}`}
                    <ExternalLinkIcon className="h-4 w-4" aria-hidden />
                  </button>
              }
                <button type="button" className="btn-secondary" onClick={getInvoice} disabled={downloading}>
                  <DownloadIcon className="h-4 w-4" aria-hidden /> {downloading ? 'Preparing…' : 'Download invoice'}
                </button>
                <Link to="/shop" className="btn-secondary">
                  Continue shopping
                </Link>
              </div>
            </section>

            {data.payment_method === 'BANK_TRANSFER' && data.payment_status === 'PENDING' &&
          <div className="mt-6">
                <BankTransferPanel orderNumber={data.order_number} amount={data.total_amount} onSubmitted={reload} />
              </div>
          }

            {placedOrder?.items && placedOrder.items.length > 0 &&
          <section className="mt-6 rounded-md bg-white p-6 md:p-8" aria-labelledby="items-h">
                <h2 id="items-h" className="text-lg font-semibold">
                  Items
                </h2>
                <ul className="mt-4 divide-y divide-line">
                  {placedOrder.items.map((item) =>
              <li key={item.id} className="flex justify-between gap-4 py-3 text-[15px]">
                      <span>
                        {item.product_name}
                        {item.variant_name && <span className="block text-sm text-muted">{item.variant_name}</span>}
                        <span className="block text-sm text-muted">Qty {item.quantity}</span>
                      </span>
                      <span className="font-medium">{formatLKR(item.total_price)}</span>
                    </li>
              )}
                </ul>
              </section>
          }
          </>
        }
      </div>
    </div>);

}