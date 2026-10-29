import React from 'react';
import { TextField } from '../ui/TextField';
import type { AddressInput } from '../../types/api';

interface AddressFieldsProps {
  value: AddressInput;
  onChange: (patch: Partial<AddressInput>) => void;
  errors?: Record<string, string>;
  showNotes?: boolean;
}

export const emptyAddress: AddressInput = {
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

export function AddressFields({ value, onChange, errors = {}, showNotes = true }: AddressFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        label="Recipient name"
        value={value.recipient_name}
        onChange={(e) => onChange({ recipient_name: e.target.value })}
        error={errors.recipient_name}
        autoComplete="name"
        required />
      
      <TextField
        label="Phone number"
        type="tel"
        value={value.phone_number}
        onChange={(e) => onChange({ phone_number: e.target.value })}
        error={errors.phone_number}
        placeholder="+94 77 123 4567"
        autoComplete="tel"
        required />
      
      <TextField
        label="Address line 1"
        className="sm:col-span-2"
        value={value.address_line1}
        onChange={(e) => onChange({ address_line1: e.target.value })}
        error={errors.address_line1}
        autoComplete="address-line1"
        required />
      
      <TextField
        label="Address line 2"
        className="sm:col-span-2"
        value={value.address_line2}
        onChange={(e) => onChange({ address_line2: e.target.value })}
        autoComplete="address-line2"
        placeholder="Apartment, suite, etc. (optional)" />
      
      <TextField
        label="City"
        value={value.city}
        onChange={(e) => onChange({ city: e.target.value })}
        error={errors.city}
        autoComplete="address-level2"
        required />
      
      <TextField
        label="Province"
        value={value.state_or_province}
        onChange={(e) => onChange({ state_or_province: e.target.value })}
        autoComplete="address-level1"
        placeholder="Western Province" />
      
      <TextField
        label="Postal code"
        value={value.postal_code}
        onChange={(e) => onChange({ postal_code: e.target.value })}
        error={errors.postal_code}
        autoComplete="postal-code"
        required />
      
      <TextField
        label="Country"
        value={value.country}
        onChange={(e) => onChange({ country: e.target.value })}
        error={errors.country}
        autoComplete="country-name"
        required />
      
      {showNotes &&
      <TextField
        label="Delivery notes"
        className="sm:col-span-2"
        value={value.delivery_notes}
        onChange={(e) => onChange({ delivery_notes: e.target.value })}
        placeholder="e.g. Call before delivery (optional)" />

      }
    </div>);

}