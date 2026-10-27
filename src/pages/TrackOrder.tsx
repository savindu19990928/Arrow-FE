import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2Icon, SearchIcon } from 'lucide-react';
import { OrderProgress } from '../components/orders/OrderProgress';
import { StatusBadge } from '../components/StatusBadge';
import { errorMessage } from '../utils/apiClient';
import { formatDate, formatLKR, paymentMethodLabel } from '../utils/format';
import { orderApi } from '../utils/storeApi';
import type { TrackResult } from '../types/api';

export function TrackOrder() {
  const [params, setParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('order_number') ?? '');
  const [contact, setContact] = useState(params.get('contact') ?? '');
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (num: string, ct: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await orderApi.track(num.trim(), ct.trim()));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const n = params.get('order_number');
    const c = params.get('contact');
    if (n && c) void lookup(n, c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ order_number: orderNumber.trim(), contact: contact.trim() }, { replace: true });
    void lookup(orderNumber, contact);
  };

  return (
    <div className="min-h-[70vh] bg-canvas">
      <div className="mx-auto grid max-w-site gap-12 px-5 pb-20 pt-12 md:px-10 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-leaf">Support</p>
          <h1 className="display mt-3 text-[44px] md:text-[64px]">Track your order</h1>
          <p className="mt-4 max-w-sm text-[16px] text-muted">
            Enter your order number and the email or phone number you used at checkout.
          </p>
          <form onSubmit={submit} className="mt-8 max-w-sm space-y-4">
            <div>
              <label className="label" htmlFor="t-order">Order number</label>
              <input id="t-order" className="field uppercase" required placeholder="ARW-20261028-9F3A1B" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="label" htmlFor="t-contact">Email or phone</label>
              <input id="t-contact" className="field" required value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : <SearchIcon className="h-4 w-4" aria-hidden />}
              Track order
            </button>
          </form>
        </div>

        <div aria-live="polite">
          {error &&
          <div role="alert" className="rounded-md bg-white p-6 text-[15px]">
              <p className="font-medium">We couldn’t find that order</p>
              <p className="mt-1 text-muted">{error}</p>
            </div>
          }
          {result &&
          <section className="rounded-md bg-white p-6 md:p-8" aria-label="Order status">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">{result.order_number}</h2>
                <StatusBadge status={result.status} />
              </div>
              <div className="mt-6">
                <OrderProgress status={result.status} />
              </div>
              <dl className="mt-8 grid gap-5 text-[15px] sm:grid-cols-2">
                <div>
                  <dt className="text-muted">Estimated arrival</dt>
                  <dd className="mt-1 font-medium">{formatDate(result.estimated_arrival_date)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Total</dt>
                  <dd className="mt-1 font-medium">{formatLKR(result.total_amount)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Payment</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    {paymentMethodLabel(result.payment_method)} <StatusBadge status={result.payment_status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Courier</dt>
                  <dd className="mt-1">
                    {result.courier_name ?
                  <>
                        {result.courier_name}
                        <span className="block text-sm text-muted">Tracking {result.tracking_number}</span>
                      </> :

                  'Assigned on dispatch'
                  }
                  </dd>
                </div>
              </dl>
              <Link
              to={`/order/${result.order_number}?contact=${encodeURIComponent(contact.trim())}`}
              className="link-underline mt-8">
              
                View order, payment & invoice
              </Link>
            </section>
          }
          {!result && !error && !loading &&
          <div className="flex h-full min-h-[240px] items-center justify-center rounded-md border border-dashed border-line p-8 text-center text-muted">
              Your order status will appear here.
            </div>
          }
        </div>
      </div>
    </div>);

}