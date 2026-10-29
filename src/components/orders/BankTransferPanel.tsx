import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2Icon, CopyIcon, UploadIcon } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { getErrorMessage } from '../../utils/apiClient';
import { formatLKR } from '../../utils/format';
import { paymentApi } from '../../utils/shopApi';
import { Button } from '../ui/Button';
import { ErrorState } from '../ui/ErrorState';
import { Spinner } from '../ui/Spinner';
import { TextField } from '../ui/TextField';

interface BankTransferPanelProps {
  orderNumber: string;
  amount: string | number;
}

export function BankTransferPanel({ orderNumber, amount }: BankTransferPanelProps) {
  const details = useApi(() => paymentApi.bankDetails(), []);
  const [reference, setReference] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().slice(0, 10));
  const [bankName, setBankName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please attach your deposit slip.');
      return;
    }
    const form = new FormData();
    form.append('order_number', orderNumber);
    form.append('customer_bank_reference', reference);
    form.append('deposit_date', depositDate);
    form.append('bank_name', bankName);
    form.append('bank_slip_image', file);
    setSubmitting(true);
    try {
      const res = await paymentApi.submitSlip(form);
      setSubmitted(res.message || 'Deposit slip submitted. Our team will verify it shortly.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="bank-heading" className="rounded-xl border border-line bg-surface p-6">
      <h2 id="bank-heading" className="text-lg font-semibold text-fg">
        Complete your bank transfer
      </h2>
      <p className="mt-1 text-sm text-muted">
        Transfer exactly <span className="font-semibold text-fg">{formatLKR(amount)}</span> and use{' '}
        <span className="font-mono text-fg">{orderNumber}</span> as the reference.
      </p>

      {details.loading ?
      <Spinner label="Loading bank details" /> :
      details.error ?
      <div className="mt-5">
          <ErrorState compact message={details.error} onRetry={details.reload} />
        </div> :

      <>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {(details.data?.bank_accounts ?? []).map((account) =>
          <div key={account.account_number} className="rounded-lg border border-line p-4">
                <p className="text-sm font-semibold text-fg">{account.bank_name}</p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <Row label="Account name" value={account.account_name} />
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-subtle">Account no.</dt>
                    <dd className="flex items-center gap-2 font-mono text-fg">
                      {account.account_number}
                      <button
                    type="button"
                    onClick={() => void copy(account.account_number)}
                    className="text-muted hover:text-fg"
                    aria-label={`Copy ${account.bank_name} account number`}>
                    
                        <CopyIcon className="h-3.5 w-3.5" />
                      </button>
                    </dd>
                  </div>
                  <Row label="Branch" value={account.branch} />
                  <Row label="SWIFT" value={account.swift_code} />
                </dl>
              </div>
          )}
          </div>
          {details.data?.instructions &&
        <ol className="mt-5 space-y-1 text-sm text-muted">
              {details.data.instructions.
          split('\n').
          filter(Boolean).
          map((line) =>
          <li key={line}>{line.replace(/'\/api\/[^']+'/g, 'the form below')}</li>
          )}
            </ol>
        }
        </>
      }

      <div className="mt-8 border-t border-line pt-6">
        {submitted ?
        <div className="flex items-start gap-3" role="status">
            <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            <div>
              <p className="font-medium text-fg">Slip received</p>
              <p className="mt-1 text-sm text-muted">{submitted}</p>
            </div>
          </div> :

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <h3 className="text-sm font-semibold text-fg sm:col-span-2">Upload your deposit slip</h3>
            <TextField label="Transaction reference" value={reference} onChange={(e) => setReference(e.target.value)} required />
            <TextField label="Your bank" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Commercial Bank" required />
            <TextField
            label="Deposit date"
            type="date"
            value={depositDate}
            onChange={(e) => setDepositDate(e.target.value)}
            required />
          
            <div>
              <span className="mb-1.5 block text-sm font-medium text-fg/90">Slip image or PDF *</span>
              <label className="flex h-11 cursor-pointer items-center gap-2 rounded-md border border-dashed border-line px-3.5 text-sm text-muted transition-colors duration-150 hover:border-fg/40 hover:text-fg">
                <UploadIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{file ? file.name : 'Choose file (.jpg, .png, .pdf)'}</span>
                <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              
              </label>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" loading={submitting}>
                Submit slip
              </Button>
            </div>
          </form>
        }
      </div>
    </section>);

}

function Row({ label, value }: {label: string;value: string;}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-subtle">{label}</dt>
      <dd className="text-right text-fg">{value}</dd>
    </div>);

}