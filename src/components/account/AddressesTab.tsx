import React, { useState } from 'react';
import { toast } from 'sonner';
import { MapPinIcon, PlusIcon } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { getErrorMessage, getFieldErrors } from '../../utils/apiClient';
import { addressApi } from '../../utils/shopApi';
import { AddressFields, emptyAddress } from '../checkout/AddressFields';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { Spinner } from '../ui/Spinner';
import type { AddressInput } from '../../types/api';

export function AddressesTab() {
  const addresses = useApi(() => addressApi.list(), []);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<AddressInput>(emptyAddress);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [defaultingId, setDefaultingId] = useState<number | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await addressApi.create(draft);
      toast.success('Address saved');
      setAdding(false);
      setDraft(emptyAddress);
      addresses.reload();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = async (id: number) => {
    setDefaultingId(id);
    try {
      await addressApi.setDefault(id);
      toast.success('Default address updated');
      addresses.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDefaultingId(null);
    }
  };

  if (addresses.loading) return <Spinner label="Loading addresses" />;
  if (addresses.error) return <ErrorState message={addresses.error} onRetry={addresses.reload} />;

  const list = addresses.data ?? [];

  return (
    <div className="space-y-8">
      {adding ?
      <form onSubmit={save} className="space-y-5 rounded-lg border border-line bg-surface p-5">
          <h3 className="font-medium text-fg">New address</h3>
          <AddressFields value={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} errors={errors} />
          <label className="flex items-center gap-3 text-sm text-muted">
            <input
            type="checkbox"
            checked={draft.is_default}
            onChange={(e) => setDraft((d) => ({ ...d, is_default: e.target.checked }))}
            className="h-4 w-4 accent-white" />
          
            Set as default delivery address
          </label>
          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              Save address
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </form> :

      <Button variant="secondary" onClick={() => setAdding(true)}>
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Add address
        </Button>
      }

      {!list.length && !adding ?
      <EmptyState icon={MapPinIcon} title="No saved addresses" message="Save an address to check out faster next time." /> :

      <ul className="grid gap-4 md:grid-cols-2">
          {list.map((addr) =>
        <li key={addr.id} className="flex flex-col rounded-lg border border-line p-5 text-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-fg">{addr.recipient_name}</p>
                {addr.is_default && <span className="rounded-full border border-fg/40 px-2 py-0.5 text-xs text-fg">Default</span>}
              </div>
              <address className="mt-2 not-italic leading-relaxed text-muted">
                {addr.address_line1}
                {addr.address_line2 && `, ${addr.address_line2}`}
                <br />
                {[addr.city, addr.state_or_province, addr.postal_code].filter(Boolean).join(', ')}
                <br />
                {addr.country} · {addr.phone_number}
              </address>
              {addr.delivery_notes && <p className="mt-2 text-xs text-subtle">Note: {addr.delivery_notes}</p>}
              {!addr.is_default &&
          <div className="mt-auto pt-4">
                  <Button variant="ghost" size="sm" className="-ml-3" onClick={() => void makeDefault(addr.id)} loading={defaultingId === addr.id}>
                    Set as default
                  </Button>
                </div>
          }
            </li>
        )}
        </ul>
      }
    </div>);

}