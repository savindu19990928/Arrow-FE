import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { errorMessage } from '../../utils/apiClient';
import { formatLKR } from '../../utils/format';
import { orderApi } from '../../utils/storeApi';
import type { Order } from '../../types/api';

interface OrderRequestDialogProps {
  order: Order;
  kind: 'cancel' | 'return' | null;
  onClose: () => void;
  onDone: () => void;
}

export function OrderRequestDialog({ order, kind, onClose, onDone }: OrderRequestDialogProps) {
  const [reason, setReason] = useState('');
  const [type, setType] = useState('RETURN_AND_REFUND');
  const [amount, setAmount] = useState(order.total_amount);
  const [bankDetails, setBankDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (kind === 'cancel') {
        await orderApi.cancel(order.id, reason.trim());
        toast.success('Cancellation requested. We’ll update you shortly.');
      } else {
        await orderApi.returnRefund(order.id, {
          type,
          refund_amount: parseFloat(amount) || 0,
          reason: reason.trim(),
          bank_details_for_refund: bankDetails.trim()
        });
        toast.success('Return request submitted.');
      }
      setReason('');
      onDone();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {kind &&
      <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="req-title">
          <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} />
          <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-lg space-y-4 rounded-t-lg bg-paper p-6 sm:rounded-lg">
          
            <div className="flex items-start justify-between gap-4">
              <h2 id="req-title" className="text-xl font-semibold">
                {kind === 'cancel' ? 'Cancel this order' : 'Request a return or refund'}
              </h2>
              <button type="button" onClick={onClose} className="focus-ring rounded p-1" aria-label="Close">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted">Order {order.order_number} · {formatLKR(order.total_amount)}</p>

            {kind === 'return' &&
          <>
                <div>
                  <label className="label" htmlFor="rr-type">Request type</label>
                  <select id="rr-type" className="field" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="RETURN_AND_REFUND">Return and refund</option>
                    <option value="REFUND_ONLY">Refund only</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="rr-amount">Refund amount (LKR)</label>
                  <input id="rr-amount" inputMode="decimal" className="field" required value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} />
                </div>
                <div>
                  <label className="label" htmlFor="rr-bank">Bank details for refund</label>
                  <input id="rr-bank" className="field" required placeholder="Bank, account number, account name" value={bankDetails} onChange={(e) => setBankDetails(e.target.value)} />
                </div>
              </>
          }
            <div>
              <label className="label" htmlFor="rr-reason">Reason</label>
              <textarea id="rr-reason" className="field min-h-[100px]" required value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit request'}
              </button>
              <button type="button" className="btn-secondary" onClick={onClose}>Keep order</button>
            </div>
          </motion.form>
        </div>
      }
    </AnimatePresence>);

}