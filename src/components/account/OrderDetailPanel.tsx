import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeftIcon, DownloadIcon } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { getErrorMessage } from '../../utils/apiClient';
import { formatDate, formatLKR, paymentLabel, toNumber } from '../../utils/format';
import { orderApi } from '../../utils/shopApi';
import { BankTransferPanel } from '../orders/BankTransferPanel';
import { OrderItemsTable } from '../orders/OrderItemsTable';
import { OrderStatusTimeline } from '../orders/OrderStatusTimeline';
import { PaymentRetryButton } from '../orders/PaymentRetryButton';
import { Button } from '../ui/Button';
import { ErrorState } from '../ui/ErrorState';
import { Spinner } from '../ui/Spinner';
import { StatusBadge } from '../ui/StatusBadge';
import { TextAreaField } from '../ui/TextAreaField';
import { TextField } from '../ui/TextField';
import type { PaymentMethod } from '../../types/api';

const CANCELLABLE = ['PENDING', 'CONFIRMED'];
const RETURNABLE = ['DELIVERED'];

export function OrderDetailPanel({ orderId, onBack }: {orderId: number;onBack: () => void;}) {
  const order = useApi(() => orderApi.get(orderId), [orderId]);
  const [action, setAction] = useState<'cancel' | 'return' | null>(null);
  const [reason, setReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (order.loading) return <Spinner label="Loading order" />;
  if (order.error || !order.data) return <ErrorState message={order.error ?? 'Order not found'} onRetry={order.reload} />;

  const data = order.data;

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (action === 'cancel') {
        await orderApi.cancel(data.id, reason);
        toast.success('Cancellation requested. We’ll review it shortly.');
      } else {
        await orderApi.returnRefund(data.id, {
          type: 'RETURN_AND_REFUND',
          refund_amount: toNumber(refundAmount || data.total_amount),
          reason,
          bank_details_for_refund: bankDetails
        });
        toast.success('Return & refund requested. We’ll be in touch.');
      }
      setAction(null);
      setReason('');
      setBankDetails('');
      order.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const downloadInvoice = async () => {
    setDownloading(true);
    try {
      await orderApi.invoice(data.id, data.order_number);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-10">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        All orders
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-mono text-xl text-fg">{data.order_number}</h2>
          <p className="mt-1 text-sm text-muted">Placed {formatDate(data.placed_at, true)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={downloadInvoice} loading={downloading}>
            <DownloadIcon className="h-4 w-4" aria-hidden="true" />
            Invoice
          </Button>
          {CANCELLABLE.includes(data.status) &&
          <Button variant="danger" size="sm" onClick={() => setAction(action === 'cancel' ? null : 'cancel')}>
              Cancel order
            </Button>
          }
          {RETURNABLE.includes(data.status) &&
          <Button variant="secondary" size="sm" onClick={() => setAction(action === 'return' ? null : 'return')}>
              Return & refund
            </Button>
          }
        </div>
      </div>

      {action &&
      <form onSubmit={submitRequest} className="space-y-4 rounded-lg border border-line bg-surface p-5">
          <h3 className="font-medium text-fg">{action === 'cancel' ? 'Request cancellation' : 'Request a return & refund'}</h3>
          <TextAreaField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required />
          {action === 'return' &&
        <div className="grid gap-4 sm:grid-cols-2">
              <TextField
            label="Refund amount (LKR)"
            type="number"
            min={0}
            value={refundAmount}
            placeholder={String(toNumber(data.total_amount))}
            onChange={(e) => setRefundAmount(e.target.value)} />
          
              <TextField
            label="Bank details for refund"
            value={bankDetails}
            onChange={(e) => setBankDetails(e.target.value)}
            placeholder="Bank, account no., account name"
            required />
          
            </div>
        }
          <div className="flex gap-2">
            <Button type="submit" loading={submitting}>
              Submit request
            </Button>
            <Button variant="ghost" onClick={() => setAction(null)}>
              Keep order
            </Button>
          </div>
        </form>
      }

      <OrderStatusTimeline status={data.status} history={data.status_history} />

      <dl className="grid grid-cols-2 gap-6 border-y border-line py-6 text-sm md:grid-cols-4">
        <div>
          <dt className="text-subtle">Payment</dt>
          <dd className="mt-1 text-fg">{paymentLabel(data.payment_method)}</dd>
        </div>
        <div>
          <dt className="text-subtle">Payment status</dt>
          <dd className="mt-1">
            <StatusBadge status={data.payment_status} />
          </dd>
        </div>
        <div>
          <dt className="text-subtle">Estimated arrival</dt>
          <dd className="mt-1 text-fg">{formatDate(data.estimated_arrival_date)}</dd>
        </div>
        <div>
          <dt className="text-subtle">Tracking</dt>
          <dd className="mt-1 text-fg">
            {data.tracking_number ? `${data.courier_name ?? ''} ${data.tracking_number}`.trim() : 'Not yet shipped'}
          </dd>
        </div>
      </dl>

      {data.payment_status === 'PENDING' && data.payment_method === 'BANK_TRANSFER' &&
      <BankTransferPanel orderNumber={data.order_number} amount={data.total_amount} />
      }
      {data.payment_status === 'PENDING' && data.payment_method !== 'BANK_TRANSFER' && data.status !== 'CANCELLED' &&
      <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Payment of {formatLKR(data.total_amount)} is still pending.</p>
          <PaymentRetryButton orderNumber={data.order_number} method={data.payment_method as PaymentMethod} />
        </div>
      }

      <div className="grid gap-10 md:grid-cols-[1fr_260px]">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-fg">Items</h3>
          <OrderItemsTable order={data} />
        </div>
        {data.shipping_address_line1 &&
        <div className="text-sm">
            <h3 className="mb-3 font-semibold text-fg">Delivering to</h3>
            <address className="not-italic leading-relaxed text-muted">
              {data.shipping_recipient_name}
              <br />
              {data.shipping_address_line1}
              {data.shipping_address_line2 &&
            <>
                  <br />
                  {data.shipping_address_line2}
                </>
            }
              <br />
              {[data.shipping_city, data.shipping_postal_code].filter(Boolean).join(' ')}
              <br />
              {data.shipping_country}
              <br />
              {data.shipping_phone}
            </address>
          </div>
        }
      </div>
    </div>);

}