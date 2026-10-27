import React, { useState } from 'react';
import { CheckCircle2Icon, CopyIcon, Loader2Icon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '../../hooks/useApi';
import { errorMessage } from '../../utils/apiClient';
import { formatLKR } from '../../utils/format';
import { paymentApi } from '../../utils/storeApi';

interface BankTransferPanelProps {
  orderNumber: string;
  amount: string;
  onSubmitted?: () => void;
}

export function BankTransferPanel({ orderNumber, amount, onSubmitted }: BankTransferPanelProps) {
  const { data, loading, error, reload } = useApi(() => paymentApi.bankDetails(), []);
  const [reference, setReference] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().slice(0, 10));
  const [bankName, setBankName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const copy = (value: string) => {
    void navigator.clipboard?.writeText(value);
    toast.success('Copied');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setFormError('Attach a photo or PDF of your bank slip.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    const form = new FormData();
    form.append('order_number', orderNumber);
    form.append('customer_bank_reference', reference.trim());
    form.append('deposit_date', depositDate);
    form.append('bank_name', bankName.trim());
    form.append('bank_slip_image', file);
    try {
      const res = await paymentApi.submitSlip(form);
      toast.success(res.message || 'Slip submitted');
      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-md bg-white p-6 md:p-8" aria-labelledby="bank-h">
      <h2 id="bank-h" className="text-xl font-semibold">
        Complete your bank transfer
      </h2>
      <p className="mt-1.5 text-[15px] text-muted">
        Transfer exactly <strong className="text-ink">{formatLKR(amount)}</strong> and use{' '}
        <strong className="text-ink">{orderNumber}</strong> as the payment reference.
      </p>

      {loading ?
      <p className="mt-6 flex items-center gap-2 text-muted">
          <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> Loading bank details…
        </p> :
      error ?
      <p role="alert" className="mt-6 text-danger">
          {error}{' '}
          <button type="button" className="underline" onClick={reload}>
            Retry
          </button>
        </p> :

      <>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {data?.bank_accounts.map((acc) =>
          <div key={acc.account_number} className="rounded-md border border-line p-4 text-[15px]">
                <p className="font-semibold">{acc.bank_name}</p>
                <dl className="mt-2 space-y-1 text-muted">
                  <div className="flex justify-between gap-3">
                    <dt>Account name</dt>
                    <dd className="text-right text-ink">{acc.account_name}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>Account no.</dt>
                    <dd className="flex items-center gap-1.5 font-medium tabular-nums text-ink">
                      {acc.account_number}
                      <button type="button" onClick={() => copy(acc.account_number)} className="focus-ring rounded p-1 hover:bg-canvas" aria-label={`Copy account number ${acc.account_number}`}>
                        <CopyIcon className="h-3.5 w-3.5" />
                      </button>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Branch</dt>
                    <dd className="text-ink">{acc.branch}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>SWIFT</dt>
                    <dd className="text-ink">{acc.swift_code}</dd>
                  </div>
                </dl>
              </div>
          )}
          </div>
          {data?.instructions && <p className="mt-4 whitespace-pre-line text-sm text-muted">{data.instructions.replace(/\s*Submit slip via '.*?'\.?/, ' Upload your slip below.')}</p>}
        </>
      }

      {submitted ?
      <div className="mt-8 flex items-start gap-3 rounded-md bg-lime/50 p-4" role="status">
          <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p className="text-[15px]">Slip received. Our team will verify your payment and confirm the order — you’ll be notified once it’s approved.</p>
        </div> :

      <form onSubmit={submit} className="mt-8 grid gap-4 border-t border-line pt-6 md:grid-cols-3">
          <h3 className="text-lg font-medium md:col-span-3">Upload your payment slip</h3>
          <div>
            <label className="label" htmlFor="bank-ref">Bank reference</label>
            <input id="bank-ref" className="field" required value={reference} onChange={(e) => setReference(e.target.value)} placeholder="TXN-8871239" />
          </div>
          <div>
            <label className="label" htmlFor="bank-name">Your bank</label>
            <input id="bank-name" className="field" required value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Commercial Bank" />
          </div>
          <div>
            <label className="label" htmlFor="bank-date">Deposit date</label>
            <input id="bank-date" type="date" className="field" required value={depositDate} onChange={(e) => setDepositDate(e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <label htmlFor="bank-slip" className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-ink/30 bg-canvas p-4 hover:border-ink">
              <UploadIcon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="text-[15px]">{file ? file.name : 'Choose slip image or PDF (.jpg, .png, .pdf)'}</span>
            </label>
            <input id="bank-slip" type="file" accept=".jpg,.jpeg,.png,.pdf,image/*,application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          {formError &&
        <p role="alert" className="text-sm text-danger md:col-span-3">
              {formError}
            </p>
        }
          <div className="md:col-span-3">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Uploading…' : 'Submit slip'}
            </button>
          </div>
        </form>
      }
    </section>);

}