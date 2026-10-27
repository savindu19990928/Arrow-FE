import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { StateMessage } from '../StateMessage';
import { useApi } from '../../hooks/useApi';
import { errorMessage, toList } from '../../utils/apiClient';
import { addressApi } from '../../utils/storeApi';
import type { Address, AddressInput } from '../../types/api';

const blank: AddressInput = {
  recipient_name: '',
  phone_number: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state_or_province: '',
  postal_code: '',
  country: 'Sri Lanka',
  is_default: false,
  delivery_notes: ''
};

export function AddressesTab() {
  const { data, loading, error, reload } = useApi(() => addressApi.list(), []);
  const addresses = toList<Address>(data);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<AddressInput>(blank);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const set = (key: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
  setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await addressApi.create(form);
      toast.success('Address saved');
      setForm(blank);
      setAdding(false);
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = async (id: number) => {
    setBusyId(id);
    try {
      await addressApi.setDefault(id);
      toast.success('Default address updated');
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <StateMessage tone="error" title="We couldn’t load your addresses" description={error} onRetry={reload} />;

  return (
    <div>
      {loading && !data ?
      <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((i) => <div key={i} className="h-36 animate-pulse rounded-md bg-white" />)}
        </div> :

      <ul className="grid gap-4 md:grid-cols-2">
          {addresses.map((a) =>
        <li key={a.id} className="flex flex-col rounded-md bg-white p-5 text-[15px]">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{a.recipient_name}</p>
                {a.is_default && <span className="rounded-full bg-lime px-2.5 py-0.5 text-xs font-semibold">Default</span>}
              </div>
              <p className="mt-2 text-muted">
                {a.address_line1}
                {a.address_line2 && <>, {a.address_line2}</>}
                <br />
                {[a.city, a.state_or_province, a.postal_code].filter(Boolean).join(', ')}
                <br />
                {a.country}
              </p>
              <p className="mt-1 text-muted">{a.phone_number}</p>
              {!a.is_default &&
          <button type="button" onClick={() => void makeDefault(a.id)} disabled={busyId === a.id} className="mt-auto self-start pt-4 text-sm font-medium underline underline-offset-4">
                  {busyId === a.id ? 'Updating…' : 'Set as default'}
                </button>
          }
            </li>
        )}
          {!adding &&
        <li>
              <button type="button" onClick={() => setAdding(true)} className="focus-ring flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ink/30 text-[15px] font-medium hover:border-ink">
                <PlusIcon className="h-5 w-5" aria-hidden /> Add address
              </button>
            </li>
        }
        </ul>
      }

      {adding &&
      <form onSubmit={save} className="mt-6 grid gap-4 rounded-md bg-white p-6 md:grid-cols-2">
          <h3 className="text-lg font-semibold md:col-span-2">New address</h3>
          <div><label className="label" htmlFor="a-name">Recipient name</label><input id="a-name" className="field" required value={form.recipient_name} onChange={set('recipient_name')} /></div>
          <div><label className="label" htmlFor="a-phone">Phone</label><input id="a-phone" type="tel" className="field" required value={form.phone_number} onChange={set('phone_number')} /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="a-l1">Address line 1</label><input id="a-l1" className="field" required value={form.address_line1} onChange={set('address_line1')} /></div>
          <div className="md:col-span-2"><label className="label" htmlFor="a-l2">Address line 2 <span className="font-normal text-subtle">(optional)</span></label><input id="a-l2" className="field" value={form.address_line2} onChange={set('address_line2')} /></div>
          <div><label className="label" htmlFor="a-city">City</label><input id="a-city" className="field" required value={form.city} onChange={set('city')} /></div>
          <div><label className="label" htmlFor="a-state">Province</label><input id="a-state" className="field" value={form.state_or_province} onChange={set('state_or_province')} /></div>
          <div><label className="label" htmlFor="a-postal">Postal code</label><input id="a-postal" className="field" required value={form.postal_code} onChange={set('postal_code')} /></div>
          <div><label className="label" htmlFor="a-notes">Delivery notes</label><input id="a-notes" className="field" value={form.delivery_notes} onChange={set('delivery_notes')} /></div>
          <label className="flex items-center gap-3 text-[15px] md:col-span-2">
            <input type="checkbox" className="h-4 w-4 accent-ink" checked={form.is_default} onChange={set('is_default')} /> Make this my default address
          </label>
          {formError && <p role="alert" className="text-sm text-danger md:col-span-2">{formError}</p>}
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save address'}</button>
            <button type="button" className="btn-secondary" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      }
    </div>);

}