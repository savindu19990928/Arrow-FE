import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DownloadIcon, SearchIcon } from 'lucide-react';
import { getErrorMessage } from '../utils/apiClient';
import { formatDate, formatLKR, paymentLabel } from '../utils/format';
import { orderApi } from '../utils/shopApi';
import { BankTransferPanel } from '../components/orders/BankTransferPanel';
import { OrderStatusTimeline } from '../components/orders/OrderStatusTimeline';
import { PaymentRetryButton } from '../components/orders/PaymentRetryButton';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { TextField } from '../components/ui/TextField';
import type { Order, PaymentMethod } from '../types/api';

export function TrackOrder() {
  const [params, setParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('order_number') ?? '');
  const [contact, setContact] = useState(params.get('contact') ?? '');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const autoRan = useRef(false);

  const lookup = async (num: string, cont: string) => {
    setLoading(true);
    setError(null);
    try {
      setOrder(await orderApi.track(num.trim(), cont.trim()));
      setParams({ order_number: num.trim(), contact: cont.trim() }, { replace: true });
    } catch (err) {
      setOrder(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    if (orderNumber && contact) void lookup(orderNumber, contact);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadInvoice = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      await orderApi.invoice(order.id, order.order_number, contact.trim());
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full bg-bg">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-fg sm:text-4xl md:text-5xl">Track order</h1>
        <p className="mt-2 text-sm text-muted">Enter your order number and the email or phone number used at checkout.</p>

        <form
          className="mt-8 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void lookup(orderNumber, contact);
          }}>
          
          <TextField
            label="Order number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            placeholder="ARW-20261028-9F3A1B"
            required />
          
          <TextField
            label="Email or phone"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="you@example.com"
            required />
          
          <Button type="submit" loading={loading} className="h-11">
            <SearchIcon className="h-4 w-4" aria-hidden="true" />
            Track
          </Button>
        </form>

        {error &&
        <p role="alert" className="mt-6 rounded-md border border-danger/40 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        }

        {order &&
        <section className="mt-12 space-y-10" aria-labelledby="result-heading">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-subtle">Order</p>
                <h2 id="result-heading" className="font-mono text-xl text-fg">
                  {order.order_number}
                </h2>
              </div>
              <Button variant="secondary" size="sm" onClick={downloadInvoice} loading={downloading}>
                <DownloadIcon className="h-4 w-4" aria-hidden="true" />
                Invoice
              </Button>
            </div>

            <OrderStatusTimeline status={order.status} history={order.status_history} />

            <dl className="grid grid-cols-2 gap-6 border-y border-line py-6 text-sm md:grid-cols-3">
              <Item label="Total" value={formatLKR(order.total_amount)} />
              <Item label="Payment method" value={paymentLabel(order.payment_method)} />
              <div>
                <dt className="text-subtle">Payment status</dt>
                <dd className="mt-1">
                  <StatusBadge status={order.payment_status} />
                </dd>
              </div>
              <Item label="Estimated arrival" value={formatDate(order.estimated_arrival_date)} />
              <Item label="Courier" value={order.courier_name ?? 'Not assigned yet'} />
              <Item label="Tracking number" value={order.tracking_number ?? '—'} mono={!!order.tracking_number} />
            </dl>

            {order.payment_status === 'PENDING' && order.payment_method === 'BANK_TRANSFER' &&
          <BankTransferPanel orderNumber={order.order_number} amount={order.total_amount} />
          }
            {order.payment_status === 'PENDING' && order.payment_method !== 'BANK_TRANSFER' &&
          <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">This order is awaiting payment.</p>
                <PaymentRetryButton orderNumber={order.order_number} method={order.payment_method as PaymentMethod} />
              </div>
          }
          </section>
        }
      </div>
    </div>);

}

function Item({ label, value, mono = false }: {label: string;value: string;mono?: boolean;}) {
  return (
    <div>
      <dt className="text-subtle">{label}</dt>
      <dd className={`mt-1 text-fg ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>);

}